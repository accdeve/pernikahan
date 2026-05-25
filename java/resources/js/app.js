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

Alpine.start()

// Detect active theme from body class set by the server
const bodyClasses = document.body.classList

console.log('[app.js] Active body classes:', Array.from(bodyClasses))
if (bodyClasses.contains('theme-image_sequence')) {
  console.log('[app.js] Importing Modern Theme (image_sequence)...')
  import('./themes/image_sequence.js')
    .then(() => console.log('[app.js] Modern Theme imported successfully.'))
    .catch((err) => console.error('[app.js] Failed to import Modern Theme:', err))
} else {
  console.log('[app.js] Importing Javanese Theme (java_style)...')
  import('./themes/java_style.js')
    .then(() => console.log('[app.js] Javanese Theme imported successfully.'))
    .catch((err) => console.error('[app.js] Failed to import Javanese Theme:', err))
}
