// resources/js/b2b/auth.js

export function loginHandler() {
  return {
    email: '',
    password: '',
    loading: false,
    errorMessage: '',
    async handleLogin() {
      this.loading = true
      this.errorMessage = ''

      const alertEl = document.querySelector('.alert-error')
      if (alertEl) alertEl.style.display = 'none'

      try {
        const { data, error } = await window.supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password,
        })

        if (error) throw error

        window.location.href = '/b2b/dashboard'
      } catch (err) {
        this.errorMessage = err.message || 'Gagal login. Periksa kembali email dan password.'
        if (alertEl) alertEl.style.display = 'block'
      } finally {
        this.loading = false
      }
    },
  }
}

export function signupHandler() {
  return {
    woName: '',
    woEmail: '',
    woLocation: '',
    staffName: '',
    staffEmail: '',
    password: '',
    loading: false,
    errorMessage: '',
    async handleSignup() {
      this.loading = true
      this.errorMessage = ''

      const alertEl = document.querySelector('.alert-error')
      if (alertEl) alertEl.style.display = 'none'

      try {
        // 1. Sign up user via Supabase Auth
        const { data: authData, error: authError } = await window.supabase.auth.signUp({
          email: this.staffEmail,
          password: this.password,
        })

        if (authError) throw authError

        const user = authData.user
        if (!user) throw new Error('Registrasi akun gagal dilakukan. Hubungi administrator.')

        // 2. Insert Wedding Organization
        const { data: woData, error: woError } = await window.supabase
          .from('wedding_organization')
          .insert({
            name: this.woName,
            email: this.woEmail,
            location: this.woLocation,
          })
          .select('id')
          .single()

        if (woError) throw woError

        // 3. Insert WO Staff record linking user_id and wo_id
        const { error: staffError } = await window.supabase.from('wo_staff').insert({
          user_id: user.id,
          wo_id: woData.id,
          name: this.staffName,
          email: this.staffEmail,
          role: 'admin',
        })

        if (staffError) throw staffError

        // 4. Auto link WO Plan (Basic Plan default for MVP testing)
        const { error: planError } = await window.supabase.from('wo_plan').insert({
          wo_id: woData.id,
          plan_id: 'a3b1a111-1111-1111-1111-111111111111',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })

        if (planError) throw planError

        window.location.href = '/b2b/dashboard'
      } catch (err) {
        this.errorMessage = err.message || 'Gagal melakukan pendaftaran. Silakan coba kembali.'
        if (alertEl) alertEl.style.display = 'block'
      } finally {
        this.loading = false
      }
    },
  }
}
