CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" text NOT NULL,
	"clerk_user_id" text,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"photo_url" text,
	"role" text DEFAULT 'technician' NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"branch" text,
	"onboarding_complete" text DEFAULT 'false' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "employees_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'new' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"complaint_type" text DEFAULT 'breakdown' NOT NULL,
	"customer_id" text NOT NULL,
	"site_id" text,
	"asset_id" text,
	"assignee_id" text,
	"office_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
