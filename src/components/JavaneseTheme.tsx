'use client'

import { useEffect, useRef, useState } from 'react'
import { DateTime } from 'luxon'
import gsap from 'gsap'
import { MockInvitation, MockGuest } from '@/services/mockData'
import AudioPlayer from './AudioPlayer'

interface JavaneseThemeProps {
  invitation: MockInvitation
  guestName?: string
}

export default function JavaneseTheme({ invitation, guestName = '' }: JavaneseThemeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [startAudio, setStartAudio] = useState(false)
  const [guests, setGuests] = useState<MockGuest[]>(invitation.guests)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  
  // RSVP Form States
  const [rsvpName, setRsvpName] = useState(guestName)
  const [rsvpAttendance, setRsvpAttendance] = useState('hadir')
  const [rsvpComment, setRsvpComment] = useState('')
  
  // Lightbox States
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Refs
  const coverRef = useRef<HTMLDivElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const bottomControlsRef = useRef<HTMLDivElement>(null)
  const flowerContainerRef = useRef<HTMLDivElement>(null)
  
  // Countdown Timer state
  const [days, setDays] = useState('00')
  const [hours, setHours] = useState('00')
  const [minutes, setMinutes] = useState('00')
  const [seconds, setSeconds] = useState('00')

  // Lock scrollbars on html and body for Javanese Theme to confine scroll to mobile wrapper
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    html.style.height = '100%'
    body.style.height = '100%'
    
    return () => {
      // Restore on unmount
      html.style.overflow = ''
      body.style.overflow = ''
      html.style.height = ''
      body.style.height = ''
    }
  }, [])

  // 1. Cover entrance animations
  useEffect(() => {
    const q = gsap.utils.selector(coverRef)
    gsap.fromTo(q('.cover-names'), { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out', delay: 0.3 })
    gsap.fromTo(q('.javanese-label'), { opacity: 0, y: -10 }, { opacity: 0.8, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.6 })
    gsap.fromTo(q('.cover-date'), { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.8 })
    gsap.fromTo(q('.guest-card'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 1.2 })
    gsap.fromTo(q('#btn-open-invitation'), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.5, ease: 'elastic.out(1, 0.75)', delay: 1.5 })
  }, [])

  // 2. Countdown Timer ticking
  useEffect(() => {
    const targetDate = DateTime.fromISO(invitation.akadDatetime).toMillis()
    const updateTimer = () => {
      const diff = targetDate - Date.now()
      if (diff <= 0) return
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      const pad = (n: number) => String(n).padStart(2, '0')
      setDays(pad(d))
      setHours(pad(h))
      setMinutes(pad(m))
      setSeconds(pad(s))
    }
    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [invitation.akadDatetime])

  // 3. Flower Petals Fall on open
  useEffect(() => {
    if (!isOpen) return
    const container = flowerContainerRef.current
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

    const interval = setInterval(createPetal, 400)
    return () => clearInterval(interval)
  }, [isOpen])

  // 4. Scroll Reveal trigger
  useEffect(() => {
    if (!isOpen) return
    const fadeUps = document.querySelectorAll('.fade-up')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          entry.target.classList.add('animated')
          gsap.fromTo(entry.target, { opacity: 0, y: 35 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
        }
      })
    }, { root: mainContentRef.current, threshold: 0.05, rootMargin: '0px 0px -40px 0px' })
    fadeUps.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [isOpen])

  // 5. Open Invitation Trigger
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
      gsap.fromTo(mainContentRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out', delay: 0.2 })
    }

    if (bottomControlsRef.current) {
      bottomControlsRef.current.classList.remove('hidden')
      gsap.fromTo(bottomControlsRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out', delay: 0.8 })
    }
  }

  // 6. Navigation Buttons Active states
  const [activeTab, setActiveTab] = useState('couple')
  const handleNavClick = (sectionId: string) => {
    const target = document.getElementById(sectionId)
    const container = mainContentRef.current
    if (target && container) {
      setActiveTab(sectionId)
      container.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
    }
  }

  const handleScroll = () => {
    const container = mainContentRef.current
    if (!container) return
    const scrollPos = container.scrollTop + 120
    const sections = ['couple', 'event', 'story', 'gallery', 'rsvp']
    let currentTab = 'couple'
    sections.forEach((id) => {
      const sec = document.getElementById(id)
      if (sec && sec.offsetTop <= scrollPos) currentTab = id
    })
    setActiveTab(currentTab)
  }

  // 7. Clipboard copy helper
  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(type)
    setTimeout(() => setCopiedText(null), 2000)
  }

  // 8. RSVP Form submit handler (pure React state in-memory simulation)
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

  // Lightbox handlers
  const handleLightboxNav = (direction: 'next' | 'prev', e: React.MouseEvent) => {
    e.stopPropagation()
    if (lightboxIndex === null) return
    const total = invitation.galleries.length
    if (direction === 'next') {
      setLightboxIndex((lightboxIndex + 1) % total)
    } else {
      setLightboxIndex((lightboxIndex - 1 + total) % total)
    }
  }

  return (
    <div className="invitation-wrapper mx-auto">
      {/* ─── MUSIC PLAYER ─── */}
      <AudioPlayer url={invitation.bgMusicUrl} autoPlayTrigger={startAudio} />

      {/* ─── 0. COVER OVERLAY ─── */}
      <div ref={coverRef} id="cover" className="cover-overlay">
        <div className="cover-content">
          <div className="gunungan-mini-ornament"></div>
          <span className="javanese-label text-gold">UNDANGAN PERNIKAHAN</span>
          
          <h1 className="cover-names font-cursive text-gold">
            {invitation.brideNickname} &amp; {invitation.groomNickname}
          </h1>

          <div className="guest-card glass-card">
            <p className="guest-label text-muted">Kepada Yth. Bapak/Ibu/Saudara/i</p>
            <p className="guest-name">{guestName || 'Tamu Undangan'}</p>
            <p className="guest-note">Tanpa mengurangi rasa hormat, kami mengundang Anda untuk hadir di hari bahagia kami.</p>
          </div>

          <p className="cover-date font-serif">
            {DateTime.fromISO(invitation.akadDatetime).toFormat('dd . MM . yyyy')}
          </p>

          <button 
            id="btn-open-invitation" 
            className="btn-primary-gold mt-6"
            onClick={handleOpenInvitation}
          >
            <span className="material-symbols-outlined text-on-primary">drafts</span>
            <span>BUKA UNDANGAN</span>
          </button>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div 
        ref={mainContentRef}
        id="invitation-main-content" 
        className="invitation-content hidden"
        onScroll={handleScroll}
      >
        {/* Flower falling canvas */}
        <div ref={flowerContainerRef} id="flower-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, overflow: 'hidden' }}></div>

        {/* ─── 1. COUPLE SECTION ─── */}
        <section id="couple" className="section-padding fade-up">
          <div className="gunungan-divider mb-6"></div>
          
          <div className="marriage-quote text-center">
            <p className="quote-text font-serif text-gold opacity-90">
              "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya, dan dijadikan-Nya diantaramu rasa kasih dan sayang."
            </p>
            <p className="quote-source text-muted font-sans mt-2">— QS. Ar-Rum: 21</p>
          </div>

          <div className="heritage-divider-gold"></div>

          <div className="mempelai-container mt-8">
            {/* Bride */}
            <div className="mempelai-card">
              <div className="profile-frame">
                <div className="profile-placeholder">
                  <span className="material-symbols-outlined">woman</span>
                </div>
              </div>
              <h3 className="mempelai-name font-cursive text-gold">{invitation.brideName}</h3>
              <p className="mempelai-nickname text-muted font-bold">Mempelai Wanita</p>
              <div className="parent-info">
                <p className="parent-label">Putri tercinta dari:</p>
                <p className="parent-names">{invitation.brideParentFather}</p>
                <p className="parent-and">&amp;</p>
                <p className="parent-names">{invitation.brideParentMother}</p>
              </div>
            </div>

            <div className="couple-ampersand font-cursive text-gold">&amp;</div>

            {/* Groom */}
            <div className="mempelai-card">
              <div className="profile-frame">
                <div className="profile-placeholder">
                  <span className="material-symbols-outlined">man</span>
                </div>
              </div>
              <h3 className="mempelai-name font-cursive text-gold">{invitation.groomName}</h3>
              <p className="mempelai-nickname text-muted font-bold">Mempelai Pria</p>
              <div className="parent-info">
                <p className="parent-label">Putra tercinta dari:</p>
                <p className="parent-names">{invitation.groomParentFather}</p>
                <p className="parent-and">&amp;</p>
                <p className="parent-names">{invitation.groomParentMother}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. EVENT SECTION ─── */}
        <section id="event" className="section-padding bg-surface-variant fade-up">
          <div className="countdown-container glass-card">
            <h3 className="countdown-title font-serif text-gold">Menghitung Hari</h3>
            <div className="countdown-timer">
              <div className="timer-box">
                <span className="timer-value">{days}</span>
                <span className="timer-label">Hari</span>
              </div>
              <div className="timer-box">
                <span className="timer-value">{hours}</span>
                <span className="timer-label">Jam</span>
              </div>
              <div className="timer-box">
                <span className="timer-value">{minutes}</span>
                <span className="timer-label">Menit</span>
              </div>
              <div className="timer-box">
                <span className="timer-value">{seconds}</span>
                <span className="timer-label">Detik</span>
              </div>
            </div>
          </div>

          <div className="events-grid mt-8">
            {/* Akad */}
            <div className="event-card glass-card">
              <div className="event-icon">
                <span className="material-symbols-outlined text-gold">church</span>
              </div>
              <h3 className="event-name font-serif text-gold">Akad Nikah</h3>
              <div className="event-divider"></div>
              <div className="event-detail">
                <span className="material-symbols-outlined">calendar_today</span>
                <p>{DateTime.fromISO(invitation.akadDatetime).setLocale('id').toFormat('cccc, dd MMMM yyyy')}</p>
              </div>
              <div className="event-detail">
                <span className="material-symbols-outlined">schedule</span>
                <p>{DateTime.fromISO(invitation.akadDatetime).toFormat('HH:mm')} WIB - Selesai</p>
              </div>
              <div className="event-detail">
                <span className="material-symbols-outlined">location_on</span>
                <p>{invitation.eventLocation}<br /><small className="text-muted">{invitation.eventAddress}</small></p>
              </div>
            </div>

            {/* Resepsi */}
            <div className="event-card glass-card">
              <div className="event-icon">
                <span className="material-symbols-outlined text-gold">restaurant</span>
              </div>
              <h3 className="event-name font-serif text-gold">Resepsi</h3>
              <div className="event-divider"></div>
              <div className="event-detail">
                <span className="material-symbols-outlined">calendar_today</span>
                <p>{DateTime.fromISO(invitation.resepsiDatetime).setLocale('id').toFormat('cccc, dd MMMM yyyy')}</p>
              </div>
              <div className="event-detail">
                <span className="material-symbols-outlined">schedule</span>
                <p>{DateTime.fromISO(invitation.resepsiDatetime).toFormat('HH:mm')} WIB - Selesai</p>
              </div>
              <div className="event-detail">
                <span className="material-symbols-outlined">location_on</span>
                <p>{invitation.eventLocation}<br /><small className="text-muted">{invitation.eventAddress}</small></p>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <a 
              href={invitation.googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary-gold"
            >
              <span className="material-symbols-outlined text-on-primary">map</span>
              <span>Buka Google Maps</span>
            </a>
          </div>
        </section>

        {/* ─── 3. STORY SECTION ─── */}
        <section id="story" className="section-padding fade-up">
          <div className="text-center mb-6">
            <span className="section-subtitle">MEMORI KASIH</span>
            <h2 className="font-serif text-gold" style={{ fontSize: '2rem' }}>Kisah Cinta Kami</h2>
            <div className="title-divider-gold"></div>
          </div>

          <div className="timeline-container">
            <div className="timeline-line"></div>
            
            {invitation.stories.map((story) => (
              <div key={story.id} className="timeline-item">
                <div className="timeline-dot"></div>
                <span className="milestone-date text-gold">{story.milestoneDate}</span>
                <h3 className="milestone-title font-serif">{story.title}</h3>
                <div className="milestone-image-wrapper">
                  <img src={story.imageUrl} alt={story.title} className="milestone-image" />
                </div>
                <p className="milestone-desc">{story.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 4. GALLERY SECTION ─── */}
        <section id="gallery" className="section-padding bg-surface-variant fade-up">
          <div className="text-center mb-6">
            <span className="section-subtitle">GALERI VISUAL</span>
            <h2 className="font-serif text-gold" style={{ fontSize: '2rem' }}>Momen Bahagia</h2>
            <div className="title-divider-gold"></div>
          </div>

          <div className="gallery-grid">
            {invitation.galleries.map((item, index) => (
              <div 
                key={item.id} 
                className="gallery-item"
                onClick={() => setLightboxIndex(index)}
              >
                <div className="gallery-image-wrapper">
                  <img src={item.imageUrl} alt={item.caption} className="gallery-image" />
                  <div className="gallery-overlay">
                    <span className="material-symbols-outlined text-gold">fullscreen</span>
                    <p className="gallery-caption">{item.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 5. RSVP & GUESTBOOK SECTION ─── */}
        <section id="rsvp" className="section-padding fade-up">
          <div className="text-center mb-6">
            <span className="section-subtitle">PENGALAMAN DIGITAL</span>
            <h2 className="font-serif text-gold" style={{ fontSize: '2rem' }}>RSVP &amp; Ucapan</h2>
            <div className="title-divider-gold"></div>
          </div>

          <div className="rsvp-form-wrapper mb-8">
            <div className="glass-card">
              <form className="space-y-4" onSubmit={handleRsvpSubmit}>
                <div className="form-group space-y-2">
                  <label className="font-label-caps text-on-surface-variant block">NAMA LENGKAP</label>
                  <input 
                    name="name" 
                    className="form-control-heritage" 
                    placeholder="Masukkan nama Anda" 
                    type="text" 
                    value={rsvpName}
                    onChange={(e) => setRsvpName(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="form-group space-y-2">
                  <label className="font-label-caps text-on-surface-variant block">KEHADIRAN</label>
                  <div className="attendance-grid">
                    <label className={`attendance-card ${rsvpAttendance === 'hadir' ? 'active' : ''}`}>
                      <input 
                        name="attendance" 
                        type="radio" 
                        value="hadir" 
                        checked={rsvpAttendance === 'hadir'}
                        onChange={(e) => setRsvpAttendance(e.target.value)}
                        required 
                      />
                      <span>Hadir</span>
                      <div className="attendance-card-border"></div>
                    </label>
                    <label className={`attendance-card ${rsvpAttendance === 'tidak' ? 'active' : ''}`}>
                      <input 
                        name="attendance" 
                        type="radio" 
                        value="tidak" 
                        checked={rsvpAttendance === 'tidak'}
                        onChange={(e) => setRsvpAttendance(e.target.value)}
                        required 
                      />
                      <span>Tidak Hadir</span>
                      <div className="attendance-card-border"></div>
                    </label>
                  </div>
                </div>

                <div className="form-group space-y-2">
                  <label className="font-label-caps text-on-surface-variant block">KIRIM UCAPAN</label>
                  <textarea 
                    name="comment" 
                    className="form-control-heritage" 
                    placeholder="Tuliskan pesan atau doa untuk kedua mempelai..." 
                    rows={4} 
                    value={rsvpComment}
                    onChange={(e) => setRsvpComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button className="btn-send-heritage mt-4" type="submit">
                  <span className="material-symbols-outlined text-on-primary">send</span>
                  <span className="font-label-caps text-on-primary">KIRIM UCAPAN</span>
                </button>
              </form>
            </div>
          </div>

          {/* Guestbook list */}
          <div className="guestbook-feed-wrapper mt-8">
            <div className="flex-align-center-gap mb-6" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 className="font-serif text-on-surface whitespace-nowrap" style={{ fontSize: '1.25rem', fontWeight: 600 }}>Buku Tamu</h3>
              <div style={{ flexGrow: 1, height: '1px', backgroundColor: 'rgba(242, 202, 80, 0.15)' }}></div>
              <span className="font-label-caps text-gold">{guests.length} UCAPAN</span>
            </div>

            <div className="comments-container-heritage custom-scrollbar" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {guests.length > 0 ? (
                guests.map((guest, index) => (
                  <div key={guest.id} className={`comment-card-heritage ${index === 0 ? 'new-message' : ''}`}>
                    <div className="comment-card-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span className="comment-card-author" style={{ fontWeight: 'bold', color: '#f2ca50' }}>{guest.name}</span>
                      <span className="comment-card-time" style={{ fontSize: '0.75rem', color: '#99907c' }}>
                        {guest.createdAt ? DateTime.fromISO(guest.createdAt).toFormat('dd MMM yyyy, HH:mm') : ''}
                      </span>
                    </div>
                    <p className="comment-card-text" style={{ fontSize: '0.85rem', color: '#eae1d4' }}>
                      "{guest.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="no-comments text-center text-muted font-sans py-8">
                  Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── 6. GIFT REGISTRY ─── */}
        <section id="gift" className="section-padding bg-surface-variant fade-up">
          <div className="text-center mb-6">
            <span className="section-subtitle">KASIH SAYANG</span>
            <h2 className="font-serif text-gold" style={{ fontSize: '2rem' }}>Tanda Kasih</h2>
            <div className="title-divider-gold"></div>
            <p className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '300px', margin: '0 auto' }}>
              Bagi Bapak/Ibu/Saudara/i yang ingin memberikan tanda kasih untuk kedua mempelai, dapat menyalurkannya melalui:
            </p>
          </div>

          <div className="rsvp-container space-y-6">
            {invitation.bankName && (
              <div className="event-card glass-card text-center">
                <span className="material-symbols-outlined text-gold" style={{ fontSize: '2.5rem' }}>credit_card</span>
                <h4 className="font-serif mt-2" style={{ fontSize: '1.2rem', color: '#fff' }}>Transfer Bank</h4>
                <div className="event-divider"></div>
                <p className="text-gold font-bold">{invitation.bankName}</p>
                <p className="font-sans" style={{ fontSize: '1.2rem', margin: '5px 0' }}>{invitation.bankAccountNumber}</p>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>a.n. {invitation.bankAccountHolder}</p>
                <button 
                  className="btn-copy-gold mt-4" 
                  onClick={() => handleCopy(invitation.bankAccountNumber || '', 'bank')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>
                  <span>{copiedText === 'bank' ? 'TERSALIN' : 'SALIN REKENING'}</span>
                </button>
              </div>
            )}

            {invitation.walletName && (
              <div className="event-card glass-card text-center">
                <span className="material-symbols-outlined text-gold" style={{ fontSize: '2.5rem' }}>account_balance_wallet</span>
                <h4 className="font-serif mt-2" style={{ fontSize: '1.2rem', color: '#fff' }}>Dompet Digital</h4>
                <div className="event-divider"></div>
                <p className="text-gold font-bold">{invitation.walletName}</p>
                <p className="font-sans" style={{ fontSize: '1.2rem', margin: '5px 0' }}>{invitation.walletNumber}</p>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>a.n. {invitation.walletHolder}</p>
                <button 
                  className="btn-copy-gold mt-4" 
                  onClick={() => handleCopy(invitation.walletNumber || '', 'wallet')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>content_copy</span>
                  <span>{copiedText === 'wallet' ? 'TERSALIN' : 'SALIN NOMOR'}</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ─── 7. CLOSING SECTION ─── */}
        <section id="closing" className="section-padding text-center fade-up">
          <div className="gunungan-divider mb-6"></div>
          <h2 className="font-cursive text-gold" style={{ fontSize: '3rem' }}>Matur Nuwun</h2>
          <p className="text-muted mt-4" style={{ fontSize: '0.9rem', maxWidth: '320px', margin: '0 auto', lineHeight: 1.6 }}>
            Merupakan suatu kehormatan dan kebahagiaan bagi kami sekeluarga, apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu kepada kedua mempelai.
          </p>
          <div className="parent-info mt-8">
            <p className="parent-label text-gold font-bold">KAMI YANG BERBAHAGIA</p>
            <p className="mempelai-names font-serif mt-2" style={{ fontSize: '1.25rem', color: '#fff' }}>
              {invitation.brideNickname} &amp; {invitation.groomNickname}
            </p>
            <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '5px' }}>Beserta Keluarga Besar Kedua Mempelai</p>
          </div>
        </section>
      </div>

      {/* ─── FLOATING BOTTOM NAV CONTROLS ─── */}
      <nav 
        ref={bottomControlsRef}
        id="invitation-bottom-controls" 
        className="bottom-nav hidden"
      >
        <a 
          href="#couple"
          onClick={(e) => { e.preventDefault(); handleNavClick('couple'); }}
          className={`nav-btn ${activeTab === 'couple' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">favorite</span>
          <span className="nav-label">Mempelai</span>
        </a>
        <a 
          href="#event"
          onClick={(e) => { e.preventDefault(); handleNavClick('event'); }}
          className={`nav-btn ${activeTab === 'event' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">event</span>
          <span className="nav-label">Acara</span>
        </a>
        <a 
          href="#story"
          onClick={(e) => { e.preventDefault(); handleNavClick('story'); }}
          className={`nav-btn ${activeTab === 'story' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">auto_stories</span>
          <span className="nav-label">Kisah</span>
        </a>
        <a 
          href="#gallery"
          onClick={(e) => { e.preventDefault(); handleNavClick('gallery'); }}
          className={`nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">photo_library</span>
          <span className="nav-label">Galeri</span>
        </a>
        <a 
          href="#rsvp"
          onClick={(e) => { e.preventDefault(); handleNavClick('rsvp'); }}
          className={`nav-btn ${activeTab === 'rsvp' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">chat</span>
          <span className="nav-label">RSVP</span>
        </a>
      </nav>

      {/* ─── 8. PHOTO LIGHTBOX OVERLAY ─── */}
      {lightboxIndex !== null && (
        <div 
          id="gallery-lightbox" 
          className="lightbox-overlay active"
          onClick={() => setLightboxIndex(null)}
        >
          <span className="lightbox-close material-symbols-outlined" onClick={() => setLightboxIndex(null)}>close</span>
          
          <span className="lightbox-prev material-symbols-outlined" onClick={(e) => handleLightboxNav('prev', e)}>chevron_left</span>
          <span className="lightbox-next material-symbols-outlined" onClick={(e) => handleLightboxNav('next', e)}>chevron_right</span>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={invitation.galleries[lightboxIndex].imageUrl} 
              alt={invitation.galleries[lightboxIndex].caption} 
            />
            <p id="lightbox-caption" className="text-gold">{invitation.galleries[lightboxIndex].caption}</p>
          </div>
        </div>
      )}
    </div>
  )
}
