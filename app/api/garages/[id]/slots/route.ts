import { NextResponse } from "next/server"
import { getAvailableSlots } from "@/app/lib/slots"

type Params = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Params) {
  const { id: garageId } = await params
  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get("date") // expects YYYY-MM-DD

  if (!dateParam || !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: "date query param required (YYYY-MM-DD)" }, { status: 400 })
  }

  const result = await getAvailableSlots(garageId, dateParam)
  return NextResponse.json(result)
}
