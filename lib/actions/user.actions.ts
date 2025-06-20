"use server";

import { auth, signIn, signOut } from "@/auth";
import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  updateUserSchema,
} from "../validators";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { AuthError } from "next-auth";
import { hashSync } from "bcrypt-ts-edge";
import { prisma } from "@/db/prisma";
import { formatError } from "../utils";
import { ShippingAddress } from "@/types";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "../generated/prisma";
import { PAGE_SIZE } from "../constants";
import { getMyCart } from "./cart.actions";

// Sign in user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const result = await signIn("credentials", user);

    // If we get here without error, sign-in was successful
    return { success: true, message: "Signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error; // Re-throw redirect errors
    }

    return { success: false, message: "Invalid email or password" };
  }
}

export async function signOutUser() {
  const currentCart = await getMyCart();

  if (currentCart?.id) {
    await prisma.cart.delete({ where: { id: currentCart.id } });
  } else {
    console.warn("No cart found for deletion.");
  }
  await signOut();
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

//save or update users address

export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });
    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });
    return { success: true, message: "User updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

//Update users payment method

export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });
    if (!currentUser) throw new Error("User not found");

    const paymentMethod = paymentMethodSchema.parse(data);
    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        paymentMethod: paymentMethod.type,
      },
    });
    return { success: true, message: "user updated successfullly" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update the user profile
export async function updateProfile(user: { name: string; email: string }) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session?.user?.id,
      },
    });

    if (!currentUser) throw new Error("User not found");

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: user.name,
      },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all the users
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query: string;
}) {
  const queryFilter: Prisma.UserWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  const data = await prisma.user.findMany({
    where: {
      ...queryFilter,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// Delete a user
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

// Update a user
export async function updateUser(user: z.infer<typeof updateUserSchema>) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        role: user.role,
      },
    });

    revalidatePath("/admin/users");

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
