import { Body, Controller, Get, Headers, Inject, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { FastifyRequest } from "fastify";
import { AuthService } from "./auth.service.js";

function metadata(request: FastifyRequest) {
  const forwarded = request.headers["x-forwarded-for"];
  return {
    ipAddress: (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0])?.trim() || request.ip,
    userAgent: request.headers["user-agent"],
  };
}

@ApiTags("staff-auth")
@Controller("auth/staff")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Authenticate an active staff account" })
  login(@Body() body: unknown, @Req() request: FastifyRequest) {
    return this.auth.login(this.auth.parseLogin(body), metadata(request));
  }

  @Post("refresh")
  @ApiOperation({ summary: "Rotate a staff refresh token" })
  refresh(@Body() body: unknown, @Req() request: FastifyRequest) {
    return this.auth.refresh(this.auth.parseRefresh(body), metadata(request));
  }

  @Get("me")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Read the active staff profile" })
  me(@Headers("authorization") authorization?: string) { return this.auth.profile(authorization); }

  @Post("logout")
  @ApiOperation({ summary: "Revoke one staff session" })
  logout(@Body() body: unknown, @Req() request: FastifyRequest) {
    return this.auth.logout(this.auth.parseRefresh(body), metadata(request));
  }

  @Post("logout-all")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Revoke every session for the active staff account" })
  logoutAll(@Headers("authorization") authorization: string | undefined, @Req() request: FastifyRequest) {
    return this.auth.logoutAll(authorization, metadata(request));
  }
}
