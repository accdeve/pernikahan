interface Guest {
  id: string
  name: string
  attendance: string | null
  comment: string | null
  created_at: string
}

interface GuestbookProps {
  guests: Guest[]
}

export function Guestbook({ guests }: GuestbookProps) {
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const sortedGuests = [...guests].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="guestbook">
      <h3 className="text-lg font-semibold mb-4">Buku Tamu</h3>
      {sortedGuests.length === 0 ? (
        <p className="text-muted-foreground text-sm">Belum ada ucapan. Jadilah yang pertama!</p>
      ) : (
        <div className="space-y-4">
          {sortedGuests.map((guest) => (
            <div key={guest.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{guest.name}</span>
                {guest.attendance && (
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      guest.attendance === 'hadir'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {guest.attendance === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
                  </span>
                )}
              </div>
              {guest.comment && (
                <p className="text-sm text-muted-foreground">{guest.comment}</p>
              )}
              <span className="text-xs text-muted-foreground">{formatTime(guest.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
