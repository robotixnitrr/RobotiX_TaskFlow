import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { milestones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { milestoneSchema } from "@/lib/validations/project";
import { ProjectRepository } from "@/lib/repositories";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    // Await params to access id
    const { id } = await context.params;
    const projectId = Number.parseInt(id);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: "Invalid project ID" },
        { status: 400 }
      );
    }

    // Get user from cookie
    const userCookie = request.cookies.get("user")?.value;
    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if project exists
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Fetch milestones for the project
    const projectMilestones = await db.query.milestones.findMany({
      where: eq(milestones.projectId, projectId),
      orderBy: (milestones, { asc }) => [asc(milestones.date), asc(milestones.createdAt)],
    });

    return NextResponse.json({
      success: true,
      data: projectMilestones,
    });
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch milestones",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    // Await params to access id
    const { id } = await context.params;
    const projectId = Number.parseInt(id);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { success: false, error: "Invalid project ID" },
        { status: 400 }
      );
    }

    // Get user from cookie
    const userCookie = request.cookies.get("user")?.value;
    const user = userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if project exists
    const project = await ProjectRepository.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if user is team lead or has admin privileges
    const isTeamLead = project.teamLeadId === user.id;
    const isAdmin = ["head-coordinator", "overall-coordinator"].includes(
      user.position || ""
    );

    if (!isTeamLead && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "Permission denied" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate milestone data
    const validationResult = milestoneSchema.safeParse({
      ...body,
      projectId,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const milestoneData = validationResult.data;

    // Create milestone
    const [newMilestone] = await db
      .insert(milestones)
      .values({
        ...milestoneData,
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newMilestone,
      message: "Milestone created successfully",
    });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create milestone",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}