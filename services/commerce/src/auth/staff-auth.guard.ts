import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, SetMetadata, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { hasEveryPermission, readBearerToken, verifyStaffAccessToken, type StaffAccessClaims } from "@najib/auth";
import type { StaffPermission } from "@najib/contracts";

const PERMISSIONS_KEY = "najib:staff-permissions";

export const RequireStaffPermissions = (...permissions: StaffPermission[]) => SetMetadata(PERMISSIONS_KEY, permissions);

@Injectable()
export class StaffAuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; staff?: StaffAccessClaims }>();
    let staff: StaffAccessClaims;
    try {
      staff = verifyStaffAccessToken(readBearerToken(request.headers.authorization), this.config.getOrThrow<string>("AUTH_ACCESS_TOKEN_SECRET"));
    } catch {
      throw new UnauthorizedException("A valid staff access token is required");
    }
    const required = this.reflector.getAllAndOverride<StaffPermission[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()]) ?? [];
    if (!hasEveryPermission(staff, required)) throw new ForbiddenException("The staff account does not have permission for this action");
    request.staff = staff;
    return true;
  }
}
