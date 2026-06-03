import React from 'react'
import { createRoot } from 'react-dom/client'
import { LoginForm } from '../components/login-form.js'

const rootEl = document.getElementById('login-root')
if (rootEl) {
  const root = createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <LoginForm />
    </React.StrictMode>
  )
}
