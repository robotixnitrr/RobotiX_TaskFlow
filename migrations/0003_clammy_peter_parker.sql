ALTER TABLE "projects" ADD COLUMN "technologies" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "skills" text[] DEFAULT '{}';