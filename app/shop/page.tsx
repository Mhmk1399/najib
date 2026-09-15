import { Suspense } from "react";
import { ShopPage } from "@/components/static/Shop/ShopPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ShopPage />
    </Suspense>
  );
}
