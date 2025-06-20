/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
  providers: [], // Required by NextAuthConfig type
  callbacks: {
    authorized({ request, auth }: any) {
      //array of path patterns to protect using test method
      const protectedPaths = [
        /\/shipping-address/,
        /\/payment-method/,
        /\/place-order/,
        /\/profile/,
        /\/user\/(.*)/,
        /\/order\/(.*)/,
        /\/admin/,
      ];
      //get path name from req URL object
      const { pathname } = request.nextUrl;

      //check if user is not authenticated and accessing a protected route
      if (!auth && protectedPaths.some((p) => p.test(pathname))) {
        return false;
      }

      const sessionCartIdCookie = request.cookies.get("sessionCartId");

      if (!sessionCartIdCookie) {
        const sessionCartId = crypto.randomUUID();

        const newRequestHeaders = new Headers(request.headers);
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        response.cookies.set("sessionCartId", sessionCartId);

        return response; // ✅ Return the modified response
      }

      return true; // ✅ Allow access normally
    },
  },
} satisfies NextAuthConfig;
