import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'home': { paramsTuple?: []; params?: {} }
    'admin.auth.login': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.auth.login.post': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.signup.signup': { paramsTuple?: []; params?: {} }
    'admin.signup.signup.post': { paramsTuple?: []; params?: {} }
    'admin.panel.logout': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.panel.dashboard': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.panel.customers.store': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.panel.customers.detail': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
    'admin.panel.customers.update': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
    'admin.panel.stories.store': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
    'admin.panel.stories.delete': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue,'id': ParamValue} }
    'admin.panel.gallery.store': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
    'admin.panel.gallery.delete': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue,'id': ParamValue} }
    'admin.panel.guests.delete': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue,'id': ParamValue} }
    'invitation.show': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
    'invitation.rsvp': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
  }
  GET: {
    'home': { paramsTuple?: []; params?: {} }
    'admin.auth.login': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.signup.signup': { paramsTuple?: []; params?: {} }
    'admin.panel.dashboard': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.panel.customers.detail': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
    'invitation.show': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
  }
  HEAD: {
    'home': { paramsTuple?: []; params?: {} }
    'admin.auth.login': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.signup.signup': { paramsTuple?: []; params?: {} }
    'admin.panel.dashboard': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.panel.customers.detail': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
    'invitation.show': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
  }
  POST: {
    'admin.auth.login.post': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.signup.signup.post': { paramsTuple?: []; params?: {} }
    'admin.panel.logout': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.panel.customers.store': { paramsTuple: [ParamValue]; params: {'slug_wo': ParamValue} }
    'admin.panel.customers.update': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
    'admin.panel.stories.store': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
    'admin.panel.stories.delete': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue,'id': ParamValue} }
    'admin.panel.gallery.store': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
    'admin.panel.gallery.delete': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue,'id': ParamValue} }
    'admin.panel.guests.delete': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue,'id': ParamValue} }
    'invitation.rsvp': { paramsTuple: [ParamValue,ParamValue]; params: {'slug_wo': ParamValue,'customer_id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}