import * as React from 'react'

interface EventDetails {
  name: string
  date: string
  time: string
  location: string
  address: string
  mapUrl?: string
}

interface EventProps {
  events: EventDetails[]
  countdownTarget?: string
}

function CountdownTimer({ target }: { target: string }) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  })

  React.useEffect(() => {
    const targetDate = new Date(target).getTime()

    const updateTimer = () => {
      const diff = targetDate - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' })
        return
      }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      const pad = (n: number) => String(n).padStart(2, '0')
      setTimeLeft({
        days: pad(days),
        hours: pad(hours),
        minutes: pad(minutes),
        seconds: pad(seconds),
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [target])

  return (
    <div className="countdown-container">
      <p className="countdown-title text-muted">Hitung Mundur</p>
      <div className="countdown-timer">
        <div className="timer-box">
          <span className="timer-value" id="timer-days">
            {timeLeft.days}
          </span>
          <span className="timer-label">Hari</span>
        </div>
        <div className="timer-box">
          <span className="timer-value" id="timer-hours">
            {timeLeft.hours}
          </span>
          <span className="timer-label">Jam</span>
        </div>
        <div className="timer-box">
          <span className="timer-value" id="timer-minutes">
            {timeLeft.minutes}
          </span>
          <span className="timer-label">Menit</span>
        </div>
        <div className="timer-box">
          <span className="timer-value" id="timer-seconds">
            {timeLeft.seconds}
          </span>
          <span className="timer-label">Detik</span>
        </div>
      </div>
    </div>
  )
}

export function Event({ events, countdownTarget }: EventProps) {
  return (
    <section id="event" className="section-padding bg-surface-variant text-center">
      <div className="heritage-divider-gold" />

      <div className="section-title mb-6">
        <h2 className="font-cursive text-gold">Waktu & Tempat</h2>
        <p className="section-subtitle">Acara</p>
      </div>

      {countdownTarget && <CountdownTimer target={countdownTarget} />}

      <div className="events-grid">
        {events.map((event, index) => (
          <div key={index} className="event-card glass-card fade-up">
            <div className="event-icon">
              <span>{index === 0 ? '🕌' : '💐'}</span>
            </div>
            <h3 className="event-name font-cursive text-gold">{event.name}</h3>
            <div className="event-divider" />

            <div className="event-detail">
              <span>📅</span>
              <p>{event.date}</p>
            </div>
            <div className="event-detail">
              <span>🕐</span>
              <p>{event.time}</p>
            </div>
            <div className="event-detail">
              <span>📍</span>
              <p>
                <strong>{event.location}</strong>
                <br />
                {event.address}
              </p>
            </div>

            {event.mapUrl && (
              <a
                href={event.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-copy-gold mt-4"
              >
                Lihat di Maps
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
