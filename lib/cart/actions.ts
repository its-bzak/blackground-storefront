"use server";

import { refresh } from "next/cache";

import { getCartId, setCartId } from "@/lib/session";
import {
  addCartLines,
  createCart,
  removeCartLines,
  updateCartLines,
} from "@/lib/shopify/cart";

export type AddToCartState = {
  status: "idle" | "added" | "error";
  message?: string;
};

const VARIANT_GID = "gid://shopify/ProductVariant/";
const LINE_GID = "gid://shopify/CartLine/";

export async function addToCart(
  _previous: AddToCartState,
  formData: FormData,
): Promise<AddToCartState> {
  const merchandiseId = formData.get("merchandiseId");
  if (typeof merchandiseId !== "string" || !merchandiseId.startsWith(VARIANT_GID)) {
    return { status: "error", message: "Choose an option first." };
  }

  const lines = [{ merchandiseId, quantity: 1 }];

  try {
    const cartId = await getCartId();
    // An expired or checked-out cart can't take new lines; start a fresh one.
    const existing = cartId
      ? await addCartLines(cartId, lines).catch(() => null)
      : null;
    const cart = existing ?? (await createCart(lines));

    // Setting the cookie also re-renders the page, which updates the bag count.
    await setCartId(cart.id);
    return { status: "added" };
  } catch (error) {
    console.error("addToCart failed", error);
    return {
      status: "error",
      message: "We couldn't add this to your bag. Please try again.",
    };
  }
}

export async function updateCartLine(formData: FormData): Promise<void> {
  const lineId = formData.get("lineId");
  const quantity = Number(formData.get("quantity"));
  const cartId = await getCartId();

  if (
    !cartId ||
    typeof lineId !== "string" ||
    !lineId.startsWith(LINE_GID) ||
    !Number.isInteger(quantity) ||
    quantity < 0
  ) {
    return;
  }

  if (quantity === 0) {
    await removeCartLines(cartId, [lineId]);
  } else {
    await updateCartLines(cartId, [{ id: lineId, quantity }]);
  }
  refresh();
}
