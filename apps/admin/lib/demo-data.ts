export const kpis = [
  { label: "Net revenue", value: "$86,420", change: "+12.8%", detail: "vs. previous period", tone: "positive" },
  { label: "Orders", value: "1,248", change: "+8.4%", detail: "104 awaiting fulfilment", tone: "positive" },
  { label: "Conversion rate", value: "3.82%", change: "+0.31", detail: "percentage points", tone: "positive" },
  { label: "Low-stock variants", value: "18", change: "6 urgent", detail: "across 11 products", tone: "warning" },
] as const;

export const chartRanges = {
  "7D": { revenue: "$21,480", orders: "306 orders", delta: "+9.2%", values: [42, 56, 48, 70, 63, 87, 78], labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  "30D": { revenue: "$86,420", orders: "1,248 orders", delta: "+12.8%", values: [24, 31, 29, 42, 38, 51, 47, 63, 58, 72, 66, 84, 79, 91], labels: ["Aug 4", "Aug 11", "Aug 18", "Aug 25", "Sep 2"] },
  "90D": { revenue: "$242,760", orders: "3,516 orders", delta: "+18.1%", values: [31, 38, 34, 47, 43, 55, 51, 62, 58, 69, 65, 74, 71, 82, 78, 88], labels: ["Jun", "Jul", "Aug", "Sep"] },
} as const;

export type ChartRange = keyof typeof chartRanges;

export const recentOrders = [
  { id: "NZ-2847", customer: "Amir Rahimi", item: "Midnight Wool Suit", amount: "$1,840", time: "11:42", status: "Paid" },
  { id: "NZ-2846", customer: "Kian Moradi", item: "Cashmere Overcoat", amount: "$1,260", time: "10:18", status: "Packing" },
  { id: "NZ-2845", customer: "Darius Kamali", item: "Silk Evening Shirt", amount: "$420", time: "09:54", status: "Review" },
  { id: "NZ-2844", customer: "Navid Azadi", item: "Double Monk Oxford", amount: "$680", time: "Yesterday", status: "Shipped" },
  { id: "NZ-2843", customer: "Reza Danesh", item: "Tailored Trousers", amount: "$390", time: "Yesterday", status: "Paid" },
] as const;

export const lowStock = [
  { product: "Midnight Wool Suit", variant: "52 / Ink", sku: "NJS-INK-52", units: 2 },
  { product: "Cashmere Overcoat", variant: "L / Camel", sku: "NCO-CAM-L", units: 3 },
  { product: "Silk Evening Shirt", variant: "M / Ivory", sku: "NES-IVR-M", units: 4 },
  { product: "Double Monk Oxford", variant: "43 / Espresso", sku: "NDO-ESP-43", units: 5 },
] as const;

export const activity = [
  { time: "11:47", title: "Inventory adjusted", detail: "2 units reserved for NZ-2847" },
  { time: "11:31", title: "Payment captured", detail: "$1,840 · Visa ending 1240" },
  { time: "10:52", title: "Collection published", detail: "Autumn formalwear · 18 pieces" },
  { time: "09:16", title: "Customer note added", detail: "Priority fitting request for Amir R." },
] as const;
