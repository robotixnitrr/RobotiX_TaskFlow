import { type NextRequest, NextResponse } from "next/server"
import { ProjectRepository } from "@/lib/repositories"
import { updateProjectSchema } from "@/lib/validations/project"
import { z } from "zod"

interface RouteParams {
    params: {
        id: string
    }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const projectId = Number.parseInt(params.id)

        if (isNaN(projectId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid project ID",
                },
                { status: 400 },
            )
        }

        const project = await ProjectRepository.findById(projectId)

        if (!project) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Project not found",
                },
                { status: 404 },
            )
        }

        return NextResponse.json({
            success: true,
            data: project,
        })
    } catch (error) {
        console.error("Failed to fetch project:", error)

        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch project",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const projectId = Number.parseInt(params.id)

        if (isNaN(projectId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid project ID",
                },
                { status: 400 },
            )
        }

        const body = await request.json()

        // Validate request body
        const validatedData = updateProjectSchema.parse({ ...body, id: projectId })

        // Check if project exists
        const existingProject = await ProjectRepository.findById(projectId)
        if (!existingProject) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Project not found",
                },
                { status: 404 },
            )
        }

        // Update project
        const { id, ...updateData } = validatedData
        const updatedProject = await ProjectRepository.update(projectId, { ...updateData, budget: updateData.budget?.toString() })

        if (!updatedProject) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to update project",
                },
                { status: 500 },
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedProject,
            message: "Project updated successfully",
        })
    } catch (error) {
        console.error("Failed to update project:", error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed",
                    details: error.errors,
                },
                { status: 400 },
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: "Failed to update project",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const projectId = Number.parseInt(params.id)

        if (isNaN(projectId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid project ID",
                },
                { status: 400 },
            )
        }

        // Check if project exists
        const existingProject = await ProjectRepository.findById(projectId)
        if (!existingProject) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Project not found",
                },
                { status: 404 },
            )
        }

        // Delete project
        const success = await ProjectRepository.delete(projectId)

        if (!success) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Failed to delete project",
                },
                { status: 500 },
            )
        }

        return NextResponse.json({
            success: true,
            message: "Project deleted successfully",
        })
    } catch (error) {
        console.error("Failed to delete project:", error)

        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete project",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
}
