import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { AvailabilityService } from "./availability.service.js";

@ApiTags("inventory")
@Controller()
export class AvailabilityController {
  constructor(
    @Inject(AvailabilityService)
    private readonly inventory: AvailabilityService,
  ) {}

  @Post("availability/check")
  @ApiOperation({ summary: "Check exact variant availability for a store" })
  checkAvailability(@Body() body: unknown) {
    return this.inventory.checkAvailability(this.inventory.parseAvailability(body));
  }

  @Get("reservations/:id")
  @ApiOperation({ summary: "Read an inventory reservation" })
  findReservation(@Param("id") id: string) {
    return this.inventory.findReservation(this.inventory.parseId(id));
  }

  @Post("reservations")
  @ApiOperation({ summary: "Atomically reserve exact variant inventory" })
  createReservation(@Body() body: unknown) {
    return this.inventory.createReservation(
      this.inventory.parseCreateReservation(body),
    );
  }

  @Post("reservations/:id/commit")
  @ApiOperation({ summary: "Commit reserved stock after an order succeeds" })
  commitReservation(@Param("id") id: string, @Body() body: unknown) {
    return this.inventory.commitReservation(
      this.inventory.parseId(id),
      this.inventory.parseAction(body),
    );
  }

  @Post("reservations/:id/release")
  @ApiOperation({ summary: "Release stock from an active reservation" })
  releaseReservation(@Param("id") id: string, @Body() body: unknown) {
    return this.inventory.releaseReservation(
      this.inventory.parseId(id),
      this.inventory.parseAction(body),
    );
  }

  @Post("reservations/expire")
  @ApiOperation({ summary: "Release reservations whose expiry time elapsed" })
  expireReservations(@Body() body: unknown) {
    return this.inventory.expireReservations(this.inventory.parseExpiryRun(body));
  }
}
