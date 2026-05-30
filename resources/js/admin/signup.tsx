import React from 'react'
import { createRoot } from 'react-dom/client'
import { SignupForm } from '../components/signup-form.js'

const configEl = document.getElementById('server-config')
const serverConfig = configEl
  ? JSON.parse(configEl.textContent || '{}')
  : { csrfToken: '', flashError: '', flashData: {} }

const rootEl = document.getElementById('signup-root')
if (rootEl) {
  const root = createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <SignupForm
        csrfToken={serverConfig.csrfToken}
        flashError={serverConfig.flashError}
        flashData={serverConfig.flashData}
      />
    </React.StrictMode>
  )
}
