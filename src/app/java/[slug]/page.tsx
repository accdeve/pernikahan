import { notFound } from 'next/navigation'
import { getMockInvitationBySlug } from '@/services/mockData'
import JavaneseTheme from '@/components/JavaneseTheme'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ to?: string }>
}

export default async function JavaneseInvitationPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { to = '' } = await searchParams

  const invitation = getMockInvitationBySlug(slug)
  if (!invitation) {
    return notFound()
  }

  return (
    <div className="app-container">
      <JavaneseTheme invitation={invitation} guestName={to} />
    </div>
  )
}
