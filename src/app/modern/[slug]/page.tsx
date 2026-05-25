import { notFound } from 'next/navigation'
import { getMockInvitationBySlug } from '@/services/mockData'
import ModernTheme from '@/components/ModernTheme'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ to?: string }>
}

export default async function ModernInvitationPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { to = '' } = await searchParams

  const invitation = getMockInvitationBySlug(slug)
  if (!invitation) {
    return notFound()
  }

  return (
    <ModernTheme invitation={invitation} guestName={to} />
  )
}
