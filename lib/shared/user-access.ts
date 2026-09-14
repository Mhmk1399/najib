export const USER_ROLE_OPTIONS = [
  { value: "customer", label: "مشتری" },
  { value: "owner", label: "مالک" },
  { value: "administrator", label: "مدیر سیستم" },
  { value: "catalog_manager", label: "مدیر کاتالوگ" },
  { value: "inventory_manager", label: "مدیر انبار" },
  { value: "order_manager", label: "مدیر سفارش‌ها" },
  { value: "customer_support", label: "پشتیبانی مشتریان" },
  { value: "finance", label: "مالی" },
  { value: "store_staff", label: "همکار فروشگاه" },
] as const;

export const USER_PERMISSION_OPTIONS = [
  { value: "admin.access", label: "ورود به پنل ادمین" },
  { value: "catalog.read", label: "مشاهده کاتالوگ" },
  { value: "catalog.write", label: "ویرایش کاتالوگ" },
  { value: "inventory.read", label: "مشاهده انبار" },
  { value: "inventory.write", label: "ویرایش انبار" },
  { value: "orders.read", label: "مشاهده سفارش‌ها" },
  { value: "orders.write", label: "ویرایش سفارش‌ها" },
  { value: "customers.read", label: "مشاهده مشتریان" },
  { value: "customers.write", label: "ویرایش مشتریان" },
  { value: "payments.read", label: "مشاهده پرداخت‌ها" },
  { value: "payments.refund", label: "ثبت بازپرداخت" },
  { value: "collections.read", label: "مشاهده کالکشن‌ها" },
  { value: "collections.write", label: "ویرایش کالکشن‌ها" },
  { value: "insights.read", label: "مشاهده گزارش‌ها" },
  { value: "settings.manage", label: "مدیریت تنظیمات" },
  { value: "staff.manage", label: "مدیریت کاربران" },
] as const;

export const USER_STATUS_OPTIONS = [
  { value: "invited", label: "دعوت‌شده" },
  { value: "active", label: "فعال" },
  { value: "suspended", label: "مسدود" },
  { value: "deleted", label: "حذف‌شده" },
] as const;

export type UserRoleValue = (typeof USER_ROLE_OPTIONS)[number]["value"];
export type UserPermissionValue =
  (typeof USER_PERMISSION_OPTIONS)[number]["value"];
export type UserStatusValue = (typeof USER_STATUS_OPTIONS)[number]["value"];

export function userRoleLabel(value: string) {
  return USER_ROLE_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

export function userPermissionLabel(value: string) {
  return (
    USER_PERMISSION_OPTIONS.find((item) => item.value === value)?.label ?? value
  );
}

export function userStatusLabel(value: string) {
  return (
    USER_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value
  );
}
