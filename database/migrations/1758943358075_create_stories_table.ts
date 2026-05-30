import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stories'

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
      table.string('milestone_date').notNullable() // e.g. "SEPTEMBER 2021"
      table.string('title').notNullable()
      table.text('description').notNullable()
      table.string('image_url').nullable()
      table.integer('sort_order').defaultTo(0).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
