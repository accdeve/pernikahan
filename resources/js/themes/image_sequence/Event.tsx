import * as React from 'react'

interface EventInfo {
  title: string
  date: string
  time: string
  location: string
  mapUrl?: string
}

interface EventProps {
  events: EventInfo[]
}

export function Event({ events }: EventProps) {
  return (
    <section id="editorial-event" className="editorial-event-section">
      <div className="editorial-container">
        <div className="event-grid">
          {events.map((event, index) => (
            <div
              key={index}
              className={`event-block ${index % 2 === 1 ? 'event-block-offset' : ''}`}
            >
              <div className="event-image-wrapper">
                <img
                  src={
                    index === 0
                      ? 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&q=80'
                      : 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'
                  }
                  alt={event.title}
                  className="event-image"
                />
              </div>
              <div className="event-details">
                <span className="event-subtitle">THE WEDDING</span>
                <h3 className="event-title">{event.title}</h3>
                <div className="event-line" />
                <div className="event-info-row">
                  <span>🕐</span>
                  <div className="event-info-text">{event.time}</div>
                </div>
                <div className="event-info-row">
                  <span>📅</span>
                  <div className="event-info-text">{event.date}</div>
                </div>
                <div className="event-info-row">
                  <span>📍</span>
                  <div className="event-info-text">{event.location}</div>
                </div>
                {event.mapUrl && (
                  <a
                    href={event.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-event-map"
                  >
                    Lihat di Peta
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
