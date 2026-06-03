import * as React from 'react'

interface CoupleProps {
  groomName: string
  groomNickname?: string
  groomFather?: string
  groomMother?: string
  brideName: string
  brideNickname?: string
  brideFather?: string
  brideMother?: string
}

export function Couple({
  groomName,
  groomNickname,
  groomFather,
  groomMother,
  brideName,
  brideNickname,
  brideFather,
  brideMother,
}: CoupleProps) {
  return (
    <section id="couple" className="section-padding text-center">
      <div className="heritage-divider-gold" />

      <div className="section-title mb-6">
        <h2 className="font-cursive text-gold">Assalamualaikum</h2>
        <p className="section-subtitle">Mempelai</p>
      </div>

      <div className="marriage-quote">
        <p className="quote-text text-muted">
          "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu
          pasangan dari jenismu sendiri, supaya kamu mendapatkan ketenangan
          dari padanya, dan Dia menjadikan di antaramu mawaddah dan rahmah."
        </p>
        <p className="quote-source text-muted mt-4">— QS. Ar-Rum: 21</p>
      </div>

      <div className="mempelai-container">
        {/* Bride */}
        <div className="mempelai-card fade-up">
          <div className="profile-frame">
            <div className="profile-placeholder">
              <span>{brideName.charAt(0)}</span>
            </div>
          </div>
          <h3 className="mempelai-name font-cursive text-gold">{brideName}</h3>
          {brideNickname && <p className="mempelai-nickname text-muted">{brideNickname}</p>}
          {(brideFather || brideMother) && (
            <div className="parent-info">
              <p className="parent-label">Putri dari</p>
              {brideFather && <p className="parent-names">{brideFather}</p>}
              {brideMother && <p className="parent-names">{brideMother}</p>}
            </div>
          )}
        </div>

        {/* Ampersand */}
        <div className="couple-ampersand font-cursive text-gold">&</div>

        {/* Groom */}
        <div className="mempelai-card fade-up">
          <div className="profile-frame">
            <div className="profile-placeholder">
              <span>{groomName.charAt(0)}</span>
            </div>
          </div>
          <h3 className="mempelai-name font-cursive text-gold">{groomName}</h3>
          {groomNickname && <p className="mempelai-nickname text-muted">{groomNickname}</p>}
          {(groomFather || groomMother) && (
            <div className="parent-info">
              <p className="parent-label">Putra dari</p>
              {groomFather && <p className="parent-names">{groomFather}</p>}
              {groomMother && <p className="parent-names">{groomMother}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
