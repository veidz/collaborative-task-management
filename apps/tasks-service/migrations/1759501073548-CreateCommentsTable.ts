import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm'

export class CreateCommentsTable1759501073548 implements MigrationInterface {
  name = 'CreateCommentsTable1759501073548'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'comments',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'content',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'task_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'author_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    )

    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['task_id'],
        referencedTableName: 'tasks',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    )

    await queryRunner.query(`
      CREATE INDEX idx_comments_task_id ON comments(task_id);
    `)

    await queryRunner.query(`
      CREATE INDEX idx_comments_author_id ON comments(author_id);
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_comments_author_id;`)
    await queryRunner.query(`DROP INDEX IF EXISTS idx_comments_task_id;`)

    const table = await queryRunner.getTable('comments')
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('task_id') !== -1,
    )
    if (foreignKey) {
      await queryRunner.dropForeignKey('comments', foreignKey)
    }

    await queryRunner.dropTable('comments')
  }
}
