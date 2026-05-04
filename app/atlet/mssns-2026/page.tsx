'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DISTRICTS = [
  'Seremban', 'Port Dickson', 'Rembau', 'Tampin', 'Jelebu',
  'Jempol', 'Kuala Pilah', 'Nilai', 'Bahau', 'Lain-lain'
]

const SWIM_EVENTS = [
  '50m Gaya Bebas', '100m Gaya Bebas', '200m Gaya Bebas',
  '400m Gaya Bebas', '800m Gaya Bebas', '1500m Gaya Bebas',
  '50m Gaya Belakang', '100m Gaya Belakang', '200m Gaya Belakang',
  '50m Gaya Dada', '100m Gaya Dada', '200m Gaya Dada',
  '50m Kupu-Kupu', '100m Kupu-Kupu', '200m Kupu-Kupu',
  '200m Renang Gaya Campuran', '400m Renang Gaya Campuran',
  'Lain-lain'
]

const YEARS = Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() - i))

interface PBEntry {
  nama_kejohanan: string
  tahun: string
  event_name: string
  time: string
}

interface SwimmerEntry {
  swimmer_name: string
  ic_number: string
  date_of_birth: string
  gender: string
  swimmer_phone: string
  school_name: string
  school_address: string
  club_name: string
  district: string
  pbs: PBEntry[]
}

const emptyPB = (): PBEntry => ({
  nama_kejohanan: '',
  tahun: '',
  event_name: '',
  time: ''
})

const emptySwimmer = (): SwimmerEntry => ({
  swimmer_name: '',
  ic_number: '',
  date_of_birth: '',
  gender: '',
  swimmer_phone: '',
  school_name: '',
  school_address: '',
  club_name: '',
  district: '',
  pbs: []
})

export default function AtletRegistrationPage() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [consent, setConsent] = useState(false)

  const [parentName, setParentName] = useState('')
  const [parentRelationship, setParentRelationship] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [parentEmail, setParentEmail] = useState('')

  const [swimmers, setSwimmers] = useState<SwimmerEntry[]>([emptySwimmer()])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsLoggedIn(true)
        setUserEmail(user.email || '')
        setParentEmail(user.email || '')
        const { data } = await supabase
          .from('swimmer_profiles')
          .select('id')
          .eq('parent_email', user.email)
          .eq('event_slug', 'mssns-2026')
          .limit(1)
        if (data && data.length > 0) setAlreadySubmitted(true)
      } else {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
  }, [])

  const addSwimmer = () => {
    if (swimmers.length >= 5) return
    setSwimmers(prev => [...prev, emptySwimmer()])
  }

  const removeSwimmer = (index: number) => {
    if (swimmers.length <= 1) return
    setSwimmers(prev => prev.filter((_, i) => i !== index))
  }

  const updateSwimmer = (index: number, field: keyof SwimmerEntry, value: string) => {
    setSwimmers(prev => prev.map((s, i) =>
      i === index ? { ...s, [field]: value } : s
    ))
  }

  const addPB = (swimmerIndex: number) => {
    if (swimmers[swimmerIndex].pbs.length >= 5) return
    setSwimmers(prev => prev.map((s, i) =>
      i === swimmerIndex ? { ...s, pbs: [...s.pbs, emptyPB()] } : s
    ))
  }

  const removePB = (swimmerIndex: number, pbIndex: number) => {
    setSwimmers(prev => prev.map((s, i) =>
      i === swimmerIndex
        ? { ...s, pbs: s.pbs.filter((_, pi) => pi !== pbIndex) }
        : s
    ))
  }

  const updatePB = (swimmerIndex: number, pbIndex: number, field: keyof PBEntry, value: string) => {
    setSwimmers(prev => prev.map((s, i) =>
      i === swimmerIndex
        ? { ...s, pbs: s.pbs.map((pb, pi) => pi === pbIndex ? { ...pb, [field]: value } : pb) }
        : s
    ))
  }

  const validateForm = () => {
    if (!parentName.trim()) return 'Sila masukkan nama penuh.'
    if (!parentRelationship) return 'Sila pilih hubungan.'
    if (!parentPhone.trim()) return 'Sila masukkan nombor telefon.'
    if (!isLoggedIn && !parentEmail.trim()) return 'Sila masukkan emel.'
    for (let i = 0; i < swimmers.length; i++) {
      const s = swimmers[i]
      if (!s.swimmer_name.trim()) return `Atlet ${i + 1}: Sila masukkan nama atlet.`
      if (!s.ic_number.trim()) return `Atlet ${i + 1}: Sila masukkan nombor IC.`
      if (!s.date_of_birth) return `Atlet ${i + 1}: Sila masukkan tarikh lahir.`
      if (!s.gender) return `Atlet ${i + 1}: Sila pilih jantina.`
      if (!s.school_name.trim()) return `Atlet ${i + 1}: Sila masukkan nama sekolah.`
      if (!s.school_address.trim()) return `Atlet ${i + 1}: Sila masukkan alamat sekolah.`
      if (!s.district) return `Atlet ${i + 1}: Sila pilih daerah.`
    }
    if (!consent) return 'Sila bersetuju dengan syarat pengumpulan data.'
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) { setError(validationError); return }
    setError('')
    setSubmitting(true)

    const email = isLoggedIn ? userEmail : parentEmail.trim().toLowerCase()

    try {
      if (!isLoggedIn) {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` }
        })
        if (authError) throw new Error(authError.message)

        const { data: existingSub } = await supabase
          .from('user_subscriptions')
          .select('id')
          .eq('user_email', email)
          .single()

        if (!existingSub) {
          await supabase.from('user_subscriptions').insert({
            user_email: email,
            plan: 'lite',
            status: 'active',
            stripe_customer_id: null,
            current_period_end: null,
            selected_discipline: 'swimming',
            full_name: parentName.trim(),
            country: 'Malaysia'
          })
        }
      }

      for (const swimmer of swimmers) {
        const { data: profile, error: profileError } = await supabase
          .from('swimmer_profiles')
          .insert({
            parent_email: email,
            parent_name: parentName.trim(),
            parent_relationship: parentRelationship,
            parent_phone: parentPhone.trim(),
            swimmer_name: swimmer.swimmer_name.trim(),
            ic_number: swimmer.ic_number.trim(),
            date_of_birth: swimmer.date_of_birth,
            gender: swimmer.gender,
            swimmer_phone: swimmer.swimmer_phone.trim() || null,
            school_name: swimmer.school_name.trim(),
            school_address: swimmer.school_address.trim(),
            school_club: swimmer.school_name.trim(),
            club_name: swimmer.club_name.trim() || null,
            district: swimmer.district,
            event_slug: 'mssns-2026'
          })
          .select()
          .single()

        if (profileError) throw new Error(profileError.message)

        if (profile && swimmer.pbs.length > 0) {
          const validPBs = swimmer.pbs.filter(pb => pb.event_name && pb.time)
          if (validPBs.length > 0) {
            await supabase.from('swimmer_pbs').insert(
              validPBs.map(pb => ({
                swimmer_id: profile.id,
                event_name: pb.event_name,
                time: pb.time,
                nama_kejohanan: pb.nama_kejohanan || null,
                tahun: pb.tahun || null,
                competition_or_training: pb.nama_kejohanan || null,
                date_achieved: null
              }))
            )
          }
        }
      }

      if (!isLoggedIn) {
        setMagicLinkSent(true)
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ralat tidak diketahui. Sila cuba lagi.')
    }

    setSubmitting(false)
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Maklumat Telah Dihantar</h2>
          <p className="text-gray-500 text-sm mb-6">Anda telah menghantar maklumat atlet untuk MSSNS 2026. Terima kasih!</p>
          <a href="/dashboard" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-blue-700">Pergi ke Dashboard</a>
        </div>
      </div>
    )
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50 px-4 py-8">
        <div className="max-w-lg mx-auto">

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Maklumat Berjaya Dihantar!</h2>
            <p className="text-gray-600 text-sm">
              Terima kasih, <strong>{parentName}</strong>. Maklumat atlet anda telah diserahkan kepada <strong>PANS</strong> untuk MSSNS 2026.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-green-100 p-5 mb-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">Data atlet selesai diserahkan</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Maklumat {swimmers.length} atlet anda telah disimpan dengan selamat untuk PANS. Tiada tindakan lanjut diperlukan untuk MSSNS 2026.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">BONUS</span>
              <p className="text-sm font-semibold text-blue-900">Akaun AquaRef Percuma</p>
            </div>
            <p className="text-xs text-blue-800 mb-4 leading-relaxed">
              Anda telah dibuat akaun <strong>AquaRef LITE</strong> secara automatik. Akses peraturan World Aquatics, info event, dan banyak lagi.
            </p>

            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Cara log masuk:
              </p>
              <ol className="text-xs text-gray-600 space-y-1.5 leading-relaxed list-decimal list-inside">
                <li>Buka emel anda: <strong className="text-blue-600">{parentEmail}</strong></li>
                <li>Cari emel daripada <strong>AquaRef</strong></li>
                <li>Subject: <strong>&quot;AquaRef — Pautan log masuk&quot;</strong></li>
                <li>Klik butang <strong>&quot;Log Masuk ke AquaRef&quot;</strong> dalam emel</li>
              </ol>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
            <p className="text-xs font-semibold text-yellow-900 mb-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Tidak nampak emel?
            </p>
            <ul className="text-xs text-yellow-800 space-y-1 ml-5 list-disc">
              <li>Semak folder <strong>Spam</strong> atau <strong>Promotions</strong></li>
              <li>Tunggu 1–2 minit, kadang ada lewat sedikit</li>
              <li>Pastikan emel <strong>{parentEmail}</strong> dieja betul</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong className="text-gray-700">Tidak perlu akaun AquaRef?</strong> Tidak mengapa — abaikan emel sahaja. Data atlet anda telah pun diserahkan kepada PANS dengan selamat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/" className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium text-center hover:bg-gray-50 transition-colors">
              Lawati AquaRef
            </a>
            <a href="https://aquaref.co/chat/swimming" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium text-center hover:bg-blue-700 transition-colors">
              Cuba Chat Renang →
            </a>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Soalan atau masalah? Hubungi{' '}
            <a href="mailto:hello@aquaref.co" className="text-blue-600 hover:underline">hello@aquaref.co</a>
          </p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Maklumat Berjaya Dihantar!</h2>
          <p className="text-gray-600 text-sm mb-6">
            Terima kasih, <strong>{parentName}</strong>. Maklumat {swimmers.length} atlet anda telah diserahkan kepada <strong>PANS</strong> untuk MSSNS 2026.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <a href="/dashboard" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium text-center hover:bg-blue-700 transition-colors">
              Pergi ke Dashboard
            </a>
            <a href="/chat/swimming" className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium text-center hover:bg-gray-50 transition-colors">
              Cuba Chat Renang
            </a>
          </div>
          <p className="text-xs text-gray-400">
            Tahun depan? Borang akan dibuka semula untuk MSSNS 2027.
          </p>
        </div>
      </div>
    )
  }

  if (isLoggedIn === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl text-gray-900">AquaRef</span>
          </a>
          {isLoggedIn && (
            <span className="text-xs text-gray-400">Log masuk sebagai {userEmail}</span>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            MSSNS 2026 · 7–9 Mei 2026
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Borang Maklumat Atlet</h1>
          <p className="text-sm text-gray-500">
            Dikumpul bagi pihak <strong>Persatuan Akuatik Negeri Sembilan (PANS)</strong> untuk tujuan pemantauan atlet.
          </p>
        </div>

        <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-green-900 font-medium mb-1">Dapatkan AquaRef secara percuma</p>
          <p className="text-xs text-green-700">
            Dengan mengisi borang ini, anda akan mendapat akaun AquaRef LITE secara percuma — platform AI untuk peraturan renang dan maklumat pertandingan.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-4 shadow-sm">
          <h2 className="font-semibold text-blue-700 mb-4 text-sm uppercase tracking-wide">
            Bahagian 1 — Maklumat Ibu Bapa / Penjaga / Atlet
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh <span className="text-red-500">*</span></label>
              <input type="text" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="Nama penuh seperti dalam kad pengenalan" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hubungan dengan Atlet <span className="text-red-500">*</span></label>
              <select value={parentRelationship} onChange={e => setParentRelationship(e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                <option value="">-- Pilih --</option>
                <option value="Sendiri">Sendiri (Atlet mengisi sendiri)</option>
                <option value="Bapa">Bapa</option>
                <option value="Ibu">Ibu</option>
                <option value="Penjaga">Penjaga</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telefon <span className="text-red-500">*</span></label>
              <input type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="cth: 0123456789" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
            </div>
            {!isLoggedIn && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emel <span className="text-red-500">*</span></label>
                <input type="email" value={parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder="emel@contoh.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                <p className="text-xs text-gray-400 mt-1">Emel ini akan digunakan untuk akaun AquaRef anda.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 mb-4">
          {swimmers.map((swimmer, si) => (
            <div key={si} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-blue-700 text-sm uppercase tracking-wide">
                  Bahagian 2 — Maklumat Atlet {swimmers.length > 1 ? `#${si + 1}` : ''}
                </h2>
                {swimmers.length > 1 && (
                  <button onClick={() => removeSwimmer(si)} className="text-xs text-red-500 hover:text-red-600 font-medium">Buang Atlet</button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh Atlet <span className="text-red-500">*</span></label>
                  <input type="text" value={swimmer.swimmer_name} onChange={e => updateSwimmer(si, 'swimmer_name', e.target.value)} placeholder="Nama penuh atlet" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Kad Pengenalan (IC) <span className="text-red-500">*</span></label>
                  <input type="text" value={swimmer.ic_number} onChange={e => updateSwimmer(si, 'ic_number', e.target.value)} placeholder="cth: 050101-14-1234" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                  <p className="text-xs text-gray-400 mt-1">Maklumat IC dilindungi dan hanya digunakan untuk tujuan pemantauan PANS.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Lahir <span className="text-red-500">*</span></label>
                    <input type="date" value={swimmer.date_of_birth} onChange={e => updateSwimmer(si, 'date_of_birth', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jantina <span className="text-red-500">*</span></label>
                    <select value={swimmer.gender} onChange={e => updateSwimmer(si, 'gender', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                      <option value="">-- Pilih --</option>
                      <option value="Lelaki">Lelaki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No. Telefon Atlet</label>
                  <input type="tel" value={swimmer.swimmer_phone} onChange={e => updateSwimmer(si, 'swimmer_phone', e.target.value)} placeholder="cth: 0123456789 (tidak wajib)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh Sekolah <span className="text-red-500">*</span></label>
                  <input type="text" value={swimmer.school_name} onChange={e => updateSwimmer(si, 'school_name', e.target.value)} placeholder="cth: Sekolah Menengah Kebangsaan Seremban 2" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Penuh Sekolah <span className="text-red-500">*</span></label>
                  <textarea value={swimmer.school_address} onChange={e => updateSwimmer(si, 'school_address', e.target.value)} placeholder="cth: Jalan Rahang, 70300 Seremban, Negeri Sembilan" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 resize-y" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelab Renang</label>
                  <input type="text" value={swimmer.club_name} onChange={e => updateSwimmer(si, 'club_name', e.target.value)} placeholder="cth: Kelab Renang Seremban (tidak wajib)" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daerah <span className="text-red-500">*</span></label>
                  <select value={swimmer.district} onChange={e => updateSwimmer(si, 'district', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                    <option value="">-- Pilih Daerah --</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pencapaian Terbaik</p>
                    <p className="text-xs text-gray-400">Tidak wajib — sehingga 5 rekod</p>
                  </div>
                  {swimmer.pbs.length < 5 && (
                    <button onClick={() => addPB(si)} className="text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50">
                      + Tambah Pencapaian
                    </button>
                  )}
                </div>

                {swimmer.pbs.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-gray-200 rounded-xl">
                    <p className="text-xs text-gray-400 mb-2">Tiada pencapaian ditambah lagi</p>
                    <button onClick={() => addPB(si)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">+ Tambah pencapaian pertama</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {swimmer.pbs.map((pb, pi) => (
                      <div key={pi} className="bg-gray-50 rounded-xl p-4 relative">
                        <button onClick={() => removePB(si, pi)} className="absolute top-3 right-3 text-xs text-red-400 hover:text-red-600">Buang</button>
                        <p className="text-xs font-medium text-gray-600 mb-3">Pencapaian #{pi + 1}</p>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Nama Kejohanan</label>
                            <input type="text" value={pb.nama_kejohanan} onChange={e => updatePB(si, pi, 'nama_kejohanan', e.target.value)} placeholder="cth: MSNS Negeri Sembilan 2024" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Tahun</label>
                              <select value={pb.tahun} onChange={e => updatePB(si, pi, 'tahun', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                                <option value="">-- Tahun --</option>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">Masa <span className="text-red-500">*</span></label>
                              <input type="text" value={pb.time} onChange={e => updatePB(si, pi, 'time', e.target.value)} placeholder="cth: 1:02.45" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">Acara <span className="text-red-500">*</span></label>
                            <select value={pb.event_name} onChange={e => updatePB(si, pi, 'event_name', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white">
                              <option value="">-- Pilih Acara --</option>
                              {SWIM_EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {swimmers.length < 5 && (
          <button onClick={addSwimmer} className="w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors mb-4">
            + Tambah Atlet Lain
          </button>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-0.5 flex-shrink-0 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-xs text-gray-600 leading-relaxed">
              Saya bersetuju maklumat ini dikumpul bagi pihak <strong>Persatuan Akuatik Negeri Sembilan (PANS)</strong> untuk tujuan pemantauan atlet. Data ini akan dipadam selepas diserahkan kepada PANS. Dengan menghantar borang ini, saya juga bersetuju untuk mencipta akaun AquaRef LITE secara percuma.{' '}
              <a href="/terms-of-service" className="text-blue-600 underline" target="_blank">Terma Perkhidmatan</a>{' '}dan{' '}
              <a href="/privacy-policy" className="text-blue-600 underline" target="_blank">Dasar Privasi</a>.
            </span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button onClick={handleSubmit} disabled={submitting} className="w-full py-4 bg-blue-600 text-white rounded-xl text-base font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {submitting ? 'Menghantar...' : 'Hantar Maklumat'}
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Data anda selamat dan dilindungi mengikut Akta Perlindungan Data Peribadi 2010 (PDPA).
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Ada masalah? Hubungi{' '}
            <a href="mailto:hello@aquaref.co" className="text-blue-600 hover:underline">hello@aquaref.co</a>
          </p>
        </div>
      </div>

      <footer className="border-t border-gray-100 bg-white px-6 py-4 mt-8">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-gray-400">AquaRef · Untuk rujukan sahaja. Sentiasa sahkan dengan pegawai bertauliah.</p>
        </div>
      </footer>
    </div>
  )
}