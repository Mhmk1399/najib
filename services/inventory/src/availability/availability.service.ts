import { randomUUID } from "node:crypto";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import mongoose, { type ClientSession, type Types } from "mongoose";
import { z } from "zod";
import { InventoryBalance } from "../models/inventory-balance.js";
import { InventoryLocation } from "../models/inventory-location.js";
import { InventoryReservation } from "../models/inventory-reservation.js";
import { StockMovement } from "../models/stock-movement.js";
import { Store, StoreInventoryPoolBinding } from "../models/store.js";
import {
  availabilityRequestSchema,
  createReservationSchema,
  expireReservationsSchema,
  reservationActionSchema,
  reservationIdSchema,
  type AvailabilityRequest,
  type CreateReservationRequest,
  type ReservationAction,
} from "./availability.schemas.js";

type Allocation = { inventoryLocationId: Types.ObjectId; quantity: number };
type LeanBalance = {
  _id: Types.ObjectId;
  productVariantId: string;
  inventoryLocationId: Types.ObjectId;
  onHand: number;
  reserved: number;
  safetyStock: number;
};
type LeanReservationId = { _id: Types.ObjectId };
type LeanPoolBinding = { inventoryPoolId: Types.ObjectId };

@Injectable()
export class AvailabilityService {
  parseAvailability(value: unknown): AvailabilityRequest {
    return this.parse(availabilityRequestSchema, value);
  }

  parseCreateReservation(value: unknown): CreateReservationRequest {
    return this.parse(createReservationSchema, value);
  }

  parseAction(value: unknown): ReservationAction {
    return this.parse(reservationActionSchema, value);
  }

  parseExpiryRun(value: unknown): { limit: number; correlationId: string } {
    return this.parse(expireReservationsSchema, value);
  }

  parseId(value: string): string {
    return this.parse(reservationIdSchema, value);
  }

  async checkAvailability(input: AvailabilityRequest) {
    const poolId = await this.findPoolForStore(input.storeId);
    const locations = await InventoryLocation.find({
      inventoryPoolId: poolId,
      isActive: true,
    }).select("_id").lean();
    const locationIds = locations.map((location) => location._id);
    const variantIds = input.lines.map((line) => line.productVariantId);
    const balances = await InventoryBalance.find({
      inventoryLocationId: { $in: locationIds },
      productVariantId: { $in: variantIds },
    }).lean();

    const totals = new Map<string, number>();
    for (const balance of balances) {
      const available = Math.max(0, balance.onHand - balance.reserved - balance.safetyStock);
      totals.set(
        balance.productVariantId,
        (totals.get(balance.productVariantId) ?? 0) + available,
      );
    }

    return {
      storeId: input.storeId,
      inventoryPoolId: poolId.toString(),
      lines: input.lines.map((line) => {
        const available = totals.get(line.productVariantId) ?? 0;
        return { ...line, available, sufficient: available >= line.quantity };
      }),
    };
  }

  async findReservation(id: string) {
    const reservation = await InventoryReservation.findById(id).lean();
    if (!reservation) throw new NotFoundException("Reservation was not found");
    return reservation;
  }

  async createReservation(input: CreateReservationRequest) {
    const existing = await InventoryReservation.findOne({
      idempotencyKey: input.idempotencyKey,
    }).lean();
    if (existing) return existing;

    const session = await mongoose.startSession();
    try {
      let createdId: Types.ObjectId | undefined;
      await session.withTransaction(async () => {
        const duplicate = await InventoryReservation.findOne({
          idempotencyKey: input.idempotencyKey,
        }).session(session).lean() as unknown as LeanReservationId | null;
        if (duplicate) {
          createdId = duplicate._id;
          return;
        }

        const poolId = await this.findPoolForStore(input.storeId, session);
        const locations = await InventoryLocation.find({
          inventoryPoolId: poolId,
          isActive: true,
        }).select("_id").session(session).lean();
        const locationIds = locations.map((location) => location._id);
        if (locationIds.length === 0) {
          throw new ConflictException("The store has no active inventory locations");
        }

        const reservationLines = [];
        const movements = [];
        const reservationNumber = `RSV-${randomUUID()}`;

        for (const line of input.lines) {
          const balances = await InventoryBalance.find({
            productVariantId: line.productVariantId,
            inventoryLocationId: { $in: locationIds },
          }).sort({ onHand: -1 }).session(session).lean() as unknown as LeanBalance[];
          let remaining = line.quantity;
          const allocations: Allocation[] = [];

          for (const balance of balances) {
            if (remaining === 0) break;
            const available = Math.max(0, balance.onHand - balance.reserved - balance.safetyStock);
            const quantity = Math.min(remaining, available);
            if (quantity === 0) continue;

            const updated = await InventoryBalance.findOneAndUpdate(
              {
                _id: balance._id,
                $expr: {
                  $gte: [
                    { $subtract: ["$onHand", { $add: ["$reserved", "$safetyStock"] }] },
                    quantity,
                  ],
                },
              },
              { $inc: { reserved: quantity } },
              { new: true, runValidators: true, session },
            ).lean() as unknown as LeanBalance | null;
            if (!updated) throw new ConflictException("Inventory changed; retry the reservation");

            allocations.push({ inventoryLocationId: balance.inventoryLocationId, quantity });
            remaining -= quantity;
            movements.push({
              movementId: randomUUID(),
              productVariantId: line.productVariantId,
              inventoryLocationId: balance.inventoryLocationId,
              type: "reservation_created",
              onHandDelta: 0,
              reservedDelta: quantity,
              resultingOnHand: updated.onHand,
              resultingReserved: updated.reserved,
              referenceType: "reservation",
              referenceId: reservationNumber,
              correlationId: input.correlationId,
              actorId: input.actorId,
            });
          }

          if (remaining > 0) {
            throw new ConflictException(`Insufficient inventory for variant ${line.productVariantId}`);
          }
          reservationLines.push({ ...line, allocations });
        }

        const [reservation] = await InventoryReservation.create(
          [{
            reservationNumber,
            idempotencyKey: input.idempotencyKey,
            orderId: input.orderId,
            storeId: input.storeId,
            inventoryPoolId: poolId,
            lines: reservationLines,
            status: "active",
            expiresAt: input.expiresAt,
          }],
          { session },
        );
        await StockMovement.insertMany(movements, { session });
        createdId = reservation._id as Types.ObjectId;
      });

      if (!createdId) throw new ConflictException("Reservation could not be created");
      return await this.findReservation(createdId.toString());
    } catch (error) {
      if (this.isDuplicateKey(error)) {
        const duplicate = await InventoryReservation.findOne({
          idempotencyKey: input.idempotencyKey,
        }).lean();
        if (duplicate) return duplicate;
      }
      this.handleDatabaseError(error);
    } finally {
      await session.endSession();
    }
  }

  async commitReservation(id: string, action: ReservationAction) {
    return this.transitionReservation(id, "committed", action);
  }

  async releaseReservation(id: string, action: ReservationAction) {
    return this.transitionReservation(id, "released", action);
  }

  async expireReservations(input: { limit: number; correlationId: string }) {
    const reservations = await InventoryReservation.find({
      status: "active",
      expiresAt: { $lte: new Date() },
    }).select("_id").limit(input.limit).lean() as unknown as LeanReservationId[];
    let expired = 0;
    for (const reservation of reservations) {
      try {
        await this.transitionReservation(reservation._id.toString(), "expired", {
          correlationId: input.correlationId,
          reason: "Reservation expiry elapsed",
        });
        expired += 1;
      } catch (error) {
        if (!(error instanceof ConflictException)) throw error;
      }
    }
    return { examined: reservations.length, expired };
  }

  private async transitionReservation(
    id: string,
    target: "committed" | "released" | "expired",
    action: ReservationAction,
  ) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const reservation = await InventoryReservation.findById(id).session(session);
        if (!reservation) throw new NotFoundException("Reservation was not found");
        if (reservation.status === target) return;
        if (reservation.status !== "active") {
          throw new ConflictException(`A ${reservation.status} reservation cannot become ${target}`);
        }
        if (target === "committed" && reservation.expiresAt.getTime() <= Date.now()) {
          throw new ConflictException("The reservation has expired and cannot be committed");
        }

        const movements = [];
        for (const line of reservation.lines) {
          for (const allocation of line.allocations) {
            const quantity = allocation.quantity;
            const change = target === "committed"
              ? { onHand: -quantity, reserved: -quantity }
              : { reserved: -quantity };
            const updated = await InventoryBalance.findOneAndUpdate(
              {
                productVariantId: line.productVariantId,
                inventoryLocationId: allocation.inventoryLocationId,
                reserved: { $gte: quantity },
                ...(target === "committed" ? { onHand: { $gte: quantity } } : {}),
              },
              { $inc: change },
              { new: true, runValidators: true, session },
            ).lean() as unknown as LeanBalance | null;
            if (!updated) throw new ConflictException("Reserved inventory is inconsistent");
            movements.push({
              movementId: randomUUID(),
              productVariantId: line.productVariantId,
              inventoryLocationId: allocation.inventoryLocationId,
              type: target === "committed" ? "reservation_committed" : "reservation_released",
              onHandDelta: target === "committed" ? -quantity : 0,
              reservedDelta: -quantity,
              resultingOnHand: updated.onHand,
              resultingReserved: updated.reserved,
              referenceType: "reservation",
              referenceId: reservation.reservationNumber,
              reason: action.reason,
              correlationId: action.correlationId,
              actorId: action.actorId,
            });
          }
        }
        await StockMovement.insertMany(movements, { session });
        reservation.status = target;
        if (target === "committed") reservation.committedAt = new Date();
        else {
          reservation.releasedAt = new Date();
          reservation.releaseReason = action.reason ?? (target === "expired" ? "Expired" : "Released");
        }
        await reservation.save({ session });
      });
      return await this.findReservation(id);
    } catch (error) {
      this.handleDatabaseError(error);
    } finally {
      await session.endSession();
    }
  }

  private async findPoolForStore(storeId: string, session?: ClientSession) {
    const now = new Date();
    const store = await Store.findOne({ _id: storeId, isActive: true }).session(session ?? null).lean();
    if (!store) throw new NotFoundException("Active store was not found");
    const binding = await StoreInventoryPoolBinding.findOne({
      storeId,
      status: "active",
      effectiveFrom: { $lte: now },
      $or: [{ effectiveUntil: { $exists: false } }, { effectiveUntil: null }, { effectiveUntil: { $gt: now } }],
    }).sort({ effectiveFrom: -1 }).session(session ?? null).lean() as unknown as LeanPoolBinding | null;
    if (!binding) throw new ConflictException("The store has no active inventory pool");
    return binding.inventoryPoolId;
  }

  private parse<T>(schema: z.ZodType<T>, value: unknown): T {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({ message: "Validation failed", issues: result.error.issues });
    }
    return result.data;
  }

  private handleDatabaseError(error: unknown): never {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    ) throw error;
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
      throw new BadRequestException(error.message);
    }
    if (this.isDuplicateKey(error)) {
      throw new ConflictException("This idempotent inventory operation already exists");
    }
    throw error;
  }

  private isDuplicateKey(error: unknown): boolean {
    return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
  }
}
