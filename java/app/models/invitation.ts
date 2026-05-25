import { InvitationSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Story from '#models/story'
import Gallery from '#models/gallery'
import Guest from '#models/guest'

export default class Invitation extends InvitationSchema {
  @hasMany(() => Story, {
    foreignKey: 'invitationId',
  })
  declare stories: HasMany<typeof Story>

  @hasMany(() => Gallery, {
    foreignKey: 'invitationId',
  })
  declare galleries: HasMany<typeof Gallery>

  @hasMany(() => Guest, {
    foreignKey: 'invitationId',
  })
  declare guests: HasMany<typeof Guest>
}
