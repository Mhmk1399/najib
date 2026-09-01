import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const reservationAllocationSchema = new Schema(
  {
    inventoryLocationId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryLocation",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isSafeInteger,
    },
  },
  { _id: false },
);

const reservationLineSchema = new Schema(
  {
    productVariantId: { type: String, required: true, trim: true },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: Number.isSafeInteger,
    },
    allocations: {
      type: [reservationAllocationSchema],
      required: true,
      validate: [
        (allocations: unknown[]) => allocations.length > 0,
        "Reservation line requires at least one location allocation",
      ],
    },
  },
  { _id: false },
);

const inventoryReservationSchema = new Schema(
  {
    reservationNumber: { type: String, required: true, trim: true, uppercase: true },
    idempotencyKey: { type: String, required: true, trim: true },
    orderId: { type: String, required: true, trim: true, index: true },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    inventoryPoolId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryPool",
      required: true,
      index: true,
    },
    lines: {
      type: [reservationLineSchema],
      required: true,
      validate: [
        (lines: unknown[]) => lines.length > 0,
        "Reservation requires at least one line",
      ],
    },
    status: {
      type: String,
      enum: ["active", "committed", "released", "expired", "cancelled"],
      default: "active",
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    committedAt: Date,
    releasedAt: Date,
    releaseReason: { type: String, trim: true },
  },
  { timestamps: true },
);

inventoryReservationSchema.pre("validate", function validateAllocations() {
  const variants = new Set<string>();

  this.lines.forEach((line, lineIndex) => {
    if (variants.has(line.productVariantId)) {
      this.invalidate(
        `lines.${lineIndex}.productVariantId`,
        "A variant may appear only once in a reservation",
      );
    }
    variants.add(line.productVariantId);

    const allocatedQuantity = line.allocations.reduce(
      (total, allocation) => total + allocation.quantity,
      0,
    );
    if (allocatedQuantity !== line.quantity) {
      this.invalidate(
        `lines.${lineIndex}.allocations`,
        "Allocated quantity must equal requested quantity",
      );
    }
  });
});

inventoryReservationSchema.index({ reservationNumber: 1 }, { unique: true });
inventoryReservationSchema.index({ idempotencyKey: 1 }, { unique: true });
inventoryReservationSchema.index({ status: 1, expiresAt: 1 });

export type InventoryReservationDocument = InferSchemaType<
  typeof inventoryReservationSchema
>;
export const InventoryReservation =
  models.InventoryReservation ||
  model("InventoryReservation", inventoryReservationSchema);

