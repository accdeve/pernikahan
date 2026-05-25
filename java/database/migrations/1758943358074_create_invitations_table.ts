import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'invitations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('slug').notNullable().unique().index()
      
      // Bride info
      table.string('bride_name').notNullable()
      table.string('bride_nickname').notNullable()
      table.string('bride_parent_father').nullable()
      table.string('bride_parent_mother').nullable()
      
      // Groom info
      table.string('groom_name').notNullable()
      table.string('groom_nickname').notNullable()
      table.string('groom_parent_father').nullable()
      table.string('groom_parent_mother').nullable()
      
      // Event info
      table.timestamp('akad_datetime').notNullable()
      table.timestamp('resepsi_datetime').notNullable()
      table.string('event_location').notNullable()
      table.string('event_address').notNullable()
      table.text('google_maps_url').nullable()
      
      // Financial/Gift details
      table.string('bank_name').nullable()
      table.string('bank_account_number').nullable()
      table.string('bank_account_holder').nullable()
      table.string('wallet_name').nullable()
      table.string('wallet_number').nullable()
      table.string('wallet_holder').nullable()
      
      // Music
      table.string('bg_music_url').nullable()

      // Theme Style
      table.string('style').notNullable().defaultTo('java_style')

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
