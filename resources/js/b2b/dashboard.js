// resources/js/b2b/dashboard.js

export function dashboardHandler() {
  return {
    user: null,
    staff: null,
    wo: null,
    customers: [],
    openCreateModal: false,
    modalLoading: false,
    newCustomer: {
      maleName: '',
      femaleName: '',
      email: '',
    },
    openBankModal: false,
    selectedCustomer: null,
    activeMetadataList: [],
    newBank: {
      bank: 'BCA',
      account_number: '',
      holder_name: '',
    },
    bankOptions: [
      'BCA',
      'Mandiri',
      'BNI',
      'BRI',
      'BSI',
      'CIMB Niaga',
      'Permata',
      'GoPay',
      'OVO',
      'DANA',
      'LinkAja',
      'ShopeePay',
    ],

    async initDashboard() {
      // 1. Get current logged in user session
      const {
        data: { session },
      } = await window.supabase.auth.getSession()
      if (!session) {
        window.location.href = '/b2b/login'
        return
      }
      this.user = session.user

      // 2. Fetch WO Staff info
      const { data: staffData, error: staffError } = await window.supabase
        .from('wo_staff')
        .select('*')
        .eq('user_id', this.user.id)
        .single()

      if (staffError || !staffData) {
        console.error('Gagal mengambil profil staff', staffError)
        window.location.href = '/b2b/login'
        return
      }
      this.staff = staffData

      // 3. Fetch Wedding Organization
      const { data: woData } = await window.supabase
        .from('wedding_organization')
        .select('*')
        .eq('id', this.staff.wo_id)
        .single()
      this.wo = woData

      // 4. Fetch Customers list
      await this.fetchCustomers()
    },

    async fetchCustomers() {
      const { data: custData, error } = await window.supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Gagal mengambil customer', error)
        return
      }

      // Fetch template activation status for each customer
      const enrichedCustomers = await Promise.all(
        custData.map(async (cust) => {
          const { data: templates } = await window.supabase
            .from('customer_template')
            .select('*')
            .eq('customer_id', cust.id)

          const hasWedding = templates?.some((t) => t.type === 'wedding' && t.active)
          const hasAnniversary = templates?.some((t) => t.type === 'anniversary' && t.active)

          return {
            ...cust,
            wedding_active: hasWedding,
            anniversary_active: hasAnniversary,
          }
        })
      )

      this.customers = enrichedCustomers
    },

    activeWeddingsCount() {
      return this.customers.filter((c) => c.wedding_active).length
    },

    activeAnniversariesCount() {
      return this.customers.filter((c) => c.anniversary_active).length
    },

    getInitials(name) {
      if (!name) return 'U'
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    },

    getSlug(cust) {
      return `${cust.female_name.toLowerCase().replace(/\s+/g, '-')}-${cust.male_name.toLowerCase().replace(/\s+/g, '-')}`
    },

    async handleCreateCustomer() {
      this.modalLoading = true
      try {
        const { data, error } = await window.supabase
          .from('customers')
          .insert({
            wo_id: this.wo.id,
            email: this.newCustomer.email,
            male_name: this.newCustomer.maleName,
            female_name: this.newCustomer.femaleName,
          })
          .select()
          .single()

        if (error) throw error

        this.newCustomer = { maleName: '', femaleName: '', email: '' }
        this.openCreateModal = false
        await this.fetchCustomers()
      } catch (err) {
        alert('Gagal menambah customer: ' + err.message)
      } finally {
        this.modalLoading = false
      }
    },

    async activateTemplate(customerId, type) {
      const confirmText =
        type === 'wedding'
          ? 'Aktifkan template Undangan Pernikahan (Wedding) untuk customer ini?'
          : 'Aktifkan template Buku Kenangan (Anniversary Memory Book) untuk customer ini?'

      if (!confirm(confirmText)) return

      try {
        const templateId =
          type === 'wedding'
            ? 'b4c1a111-1111-1111-1111-111111111111'
            : 'c5d1a111-1111-1111-1111-111111111111'

        const { data: ctData, error: ctError } = await window.supabase
          .from('customer_template')
          .insert({
            wo_id: this.wo.id,
            customer_id: customerId,
            template_id: templateId,
            type: type,
            active: true,
          })
          .select('id')
          .single()

        if (ctError) throw ctError

        const { error: metaError } = await window.supabase.from('cust_metadata').insert({
          wo_id: this.wo.id,
          customer_id: customerId,
          customer_template_id: ctData.id,
          type: type,
          date: new Date().toISOString(),
          location: 'Grand Ballroom, Hotel Luxury',
          address: 'Jalan Premium Raya No. 88, Jakarta Pusat',
          akad_date: type === 'wedding' ? new Date().toISOString() : null,
          reception_date:
            type === 'wedding' ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : null,
          love_story: JSON.stringify([
            {
              title: 'Awal Berjumpa',
              date: 'SEPTEMBER 2021',
              description: 'Kami pertama kali berjumpa di kafe romantis di bawah senja.',
            },
            {
              title: 'Lamaran Resmi',
              date: 'JULI 2023',
              description: 'Janji suci terikat di hadapan keluarga tercinta.',
            },
          ]),
          bank_account: JSON.stringify([
            { bank: 'BCA', account_number: '7820129482', holder_name: 'Pengantin Bahagia' },
          ]),
        })

        if (metaError) throw metaError

        alert(`Template ${type} berhasil diaktifkan secara instan untuk MVP!`)
        await this.fetchCustomers()
      } catch (err) {
        alert('Gagal mengaktifkan template: ' + err.message)
      }
    },

    async openManageBanks(cust) {
      this.selectedCustomer = cust
      this.activeMetadataList = []
      try {
        const { data: metaData, error } = await window.supabase
          .from('cust_metadata')
          .select('*')
          .eq('customer_id', cust.id)

        if (error) throw error

        // Parse bank accounts correctly for each metadata record
        this.activeMetadataList = (metaData || []).map((meta) => {
          let parsedAccounts = []
          if (meta.bank_account) {
            parsedAccounts =
              typeof meta.bank_account === 'string'
                ? JSON.parse(meta.bank_account)
                : meta.bank_account
          }
          return {
            ...meta,
            parsed_banks: parsedAccounts,
          }
        })

        this.openBankModal = true
      } catch (err) {
        alert('Gagal mengambil data rekening: ' + err.message)
      }
    },

    async addBankToMetadata(metaId) {
      if (!this.newBank.account_number.trim() || !this.newBank.holder_name.trim()) {
        alert('Semua kolom data rekening wajib diisi.')
        return
      }

      try {
        const meta = this.activeMetadataList.find((m) => m.id === metaId)
        if (!meta) return

        const updatedBanks = [
          ...meta.parsed_banks,
          {
            bank: this.newBank.bank,
            account_number: this.newBank.account_number,
            holder_name: this.newBank.holder_name,
          },
        ]

        const { error } = await window.supabase
          .from('cust_metadata')
          .update({
            bank_account: JSON.stringify(updatedBanks),
          })
          .eq('id', metaId)

        if (error) throw error

        // Reset inputs and refresh
        this.newBank.account_number = ''
        this.newBank.holder_name = ''

        // Refresh modal data
        await this.openManageBanks(this.selectedCustomer)
        alert('Rekening / E-Wallet berhasil ditambahkan!')
      } catch (err) {
        alert('Gagal menambahkan rekening: ' + err.message)
      }
    },

    async removeBankFromMetadata(metaId, index) {
      if (!confirm('Hapus rekening ini dari template?')) return

      try {
        const meta = this.activeMetadataList.find((m) => m.id === metaId)
        if (!meta) return

        const updatedBanks = meta.parsed_banks.filter((_, idx) => idx !== index)

        const { error } = await window.supabase
          .from('cust_metadata')
          .update({
            bank_account: JSON.stringify(updatedBanks),
          })
          .eq('id', metaId)

        if (error) throw error

        // Refresh modal data
        await this.openManageBanks(this.selectedCustomer)
        alert('Rekening / E-Wallet berhasil dihapus!')
      } catch (err) {
        alert('Gagal menghapus rekening: ' + err.message)
      }
    },

    async handleLogout() {
      if (!confirm('Anda yakin ingin keluar?')) return
      await window.supabase.auth.signOut()
      window.location.href = '/b2b/login'
    },
  }
}
