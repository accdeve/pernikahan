/**
 * themes/java_style.js — Javanese Royal Heritage Theme
 * Handles: cover entrance, open invitation, flower petals,
 * scroll reveal, countdown timer, photo lightbox, bottom nav
 */

import { gsap } from 'gsap'
import { initAudio, initClipboard, initRsvpForm } from '../shared.js'

function init() {
  const btnOpen = document.getElementById('btn-open-invitation')
  const cover = document.getElementById('cover')
  const mainContent = document.getElementById('invitation-main-content')
  const bottomControls = document.getElementById('invitation-bottom-controls')
  const countdownTimer = document.querySelector('.countdown-timer')

  // ─── 0. COVER ENTRANCE ANIMATIONS ───────────────────────────────────────
  const coverNames = document.querySelector('.cover-names')
  const coverDate = document.querySelector('.cover-date')
  const guestCard = document.querySelector('.guest-card')
  const javaneseLabel = document.querySelector('.javanese-label')

  if (coverNames)
    gsap.fromTo(
      coverNames,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out', delay: 0.3 }
    )
  if (javaneseLabel)
    gsap.fromTo(
      javaneseLabel,
      { opacity: 0, y: -10 },
      { opacity: 0.8, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.6 }
    )
  if (coverDate)
    gsap.fromTo(
      coverDate,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.8 }
    )
  if (guestCard)
    gsap.fromTo(
      guestCard,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.2 }
    )
  if (btnOpen)
    gsap.fromTo(
      btnOpen,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 1.5, ease: 'elastic.out(1, 0.75)', delay: 1.5 }
    )

  // ─── 1. OPEN INVITATION ──────────────────────────────────────────────────
  const audio = initAudio()

  if (btnOpen && cover && mainContent) {
    btnOpen.addEventListener('click', () => {
      gsap.to(cover, {
        yPercent: -100,
        opacity: 0,
        duration: 1.6,
        ease: 'power4.inOut',
        onComplete: () => {
          cover.style.display = 'none'
        },
      })

      mainContent.classList.remove('hidden')
      gsap.fromTo(
        mainContent,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out', delay: 0.2 }
      )

      if (bottomControls) {
        bottomControls.classList.remove('hidden')
        gsap.fromTo(
          bottomControls,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.8 }
        )
      }

      if (audio) {
        audio.play().catch((err) => console.log('Audio blocked:', err))
        const audioControl = document.getElementById('floating-audio-control')
        if (audioControl) audioControl.classList.add('rotating')
      }

      startFlowerFall()
      setupScrollReveal()

      setTimeout(() => window.dispatchEvent(new Event('resize')), 100)
    })
  }

  // ─── 2. COUNTDOWN TIMER ─────────────────────────────────────────────────
  if (countdownTimer) {
    const targetStr = countdownTimer.getAttribute('data-target')
    if (targetStr) {
      const targetDate = new Date(targetStr).getTime()
      const updateTimer = () => {
        const diff = targetDate - Date.now()
        if (diff <= 0) {
          clearInterval(timerInterval)
          return
        }
        const days = Math.floor(diff / 86400000)
        const hours = Math.floor((diff % 86400000) / 3600000)
        const minutes = Math.floor((diff % 3600000) / 60000)
        const seconds = Math.floor((diff % 60000) / 1000)
        const pad = (n) => String(n).padStart(2, '0')
        const dEl = document.getElementById('timer-days')
        const hEl = document.getElementById('timer-hours')
        const mEl = document.getElementById('timer-minutes')
        const sEl = document.getElementById('timer-seconds')
        if (dEl) dEl.textContent = pad(days)
        if (hEl) hEl.textContent = pad(hours)
        if (mEl) mEl.textContent = pad(minutes)
        if (sEl) sEl.textContent = pad(seconds)
      }
      updateTimer()
      const timerInterval = setInterval(updateTimer, 1000)
    }
  }

  // ─── 3. JASMINE PETAL FALL ──────────────────────────────────────────────
  function startFlowerFall() {
    const container = document.getElementById('flower-container')
    if (!container) return
    const maxPetals = 25
    let currentPetals = 0
    const createPetal = () => {
      if (currentPetals >= maxPetals) return
      const petal = document.createElement('div')
      petal.className = 'petal'
      const size = Math.random() * 8 + 6
      petal.style.width = `${size}px`
      petal.style.height = `${size}px`
      petal.style.left = `${Math.random() * 100}%`
      const duration = Math.random() * 5 + 5
      petal.style.animationDuration = `${duration}s`
      petal.style.animationDelay = `${Math.random() * 2}s`
      container.appendChild(petal)
      currentPetals++
      setTimeout(() => {
        petal.remove()
        currentPetals--
      }, duration * 1000)
    }
    setInterval(createPetal, 400)
  }

  // ─── 4. SCROLL REVEAL ───────────────────────────────────────────────────
  function setupScrollReveal() {
    const fadeUps = document.querySelectorAll('.fade-up')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated')
            gsap.fromTo(
              entry.target,
              { opacity: 0, y: 35 },
              { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
            )
          }
        })
      },
      { root: mainContent, threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    )
    fadeUps.forEach((el) => observer.observe(el))
  }

  // ─── 5. PHOTO LIGHTBOX ──────────────────────────────────────────────────
  const galleryItems = document.querySelectorAll('.gallery-item')
  const lightbox = document.getElementById('gallery-lightbox')
  const lightboxImg = document.getElementById('lightbox-img')
  const lightboxCaption = document.getElementById('lightbox-caption')

  if (lightbox && lightboxImg && lightboxCaption && galleryItems.length > 0) {
    let currentIndex = 0
    const photos = Array.from(galleryItems).map((item) => ({
      src: item.getAttribute('data-src'),
      caption: item.getAttribute('data-caption'),
    }))
    const showPhoto = (i) => {
      currentIndex = i
      lightboxImg.src = photos[i].src
      lightboxCaption.textContent = photos[i].caption
    }
    galleryItems.forEach((item, i) =>
      item.addEventListener('click', () => {
        lightbox.classList.add('active')
        showPhoto(i)
      })
    )
    document
      .querySelector('.lightbox-close')
      ?.addEventListener('click', () => lightbox.classList.remove('active'))
    document.querySelector('.lightbox-prev')?.addEventListener('click', (e) => {
      e.stopPropagation()
      showPhoto((currentIndex - 1 + photos.length) % photos.length)
    })
    document.querySelector('.lightbox-next')?.addEventListener('click', (e) => {
      e.stopPropagation()
      showPhoto((currentIndex + 1) % photos.length)
    })
    lightbox.addEventListener('click', () => lightbox.classList.remove('active'))
  }

  // ─── 6. BOTTOM NAV SCROLL HIGHLIGHT ────────────────────────────────────
  const navButtons = document.querySelectorAll('.nav-btn')
  const sections = document.querySelectorAll('section')

  if (mainContent && navButtons.length > 0) {
    navButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        const target = document.querySelector(btn.getAttribute('href'))
        if (target) {
          navButtons.forEach((b) => b.classList.remove('active'))
          btn.classList.add('active')
          mainContent.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
        }
      })
    })

    mainContent.addEventListener('scroll', () => {
      const scrollPos = mainContent.scrollTop + 120
      let currentId = 'couple'
      sections.forEach((sec) => {
        if (sec.offsetTop <= scrollPos) currentId = sec.id
      })
      navButtons.forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('href') === `#${currentId}`)
      })
    })
  }

  // ─── 7. CLIPBOARD & RSVP ────────────────────────────────────────────────
  initClipboard()
  initRsvpForm('comment-card-heritage', true)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
