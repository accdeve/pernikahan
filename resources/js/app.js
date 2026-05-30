/**
 * app.js — Bootstrap Entry Point
 *
 * Initializes Alpine.js, then dynamically imports the correct
 * theme module based on the `class="theme-*"` set on <body>.
 *
 * To add a new theme:
 *  1. Create resources/js/themes/<theme_key>.js
 *  2. Add a case below
 */

import Alpine from 'alpinejs'
import { supabase } from './lib/supabase-client.js'
import { loginHandler, signupHandler } from './b2b/auth.js'
import { dashboardHandler } from './b2b/dashboard.js'
import { weddingViewer } from './themes/wedding.js'
import { anniversaryViewer } from './themes/anniversary.js'

window.supabase = supabase

// Register Alpine.js Data Controllers
Alpine.data('loginHandler', loginHandler)
Alpine.data('signupHandler', signupHandler)
Alpine.data('dashboardHandler', dashboardHandler)
Alpine.data('weddingViewer', weddingViewer)
Alpine.data('anniversaryViewer', anniversaryViewer)

Alpine.start()

// Detect active theme from body class set by the server for classic pages
const bodyClasses = document.body.classList

if (bodyClasses.contains('theme-image_sequence')) {
  import('./themes/image_sequence.js')
} else if (bodyClasses.contains('theme-java_style')) {
  import('./themes/java_style.js')
}
