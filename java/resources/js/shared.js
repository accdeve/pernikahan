/**
 * shared.js — Utilities shared across ALL invitation themes
 * Audio control, clipboard copy, toast, RSVP AJAX form submission
 */

export function initAudio() {
  const audio = document.getElementById('bg-music')
  const audioControl = document.getElementById('floating-audio-control')

  if (audioControl && audio) {
    audioControl.addEventListener('click', () => {
      if (audio.paused) {
        audio.play()
        audioControl.classList.add('rotating')
      } else {
        audio.pause()
        audioControl.classList.remove('rotating')
      }
    })
  }

  return audio
}

export function showToast(message) {
  const copyToast = document.getElementById('copy-toast')
  if (copyToast) {
    copyToast.textContent = message
    copyToast.classList.add('show')
    setTimeout(() => copyToast.classList.remove('show'), 2000)
  }
}

export function initClipboard() {
  const copyButtons = document.querySelectorAll('.btn-copy')
  copyButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target')
      const targetEl = document.getElementById(targetId)
      if (targetEl) {
        const text = targetEl.textContent.trim().replace(/\s/g, '')
        navigator.clipboard
          .writeText(text)
          .then(() => showToast('Nomor berhasil disalin!'))
          .catch((err) => console.error('Failed to copy:', err))
      }
    })
  })
}

export function initRsvpForm(commentCardClass, showGunungan = false) {
  const formRsvp = document.getElementById('form-rsvp')
  const commentsList = document.getElementById('comments-list')
  if (!formRsvp || !commentsList) return

  formRsvp.addEventListener('submit', async (e) => {
    e.preventDefault()

    const submitBtn = formRsvp.querySelector('button[type="submit"]')
    const prevBtnText = submitBtn.innerHTML
    submitBtn.disabled = true
    submitBtn.innerHTML =
      '<span class="material-symbols-outlined rotating">progress_activity</span> Mengirim...'

    const url = formRsvp.getAttribute('action')
    const formData = new FormData(formRsvp)

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      })

      if (!response.ok) throw new Error('Gagal mengirim RSVP. Coba beberapa saat lagi.')

      const data = await response.json()

      showToast('Ucapan berhasil terkirim!')

      const commentArea = document.getElementById('comment')
      if (commentArea) commentArea.value = ''

      const countBadge = document.getElementById('rsvp-count-badge')
      if (countBadge && data.guests) {
        countBadge.textContent = `${data.guests.length} UCAPAN`
      }

      if (data.guests && data.guests.length > 0) {
        commentsList.innerHTML = ''

        data.guests.forEach((guest, index) => {
          const dateStr = new Date(guest.createdAt)
            .toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            .replace(/\./g, ':')

          commentsList.innerHTML += `
            <div class="${commentCardClass} ${index === 0 ? 'new-message' : ''}">
              <div class="comment-card-header">
                <span class="comment-card-author">${guest.name}</span>
                <span class="comment-card-time">${dateStr} WIB</span>
              </div>
              <p class="comment-card-text">"${guest.comment || ''}"</p>
            </div>
          `
        })

        if (showGunungan) {
          commentsList.innerHTML += `
            <div class="py-8 flex-center opacity-80">
              <img class="w-32"
                src="/images/gunungan.svg"
                style="width:128px;max-width:100%;height:auto;" />
            </div>
          `
        }
      }
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Terjadi kesalahan.')
    } finally {
      submitBtn.disabled = false
      submitBtn.innerHTML = prevBtnText
    }
  })
}
