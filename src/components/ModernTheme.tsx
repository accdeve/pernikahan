'use client'

import { useEffect, useRef, useState } from 'react'
import { DateTime } from 'luxon'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MockInvitation, MockGuest } from '@/services/mockData'
import AudioPlayer from './AudioPlayer'

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger)

interface ModernThemeProps {
  invitation: MockInvitation
  guestName?: string
}

export default function ModernTheme({ invitation, guestName = '' }: ModernThemeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [startAudio, setStartAudio] = useState(false)
  const [guests, setGuests] = useState<MockGuest[]>(invitation.guests)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  
  // RSVP Form States
  const [rsvpName, setRsvpName] = useState(guestName)
  const [rsvpAttendance, setRsvpAttendance] = useState('hadir')
  const [rsvpComment, setRsvpComment] = useState('')

  // Refs
  const coverRef = useRef<HTMLDivElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)

  // Enable dynamic scrollbars for the Modern Theme layout
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    
    // Add theme class to body to trigger all scoped CSS rules in globals.css
    body.classList.add('theme-image_sequence')
    
    html.style.overflow = 'auto'
    body.style.overflow = 'auto'
    html.style.height = 'auto'
    body.style.height = 'auto'
    
    return () => {
      // Restore on unmount
      body.classList.remove('theme-image_sequence')
      html.style.overflow = ''
      body.style.overflow = ''
      html.style.height = ''
      body.style.height = ''
    }
  }, [])

  // 1. Cover entrance animations
  useEffect(() => {
    const q = gsap.utils.selector(coverRef)
    gsap.fromTo(q('.cover-subtitle'), { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.3 })
    gsap.fromTo(q('.cover-title'), { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out', delay: 0.6 })
    gsap.fromTo(q('.cover-date'), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.0 })
    gsap.fromTo(q('.guest-card-editorial'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.3 })
    gsap.fromTo(q('#btn-open-invitation'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.6 })
  }, [])

  // 2. GSAP Scroll Sequence & Reveals (once open)
  useEffect(() => {
    if (!isOpen) return

    // Sekuen Foto (Pinned Image Sequence)
    const seqContainer = document.getElementById('editorial-sequence-container')
    let seqTrigger: ScrollTrigger | null = null

    if (seqContainer) {
      const slides = seqContainer.querySelectorAll('.sequence-slide')
      const texts = seqContainer.querySelectorAll('.sequence-text')
      const totalFrames = slides.length
      
      if (totalFrames > 1) {
        slides[0]?.classList.add('active')
        texts[0]?.classList.add('active')

        seqTrigger = ScrollTrigger.create({
          trigger: seqContainer,
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
    }

    // Scroll reveal triggers
    const reveals = document.querySelectorAll('.reveal-on-scroll')
    const revealTriggers: ScrollTrigger[] = []

    reveals.forEach((el) => {
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(el, {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: 'power3.out',
          })
        }
      })
      revealTriggers.push(trigger)
    })

    // Nav active link scrolling highlight
    const sectionIds = ['cover', 'editorial-sequence-container', 'editorial-event', 'editorial-rsvp']
    const handleScroll = () => {
      const scrollPos = window.scrollY + window.innerHeight / 3
      let currentId = sectionIds[0]

      sectionIds.forEach((id) => {
        const sec = document.getElementById(id)
        if (sec && scrollPos >= sec.offsetTop) currentId = id
      })

      const headerLinks = document.querySelectorAll('.editorial-nav-link')
      const bottomLinks = document.querySelectorAll('.editorial-bottom-nav-btn')
      ;[...headerLinks, ...bottomLinks].forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`)
      })
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      if (seqTrigger) seqTrigger.kill()
      revealTriggers.forEach(t => t.kill())
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isOpen])

  // 3. Open Invitation Handler
  const handleOpenInvitation = () => {
    if (coverRef.current) {
      gsap.to(coverRef.current, {
        yPercent: -100,
        opacity: 0,
        duration: 1.6,
        ease: 'power4.inOut',
        onComplete: () => {
          if (coverRef.current) coverRef.current.style.display = 'none'
        },
      })
    }

    setIsOpen(true)
    setStartAudio(true)

    if (mainContentRef.current) {
      mainContentRef.current.classList.remove('hidden')
      window.scrollTo(0, 0)
      gsap.fromTo(mainContentRef.current, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out', delay: 0.3 })
    }
  }

  // 4. Clipboard helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // 5. RSVP submit handler (simulated in-memory)
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rsvpName.trim() || !rsvpComment.trim()) return

    const newGuest: MockGuest = {
      id: Date.now(),
      invitationId: invitation.id,
      name: rsvpName,
      attendance: rsvpAttendance,
      comment: rsvpComment,
      createdAt: DateTime.now().toISO() || '',
    }

    setGuests([newGuest, ...guests])
    setRsvpComment('')
  }

  return (
    <div className="theme-image_sequence w-full">
      {/* ─── MUSIC PLAYER ─── */}
      <AudioPlayer url={invitation.bgMusicUrl} autoPlayTrigger={startAudio} />

      {/* ─── 0. COVER ENTRY OVERLAY ─── */}
      <div 
        ref={coverRef} 
        id="cover" 
        className="editorial-cover"
      >
        {/* Background Image with high-contrast monochrome tint */}
        <div 
          className="cover-bg-image" 
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop')` }}
        ></div>
        <div className="cover-overlay"></div>
        
        <div className="cover-content">
          <span className="cover-subtitle">THE WEDDING INVITATION</span>
          <h1 className="cover-title">
            {invitation.groomNickname} &amp; {invitation.brideNickname}
          </h1>
          <div className="cover-divider"></div>
          <p className="cover-date">
            {DateTime.fromISO(invitation.akadDatetime).toFormat('dd . MM . yyyy')}
          </p>
          
          {guestName && (
            <div className="guest-card-editorial">
              <span className="guest-label">DEAR GUEST</span>
              <span className="guest-name">{guestName}</span>
            </div>
          )}
          
          <button 
            id="btn-open-invitation" 
            className="btn-open-editorial"
            onClick={handleOpenInvitation}
          >
            BUKA UNDANGAN
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div 
        ref={mainContentRef} 
        id="invitation-main-content" 
        className="editorial-main-content hidden"
      >
        {/* ─── 1. FIXED HEADER NAV ─── */}
        <header className="editorial-header">
          <div className="header-logo">
            {invitation.groomNickname.charAt(0)} &amp; {invitation.brideNickname.charAt(0)}
          </div>
          <nav className="header-nav-links">
            <a href="#cover" className="editorial-nav-link">HOME</a>
            <a href="#editorial-sequence-container" className="editorial-nav-link">OUR STORY</a>
            <a href="#editorial-event" className="editorial-nav-link">EVENTS</a>
            <a href="#editorial-rsvp" className="editorial-nav-link">RSVP</a>
          </nav>
          <div className="header-right-placeholder"></div>
        </header>

        {/* Floating Audio Control Button */}
        <button id="floating-audio-control" className="floating-audio-btn-editorial rotating">
          <span className="material-symbols-outlined">music_note</span>
        </button>

        {/* ─── 2. JOURNEY PINNED IMAGE SEQUENCE ─── */}
        <div id="editorial-sequence-container" className="sequence-container">
          <div className="sequence-stage">
            {/* Slide 1 (Bride Photo) */}
            <div className="sequence-slide active">
              <img 
                src={invitation.galleries && invitation.galleries.length > 0 ? invitation.galleries[0].imageUrl : 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070'} 
                className="sequence-img" 
                alt="The Bride" 
              />
            </div>

            {/* Slide 2 (Groom Photo) */}
            <div className="sequence-slide">
              <img 
                src={invitation.galleries && invitation.galleries.length > 1 ? invitation.galleries[1].imageUrl : 'https://images.unsplash.com/photo-1519225495810-7517c5a7d754?q=80&w=2070'} 
                className="sequence-img" 
                alt="The Groom" 
              />
            </div>

            {/* Slide 3+ (Story Photos) */}
            {invitation.stories.map((story) => (
              <div key={story.id} className="sequence-slide">
                <img 
                  src={story.imageUrl || 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070'} 
                  className="sequence-img" 
                  alt={story.title} 
                />
              </div>
            ))}
          </div>

          <div className="sequence-overlay"></div>

          {/* Pinned Content Overlays */}
          <div className="sequence-texts">
            {/* Text 1 (Bride Introduction) */}
            <div className="sequence-text active">
              <span className="text-subtitle">THE BRIDE</span>
              <h2 className="text-title">{invitation.brideName}</h2>
              <p className="text-parent">Putri dari {invitation.brideParentFather || '-'} &amp; {invitation.brideParentMother || '-'}</p>
            </div>

            {/* Text 2 (Groom Introduction) */}
            <div className="sequence-text">
              <span className="text-subtitle">THE GROOM</span>
              <h2 className="text-title">{invitation.groomName}</h2>
              <p className="text-parent">Putra dari {invitation.groomParentFather || '-'} &amp; {invitation.groomParentMother || '-'}</p>
            </div>

            {/* Text 3+ (Stories Milestones) */}
            {invitation.stories.map((story) => (
              <div key={story.id} className="sequence-text">
                <span className="text-subtitle">{story.milestoneDate}</span>
                <h2 className="text-title">{story.title}</h2>
                <p className="text-description">{story.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── 3. WEDDING DETAILS / EVENT ─── */}
        <section id="editorial-event" className="editorial-event-section">
          <div className="editorial-container">
            <div className="event-grid">
              {/* Akad Nikah Block */}
              <div className="event-block reveal-on-scroll">
                <div className="event-image-wrapper">
                  <img 
                    src={invitation.galleries && invitation.galleries.length > 2 ? invitation.galleries[2].imageUrl : 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070'} 
                    className="event-image" 
                    alt="Solemnization Venue" 
                  />
                </div>
                <div className="event-details">
                  <span className="event-subtitle">THE SOLEMNIZATION</span>
                  <h2 className="event-title">Akad Nikah</h2>
                  <div className="event-line"></div>
                  <div className="event-info-row">
                    <span className="material-symbols-outlined">schedule</span>
                    <span className="event-info-text">{DateTime.fromISO(invitation.akadDatetime).toFormat('HH:mm')} WIB</span>
                  </div>
                  <div className="event-info-row">
                    <span className="material-symbols-outlined">location_on</span>
                    <span className="event-info-text">
                      <strong>{invitation.eventLocation}</strong><br/>
                      {invitation.eventAddress}
                    </span>
                  </div>
                  {invitation.googleMapsUrl && (
                    <a href={invitation.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn-event-map">
                      OPEN MAPS
                    </a>
                  )}
                </div>
              </div>

              {/* Resepsi Block */}
              <div className="event-block event-block-offset reveal-on-scroll">
                <div className="event-image-wrapper">
                  <img 
                    src={invitation.galleries && invitation.galleries.length > 3 ? invitation.galleries[3].imageUrl : 'https://images.unsplash.com/photo-1519225495810-7517c5a7d754?q=80&w=2070'} 
                    className="event-image" 
                    alt="Celebration Venue" 
                  />
                </div>
                <div className="event-details">
                  <span className="event-subtitle">THE CELEBRATION</span>
                  <h2 className="event-title">Resepsi</h2>
                  <div className="event-line"></div>
                  <div className="event-info-row">
                    <span className="material-symbols-outlined">schedule</span>
                    <span className="event-info-text">{DateTime.fromISO(invitation.resepsiDatetime).toFormat('HH:mm')} WIB</span>
                  </div>
                  <div className="event-info-row">
                    <span className="material-symbols-outlined">location_on</span>
                    <span className="event-info-text">
                      <strong>{invitation.eventLocation}</strong><br/>
                      {invitation.eventAddress}
                    </span>
                  </div>
                  {invitation.googleMapsUrl && (
                    <a href={invitation.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn-event-map">
                      OPEN MAPS
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. RSVP & GUESTBOOK ─── */}
        <section id="editorial-rsvp" className="editorial-rsvp-section reveal-on-scroll">
          <div className="editorial-container max-w-4xl mx-auto">
            {/* Form Header */}
            <h2 className="editorial-section-title uppercase pl-8 border-l-2 border-primary mb-12">THE RSVP</h2>
            
            {/* Form Box */}
            <div className="rsvp-card-editorial mb-16">
              <form className="space-y-12" onSubmit={handleRsvpSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                  <div className="relative form-group-editorial">
                    <label className="form-label-editorial">FULL NAME</label>
                    <input 
                      id="name" 
                      name="name" 
                      className="form-input-editorial" 
                      placeholder="As written on invitation" 
                      type="text" 
                      value={rsvpName} 
                      onChange={(e) => setRsvpName(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="relative form-group-editorial">
                    <label className="form-label-editorial">WILL YOU BE ATTENDING?</label>
                    <div className="flex gap-8 pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          className="form-radio-editorial" 
                          name="attendance" 
                          type="radio" 
                          value="hadir" 
                          checked={rsvpAttendance === 'hadir'}
                          onChange={(e) => setRsvpAttendance(e.target.value)}
                          required 
                        />
                        <span className="form-radio-label">Joyfully Accept</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          className="form-radio-editorial" 
                          name="attendance" 
                          type="radio" 
                          value="tidak" 
                          checked={rsvpAttendance === 'tidak'}
                          onChange={(e) => setRsvpAttendance(e.target.value)}
                          required 
                        />
                        <span className="form-radio-label">Regretfully Decline</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="relative form-group-editorial">
                  <label className="form-label-editorial">WISHES &amp; BLESSINGS</label>
                  <textarea 
                    id="comment" 
                    name="comment" 
                    className="form-input-editorial form-textarea-editorial" 
                    placeholder="Tuliskan pesan atau doa restu Anda..." 
                    rows={3} 
                    value={rsvpComment}
                    onChange={(e) => setRsvpComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button className="btn-submit-editorial" type="submit" id="btn-submit-rsvp">
                    SUBMIT RESPONSE
                  </button>
                </div>
              </form>
            </div>

            {/* Wishes List */}
            <div className="guestbook-section-editorial mb-16">
              <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
                <h3 className="font-headline-md text-headline-md tracking-wider text-primary">GUESTBOOK</h3>
                <span id="rsvp-count-badge" className="font-label-caps text-label-caps text-primary/60">{guests.length} UCAPAN</span>
              </div>

              <div className="comments-container-editorial custom-scrollbar" id="comments-list">
                {guests.length > 0 ? (
                  guests.map((guest, index) => (
                    <div key={guest.id} className={`comment-card-editorial ${index === 0 ? 'new-message' : ''}`}>
                      <div className="comment-card-header">
                        <span className="comment-card-author">{guest.name}</span>
                        <span className="comment-card-time">
                          {guest.createdAt ? DateTime.fromISO(guest.createdAt).toFormat('dd MMM yyyy, HH:mm') : ''}
                        </span>
                      </div>
                      <p className="comment-card-text">
                        "{guest.comment}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="no-comments text-center text-muted font-sans py-8" id="no-comments-placeholder">
                    Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
                  </div>
                )}
              </div>
            </div>

            {/* Digital Envelope / Registry Section */}
            {(invitation.bankName || invitation.walletName) && (
              <div className="registry-section-editorial mt-16">
                <div className="editorial-line my-12"></div>
                <h3 className="font-display-lg-mobile md:font-headline-lg text-display-lg-mobile md:text-headline-lg mb-8 uppercase text-center text-primary">Digital Registry</h3>
                <p className="font-body-lg text-body-lg text-on-surface-variant mb-12 max-w-sm mx-auto text-center">
                  Bagi keluarga dan kerabat yang ingin mengirimkan hadiah digital, dapat dikirimkan melalui rekening berikut:
                </p>

                <div className="registry-grid">
                  {/* Gift Card 1 (Bank) */}
                  {invitation.bankName && (
                    <div className="registry-card">
                      <div className="registry-card-header">
                        <div>
                          <span className="registry-card-label">REKENING BANK</span>
                          <h4 className="registry-card-bank">{invitation.bankName}</h4>
                        </div>
                        <span className="material-symbols-outlined">credit_card</span>
                      </div>
                      <div className="registry-card-body">
                        <div>
                          <p className="registry-number-label">NOMOR REKENING</p>
                          <p className="registry-number" id="acc-bank">{invitation.bankAccountNumber}</p>
                        </div>
                        <button 
                          className="btn-copy" 
                          onClick={() => handleCopy(invitation.bankAccountNumber || '', 'bank')}
                        >
                          {copiedText === 'bank' ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                      <div className="registry-card-footer">
                        <p>A.N. {invitation.bankAccountHolder}</p>
                      </div>
                    </div>
                  )}

                  {/* Gift Card 2 (Wallet) */}
                  {invitation.walletName && (
                    <div className="registry-card">
                      <div className="registry-card-header">
                        <div>
                          <span className="registry-card-label">DOMPET DIGITAL</span>
                          <h4 className="registry-card-bank">{invitation.walletName}</h4>
                        </div>
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                      </div>
                      <div className="registry-card-body">
                        <div>
                          <p className="registry-number-label">NOMOR AKUN</p>
                          <p className="registry-number" id="acc-wallet">{invitation.walletNumber}</p>
                        </div>
                        <button 
                          className="btn-copy" 
                          onClick={() => handleCopy(invitation.walletNumber || '', 'wallet')}
                        >
                          {copiedText === 'wallet' ? 'COPIED' : 'COPY'}
                        </button>
                      </div>
                      <div className="registry-card-footer">
                        <p>A.N. {invitation.walletHolder}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Toast for Copy Confirmation */}
          <div className={`copy-toast-editorial ${copiedText ? 'show' : ''}`}>
            Nomor berhasil disalin!
          </div>
        </section>

        {/* ─── 5. CLOSING SECTION ─── */}
        <section className="editorial-closing-section">
          {/* Use galleries[4] (Taman Bunga Senja) or galleries[5] (Ikatan Suci) if available for full-bleed closing image */}
          <div 
            className="closing-bg-image" 
            style={{ backgroundImage: `url('${invitation.galleries && invitation.galleries.length > 4 ? invitation.galleries[4].imageUrl : 'https://images.unsplash.com/photo-1519225495810-7517c5a7d754?q=80&w=2070'}')` }}
          ></div>
          <div className="closing-overlay"></div>
          
          <div className="closing-content reveal-on-scroll">
            <span className="closing-subtitle">OUR GRATITUDE</span>
            <h2 className="closing-title">Thank You</h2>
            <p className="closing-desc">
              Ungkapan syukur dan terima kasih kami ucapkan atas doa restu serta kehadiran Bapak/Ibu/Saudara/i dalam momen suci pernikahan kami.
            </p>
            <div className="closing-line"></div>
            <p className="closing-names">
              {invitation.groomNickname} &amp; {invitation.brideNickname}
            </p>
          </div>
        </section>
      </div>

      {/* ─── FLOATING BOTTOM NAV FOR MOBILE ─── */}
      {isOpen && (
        <nav className="editorial-bottom-nav">
          <a className="editorial-bottom-nav-btn active" href="#cover">
            <span className="material-symbols-outlined">home</span>
          </a>
          <a className="editorial-bottom-nav-btn" href="#editorial-sequence-container">
            <span className="material-symbols-outlined">book</span>
          </a>
          <a className="editorial-bottom-nav-btn" href="#editorial-event">
            <span className="material-symbols-outlined">calendar_today</span>
          </a>
          <a className="editorial-bottom-nav-btn" href="#editorial-rsvp">
            <span className="material-symbols-outlined">rsvp</span>
          </a>
        </nav>
      )}
    </div>
  )
}
