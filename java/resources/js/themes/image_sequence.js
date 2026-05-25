/**
 * themes/image_sequence.js — Aeterna Editorial (Image Sequence) Theme
 * Handles: editorial cover entrance, open invitation (fixed overlay),
 * GSAP pinned image sequence, scroll reveal, nav highlight, clipboard, RSVP
 */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { initAudio, initClipboard, initRsvpForm } from '../shared.js'

gsap.registerPlugin(ScrollTrigger)

document.addEventListener('DOMContentLoaded', () => {
  const btnOpen = document.getElementById('btn-open-invitation')
  const cover = document.getElementById('cover')
  const mainContent = document.getElementById('invitation-main-content')

  // ─── 0. COVER ENTRANCE ANIMATIONS ───────────────────────────────────────
  const coverTitle = document.querySelector('.cover-title')
  const coverSubtitle = document.querySelector('.cover-subtitle')
  const coverDate = document.querySelector('.cover-date')
  const guestCardEditorial = document.querySelector('.guest-card-editorial')

  if (coverSubtitle) gsap.fromTo(coverSubtitle, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.3 })
  if (coverTitle) gsap.fromTo(coverTitle, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out', delay: 0.6 })
  if (coverDate) gsap.fromTo(coverDate, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.0 })
  if (guestCardEditorial) gsap.fromTo(guestCardEditorial, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.3 })
  if (btnOpen) gsap.fromTo(btnOpen, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.6 })

  // ─── 1. OPEN INVITATION ──────────────────────────────────────────────────
  const audio = initAudio()

  if (btnOpen && cover && mainContent) {
    btnOpen.addEventListener('click', () => {
      // Slide cover up and out (cover is position:fixed — acts as a true overlay)
      gsap.to(cover, {
        yPercent: -100,
        opacity: 0,
        duration: 1.6,
        ease: 'power4.inOut',
        onComplete: () => { cover.style.display = 'none' },
      })

      // Reveal content (already at scroll position 0 since cover was fixed)
      mainContent.classList.remove('hidden')
      window.scrollTo({ top: 0, behavior: 'instant' })
      gsap.fromTo(mainContent, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out', delay: 0.3 })

      // Start editorial animations after content is visible
      setTimeout(() => {
        setupImageSequence()
        setupScrollReveal()
        setupNavHighlight()
      }, 800)

      // Audio
      if (audio) {
        audio.play().catch((err) => console.log('Audio blocked:', err))
        const audioControl = document.getElementById('floating-audio-control')
        if (audioControl) audioControl.classList.add('rotating')
      }

      setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
    })
  }

  // ─── 2. GSAP PINNED IMAGE SEQUENCE ──────────────────────────────────────
  function setupImageSequence() {
    const container = document.getElementById('editorial-sequence-container')
    if (!container) return

    const slides = container.querySelectorAll('.sequence-slide')
    const texts = container.querySelectorAll('.sequence-text')
    const totalFrames = slides.length
    if (totalFrames <= 1) return

    // Activate first slide immediately
    slides[0]?.classList.add('active')
    texts[0]?.classList.add('active')

    ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: `+=${window.innerHeight * totalFrames}`,
      pin: true,
      scrub: 0.8,
      onUpdate: (self) => {
        const activeIndex = Math.min(
          Math.round(self.progress * (totalFrames - 1)),
          totalFrames - 1
        )
        slides.forEach((slide, i) => slide.classList.toggle('active', i === activeIndex))
        texts.forEach((text, i) => text.classList.toggle('active', i === activeIndex))
      },
    })
  }

  // ─── 3. SCROLL REVEAL (window-based) ────────────────────────────────────
  function setupScrollReveal() {
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    })
  }

  // ─── 4. EDITORIAL NAV HIGHLIGHT ─────────────────────────────────────────
  function setupNavHighlight() {
    const sectionIds = ['cover', 'editorial-sequence-container', 'editorial-event', 'editorial-rsvp']
    const headerLinks = document.querySelectorAll('.editorial-nav-link')
    const bottomLinks = document.querySelectorAll('.editorial-bottom-nav-btn')

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + window.innerHeight / 3
      let currentId = sectionIds[0]

      sectionIds.forEach((id) => {
        const sec = document.getElementById(id)
        if (sec && scrollPos >= sec.offsetTop) currentId = id
      })

      ;[...headerLinks, ...bottomLinks].forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`)
      })
    })
  }

  // ─── 5. CLIPBOARD & RSVP ────────────────────────────────────────────────
  initClipboard()
  initRsvpForm('comment-card-editorial', false)
})
