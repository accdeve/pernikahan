import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'invitation.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'invitation.rsvp': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_auth.show_login': { paramsTuple?: []; params?: {} }
    'admin_auth.login': { paramsTuple?: []; params?: {} }
    'admin_auth.logout': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.edit': { paramsTuple?: []; params?: {} }
    'admin.update': { paramsTuple?: []; params?: {} }
    'admin.stories': { paramsTuple?: []; params?: {} }
    'admin.create_story': { paramsTuple?: []; params?: {} }
    'admin.delete_story': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.gallery': { paramsTuple?: []; params?: {} }
    'admin.create_gallery': { paramsTuple?: []; params?: {} }
    'admin.delete_gallery': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.guests': { paramsTuple?: []; params?: {} }
    'admin.delete_guest': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'invitation.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_auth.show_login': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.edit': { paramsTuple?: []; params?: {} }
    'admin.stories': { paramsTuple?: []; params?: {} }
    'admin.gallery': { paramsTuple?: []; params?: {} }
    'admin.guests': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'invitation.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_auth.show_login': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.edit': { paramsTuple?: []; params?: {} }
    'admin.stories': { paramsTuple?: []; params?: {} }
    'admin.gallery': { paramsTuple?: []; params?: {} }
    'admin.guests': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'invitation.rsvp': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_auth.login': { paramsTuple?: []; params?: {} }
    'admin_auth.logout': { paramsTuple?: []; params?: {} }
    'admin.update': { paramsTuple?: []; params?: {} }
    'admin.create_story': { paramsTuple?: []; params?: {} }
    'admin.delete_story': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.create_gallery': { paramsTuple?: []; params?: {} }
    'admin.delete_gallery': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin.delete_guest': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}