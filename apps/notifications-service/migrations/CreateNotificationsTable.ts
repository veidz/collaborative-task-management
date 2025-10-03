import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateNotificationsTable1733238600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`)

    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: [
              'TASK_CREATED',
              'TASK_UPDATED',
              'TASK_DELETED',
              'COMMENT_CREATED',
            ],
            isNullable: false,
          },
          {
            name: 'message',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'read',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    )

    await queryRunner.query(`
      CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    `)

    await queryRunner.query(`
      CREATE INDEX idx_notifications_read ON notifications(read);
    `)

    await queryRunner.query(`
      CREATE INDEX idx_notifications_created_at ON notifications(created_at);
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS idx_notifications_created_at;`,
    )
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_read;`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_notifications_user_id;`)
    await queryRunner.dropTable('notifications')
  }
}
