import { jsonError, jsonResponse } from "@/lib/server/response";
import { inventoryService } from "@/services/inventory/service";

export async function GET(request: Request) {
  try {
    return jsonResponse(
      await inventoryService.availability(Object.fromEntries(new URL(request.url).searchParams)),
      { cache: "no-store" },
    );
  } catch (error) {
    return jsonError(error);
  }
}
