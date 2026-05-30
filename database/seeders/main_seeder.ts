import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    // No-op: Database fully migrated to Supabase. Seeding is handled via Supabase seed.sql.
  }
}
