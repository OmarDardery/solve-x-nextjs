Loaded Prisma config from prisma.config.ts.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "students" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "last_changed_password" TIMESTAMPTZ(6),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professors" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "last_changed_password" TIMESTAMPTZ(6),

    CONSTRAINT "professors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "contact" TEXT,
    "link" TEXT,
    "last_changed_password" TIMESTAMPTZ(6),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coins" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "amount" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,

    CONSTRAINT "coins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunities" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "professor_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "details" TEXT,
    "requirements" TEXT,
    "reward" TEXT,
    "type" TEXT NOT NULL,

    CONSTRAINT "opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "student_id" BIGINT NOT NULL,
    "opportunity_id" BIGINT NOT NULL,
    "message" TEXT,
    "resume_link" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "title" TEXT,
    "description" TEXT,
    "date" TEXT,
    "link" TEXT,
    "sign_up_link" TEXT,
    "organization_id" BIGINT,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_reports" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "student_id" BIGINT NOT NULL,
    "recipient_id" BIGINT NOT NULL,
    "drive_link" TEXT NOT NULL,

    CONSTRAINT "weekly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "recipient_id" BIGINT NOT NULL,
    "recipient_role" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT DEFAULT 'info',
    "read" BOOLEAN DEFAULT false,
    "read_at" TIMESTAMPTZ(6),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_tags" (
    "student_id" BIGINT NOT NULL,
    "tag_id" BIGINT NOT NULL,

    CONSTRAINT "student_tags_pkey" PRIMARY KEY ("student_id","tag_id")
);

-- CreateTable
CREATE TABLE "opportunity_tags" (
    "opportunity_id" BIGINT NOT NULL,
    "tag_id" BIGINT NOT NULL,

    CONSTRAINT "opportunity_tags_pkey" PRIMARY KEY ("opportunity_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uni_students_email" ON "students"("email");

-- CreateIndex
CREATE INDEX "idx_students_deleted_at" ON "students"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "uni_professors_email" ON "professors"("email");

-- CreateIndex
CREATE INDEX "idx_professors_deleted_at" ON "professors"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "uni_organizations_email" ON "organizations"("email");

-- CreateIndex
CREATE INDEX "idx_organizations_deleted_at" ON "organizations"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "uni_tags_name" ON "tags"("name");

-- CreateIndex
CREATE INDEX "idx_tags_deleted_at" ON "tags"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "idx_coins_student_id" ON "coins"("student_id");

-- CreateIndex
CREATE INDEX "idx_coins_deleted_at" ON "coins"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_opportunities_deleted_at" ON "opportunities"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_applications_deleted_at" ON "applications"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_events_deleted_at" ON "events"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_weekly_reports_deleted_at" ON "weekly_reports"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_notifications_deleted_at" ON "notifications"("deleted_at");

-- AddForeignKey
ALTER TABLE "coins" ADD CONSTRAINT "fk_students_coins" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "fk_opportunities_professor" FOREIGN KEY ("professor_id") REFERENCES "professors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "fk_applications_opportunity" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "fk_applications_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "fk_events_organization" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weekly_reports" ADD CONSTRAINT "fk_weekly_reports_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_tags" ADD CONSTRAINT "fk_student_tags_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_tags" ADD CONSTRAINT "fk_student_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_tags" ADD CONSTRAINT "fk_opportunity_tags_opportunity" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunity_tags" ADD CONSTRAINT "fk_opportunity_tags_tag" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

