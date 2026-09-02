import type { StaffPermission, StaffRole } from "@najib/contracts";
export declare const ACCESS_TOKEN_ISSUER = "najib-customer-data";
export declare const ACCESS_TOKEN_AUDIENCE = "najib-services";
export declare const ROLE_PERMISSIONS: Readonly<Record<StaffRole, readonly StaffPermission[]>>;
export interface StaffAccessClaims {
    sub: string;
    sid: string;
    roles: StaffRole[];
    permissions: StaffPermission[];
    allowedStoreIds: string[];
    iss: typeof ACCESS_TOKEN_ISSUER;
    aud: typeof ACCESS_TOKEN_AUDIENCE;
    typ: "staff_access";
    iat: number;
    exp: number;
}
export declare class InvalidAccessTokenError extends Error {
    constructor();
}
export declare function resolveStaffPermissions(roles: readonly StaffRole[], additions?: readonly StaffPermission[]): StaffPermission[];
export declare function createStaffAccessToken(input: Omit<StaffAccessClaims, "iss" | "aud" | "typ" | "iat" | "exp">, secret: string, ttlSeconds: number, nowSeconds?: number): string;
export declare function verifyStaffAccessToken(token: string, secret: string, nowSeconds?: number): StaffAccessClaims;
export declare function readBearerToken(header: string | undefined): string;
export declare function hasEveryPermission(claims: StaffAccessClaims, required: readonly StaffPermission[]): boolean;
