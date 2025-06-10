"use client";

import { Cart } from "@/types";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

const CartTable = ({ cart }: { cart?: Cart }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  return (
    <>
      <h1 className="py-4 h2-bold">Shopping cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go Shopping</Link>{" "}
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            {JSON.stringify(cart)}
          </div>
        </div>
      )}
    </>
  );
};
export default CartTable;
