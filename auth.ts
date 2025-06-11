import NextAuth from "next-auth";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        console.log(
          "🔐 Starting authorization with credentials:",
          !!credentials
        );

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          // Find user in database
          const user = await prisma.user.findFirst({
            where: { email: credentials.email as string },
          });

          console.log("👤 User found:", !!user);

          if (!user || !user.password) {
            console.log("❌ User not found or no password");
            return null;
          }

          // Check password
          const isMatch = await compare(
            credentials.password as string,
            user.password
          );

          console.log("🔑 Password match:", isMatch);

          if (isMatch) {
            console.log("✅ Authorization successful for:", user.email);
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }

          console.log("❌ Password mismatch");
          return null;
        } catch (error) {
          console.error("💥 Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // Make JWT callback async
    async jwt({ token, user, trigger, session }: any) {
      console.log("🎫 JWT Callback - trigger:", trigger);

      // Initial sign in - add user data to token
      if (user) {
        console.log("👤 Adding user to token:", user.email);
        token.role = user.role;
        token.id = user.id;
        // here we make namein email as user name if no name is provided
        token.role = user.role;
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];
          //syncing the database with newly created name
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
        if (trigger === "signIn" || trigger === "signUp") {
          //get the session cartId and add as user cart
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;
          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId: sessionCartId },
            });
            if (sessionCart) {
              //if there is a session cart , override any existing user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });
              //assign new cart

              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      // Handle session updates
      // if (trigger === "update" && session) {
      //   token.name = session.user.name;
      // }

      console.log("🎫 JWT token created/updated for:", token.email);
      return token;
    },

    // Make session callback async
    async session({ session, token, trigger, user }: any) {
      console.log("📋 Session Callback - token sub:", token.sub);

      if (token && session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
        session.user.name = token.name;
      }
      if (trigger === "update") {
        session.user.name = user.name;
      }

      console.log("📋 Session created for:", token);
      return session;
    },
    authorized({ request, auth }: any) {
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
  debug: process.env.NODE_ENV === "development",
  trustHost: true,
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? `__Secure-authjs.session-token`
          : `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(config);
