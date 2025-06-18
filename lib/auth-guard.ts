import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  console.log("session is -", session);

  if (session?.user?.role !== "admin") {
    redirect("/unauthorized");
  }

  return session;
}
