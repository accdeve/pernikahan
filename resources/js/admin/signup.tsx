import React from 'react'
import { createRoot } from 'react-dom/client'
import { SignupForm } from '../components/signup-form.js'

const rootEl = document.getElementById('signup-root')
if (rootEl) {
  const root = createRoot(rootEl)
  root.render(
    <React.StrictMode>
      <SignupForm />
    </React.StrictMode>
  )
}
