"use server";

import { signIn, signOut } from "@/auth";
import { signInFormSchema, signUpFormSchema } from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";

// Sign in user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  console.log("🚀 Sign-in action started");

  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    console.log("📧 Attempting sign-in for:", user.email);

    const result = await signIn("credentials", {
      email: user.email,
      password: user.password,
    });

    console.log("✅ Sign-in result:", result);

    // If we get here without error, sign-in was successful
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    console.error("💥 Sign-in error:", error);

    if (isRedirectError(error)) {
      throw error; // Re-throw redirect errors
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, message: "Invalid email or password" };
        default:
          return { success: false, message: "Authentication failed" };
      }
    }

    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function signOutUser() {
  await signOut({ redirectTo: "/sign-in" });
}

//Signup user

export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    const plainPassword = user.password;
    user.password = hashSync(user.password, 10);
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });
    await signIn("credentials", { email: user.email, password: plainPassword });
    return { success: true, message: "User Registered Successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error; // Re-throw redirect errors
    }
    return { success: false, message: formatError(error) };
  }
}

//get user by Id

export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) throw new Error("user not found");
  return user;
}
