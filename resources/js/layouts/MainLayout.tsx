import * as React from 'react'
import { Outlet } from 'react-router-dom'

import { AudioPlayer } from '../components/shared/AudioPlayer'

interface MainLayoutProps {
  title?: string
  description?: string
  ogImage?: string
  audioUrl?: string
  onOpen?: () => void
}

export function MainLayout({
  title = 'Wedding Invitation',
  description = 'You are invited to celebrate our special day',
  ogImage,
  audioUrl,
  onOpen,
}: MainLayoutProps) {
  return (
    <div className="h-svh overflow-y-auto">
      {onOpen && (
        <button
          onClick={onOpen}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a2e]/95 backdrop-blur-sm"
          aria-label="Buka Undangan"
        >
          <div className="text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 animate-pulse text-[#d4af37]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-9 0H8m0 0h4m-4 0a2 2 0 01-2-2V8a2 2 0 012-2h4a2 2 0 012 2v1a2 2 0 01-2 2m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="mb-2 font-cinzel text-2xl font-semibold text-white">
              Buka Undangan
            </h2>
            <p className="font-inter text-sm text-white/70">Tap untuk melihat undangan</p>
          </div>
        </button>
      )}

      <Outlet />

      {audioUrl && <AudioPlayer audioUrl={audioUrl} />}
    </div>
  )
}
