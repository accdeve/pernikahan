import * as React from 'react'

interface CoupleProps {
  groomName: string
  groomParent: string
  brideName: string
  brideParent: string
  images?: string[]
}

export function Couple({
  groomName,
  groomParent,
  brideName,
  brideParent,
  images = [
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&q=80',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1920&q=80',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce0a5?w=1920&q=80',
  ],
}: CoupleProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)

  React.useEffect(() => {
    if (!containerRef.current) return
    const container = containerRef.current
    const slides = container.querySelectorAll('.sequence-slide')
    const texts = container.querySelectorAll('.sequence-text')
    const totalFrames = slides.length
    if (totalFrames <= 1) return

    let scrollTriggerInstance: any

    const initScrollTrigger = async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      scrollTriggerInstance = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: `+=${window.innerHeight * totalFrames}`,
        pin: true,
        scrub: 0.8,
        onUpdate: (self: any) => {
          const newIndex = Math.min(
            Math.round(self.progress * (totalFrames - 1)),
            totalFrames - 1
          )
          setActiveIndex(newIndex)
        },
      })
    }

    initScrollTrigger()

    return () => {
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill()
      }
    }
  }, [])

  return (
    <section
      id="editorial-sequence-container"
      ref={containerRef}
      className="editorial-sequence-container"
    >
      <div className="sequence-images">
        {images.map((img, i) => (
          <div key={i} className={`sequence-slide ${i === activeIndex ? 'active' : ''}`}>
            <img src={img} alt={`Slide ${i + 1}`} className="sequence-img" />
          </div>
        ))}
      </div>

      <div className="sequence-texts">
        <div className={`sequence-text ${activeIndex === 0 ? 'active' : ''}`}>
          <span className="text-subtitle">THE BRIDE</span>
          <h2 className="text-title">{brideName}</h2>
          <p className="text-parent">{brideParent}</p>
        </div>

        <div className={`sequence-text ${activeIndex === 1 ? 'active' : ''}`}>
          <span className="text-subtitle">THE GROOM</span>
          <h2 className="text-title">{groomName}</h2>
          <p className="text-parent">{groomParent}</p>
        </div>

        <div className={`sequence-text ${activeIndex === 2 ? 'active' : ''}`}>
          <span className="text-subtitle">TOGETHER FOREVER</span>
          <h2 className="text-title">
            {groomName} & {brideName}
          </h2>
          <p className="text-description">
            Two souls, one journey. We invite you to witness our love story as we begin this
            beautiful chapter together.
          </p>
        </div>
      </div>
    </section>
  )
}
