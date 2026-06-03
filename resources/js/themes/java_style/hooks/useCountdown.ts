import { useState, useEffect } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function useCountdown(targetDate: string): TimeLeft {
  const calcTimeLeft = (): TimeLeft => {
    const diff = new Date(targetDate).getTime() - Date.now()
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }
  }

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft())
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return timeLeft
}
