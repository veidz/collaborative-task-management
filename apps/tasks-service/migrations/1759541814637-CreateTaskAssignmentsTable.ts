import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm'

export class CreateTaskAssignmentsTable1759541814637
  implements MigrationInterface
{
  name = 'CreateTaskAssignmentsTable1759541814637'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'task_assignments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'task_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'assigned_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'assigned_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['task_id'],
            referencedTableName: 'tasks',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    )

    await queryRunner.createIndex(
      'task_assignments',
      new TableIndex({
        name: 'idx_task_assignments_task_id',
        columnNames: ['task_id'],
      }),
    )

    await queryRunner.createIndex(
      'task_assignments',
      new TableIndex({
        name: 'idx_task_assignments_user_id',
        columnNames: ['user_id'],
      }),
    )

    await queryRunner.createIndex(
      'task_assignments',
      new TableIndex({
        name: 'idx_task_assignments_task_user_unique',
        columnNames: ['task_id', 'user_id'],
        isUnique: true,
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'task_assignments',
      'idx_task_assignments_task_user_unique',
    )
    await queryRunner.dropIndex(
      'task_assignments',
      'idx_task_assignments_user_id',
    )
    await queryRunner.dropIndex(
      'task_assignments',
      'idx_task_assignments_task_id',
    )
    await queryRunner.dropTable('task_assignments')
  }
}
