import { type NextRequest, NextResponse } from "next/server";
import { ProjectMemberRepository } from "@/lib/repositories";
import { projectMemberSchema } from "@/lib/validations/project";
import { z } from "zod";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    // Await the params object to access the id
    const { id } = await context.params;
    const projectId = Number.parseInt(id);

    if (isNaN(projectId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project ID",
        },
        { status: 400 }
      );
    }

    const members = await ProjectMemberRepository.findByProject(projectId);

    return NextResponse.json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Failed to fetch project members:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch project members",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    // Await the params object to access the id
    const { id } = await context.params;
    const projectId = Number.parseInt(id);

    if (isNaN(projectId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid project ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = projectMemberSchema.parse({ ...body, projectId });

    // Add member to project
    const member = await ProjectMemberRepository.addMember(validatedData);

    return NextResponse.json(
      {
        success: true,
        data: member,
        message: "Member added to project successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to add project member:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to add project member",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}