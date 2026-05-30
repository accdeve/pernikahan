import React from 'react'
import { createRoot } from 'react-dom/client'
import { LoginForm } from '../components/login-form.js'

const configEl = document.getElementById('server-config')
const serverConfig = configEl
  ? JSON.parse(configEl.textContent || '{}')
  : { slugWo: '', csrfToken: '', flashError: '', flashEmail: '' }

const rootEl = document.getElementById('login-root')
if (rootEl) {
  const root = createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <LoginForm
        slugWo={serverConfig.slugWo}
        csrfToken={serverConfig.csrfToken}
        flashError={serverConfig.flashError}
        flashEmail={serverConfig.flashEmail}
      />
    </React.StrictMode>
  )
}
