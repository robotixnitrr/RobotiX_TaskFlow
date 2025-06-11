import { NextResponse } from "next/server"
import { ProjectRepository } from "@/lib/repositories"

export async function GET() {
  try {
    const stats = await ProjectRepository.getStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Failed to fetch project statistics:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch project statistics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
