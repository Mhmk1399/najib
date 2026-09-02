import { Controller, Get } from "@nestjs/common";
@Controller()
export class AppController { @Get() getService() { return { name: "customer-data", version: "v1" }; } }
