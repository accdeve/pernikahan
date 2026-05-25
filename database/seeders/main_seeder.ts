import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Invitation from '#models/invitation'
import Story from '#models/story'
import Gallery from '#models/gallery'
import Guest from '#models/guest'
import env from '#start/env'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // 1. Seed Admin User
    const adminEmail = env.get('ADMIN_EMAIL')
    const adminPassword = env.get('ADMIN_PASSWORD')

    const hashedVal = await hash.make(adminPassword)
    await User.updateOrCreate(
      { email: adminEmail },
      {
        fullName: 'Admin Pernikahan',
        password: hashedVal,
      }
    )

    // 2. Seed Javanese Heritage Invitation
    const javaInvitation = await Invitation.updateOrCreate(
      { slug: 'juliana-muhammad' },
      {
        brideName: 'Juliana Saputri',
        brideNickname: 'Juliana',
        brideParentFather: 'Bapak Ahmad Santoso',
        brideParentMother: 'Ibu Siti Maryam',
        groomName: 'Muhammad Pratama',
        groomNickname: 'Muhammad',
        groomParentFather: 'Bapak H. Ridwan Jaya',
        groomParentMother: 'Ibu Hj. Kartika',
        // Set wedding event dates in the future so the countdown timer ticks!
        akadDatetime: DateTime.now().plus({ days: 365 }).set({ hour: 8, minute: 0, second: 0, millisecond: 0 }),
        resepsiDatetime: DateTime.now().plus({ days: 365 }).set({ hour: 11, minute: 0, second: 0, millisecond: 0 }),
        eventLocation: 'Gedung Krama Jawi',
        eventAddress: 'Jl. Sosrowijayan No. 12, Yogyakarta',
        googleMapsUrl: 'https://maps.app.goo.gl/uX73Y69aR8d',
        bankName: 'Bank Mandiri',
        bankAccountNumber: '123 4567 890',
        bankAccountHolder: 'Muhammad Pratama',
        walletName: 'GoPay',
        walletNumber: '0812 3456 7890',
        walletHolder: 'Juliana Saputri',
        bgMusicUrl: '/audio/gamelan.mp3',
        style: 'java_style'
      }
    )

    // Seed Editorial Invitation
    const editorialInvitation = await Invitation.updateOrCreate(
      { slug: 'juliana-muhammad-editorial' },
      {
        brideName: 'Juliana Saputri',
        brideNickname: 'Juliana',
        brideParentFather: 'Bapak Ahmad Santoso',
        brideParentMother: 'Ibu Siti Maryam',
        groomName: 'Muhammad Pratama',
        groomNickname: 'Muhammad',
        groomParentFather: 'Bapak H. Ridwan Jaya',
        groomParentMother: 'Ibu Hj. Kartika',
        // Set wedding event dates in the future so the countdown timer ticks!
        akadDatetime: DateTime.now().plus({ days: 365 }).set({ hour: 8, minute: 0, second: 0, millisecond: 0 }),
        resepsiDatetime: DateTime.now().plus({ days: 365 }).set({ hour: 19, minute: 0, second: 0, millisecond: 0 }),
        eventLocation: 'The Glass House',
        eventAddress: 'Jl. Sukajadi No. 102, Bandung',
        googleMapsUrl: 'https://maps.app.goo.gl/uX73Y69aR8d',
        bankName: 'Citibank NA',
        bankAccountNumber: '8842 1902 0031 4452',
        bankAccountHolder: 'Muhammad Pratama',
        walletName: 'OVO',
        walletNumber: '0812 3456 7890',
        walletHolder: 'Juliana Saputri',
        bgMusicUrl: '/audio/gamelan.mp3',
        style: 'image_sequence'
      }
    )

    // 3. Seed Love Stories, Galleries, and Guests for both invitations
    for (const invitation of [javaInvitation, editorialInvitation]) {
      // Clear old dependent data if exists (to keep seed idempotent)
      await Story.query().where('invitationId', invitation.id).delete()
      await Gallery.query().where('invitationId', invitation.id).delete()
      await Guest.query().where('invitationId', invitation.id).delete()

      // Seed Love Stories Milestones
      await Story.createMany([
        {
          invitationId: invitation.id,
          milestoneDate: 'SEPTEMBER 2021',
          title: 'Awal Berjumpa',
          description: 'Pertemuan tak terduga yang menjadi awal dari segalanya. Di bawah langit senja, semesta mempertemukan dua jiwa yang mencari.',
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY1aRIisont3Niwu7RhAvjdN7Qwdl943Yrw4bAGBlgR57WcAEHB8cSu895hjmJ0fLPvWscTvOalqqNMH1A7fGz99utgt0vmcEY7MZO8clL3CGYE3eooGKolD2Oj1Ant_AR3P7AwV9GUJayz7hcOmmenPp9HAzRqd5pQnvySjtEyDPfUCMNR0XyJxyERXMLIoFmknW7qBNMUN9OOaYwugn6WKdlRBQZ5aGLszfRpmo0msBTjRReJCqr5gnSy2DofR07jviBmxnWPi8',
          sortOrder: 1,
        },
        {
          invitationId: invitation.id,
          milestoneDate: 'JULI 2023',
          title: 'Lamaran',
          description: 'Satu janji terucap di hadapan keluarga tercinta. Sebuah komitmen untuk melangkah bersama mengarungi samudera kehidupan.',
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmGv_ZCXCbihzhM2AkllbJrb0tLZaX0cGDkq0WZjukvIIsyq-l9apt7GKfg2NUbaXqIy4PLEP_Xk3LJLt8eurLtrRwXN6IQXd5cmUOvLuPRGvxK2GoIfXZy4liD3g9rToz4tlnYYV0Op7ojF36ZzX0yUjGDsP7foEUcg-ReMuqPsm05W4aK5lLc7xVY8J-j1ylrHCBQRwc2GWLlgpl-HsmliFywjyc-BEywtWq1XOCkB3VUklS7_LxrGmjrTsISTk2SAbcRiPE-Qk',
          sortOrder: 2,
        },
        {
          invitationId: invitation.id,
          milestoneDate: 'MEI 2026',
          title: 'Menuju Halal',
          description: 'Menanti hari kemenangan, menyatukan doa dan harapan untuk menjadi satu dalam ikatan yang suci dan diridhai Allah SWT.',
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfcAcD3YIv2sab8aTvylF3ZFaeQ5eP8Y9z60ZCQ1tg89MzIx8bsGd6lGNnBTEH2PR9LlbI6MQA7z1VSOxQg-zYg9jVCyPBj_3MtK_oQfIFejsTyTPuvxKkruUqERMNkzZWOGP8-v-4obxfiyp6FrRkWaFv_ZlDn1BrivQniDruSThUVOtQNTTEbpsCjw-622idEhA6_Q0CzbPHaf5qDSsynACT_8rDUno5LchMWR0cGjbe-jpgotqdecY3X6mosxqqTcr-R_pgpbk',
          sortOrder: 3,
        },
      ])

      // Seed Gallery Photos
      await Gallery.createMany([
        {
          invitationId: invitation.id,
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6aTkiAQ_xsR5IPTqonZmOo6iqe2RI_WVPoDAtZ10g1L1dJHzZ4Rk69Z1Mi980b301rP-Pji8iE5k1lH8-pvCDNoAnMvYAEzyUPtRPxl6nhKMcVX4vrDybvltBP0mJdgbMxELScybS2b4HPtd_0-zpFESqr9Y4S8oFYsOqJT7O-XVV9XZ2Y2dPC2FTtz6QIl6YF7ZUrE4agEq37PL6kJnyhNCIrumJe8bK73SQu8Td9mjn0WiPYt7NQ3r25xiztSK4Eiz3W2E_w3w',
          caption: 'Batik Keagungan',
          sortOrder: 1,
        },
        {
          invitationId: invitation.id,
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-fynMPqG_cghiPPkVAbYiv34mTHoTmZCtGGG-gO9veJzEk6GXPTEkx6AHzrErCp5Dhz26TXKHG4BV5KPhnjctkaNkhejLXTmIAOjrXLBKdq1mXVzxl36VCVm1V84dqQWHIVq7izHSfMhvgl0MeeRI7riC9ltfmA9lbSYNNedts2qFbCSlDGsdKkgemF2880oXiLMcdO65JYJS4dgXohzePJFdm6aIzHETdH5R0hvj7cDyHXPm1Scc6vOUNw30chVgeQFnDxvxkmU',
          caption: 'Sentuhan Kasih',
          sortOrder: 2,
        },
        {
          invitationId: invitation.id,
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkgTvh1aCNPu9A5dmDBGwwYfAPPWzAxQ_bPRyBTgR3MUHES90eSipKTX7Y9EHion4QNdcf84nruN9tN4wtBhuTtJ65AFSILwdrHj-r-YmvRl_aSM8L6_8hEbzSeAm8iQhwuK0P0EOR2S90h-4xAQFJJYNn5-NN8QLWXneM-vSiiZDnNN9l63cG91x6fzGhfXB0th4sqtP6nJX6zh3oSdZ6-nXTo8E6zbyT9i7xWC40WR4E_S1eEQR6KClIyjDqjvE83Z-BznGDlCg',
          caption: 'Langkah Bersama',
          sortOrder: 3,
        },
        {
          invitationId: invitation.id,
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCQWz2UnhTEoc-Q6S8I0bS7SLTp1nx5gxCCxdvHl5BJqweIRVO5nWJ7DHBsb0xL3pnWRHb-pCfIpBObqufPw8MGj5Upd03x6ZzPvstxXMw828EzTAT8lN-ojqKnSA5g91ZokslYKY0yLpOsW7yNHLXod7BuXmjjKzT7ozHpieHF75VsASkb2Xx7r1gzO_W0fTqu-i6WiTEPBheSOXBvzaFaE6CxYHNyKcNB1qPR6jw6agyt8Jduq5AkU_AuNtW1RnpWflE-UBRJpRs',
          caption: 'Wibawa Beskap',
          sortOrder: 4,
        },
        {
          invitationId: invitation.id,
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEAJDIUMn78TP1PflKTGs80qYHesHzTiUZWy6g0ExmbD0gW6aL30uKBaEWsGwhmwMb0qAp3Ch_y-fyc96QEiDrtNSgdpXig9w5vU_fQB3Coty7zI0LuakiBa7JMzsA5v_Sez9Z0iwNkl75S4gA6RILdaS3fAhuMoo7ec9GN5tMzSCQ0g7agP2ChqJd34vrIfvasqCaUspCksqKIOn90WJyTE6WydTDK0938Dx6-NfYOomiY4YzfkX0pq0U4QXEFlTOj7DJEwBM9tk',
          caption: 'Taman Bunga Senja',
          sortOrder: 5,
        },
        {
          invitationId: invitation.id,
          imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCeHxbWbg6B4v759CN3aypLa6JfUqMG-Ne0b2T7jBFtPPV9UAAVPcbP7dyNWxH7A4dmHEcDfO_Xn6dkfGUDfohmD-3taADrSwNPraFyEL_d7bSCfnCMW7nQyQpfDobBQwh8NbWlRNAJqIHZq0a7_lCm33mPCtWXc0jKHgxDHmjjXv5nDknESXnEM-iIECvvatXkosWIACgJPGxkRf8L37ZStsMREZFeSAmsyYampHkxFtrai26UpmYnQfqE1kLcRxTuabLyJwhNaBc',
          caption: 'Ikatan Suci',
          sortOrder: 6,
        },
      ])

      // Seed Guest RSVPs
      await Guest.createMany([
        {
          invitationId: invitation.id,
          name: 'Andi & Sara',
          attendance: 'hadir',
          comment: 'Selamat menempuh hidup baru J & M! Semoga cinta kalian selalu mekar seperti bunga di taman surga. Kami sangat senang bisa hadir!',
        },
        {
          invitationId: invitation.id,
          name: 'Ibu Ratna',
          attendance: 'tidak',
          comment: 'Doa terbaik untuk kalian berdua. Maaf Ibu tidak bisa hadir secara langsung, namun doa Ibu menyertai langkah kalian berdua.',
        },
        {
          invitationId: invitation.id,
          name: 'Keluarga Sudarsono',
          attendance: 'hadir',
          comment: 'Barakallah, semoga menjadi keluarga yang sakinah, mawaddah, dan warahmah. Sangat terharu melihat perjalanan kalian.',
        },
      ])
    }
  }
}
