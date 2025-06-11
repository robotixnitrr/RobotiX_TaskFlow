import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { milestones } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { updateMilestoneSchema } from "@/lib/validations/project"
// import { getServerSession } from "@/lib/auth"
import { ProjectRepository } from "@/lib/repositories"

export async function GET(request: NextRequest, { params }: { params: { id: string; milestoneId: string } }) {
  try {
    const projectId = Number.parseInt(params.id)
    const milestoneId = Number.parseInt(params.milestoneId)

    if (isNaN(projectId) || isNaN(milestoneId)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 })
    }
    const userCookie = request.cookies.get("user")?.value;
    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // const session = await getServerSession()
    // if (!session?.user) {
    //   return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    // }

    // Fetch the milestone
    const milestone = await db.query.milestones.findFirst({
      where: and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId)),
    })

    if (!milestone) {
      return NextResponse.json({ success: false, error: "Milestone not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: milestone,
    })
  } catch (error) {
    console.error("Error fetching milestone:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch milestone",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string; milestoneId: string } }) {
  try {
    const projectId = Number.parseInt(params.id)
    const milestoneId = Number.parseInt(params.milestoneId)

    if (isNaN(projectId) || isNaN(milestoneId)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 })
    }
    const userCookie = request.cookies.get("user")?.value;
    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // const session = await getServerSession()
    // if (!session?.user) {
    //   return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    // }

    // Check if project exists and user has permission
    const project = await ProjectRepository.findById(projectId)
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
    }

    // Check if user is team lead or has admin privileges
    const isTeamLead = project.teamLeadId === user.id
    const isAdmin = ["head-coordinator", "overall-coordinator"].includes(user.position || "")

    if (!isTeamLead && !isAdmin) {
      return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 })
    }

    // Check if milestone exists
    const existingMilestone = await db.query.milestones.findFirst({
      where: and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId)),
    })

    if (!existingMilestone) {
      return NextResponse.json({ success: false, error: "Milestone not found" }, { status: 404 })
    }

    const body = await request.json()

    // Validate milestone data
    const validationResult = updateMilestoneSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 },
      )
    }

    const updateData = validationResult.data

    // Update milestone
    const [updatedMilestone] = await db
      .update(milestones)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId)))
      .returning()

    return NextResponse.json({
      success: true,
      data: updatedMilestone,
      message: "Milestone updated successfully",
    })
  } catch (error) {
    console.error("Error updating milestone:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update milestone",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string; milestoneId: string } }) {
  try {
    const projectId = Number.parseInt(params.id)
    const milestoneId = Number.parseInt(params.milestoneId)

    if (isNaN(projectId) || isNaN(milestoneId)) {
      return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 })
    }
    const userCookie = request.cookies.get("user")?.value;
    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // const session = await getServerSession()
    // if (!session?.user) {
    //   return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    // }

    // Check if project exists and user has permission
    const project = await ProjectRepository.findById(projectId)
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
    }

    // Check if user is team lead or has admin privileges
    const isTeamLead = project.teamLeadId === user.id
    const isAdmin = ["head-coordinator", "overall-coordinator"].includes(user.position || "")

    if (!isTeamLead && !isAdmin) {
      return NextResponse.json({ success: false, error: "Permission denied" }, { status: 403 })
    }

    // Delete milestone
    const result = await db
      .delete(milestones)
      .where(and(eq(milestones.id, milestoneId), eq(milestones.projectId, projectId)))
      .returning({ id: milestones.id })

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Milestone not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Milestone deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting milestone:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete milestone",
      },
      { status: 500 },
    )
  }
}
