// resources/js/themes/anniversary.js

export function anniversaryViewer() {
  return {
    slug: '',
    loading: true,
    active: false,
    customer: null,
    meta: null,
    moments: [],
    momentForm: {
      title: '',
      date: '',
      description: '',
    },
    momentLoading: false,
    timeLeft: { days: '00', hours: '00', minutes: '00', seconds: '00' },
    countdownInterval: null,

    async initAnniversary(slug) {
      this.slug = slug
      try {
        const { data: ctData, error: ctError } = await window.supabase
          .from('customer_template')
          .select('*')
          .eq('type', 'anniversary')
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
          this.moments =
            typeof this.meta.love_story === 'string'
              ? JSON.parse(this.meta.love_story)
              : this.meta.love_story
        }

        if (this.meta && (this.meta.date || this.meta.reception_date)) {
          this.startCountdown(this.meta.date || this.meta.reception_date)
        }
      } catch (err) {
        console.error('Error fetching anniversary metadata', err)
      } finally {
        this.loading = false
      }
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

    formatDate(dateStr) {
      if (!dateStr) return ''
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateStr).toLocaleDateString('id-ID', options).toUpperCase()
    },

    async addMoment() {
      if (
        !this.momentForm.title.trim() ||
        !this.momentForm.date.trim() ||
        !this.momentForm.description.trim()
      )
        return
      this.momentLoading = true

      try {
        const newMoment = {
          title: this.momentForm.title,
          date: this.momentForm.date,
          description: this.momentForm.description,
        }

        const updatedMoments = [...this.moments, newMoment]

        const { error } = await window.supabase
          .from('cust_metadata')
          .update({
            love_story: JSON.stringify(updatedMoments),
          })
          .eq('id', this.meta.id)

        if (error) throw error

        this.moments = updatedMoments
        this.momentForm = { title: '', date: '', description: '' }
        alert('Selamat! Momen baru Anda berhasil diabadikan di Memory Book.')
      } catch (err) {
        alert('Gagal mengabadikan momen: ' + err.message)
      } finally {
        this.momentLoading = false
      }
    },
  }
}
