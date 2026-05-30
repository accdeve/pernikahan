import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'guests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('invitation_id')
        .unsigned()
        .references('id')
        .inTable('invitations')
        .onDelete('CASCADE')
        .notNullable()
      table.string('name').notNullable()
      table.string('attendance').nullable() // 'hadir' or 'tidak' or NULL
      table.text('comment').nullable() // Well wishes/greetings

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
