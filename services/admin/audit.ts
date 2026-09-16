import "server-only";

import { z } from "zod";

import { connectToDatabase } from "@/lib/server/db";
import { StaffAudit } from "@/models/auth/staff-audit";

export const auditListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  search: z.string().trim().max(160).default(""),
  action: z.string().trim().max(120).optional(),
  outcome: z.enum(["success", "failure"]).optional(),
  targetType: z.string().trim().max(80).optional(),
  from: z.iso.datetime().optional(),
  to: z.iso.datetime().optional(),
}).strict();

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const adminAuditService = {
  async list(query: z.infer<typeof auditListQuerySchema>) {
    await connectToDatabase();
    const filter: Record<string, unknown> = {};
    if (query.action) filter.action = query.action;
    if (query.outcome) filter.outcome = query.outcome;
    if (query.targetType) filter.targetType = query.targetType;
    if (query.from || query.to) {
      filter.createdAt = {
        ...(query.from ? { $gte: new Date(query.from) } : {}),
        ...(query.to ? { $lte: new Date(query.to) } : {}),
      };
    }
    if (query.search) {
      const regex = new RegExp(escapeRegex(query.search), "i");
      filter.$or = [
        { email: regex },
        { action: regex },
        { reason: regex },
        { targetId: regex },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      StaffAudit.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      StaffAudit.countDocuments(filter),
    ]);
    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },
};
