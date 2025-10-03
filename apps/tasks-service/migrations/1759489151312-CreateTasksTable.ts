import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateTasksTable1759489151312 implements MigrationInterface {
  name = 'CreateTasksTable1759489151312'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."tasks_status_enum" AS ENUM('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED')
    `)

    await queryRunner.query(`
      CREATE TYPE "public"."tasks_priority_enum" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT')
    `)

    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'TODO',
        "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'MEDIUM',
        "deadline" TIMESTAMP,
        "createdById" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_createdById" ON "tasks" ("createdById")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_status" ON "tasks" ("status")
    `)

    await queryRunner.query(`
      CREATE INDEX "IDX_tasks_priority" ON "tasks" ("priority")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_tasks_priority"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_tasks_status"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_tasks_createdById"`)
    await queryRunner.query(`DROP TABLE "tasks"`)
    await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`)
    await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`)
  }
}
