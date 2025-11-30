CREATE TABLE "achievements" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"xp" integer NOT NULL,
	"icon" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bncc_competencies" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"document_id" varchar
);
--> statement-breakpoint
CREATE TABLE "bncc_documents" (
	"id" varchar PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"uploaded_by" varchar NOT NULL,
	"uploaded_at" timestamp DEFAULT now() NOT NULL,
	"text_content" text,
	"processing_status" text DEFAULT 'processing' NOT NULL,
	"competencies_extracted" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "classes" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"teacher_id" varchar NOT NULL,
	"student_count" integer DEFAULT 0 NOT NULL,
	"engagement" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "coordinators" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	CONSTRAINT "coordinators_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "event_responses" (
	"id" varchar PRIMARY KEY NOT NULL,
	"event_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"status" text NOT NULL,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"location" text NOT NULL,
	"project_id" varchar,
	"teacher_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" varchar PRIMARY KEY NOT NULL,
	"project_id" varchar NOT NULL,
	"teacher_id" varchar NOT NULL,
	"comment" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_competencies" (
	"id" varchar PRIMARY KEY NOT NULL,
	"project_id" varchar NOT NULL,
	"competency_id" varchar NOT NULL,
	"coverage" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_planning" (
	"id" varchar PRIMARY KEY NOT NULL,
	"project_id" varchar NOT NULL,
	"objectives" text,
	"methodology" text,
	"resources" text,
	"timeline" text,
	"expected_outcomes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_planning_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"status" text NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"students" integer DEFAULT 0 NOT NULL,
	"next_deadline" text,
	"deadline_label" text,
	"theme" text NOT NULL,
	"teacher_id" varchar NOT NULL,
	"delayed" boolean DEFAULT false NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "rubric_criteria" (
	"id" varchar PRIMARY KEY NOT NULL,
	"project_id" varchar NOT NULL,
	"criteria" text NOT NULL,
	"weight" integer NOT NULL,
	"level1" text NOT NULL,
	"level2" text NOT NULL,
	"level3" text NOT NULL,
	"level4" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_achievements" (
	"id" varchar PRIMARY KEY NOT NULL,
	"student_id" varchar NOT NULL,
	"achievement_id" varchar NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"unlocked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"avatar" text,
	"xp" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	CONSTRAINT "students_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "students_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" varchar PRIMARY KEY NOT NULL,
	"project_id" varchar NOT NULL,
	"student_id" varchar NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"comment" text,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"avatar" text,
	"rating" integer DEFAULT 0,
	CONSTRAINT "teachers_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"hashed_password" text NOT NULL,
	"role" text NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "bncc_competencies" ADD CONSTRAINT "bncc_competencies_document_id_bncc_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."bncc_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bncc_documents" ADD CONSTRAINT "bncc_documents_uploaded_by_coordinators_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."coordinators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coordinators" ADD CONSTRAINT "coordinators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_responses" ADD CONSTRAINT "event_responses_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_responses" ADD CONSTRAINT "event_responses_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_competencies" ADD CONSTRAINT "project_competencies_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_competencies" ADD CONSTRAINT "project_competencies_competency_id_bncc_competencies_id_fk" FOREIGN KEY ("competency_id") REFERENCES "public"."bncc_competencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_planning" ADD CONSTRAINT "project_planning_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rubric_criteria" ADD CONSTRAINT "rubric_criteria_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_achievements" ADD CONSTRAINT "student_achievements_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_achievements" ADD CONSTRAINT "student_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;