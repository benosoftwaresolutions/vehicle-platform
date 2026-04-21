import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/app/lib/prisma"

const f = createUploadthing()

export const ourFileRouter = {
  garageLogoUploader: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth()
      if (!userId) throw new UploadThingError("Unauthorised")

      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true, garageId: true },
      })
      if (!user || user.role !== "garage_owner" || !user.garageId) {
        throw new UploadThingError("Unauthorised")
      }

      return { garageId: user.garageId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.garage.update({
        where: { id: metadata.garageId },
        data: { logoUrl: file.url },
      })
      return { logoUrl: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
