import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // adjust to your actual path
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { id, name, email, position, lastNotificationReadAt } = body;
    const user = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        position: users.position,
        lastNotificationReadAt: users.lastNotificationReadAt,
    }).from(users)
        .where(eq(users.id, id))
        .limit(1);

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const updatedUser = user[0];
    if (updatedUser.email !== email) {
        const existingUser = await db.select({
            id: users.id,
            email: users.email,
        })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        if (existingUser.length > 0) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }
    }
    if (name) {
        updatedUser.name = name;
    }
    if (email) {
        updatedUser.email = email;
    }
    if (position) {
        updatedUser.position = position;
    }
    if (lastNotificationReadAt) {
        updatedUser.lastNotificationReadAt = new Date(lastNotificationReadAt);
    }
    const userUpdate = await db.update(users)
        .set({
            name: updatedUser.name,
            email: updatedUser.email,
            position: updatedUser.position,
            lastNotificationReadAt: updatedUser.lastNotificationReadAt,
        })
        .where(eq(users.id, id))
        .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            position: users.position,
            lastNotificationReadAt: users.lastNotificationReadAt,
        });
    if (userUpdate.length === 0) {
        return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
    return NextResponse.json({ user }, { status: 200 });

}
