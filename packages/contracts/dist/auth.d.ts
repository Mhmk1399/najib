import { z } from "zod";
export declare const staffRoleSchema: z.ZodEnum<{
    owner: "owner";
    administrator: "administrator";
    catalog_manager: "catalog_manager";
    inventory_manager: "inventory_manager";
    order_manager: "order_manager";
    customer_support: "customer_support";
    finance: "finance";
    store_staff: "store_staff";
}>;
export declare const staffPermissionSchema: z.ZodEnum<{
    "admin.access": "admin.access";
    "catalog.read": "catalog.read";
    "catalog.write": "catalog.write";
    "inventory.read": "inventory.read";
    "inventory.write": "inventory.write";
    "orders.read": "orders.read";
    "orders.write": "orders.write";
    "customers.read": "customers.read";
    "customers.write": "customers.write";
    "payments.read": "payments.read";
    "payments.refund": "payments.refund";
    "collections.read": "collections.read";
    "collections.write": "collections.write";
    "insights.read": "insights.read";
    "settings.manage": "settings.manage";
    "staff.manage": "staff.manage";
}>;
export declare const staffLoginSchema: z.ZodObject<{
    email: z.ZodEmail;
    password: z.ZodString;
}, z.core.$strip>;
export declare const staffRefreshSchema: z.ZodObject<{
    refreshToken: z.ZodString;
}, z.core.$strip>;
export declare const staffProfileSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodEmail;
    firstName: z.ZodString;
    lastName: z.ZodString;
    roles: z.ZodArray<z.ZodEnum<{
        owner: "owner";
        administrator: "administrator";
        catalog_manager: "catalog_manager";
        inventory_manager: "inventory_manager";
        order_manager: "order_manager";
        customer_support: "customer_support";
        finance: "finance";
        store_staff: "store_staff";
    }>>;
    permissions: z.ZodArray<z.ZodEnum<{
        "admin.access": "admin.access";
        "catalog.read": "catalog.read";
        "catalog.write": "catalog.write";
        "inventory.read": "inventory.read";
        "inventory.write": "inventory.write";
        "orders.read": "orders.read";
        "orders.write": "orders.write";
        "customers.read": "customers.read";
        "customers.write": "customers.write";
        "payments.read": "payments.read";
        "payments.refund": "payments.refund";
        "collections.read": "collections.read";
        "collections.write": "collections.write";
        "insights.read": "insights.read";
        "settings.manage": "settings.manage";
        "staff.manage": "staff.manage";
    }>>;
    allowedStoreIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export declare const staffSessionResponseSchema: z.ZodObject<{
    accessToken: z.ZodString;
    refreshToken: z.ZodString;
    accessTokenExpiresInSeconds: z.ZodNumber;
    refreshTokenExpiresAt: z.ZodISODateTime;
    staff: z.ZodObject<{
        id: z.ZodString;
        email: z.ZodEmail;
        firstName: z.ZodString;
        lastName: z.ZodString;
        roles: z.ZodArray<z.ZodEnum<{
            owner: "owner";
            administrator: "administrator";
            catalog_manager: "catalog_manager";
            inventory_manager: "inventory_manager";
            order_manager: "order_manager";
            customer_support: "customer_support";
            finance: "finance";
            store_staff: "store_staff";
        }>>;
        permissions: z.ZodArray<z.ZodEnum<{
            "admin.access": "admin.access";
            "catalog.read": "catalog.read";
            "catalog.write": "catalog.write";
            "inventory.read": "inventory.read";
            "inventory.write": "inventory.write";
            "orders.read": "orders.read";
            "orders.write": "orders.write";
            "customers.read": "customers.read";
            "customers.write": "customers.write";
            "payments.read": "payments.read";
            "payments.refund": "payments.refund";
            "collections.read": "collections.read";
            "collections.write": "collections.write";
            "insights.read": "insights.read";
            "settings.manage": "settings.manage";
            "staff.manage": "staff.manage";
        }>>;
        allowedStoreIds: z.ZodArray<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type StaffRole = z.infer<typeof staffRoleSchema>;
export type StaffPermission = z.infer<typeof staffPermissionSchema>;
export type StaffLogin = z.infer<typeof staffLoginSchema>;
export type StaffRefresh = z.infer<typeof staffRefreshSchema>;
export type StaffProfile = z.infer<typeof staffProfileSchema>;
export type StaffSessionResponse = z.infer<typeof staffSessionResponseSchema>;
