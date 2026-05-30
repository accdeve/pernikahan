// resources/js/themes/wedding.js

export function weddingViewer() {
  return {
    slug: '',
    loading: true,
    active: false,
    customer: null,
    meta: null,
    stories: [],
    comments: [],
    rsvpForm: {
      name: '',
      attending: 'true',
      count: 1,
      reason: '',
    },
    commentForm: {
      comment: '',
    },
    rsvpLoading: false,
    commentLoading: false,
    timeLeft: { days: '00', hours: '00', minutes: '00', seconds: '00' },
    countdownInterval: null,

    async initWedding(slug) {
      this.slug = slug
      try {
        const { data: ctData, error: ctError } = await window.supabase
          .from('customer_template')
          .select('*')
          .eq('type', 'wedding')
          .eq('active', true)

        if (ctError || !ctData || ctData.length === 0) {
          this.active = false
          this.loading = false
          return
        }

        let matchingCt = null
        let matchingCust = null
        for (let ct of ctData) {
          const { data: cust } = await window.supabase
            .from('customers')
            .select('*')
            .eq('id', ct.customer_id)
            .single()

          if (cust) {
            const female = cust.female_name.toLowerCase().replace(/\s+/g, '-')
            const male = cust.male_name.toLowerCase().replace(/\s+/g, '-')
            const calculatedSlug = `${female}-${male}`
            if (calculatedSlug === slug) {
              matchingCt = ct
              matchingCust = cust
              break
            }
          }
        }

        if (!matchingCt) {
          this.active = false
          this.loading = false
          return
        }

        this.customer = matchingCust
        this.active = true

        const { data: metaData } = await window.supabase
          .from('cust_metadata')
          .select('*')
          .eq('customer_template_id', matchingCt.id)
          .single()

        this.meta = metaData

        if (this.meta && this.meta.love_story) {
          this.stories =
            typeof this.meta.love_story === 'string'
              ? JSON.parse(this.meta.love_story)
              : this.meta.love_story
        }

        await this.fetchComments()

        if (this.meta && this.meta.reception_date) {
          this.startCountdown(this.meta.reception_date)
        }
      } catch (err) {
        console.error('Error fetching wedding metadata', err)
      } finally {
        this.loading = false
      }
    },

    async fetchComments() {
      const { data: commData } = await window.supabase
        .from('cust_comment')
        .select('*')
        .eq('customer_id', this.customer.id)
        .order('created_at', { ascending: false })

      if (commData) {
        this.comments = await Promise.all(
          commData.map(async (comm) => {
            let name = 'Tamu'
            let attending = true

            if (comm.guest_id) {
              const { data: guest } = await window.supabase
                .from('guests')
                .select('*')
                .eq('id', comm.guest_id)
                .single()
              if (guest) {
                name = guest.name
                attending = guest.rsvp_status
              }
            }

            return {
              name,
              attending,
              comment: comm.comment,
            }
          })
        )
      }
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateStr).toLocaleDateString('id-ID', options).toUpperCase()
    },

    formatTime(dateStr) {
      if (!dateStr) return ''
      const time = new Date(dateStr).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      })
      return `Pukul ${time} WIB - Selesai`
    },

    startCountdown(targetDateStr) {
      const target = new Date(targetDateStr).getTime()
      this.countdownInterval = setInterval(() => {
        const now = new Date().getTime()
        const difference = target - now

        if (difference < 0) {
          clearInterval(this.countdownInterval)
          this.timeLeft = { days: '00', hours: '00', minutes: '00', seconds: '00' }
          return
        }

        const d = Math.floor(difference / (1000 * 60 * 60 * 24))
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const s = Math.floor((difference % (1000 * 60)) / 1000)

        this.timeLeft = {
          days: d.toString().padStart(2, '0'),
          hours: h.toString().padStart(2, '0'),
          minutes: m.toString().padStart(2, '0'),
          seconds: s.toString().padStart(2, '0'),
        }
      }, 1000)
    },

    async submitRSVP() {
      this.rsvpLoading = true
      try {
        const { data, error } = await window.supabase
          .from('guests')
          .insert({
            wo_id: this.customer.wo_id,
            customer_id: this.customer.id,
            name: this.rsvpForm.name,
            rsvp_status: this.rsvpForm.attending === 'true',
            guest_count: this.rsvpForm.attending === 'true' ? Number(this.rsvpForm.count) : 0,
            reason: this.rsvpForm.attending === 'false' ? this.rsvpForm.reason : '',
          })
          .select('id')
          .single()

        if (error) throw error

        alert('Terima kasih! Konfirmasi kehadiran Anda berhasil dikirim.')
        this.rsvpForm = { name: '', attending: 'true', count: 1, reason: '' }
      } catch (err) {
        alert('Gagal mengirim RSVP: ' + err.message)
      } finally {
        this.rsvpLoading = false
      }
    },

    async submitComment() {
      if (!this.commentForm.comment.trim()) return
      this.commentLoading = true
      try {
        const { error } = await window.supabase.from('cust_comment').insert({
          wo_id: this.customer.wo_id,
          customer_id: this.customer.id,
          guest_id: null,
          comment: this.commentForm.comment,
        })

        if (error) throw error

        this.commentForm.comment = ''
        await this.fetchComments()
      } catch (err) {
        alert('Gagal mengirim ucapan: ' + err.message)
      } finally {
        this.commentLoading = false
      }
    },
  }
}
