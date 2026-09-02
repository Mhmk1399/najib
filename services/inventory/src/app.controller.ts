import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("service")
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: "Read Inventory service information" })
  getService(): { name: string; version: string } {
    return { name: "inventory", version: "v1" };
  }
}

