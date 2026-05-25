import { StorySchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Invitation from '#models/invitation'

export default class Story extends StorySchema {
  @belongsTo(() => Invitation, {
    foreignKey: 'invitationId',
  })
  declare invitation: BelongsTo<typeof Invitation>
}
