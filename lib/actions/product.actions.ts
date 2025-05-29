"use server";

import { LATEST_PRODUCTS_LIMIT } from "../constants";
import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "../utils";

//get latest products

export async function getLatestProducts() {
  const data = await prisma.product.findMany({
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });
  return convertToPlainObject(data);
}

// get single product by slug

export async function getProductBySlug(slug: string) {
  const data = await prisma.product.findFirst({ where: { slug: slug } });
  return convertToPlainObject(data);
}
