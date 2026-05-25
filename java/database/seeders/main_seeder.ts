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
          imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop',
          sortOrder: 1,
        },
        {
          invitationId: invitation.id,
          milestoneDate: 'JULI 2023',
          title: 'Lamaran',
          description: 'Satu janji terucap di hadapan keluarga tercinta. Sebuah komitmen untuk melangkah bersama mengarungi samudera kehidupan.',
          imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
          sortOrder: 2,
        },
        {
          invitationId: invitation.id,
          milestoneDate: 'MEI 2026',
          title: 'Menuju Halal',
          description: 'Menanti hari kemenangan, menyatukan doa dan harapan untuk menjadi satu dalam ikatan yang suci dan diridhai Allah SWT.',
          imageUrl: 'https://images.unsplash.com/photo-1494972308805-463bc619b34e?q=80&w=600&auto=format&fit=crop',
          sortOrder: 3,
        },
      ])

      // Seed Gallery Photos
      await Gallery.createMany([
        {
          invitationId: invitation.id,
          imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600&auto=format&fit=crop',
          caption: 'Batik Keagungan',
          sortOrder: 1,
        },
        {
          invitationId: invitation.id,
          imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=600&auto=format&fit=crop',
          caption: 'Sentuhan Kasih',
          sortOrder: 2,
        },
        {
          invitationId: invitation.id,
          imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=600&auto=format&fit=crop',
          caption: 'Langkah Bersama',
          sortOrder: 3,
        },
        {
          invitationId: invitation.id,
          imageUrl: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=600&auto=format&fit=crop',
          caption: 'Wibawa Beskap',
          sortOrder: 4,
        },
        {
          invitationId: invitation.id,
          imageUrl: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?q=80&w=600&auto=format&fit=crop',
          caption: 'Taman Bunga Senja',
          sortOrder: 5,
        },
        {
          invitationId: invitation.id,
          imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600&auto=format&fit=crop',
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
