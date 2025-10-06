import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateUserTable1759430887488 implements MigrationInterface {
  name = 'CreateUserTable1759430887488'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "email" varchar NOT NULL UNIQUE,
        "username" varchar NOT NULL UNIQUE,
        "password" varchar NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_USERS_EMAIL" ON "users" ("email")
    `)

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_USERS_USERNAME" ON "users" ("username")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USERS_USERNAME"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_USERS_EMAIL"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`)
  }
}
