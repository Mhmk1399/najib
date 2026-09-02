import { Controller, Get } from "@nestjs/common";
@Controller()
export class AppController {
  @Get()
  getService() { return { name: "payment", version: "v1" }; }
}
