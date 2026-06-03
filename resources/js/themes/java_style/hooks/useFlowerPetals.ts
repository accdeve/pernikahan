import { useEffect, useRef } from 'react'

interface Petal {
  id: number
  element: HTMLDivElement
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  rotation: number
  rotationSpeed: number
  opacity: number
}

export function useFlowerPetals(containerRef: React.RefObject<HTMLDivElement | null>) {
  const petalsRef = useRef<Petal[]>([])
  const animationRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const idCounterRef = useRef(0)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const maxPetals = 25
    const createPetal = () => {
      if (petalsRef.current.length >= maxPetals) return

      const petal = document.createElement('div')
      petal.className = 'petal'
      const size = Math.random() * 8 + 6
      petal.style.width = `${size}px`
      petal.style.height = `${size}px`
      petal.style.left = `${Math.random() * 100}%`
      petal.style.position = 'absolute'
      petal.style.top = '-10px'
      petal.style.pointerEvents = 'none'
      container.appendChild(petal)

      const petalData: Petal = {
        id: idCounterRef.current++,
        element: petal,
        x: Math.random() * window.innerWidth,
        y: -10,
        size,
        speedY: Math.random() * 1.5 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.5 + 0.5,
      }

      petalsRef.current.push(petalData)
    }

    const animate = () => {
      petalsRef.current.forEach((petal) => {
        petal.y += petal.speedY
        petal.x += petal.speedX + Math.sin(petal.y * 0.01) * 0.3
        petal.rotation += petal.rotationSpeed

        petal.element.style.transform = `translate(${petal.x}px, ${petal.y}px) rotate(${petal.rotation}deg)`
        petal.element.style.opacity = String(petal.opacity)
      })

      // Remove petals that have fallen below the viewport
      petalsRef.current = petalsRef.current.filter((petal) => {
        if (petal.y > window.innerHeight + 50) {
          petal.element.remove()
          return false
        }
        return true
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    createPetal()
    animationRef.current = requestAnimationFrame(animate)
    intervalRef.current = setInterval(createPetal, 400)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      petalsRef.current.forEach((petal) => petal.element.remove())
      petalsRef.current = []
    }
  }, [containerRef])
}
