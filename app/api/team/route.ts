import { NextResponse } from "next/server"
import { UserRepository } from "@/lib/repositories"

export async function GET() {
  try {
    const members = await UserRepository.findAll()

    return NextResponse.json({
      success: true,
      members: members.map((member) => ({
        ...member,
        // Don't expose password in API response
        password: undefined,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch team members:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch team members" }, { status: 500 })
  }
}
