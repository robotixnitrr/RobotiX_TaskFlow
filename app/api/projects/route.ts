import { NextResponse } from "next/server"
import { ProjectRepository } from "@/lib/repositories"

export async function GET() {
  try {
    const projects = await ProjectRepository.findAll()

    return NextResponse.json({
      success: true,
      data: projects,
    })
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      status,
      category,
      startDate,
      endDate,
      teamLeadId,
      teamLeadName,
      teamMembers,
      technologies,
      githubUrl,
      demoUrl,
      imageUrl,
    } = body

    if (!title || !description || !status || !category || !startDate || !teamLeadId || !teamLeadName) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const project = await ProjectRepository.create({
      title,
      description,
      status,
      category,
      startDate,
      endDate,
      teamLeadId,
      teamLeadName,
      teamMembers: teamMembers || [],
      technologies: technologies || [],
      githubUrl,
      demoUrl,
      imageUrl,
    })

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
