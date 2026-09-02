import { BadRequestException, Injectable } from "@nestjs/common";
import { recordCustomerActivitySchema, type RecordCustomerActivity } from "@najib/contracts";
import { CustomerActivityEvent } from "../models/activity.js";
@Injectable()
export class ActivityService {
  parse(value: unknown): RecordCustomerActivity {
    const result = recordCustomerActivitySchema.safeParse(value);
    if (!result.success) throw new BadRequestException({ message: "Validation failed", issues: result.error.issues });
    return result.data;
  }
  async record(input: RecordCustomerActivity) {
    const existing = await CustomerActivityEvent.findOne({ eventId: input.eventId }).lean();
    if (existing) return existing;
    try { return await CustomerActivityEvent.create({ ...input, schemaVersion: 1 }); }
    catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        return CustomerActivityEvent.findOne({ eventId: input.eventId }).lean();
      }
      throw error;
    }
  }
}
