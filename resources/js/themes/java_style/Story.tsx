import * as React from 'react'

export interface StoryData {
  id: string
  title: string
  date: string
  description?: string
  image_url?: string
}

interface StoryProps {
  stories: StoryData[]
}

export function Story({ stories }: StoryProps) {
  if (!stories || stories.length === 0) {
    return null
  }

  return (
    <section id="story" className="section-padding text-center">
      <div className="heritage-divider-gold" />

      <div className="section-title mb-6">
        <h2 className="font-cursive text-gold">Kisah Cinta</h2>
        <p className="section-subtitle">Our Story</p>
      </div>

      <div className="timeline-container">
        <div className="timeline-line" />
        {stories.map((story, index) => (
          <div key={story.id} className="timeline-item fade-up">
            <div className="timeline-dot" />
            <span className="milestone-date text-muted">{story.date}</span>
            <h3 className="milestone-title font-cursive text-gold">{story.title}</h3>
            {story.image_url && (
              <div className="milestone-image-wrapper">
                <img src={story.image_url} alt={story.title} className="milestone-image" />
              </div>
            )}
            {story.description && (
              <p className="milestone-desc text-muted">{story.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
