import NextAuth from "next-auth";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authConfig } from "./auth.config";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt" as const,
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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user in database
        const user = await prisma.user.findFirst({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        // Check password
        const isMatch = await compare(
          credentials.password as string,
          user.password
        );

        if (isMatch) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Make JWT callback
    async jwt({ token, user, trigger, session }: any) {
      // Initial sign in - add user data to token
      if (user) {
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
      if (trigger === "update" && session?.user?.name) {
        token.name = session.user.name;
      }

      return token;
    },

    // session callback
    async session({ session, token, trigger, user }: any) {
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },
  },
  // debug: process.env.NODE_ENV === "development",
  // trustHost: true,
  // cookies: {
  //   sessionToken: {
  //     name:
  //       process.env.NODE_ENV === "production"
  //         ? `__Secure-authjs.session-token`
  //         : `authjs.session-token`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: "lax",
  //       path: "/",
  //       secure: process.env.NODE_ENV === "production",
  //     },
  //   },
  // },
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(config);
