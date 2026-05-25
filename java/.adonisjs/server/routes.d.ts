import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'java.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'java.rsvp': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'modern.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'modern.rsvp': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'undangan.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'undangan.rsvp': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'legacy.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'legacy.rsvp': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
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
    'java.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'modern.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'undangan.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'legacy.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_auth.show_login': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.edit': { paramsTuple?: []; params?: {} }
    'admin.stories': { paramsTuple?: []; params?: {} }
    'admin.gallery': { paramsTuple?: []; params?: {} }
    'admin.guests': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'java.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'modern.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'undangan.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'legacy.show': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'admin_auth.show_login': { paramsTuple?: []; params?: {} }
    'admin.dashboard': { paramsTuple?: []; params?: {} }
    'admin.edit': { paramsTuple?: []; params?: {} }
    'admin.stories': { paramsTuple?: []; params?: {} }
    'admin.gallery': { paramsTuple?: []; params?: {} }
    'admin.guests': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'java.rsvp': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'modern.rsvp': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'undangan.rsvp': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
    'legacy.rsvp': { paramsTuple: [ParamValue]; params: {'slug': ParamValue} }
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