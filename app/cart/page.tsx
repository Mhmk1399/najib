import {
  CartPage,
} from "@/components/static/Cart/CartPage";
import { cartCopy } from "@/lib/i18n/cart-copy";

export default function Page() {
  return (
    <CartPage locale="fa" copy={cartCopy.fa} />
  );
}
