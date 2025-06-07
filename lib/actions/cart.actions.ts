"use server";

import { CartItem } from "@/types";

export async function addItemToCart(data: CartItem) {
  // await prisma.cart.create({ data: item });
  return { success: true, message: "Item added to cart" };
}
