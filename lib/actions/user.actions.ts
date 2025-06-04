"use server";

import { signIn, signOut } from "@/auth";
import { signInFormSchema } from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";

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
