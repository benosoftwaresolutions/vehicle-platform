"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"
import { revalidatePath } from "next/cache"

export async function updateProfileName(name: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorised")
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Name cannot be empty")
  await prisma.user.update({ where: { clerkId: userId }, data: { name: trimmed } })
  revalidatePath("/profile")
}
