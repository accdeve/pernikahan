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

if (bodyClasses.contains('theme-image_sequence')) {
  import('./themes/image_sequence.js')
} else {
  // Default: java_style
  import('./themes/java_style.js')
}
