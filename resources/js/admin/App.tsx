import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase-client.js'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs.js'
import { AreaChart, Area, XAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '../components/ui/chart.js'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '../components/ui/card.js'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.js'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../components/ui/alert-dialog.js'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog.js'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '../components/ui/table.js'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../components/ui/dropdown-menu.js'
import {
  LayoutDashboard,
  UserPlus,
  ArrowLeft,
  Edit3,
  BookHeart,
  Image as ImageIcon,
  MessageSquare,
  LogOut,
  Save,
  Plus,
  Trash2,
  ExternalLink,
  Users,
  CheckCircle,
  XCircle,
  Copy,
  Menu,
  X,
  Settings,
  User,
  CreditCard,
  MoreVertical,
  GripVertical,
  Shield,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

// Parse server side configuration injected into spa.edge
const configEl = document.getElementById('server-config')
const serverConfig = configEl
  ? JSON.parse(configEl.textContent || '{}')
  : {
      woId: '',
      woSlug: '',
      woName: '',
      woLocation: '',
      userEmail: '',
      accessToken: '',
      refreshToken: '',
    }

interface Customer {
  id: string
  male_name: string
  female_name: string
  email: string
  created_at: string
  isActive?: boolean
  slug?: string
  style?: string
  wedding_date?: string | null
  guest_count?: number
}

interface Invitation {
  id: string
  customer_id: string
  slug: string
  bride_name: string
  bride_nickname: string
  bride_parent_father: string
  bride_parent_mother: string
  groom_name: string
  groom_nickname: string
  groom_parent_father: string
  groom_parent_mother: string
  akad_datetime: string
  resepsi_datetime: string
  event_location: string
  event_address: string
  google_maps_url: string
  bank_name: string
  bank_account_number: string
  bank_account_holder: string
  wallet_name: string
  wallet_number: string
  wallet_holder: string
  bg_music_url: string
  style: string
}

interface Story {
  id: string
  invitation_id: string
  milestone_date: string
  title: string
  description: string
  image_url: string
  sort_order: number
}

interface Gallery {
  id: string
  invitation_id: string
  image_url: string
  caption: string
  sort_order: number
}

interface Guest {
  id: string
  invitation_id: string
  name: string
  attendance: string
  comment: string
  created_at: string
}

interface SortableStoryRowProps {
  story: Story
  onEdit: (story: Story) => void
  onDelete: (id: string) => void
  storiesCount: number
}

function SortableStoryRow({ story, onEdit, onDelete, storiesCount }: SortableStoryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: story.id,
  })

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : 'auto',
  }

  const canDelete = storiesCount > 2

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`hover:bg-[#FAF9F6]/50 transition-colors ${isDragging ? 'shadow-lg border border-[#E2E2E0] bg-[#FAF9F6] z-50' : ''}`}
    >
      <TableCell className="text-center font-bold text-[#111111] pl-4">
        <div className="flex items-center justify-center gap-1.5">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-[#E2E2E0]/50 rounded-lg text-[#6E6E6C]/50 hover:text-[#111111] transition-colors"
          >
            <GripVertical size={14} />
          </div>
          <span className="w-4 text-right pr-1">{story.sort_order}</span>
        </div>
      </TableCell>
      <TableCell className="font-bold text-[#111111]">{story.milestone_date}</TableCell>
      <TableCell className="font-semibold text-[#111111]">{story.title}</TableCell>
      <TableCell className="text-xs text-[#6E6E6C] leading-relaxed max-w-xs truncate">
        {story.description}
      </TableCell>
      <TableCell className="text-center">
        {story.image_url ? (
          <a
            href={story.image_url}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-[#111111] underline hover:text-[#111111]/80 transition-colors"
          >
            Lihat
          </a>
        ) : (
          <span className="text-xs text-[#6E6E6C]/40 font-medium">-</span>
        )}
      </TableCell>
      <TableCell className="text-center pr-4">
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(story)}
            className="p-1.5 rounded-xl text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] cursor-pointer transition-all"
            title="Edit kisah"
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => canDelete && onDelete(story.id)}
            disabled={!canDelete}
            className={`p-1.5 rounded-xl transition-all ${canDelete ? 'text-[#f43f5e] hover:text-[#e11d48] hover:bg-[#fff5f5] cursor-pointer' : 'text-[#E2E2E0] cursor-not-allowed'}`}
            title={!canDelete ? 'Minimal 2 momen kisah harus tersedia' : 'Hapus kisah'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </TableCell>
    </TableRow>
  )
}

interface SortableGalleryRowProps {
  photo: Gallery
  onEdit: (photo: Gallery) => void
  onDelete: (id: string) => void
  photosCount: number
}

function SortableGalleryRow({ photo, onEdit, onDelete, photosCount }: SortableGalleryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: photo.id,
  })

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : 'auto',
  }

  const canDelete = photosCount > 3

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`hover:bg-[#FAF9F6]/50 transition-colors ${isDragging ? 'shadow-lg border border-[#E2E2E0] bg-[#FAF9F6] z-50' : ''}`}
    >
      <TableCell className="text-center font-bold text-[#111111] pl-4">
        <div className="flex items-center justify-center gap-1.5">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-[#E2E2E0]/50 rounded-lg text-[#6E6E6C]/50 hover:text-[#111111] transition-colors"
          >
            <GripVertical size={14} />
          </div>
          <span className="w-4 text-right pr-1">{photo.sort_order}</span>
        </div>
      </TableCell>
      <TableCell className="py-2">
        <img
          src={photo.image_url}
          alt={photo.caption || ''}
          className="w-20 h-14 object-cover rounded-lg border border-[#E2E2E0]"
        />
      </TableCell>
      <TableCell className="text-xs text-[#6E6E6C] max-w-xs truncate font-mono">
        <a
          href={photo.image_url}
          target="_blank"
          rel="noreferrer"
          className="hover:underline hover:text-[#111111]"
        >
          {photo.image_url}
        </a>
      </TableCell>
      <TableCell className="font-semibold text-[#111111]">{photo.caption || '-'}</TableCell>
      <TableCell className="text-center pr-4">
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(photo)}
            className="p-1.5 rounded-xl text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] cursor-pointer transition-all"
            title="Edit foto"
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => canDelete && onDelete(photo.id)}
            disabled={!canDelete}
            className={`p-1.5 rounded-xl transition-all ${canDelete ? 'text-[#f43f5e] hover:text-[#e11d48] hover:bg-[#fff5f5] cursor-pointer' : 'text-[#E2E2E0] cursor-not-allowed'}`}
            title={!canDelete ? 'Minimal 3 foto harus tersedia' : 'Hapus foto'}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </TableCell>
    </TableRow>
  )
}

// Helper functions for image compression and S3 upload
const ensureBucketExists = async (bucketName: string) => {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) throw listError

    const exists = buckets?.some((b) => b.name === bucketName)
    if (!exists) {
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/webp', 'image/jpeg', 'image/png'],
        fileSizeLimit: 10485760, // 10MB limit in bytes
      })
      if (createError) {
        console.error('Failed to create bucket:', createError)
      }
    }
  } catch (err) {
    console.warn('Could not ensure bucket exists (ignoring and proceeding):', err)
  }
}

const convertToWebP = (file: File, quality = 0.8): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Limit maximum resolution to 1920px (full HD) for performance
        const maxDim = 1920
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas 2d context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Canvas to WebP conversion failed'))
            }
          },
          'image/webp',
          quality
        )
      }
      img.onerror = () => reject(new Error('Failed to load image file'))
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
  })
}

const uploadImageToStorage = async (file: File): Promise<string> => {
  // Ensure the 'wednity' bucket exists
  await ensureBucketExists('wednity')

  // Convert image to WebP
  const webpBlob = await convertToWebP(file, 0.8)

  // Generate a clean unique filename inside 'wednity' bucket
  const extension = 'webp'
  const randomStr = Math.random().toString(36).substring(2, 10)
  const timestamp = Date.now()
  const fileName = `${timestamp}_${randomStr}.${extension}`

  // Upload webp blob to bucket
  const { error } = await supabase.storage
    .from('wednity')
    .upload(fileName, webpBlob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    })

  if (error) throw error

  // Get public URL
  const { data: urlData } = supabase.storage.from('wednity').getPublicUrl(fileName)
  return urlData.publicUrl
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [activeTab, setActiveTab] = useState('metadata') // 'metadata' | 'stories' | 'gallery' | 'guests'
  const [formSection, setFormSection] = useState<
    'groom' | 'bride' | 'event' | 'gift' | 'additional'
  >('groom')

  // General WO Dashboard tabs state
  const [activeWoTab, setActiveWoTab] = useState<
    'clients' | 'customers' | 'team' | 'settings' | 'billing' | 'profile'
  >('clients')
  const [woProfile, setWoProfile] = useState({
    name: serverConfig.woName || '',
    slug: serverConfig.woSlug || '',
    email: '',
    location: serverConfig.woLocation || '',
  })
  const [staffList, setStaffList] = useState<any[]>([])
  const [showAddStaffModal, setShowAddStaffModal] = useState(false)
  const [activePlan, setActivePlan] = useState<any>(null)
  const [adminUser, setAdminUser] = useState({
    name: serverConfig.userName || 'Administrator',
    email: serverConfig.userEmail || '',
  })

  // App-wide state
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [totalStats, setTotalStats] = useState({ total: 0, published: 0, draft: 0 })
  const [globalGuests, setGlobalGuests] = useState<any[]>([])

  // Selected Couple States
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null)

  // Image Upload Toggles & Loaders
  const [storyImageType, setStoryImageType] = useState<'url' | 'upload'>('url')
  const [editStoryImageType, setEditStoryImageType] = useState<'url' | 'upload'>('url')
  const [galleryImageType, setGalleryImageType] = useState<'url' | 'upload'>('url')
  const [editGalleryImageType, setEditGalleryImageType] = useState<'url' | 'upload'>('url')

  const [isUploadingStoryImage, setIsUploadingStoryImage] = useState(false)
  const [isUploadingEditStoryImage, setIsUploadingEditStoryImage] = useState(false)
  const [isUploadingGalleryImage, setIsUploadingGalleryImage] = useState(false)
  const [isUploadingEditGalleryImage, setIsUploadingEditGalleryImage] = useState(false)

  useEffect(() => {
    if (editingStory) {
      setEditStoryImageType('url')
    }
  }, [editingStory])

  useEffect(() => {
    if (editingGallery) {
      setEditGalleryImageType('url')
    }
  }, [editingGallery])

  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [guests, setGuests] = useState<Guest[]>([])

  // Form submission alerts
  const [statusAlert, setStatusAlert] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Client-side authentication state
  const [isAuthReady, setIsAuthReady] = useState(false)

  // Mobile responsive navigation state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Custom copy toast state
  const [showCopyToast, setShowCopyToast] = useState(false)

  // Confirm dialog state (replaces native confirm())
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    destructive?: boolean
    onConfirm: () => void
  }>({ open: false, title: '', description: '', onConfirm: () => {} })

  const showConfirm = (opts: {
    title: string
    description: string
    destructive?: boolean
    onConfirm: () => void
  }) => {
    setConfirmDialog({ open: true, ...opts })
  }
  // Data Table interactive states
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'year' | 'month' | 'week'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  // Guest Table interactive states
  const [guestSearchQuery, setGuestSearchQuery] = useState('')
  const [guestCurrentPage, setGuestCurrentPage] = useState(1)
  const guestPageSize = 5

  // Settings Tab & Profile interactive states
  const [settingsSubTab, setSettingsSubTab] = useState<'profile' | 'business' | 'billing'>(
    'profile'
  )
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [emailSummaries, setEmailSummaries] = useState(true)
  const [criticalAlerts, setCriticalAlerts] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState(true)

  // Interactive templates chart hover state
  const [hoveredTemplateIndex, setHoveredTemplateIndex] = useState<number | null>(null)
  const [rsvpRange, setRsvpRange] = useState<'7d' | '30d' | '90d'>('7d')

  // Initialize client-side Supabase session using server-injected tokens
  useEffect(() => {
    const initSession = async () => {
      if (serverConfig.accessToken && serverConfig.refreshToken) {
        try {
          await supabase.auth.setSession({
            access_token: serverConfig.accessToken,
            refresh_token: serverConfig.refreshToken,
          })
        } catch (err) {
          console.error('Error initializing client-side Supabase session:', err)
        }
      }
      setIsAuthReady(true)
    }
    initSession()
  }, [])

  // Listen to browser navigation changes (back/forward button)
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname)
    }
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [])

  // Parse path to resolve active views and IDs
  useEffect(() => {
    // Path pattern matches /admin/:slug_wo/customers/:customer_id
    const customerMatch = currentPath.match(/\/admin\/[^/]+\/customers\/([^/]+)/)
    if (customerMatch && customerMatch[1]) {
      setSelectedCustomerId(customerMatch[1])
    } else {
      setSelectedCustomerId(null)
      setSelectedCustomer(null)
      setInvitation(null)
      setStories([])
      setGalleries([])
      setGuests([])
    }
  }, [currentPath])

  // Fetch WO couples/dashboard stats
  useEffect(() => {
    if (!isAuthReady) return

    if (!selectedCustomerId) {
      fetchDashboardData()
      fetchWoProfile()
      fetchStaffList()
      fetchPlanInfo()
    } else {
      fetchCoupleData(selectedCustomerId)
    }
  }, [selectedCustomerId, isAuthReady, activeWoTab])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // 1. Fetch customers
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (custErr) throw custErr
      const fetchedCustomers = custData || []

      // 2. Fetch linked invitations to map active states
      const customerIds = fetchedCustomers.map((c: any) => c.id)
      let invitationsData: any[] = []
      let guestCountsMap: Record<string, number> = {}
      if (customerIds.length > 0) {
        const { data: invData } = await supabase
          .from('invitations')
          .select('id, customer_id, slug, style, akad_datetime, resepsi_datetime')
          .in('customer_id', customerIds)
        invitationsData = invData || []

        const invitationIds = invitationsData.map((i: any) => i.id)
        if (invitationIds.length > 0) {
          const { data: guestData } = await supabase
            .from('admin_guests')
            .select('invitation_id, attendance, created_at')
            .in('invitation_id', invitationIds)

          if (guestData) {
            setGlobalGuests(guestData)
            guestData.forEach((g: any) => {
              guestCountsMap[g.invitation_id] = (guestCountsMap[g.invitation_id] || 0) + 1
            })
          }
        }
      }

      const mapped = fetchedCustomers.map((c: any) => {
        const linkedInv = invitationsData.find((i: any) => i.customer_id === c.id)
        return {
          ...c,
          isActive: !!linkedInv,
          slug: linkedInv?.slug || '',
          style: linkedInv?.style || 'java_style',
          wedding_date: linkedInv ? linkedInv.akad_datetime || linkedInv.resepsi_datetime : null,
          guest_count: linkedInv ? guestCountsMap[linkedInv.id] || 0 : 0,
        }
      })

      setCustomers(mapped)
      setTotalStats({
        total: mapped.length,
        published: mapped.filter((c: any) => c.isActive).length,
        draft: mapped.filter((c: any) => !c.isActive).length,
      })
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchWoProfile = async () => {
    if (!serverConfig.woId) return
    try {
      const { data, error } = await supabase
        .from('wedding_organization')
        .select('*')
        .eq('id', serverConfig.woId)
        .single()
      if (error) throw error
      if (data) {
        setWoProfile({
          name: data.name,
          slug: data.slug,
          email: data.email,
          location: data.location || '',
        })
      }
    } catch (err) {
      console.error('Error fetching WO profile:', err)
    }
  }

  const fetchStaffList = async () => {
    if (!serverConfig.woId) return
    try {
      const { data, error } = await supabase
        .from('wo_staff')
        .select('*')
        .eq('wo_id', serverConfig.woId)
        .order('created_at', { ascending: true })
      if (error) throw error
      if (data) {
        setStaffList(data)
      }
    } catch (err) {
      console.error('Error fetching staff list:', err)
    }
  }

  const fetchPlanInfo = async () => {
    if (!serverConfig.woId) return
    try {
      const { data: woPlans } = await supabase
        .from('wo_plan')
        .select('*, plan(*)')
        .eq('wo_id', serverConfig.woId)
        .eq('status', 'active')
        .order('end_date', { ascending: false })

      if (woPlans && woPlans.length > 0) {
        setActivePlan(woPlans[0])
      } else {
        setActivePlan(null)
      }
    } catch (err) {
      console.error('Error fetching plan info:', err)
    }
  }

  const handleUpdateWoProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('woName') as string
    const location = formData.get('woLocation') as string
    const email = formData.get('woEmail') as string
    const slug = formData.get('woSlug') as string

    try {
      const { error } = await supabase
        .from('wedding_organization')
        .update({ name, location, email, slug })
        .eq('id', serverConfig.woId)

      if (error) throw error

      setWoProfile({ name, location, email, slug })
      setStatusAlert({ type: 'success', message: 'Profil Wedding Organizer berhasil disimpan!' })
      setTimeout(() => setStatusAlert(null), 3000)

      if (slug !== serverConfig.woSlug) {
        window.location.href = `/admin/${slug}`
      }
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal memperbarui profil: ${err.message}` })
    }
  }

  const handleUpgradePlan = async (planId: string) => {
    if (!serverConfig.woId) return
    try {
      // 1. Expire all current plans for this WO
      await supabase
        .from('wo_plan')
        .update({ status: 'expired' })
        .eq('wo_id', serverConfig.woId)
        .eq('status', 'active')

      // 2. Insert new active plan
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + 30)

      const { error } = await supabase.from('wo_plan').insert({
        wo_id: serverConfig.woId,
        plan_id: planId,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })

      if (error) throw error

      setStatusAlert({ type: 'success', message: 'Paket langganan berhasil diperbarui!' })
      setTimeout(() => setStatusAlert(null), 3000)
      await fetchPlanInfo()
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal memperbarui paket: ${err.message}` })
      setTimeout(() => setStatusAlert(null), 3000)
    }
  }

  const handleUpdateAdminProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('adminName') as string
    setAdminUser((prev) => ({ ...prev, name }))
    setShowEditProfileModal(false)
    setStatusAlert({ type: 'success', message: 'Profil Admin berhasil disimpan!' })
    setTimeout(() => setStatusAlert(null), 3000)
  }

  const handleAddStaffSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('staffName') as string
    const email = formData.get('staffEmail') as string
    const role = formData.get('staffRole') as string
    const userId = formData.get('staffUserId') as string

    try {
      const { error } = await supabase.from('wo_staff').insert({
        wo_id: serverConfig.woId,
        user_id: userId,
        name,
        email,
        role,
      })

      if (error) throw error

      setShowAddStaffModal(false)
      fetchStaffList()
      setStatusAlert({ type: 'success', message: 'Anggota tim staff baru berhasil ditambahkan!' })
      setTimeout(() => setStatusAlert(null), 3000)
    } catch (err: any) {
      window.alert(`Gagal menambah staff: ${err.message}`)
    }
  }

  const handleDeleteStaff = async (id: string) => {
    showConfirm({
      title: 'Hapus Staff',
      description: 'Apakah Anda yakin ingin menghapus staff ini?',
      destructive: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('wo_staff').delete().eq('id', id)
          if (error) throw error
          fetchStaffList()
          setStatusAlert({ type: 'success', message: 'Staff berhasil dihapus!' })
          setTimeout(() => setStatusAlert(null), 3000)
        } catch (err: any) {
          setStatusAlert({ type: 'error', message: `Gagal menghapus staff: ${err.message}` })
        }
      },
    })
  }

  const fetchCoupleData = async (customerId: string) => {
    setLoading(true)
    try {
      // 1. Fetch couple metadata
      const { data: cust, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

      if (custErr) throw custErr
      setSelectedCustomer(cust)

      // 2. Fetch invitation settings
      const { data: inv, error: invErr } = await supabase
        .from('invitations')
        .select('*')
        .eq('customer_id', customerId)
        .single()

      if (invErr && invErr.code !== 'PGRST116') throw invErr // PGRST116 is single empty row error

      if (inv) {
        setInvitation(inv)

        // 3. Fetch stories
        const { data: storyList } = await supabase
          .from('stories')
          .select('*')
          .eq('invitation_id', inv.id)
          .order('sort_order', { ascending: true })
        setStories(storyList || [])

        // 4. Fetch photos
        const { data: galleryList } = await supabase
          .from('galleries')
          .select('*')
          .eq('invitation_id', inv.id)
          .order('sort_order', { ascending: true })
        setGalleries(galleryList || [])

        // 5. Fetch guest RSVPs
        const { data: guestList } = await supabase
          .from('admin_guests')
          .select('*')
          .eq('invitation_id', inv.id)
          .order('created_at', { ascending: false })
        setGuests(guestList || [])
      } else {
        setInvitation(null)
      }
    } catch (err: any) {
      console.error('Error fetching couple detail data:', err.message)
      setStatusAlert({ type: 'error', message: `Gagal memuat data klien: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  // Handle SPA routing helper
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
    setIsSidebarOpen(false)
  }

  // Create new customer & auto-initialise invitation record
  const handleCreateCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const maleName = formData.get('maleName') as string
    const femaleName = formData.get('femaleName') as string
    const email = formData.get('email') as string

    try {
      // 1. Insert customer
      const { data: newCust, error: custErr } = await supabase
        .from('customers')
        .insert({
          male_name: maleName,
          female_name: femaleName,
          email: email,
        })
        .select()
        .single()

      if (custErr) throw custErr

      // Generate slug suffix
      const suffix = Math.floor(1000 + Math.random() * 9000)
      const baseSlug = `${maleName.toLowerCase()}-${femaleName.toLowerCase()}`.replace(
        /[^a-z0-9-]/g,
        ''
      )
      const finalSlug = `${baseSlug}-${suffix}`

      // 2. Initialize corresponding invitation record
      const { error: invErr } = await supabase.from('invitations').insert({
        customer_id: newCust.id,
        slug: finalSlug,
        groom_name: maleName,
        groom_nickname: maleName,
        bride_name: femaleName,
        bride_nickname: femaleName,
        event_location: 'Gedung Pernikahan',
        event_address: 'Alamat Acara',
        style: 'java_style',
        akad_datetime: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        resepsi_datetime: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000 + 3 * 3600 * 1000
        ).toISOString(),
      })

      if (invErr) throw invErr

      setOpenCreateModal(false)
      fetchDashboardData()
      setStatusAlert({ type: 'success', message: 'Inisialisasi klien pengantin baru sukses!' })
      setTimeout(() => setStatusAlert(null), 3000)
    } catch (err: any) {
      window.alert(`Gagal menambah klien: ${err.message}`)
    }
  }

  // Update selected couple metadata
  const handleUpdateMetadata = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!invitation) return

    const formData = new FormData(e.currentTarget)
    try {
      const { error } = await supabase
        .from('invitations')
        .update({
          groom_name: formData.get('groomName'),
          groom_nickname: formData.get('groomNickname'),
          groom_parent_father: formData.get('groomParentFather'),
          groom_parent_mother: formData.get('groomParentMother'),
          bride_name: formData.get('brideName'),
          bride_nickname: formData.get('brideNickname'),
          bride_parent_father: formData.get('brideParentFather'),
          bride_parent_mother: formData.get('brideParentMother'),
          akad_datetime: formData.get('akadDatetime'),
          resepsi_datetime: formData.get('resepsiDatetime'),
          event_location: formData.get('eventLocation'),
          event_address: formData.get('eventAddress'),
          google_maps_url: formData.get('googleMapsUrl'),
          bank_name: formData.get('bankName'),
          bank_account_number: formData.get('bankAccountNumber'),
          bank_account_holder: formData.get('bankAccountHolder'),
          wallet_name: formData.get('walletName'),
          wallet_number: formData.get('walletNumber'),
          wallet_holder: formData.get('walletHolder'),
          slug: formData.get('slug'),
          bg_music_url: formData.get('bgMusicUrl'),
          style: formData.get('style'),
          updated_at: new Date().toISOString(),
        })
        .eq('id', invitation.id)

      if (error) throw error
      setStatusAlert({ type: 'success', message: 'Detail informasi undangan berhasil disimpan!' })
      setTimeout(() => setStatusAlert(null), 3500)
      if (selectedCustomerId) fetchCoupleData(selectedCustomerId)
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal memperbarui: ${err.message}` })
    }
  }

  // Create love story milestone story (max 4)
  const handleCreateStory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!invitation) return
    if (stories.length >= 4) {
      setStatusAlert({
        type: 'error',
        message: 'Maksimal 4 momen kisah. Hapus salah satu untuk menambah yang baru.',
      })
      return
    }

    const formRef = e.currentTarget
    const formData = new FormData(formRef)
    try {
      let imageUrl = formData.get('imageUrl') as string
      if (storyImageType === 'upload') {
        const fileInput = formRef.querySelector('input[type="file"]') as HTMLInputElement
        const file = fileInput?.files?.[0]
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            setStatusAlert({ type: 'error', message: 'Ukuran file gambar melebihi batas maksimal 10MB.' })
            return
          }
          setIsUploadingStoryImage(true)
          imageUrl = await uploadImageToStorage(file)
        } else {
          setStatusAlert({ type: 'error', message: 'Silakan pilih berkas gambar untuk diunggah.' })
          return
        }
      }

      const nextSortOrder = stories.length + 1
      const { error } = await supabase.from('stories').insert({
        invitation_id: invitation.id,
        milestone_date: formData.get('milestoneDate'),
        title: formData.get('title'),
        description: formData.get('description'),
        image_url: imageUrl || '',
        sort_order: nextSortOrder,
      })

      if (error) throw error
      formRef.reset()
      setStatusAlert({ type: 'success', message: 'Momen kisah berhasil ditambahkan!' })
      setTimeout(() => setStatusAlert(null), 3500)
      if (selectedCustomerId) fetchCoupleData(selectedCustomerId)
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal menambahkan kisah: ${err.message}` })
    } finally {
      setIsUploadingStoryImage(false)
    }
  }

  // Update love story milestone
  const handleUpdateStory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingStory) return

    const formRef = e.currentTarget
    const formData = new FormData(formRef)
    try {
      let imageUrl = editingStory.image_url
      if (editStoryImageType === 'url') {
        imageUrl = formData.get('imageUrl') as string
      } else {
        const fileInput = formRef.querySelector('input[type="file"]') as HTMLInputElement
        const file = fileInput?.files?.[0]
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            setStatusAlert({ type: 'error', message: 'Ukuran file gambar melebihi batas maksimal 10MB.' })
            return
          }
          setIsUploadingEditStoryImage(true)
          imageUrl = await uploadImageToStorage(file)
        }
      }

      const { error } = await supabase
        .from('stories')
        .update({
          milestone_date: formData.get('milestoneDate'),
          title: formData.get('title'),
          description: formData.get('description'),
          image_url: imageUrl || '',
        })
        .eq('id', editingStory.id)

      if (error) throw error
      setEditingStory(null)
      setStatusAlert({ type: 'success', message: 'Momen kisah berhasil diperbarui!' })
      setTimeout(() => setStatusAlert(null), 3500)
      if (selectedCustomerId) fetchCoupleData(selectedCustomerId)
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal memperbarui kisah: ${err.message}` })
    } finally {
      setIsUploadingEditStoryImage(false)
    }
  }

  // Delete story (min 2)

  const handleDeleteStory = async (id: string) => {
    if (stories.length <= 2) {
      setStatusAlert({ type: 'error', message: 'Minimal 2 momen kisah harus tersedia.' })
      return
    }
    showConfirm({
      title: 'Hapus Momen Kisah',
      description: 'Apakah Anda yakin ingin menghapus momen kisah ini?',
      destructive: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('stories').delete().eq('id', id)

          if (error) throw error
          setStatusAlert({ type: 'success', message: 'Kisah berhasil dihapus!' })
          setTimeout(() => setStatusAlert(null), 3000)
          if (selectedCustomerId) fetchCoupleData(selectedCustomerId)
        } catch (err: any) {
          setStatusAlert({ type: 'error', message: `Gagal menghapus kisah: ${err.message}` })
        }
      },
    })
  }

  // Drag and drop sensors for Love Story reordering
  const dndSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Handle reordering of stories when drag ends
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = stories.findIndex((s) => s.id === active.id)
    const newIndex = stories.findIndex((s) => s.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reorderedStories = arrayMove(stories, oldIndex, newIndex)

    // Remap sort orders based on new positions (1-indexed)
    const updatedStories = reorderedStories.map((story, idx) => ({
      ...story,
      sort_order: idx + 1,
    }))

    // Optimistic UI update
    setStories(updatedStories)

    try {
      // Update each story's sort_order in Supabase concurrently
      const promises = updatedStories.map((story) =>
        supabase.from('stories').update({ sort_order: story.sort_order }).eq('id', story.id)
      )

      const results = await Promise.all(promises)
      const error = results.find((r) => r.error)?.error
      if (error) throw error
    } catch (err: any) {
      console.error('Error updating stories sort order:', err)
      setStatusAlert({ type: 'error', message: `Gagal memperbarui urutan kisah: ${err.message}` })
      // Revert from backend
      if (selectedCustomerId) fetchCoupleData(selectedCustomerId)
    }
  }

  // Create photo gallery photo
  const handleCreateGallery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!invitation) return
    if (galleries.length >= 6) {
      setStatusAlert({
        type: 'error',
        message: 'Maksimal 6 foto galeri. Hapus salah satu untuk mengunggah yang baru.',
      })
      return
    }

    const formRef = e.currentTarget
    const formData = new FormData(formRef)
    try {
      let imageUrl = formData.get('imageUrl') as string
      if (galleryImageType === 'upload') {
        const fileInput = formRef.querySelector('input[type="file"]') as HTMLInputElement
        const file = fileInput?.files?.[0]
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            setStatusAlert({ type: 'error', message: 'Ukuran file gambar melebihi batas maksimal 10MB.' })
            return
          }
          setIsUploadingGalleryImage(true)
          imageUrl = await uploadImageToStorage(file)
        } else {
          setStatusAlert({ type: 'error', message: 'Silakan pilih berkas gambar untuk diunggah.' })
          return
        }
      }

      const nextGallerySortOrder = galleries.length + 1
      const { error } = await supabase.from('galleries').insert({
        invitation_id: invitation.id,
        image_url: imageUrl || '',
        caption: formData.get('caption'),
        sort_order: nextGallerySortOrder,
      })

      if (error) throw error
      formRef.reset()
      setStatusAlert({ type: 'success', message: 'Foto galeri berhasil diunggah!' })
      setTimeout(() => setStatusAlert(null), 3500)
      if (selectedCustomerId) fetchCoupleData(selectedCustomerId)
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal mengunggah foto: ${err.message}` })
    } finally {
      setIsUploadingGalleryImage(false)
    }
  }

  // Update photo gallery photo
  const handleUpdateGallery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingGallery) return

    const formRef = e.currentTarget
    const formData = new FormData(formRef)
    try {
      let imageUrl = editingGallery.image_url
      if (editGalleryImageType === 'url') {
        imageUrl = formData.get('imageUrl') as string
      } else {
        const fileInput = formRef.querySelector('input[type="file"]') as HTMLInputElement
        const file = fileInput?.files?.[0]
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            setStatusAlert({ type: 'error', message: 'Ukuran file gambar melebihi batas maksimal 10MB.' })
            return
          }
          setIsUploadingEditGalleryImage(true)
          imageUrl = await uploadImageToStorage(file)
        }
      }

      const { error } = await supabase
        .from('galleries')
        .update({
          image_url: imageUrl || '',
          caption: formData.get('caption'),
        })
        .eq('id', editingGallery.id)

      if (error) throw error
      setEditingGallery(null)
      setStatusAlert({ type: 'success', message: 'Foto galeri berhasil diperbarui!' })
      setTimeout(() => setStatusAlert(null), 3500)
      if (selectedCustomerId) fetchCoupleData(selectedCustomerId)
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal memperbarui foto: ${err.message}` })
    } finally {
      setIsUploadingEditGalleryImage(false)
    }
  }

  // Delete photo from gallery
  const handleDeleteGallery = async (id: string) => {
    if (galleries.length <= 3) {
      setStatusAlert({ type: 'error', message: 'Minimal 3 foto galeri harus tersedia.' })
      return
    }
    showConfirm({
      title: 'Hapus Foto Galeri',
      description: 'Hapus foto dari galeri ini?',
      destructive: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('galleries').delete().eq('id', id)

          if (error) throw error
          setStatusAlert({ type: 'success', message: 'Foto berhasil dihapus!' })
          setTimeout(() => setStatusAlert(null), 3000)
          if (selectedCustomerId) fetchCoupleData(selectedCustomerId)
        } catch (err: any) {
          setStatusAlert({ type: 'error', message: `Gagal menghapus foto: ${err.message}` })
        }
      },
    })
  }

  // Handle reordering of galleries when drag ends
  const handleDragEndGallery = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = galleries.findIndex((g) => g.id === active.id)
    const newIndex = galleries.findIndex((g) => g.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reorderedGalleries = arrayMove(galleries, oldIndex, newIndex)

    // Remap sort orders based on new positions (1-indexed)
    const updatedGalleries = reorderedGalleries.map((photo, idx) => ({
      ...photo,
      sort_order: idx + 1,
    }))

    // Optimistic UI update
    setGalleries(updatedGalleries)

    try {
      // Update each photo's sort_order in Supabase concurrently
      const promises = updatedGalleries.map((photo) =>
        supabase.from('galleries').update({ sort_order: photo.sort_order }).eq('id', photo.id)
      )

      const results = await Promise.all(promises)
      const error = results.find((r) => r.error)?.error
      if (error) throw error
    } catch (err: any) {
      console.error('Error updating galleries sort order:', err)
      setStatusAlert({ type: 'error', message: `Gagal memperbarui urutan galeri: ${err.message}` })
      // Revert from backend
      if (selectedCustomerId) fetchCoupleData(selectedCustomerId)
    }
  }

  // Delete RSVP Guest
  const handleDeleteGuest = async (id: string) => {
    showConfirm({
      title: 'Hapus Konfirmasi RSVP',
      description: 'Apakah Anda yakin ingin menghapus konfirmasi RSVP dari tamu ini?',
      destructive: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('admin_guests').delete().eq('id', id)

          if (error) throw error
          setStatusAlert({ type: 'success', message: 'Konfirmasi RSVP berhasil dihapus!' })
          setTimeout(() => setStatusAlert(null), 3000)
          if (selectedCustomerId) fetchCoupleData(selectedCustomerId)
        } catch (err: any) {
          setStatusAlert({ type: 'error', message: `Gagal menghapus tamu: ${err.message}` })
        }
      },
    })
  }

  // Create RSVP Guest
  const handleCreateGuest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!invitation) return

    const form = e.currentTarget
    const formData = new FormData(form)
    const guestName = formData.get('guestName') as string

    if (!guestName || !guestName.trim()) return

    try {
      const { error } = await supabase.from('admin_guests').insert({
        invitation_id: invitation.id,
        name: guestName.trim(),
        attendance: null, // pending
        comment: null,
      })

      if (error) throw error
      form.reset()
      setStatusAlert({ type: 'success', message: 'Tamu berhasil ditambahkan!' })
      setTimeout(() => setStatusAlert(null), 3500)
      if (selectedCustomerId) fetchCoupleData(selectedCustomerId)
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal menambahkan tamu: ${err.message}` })
    }
  }

  // Format Date string helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return (
        date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }) + ' WIB'
      )
    } catch (e) {
      return isoString
    }
  }

  const getMonthlyRegistrationStats = () => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'Mei',
      'Jun',
      'Jul',
      'Agu',
      'Sep',
      'Okt',
      'Nov',
      'Des',
    ]
    const last6Months: Array<{
      monthName: string
      year: number
      monthIndex: number
      count: number
    }> = []

    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      last6Months.push({
        monthName: months[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        count: 0,
      })
    }

    customers.forEach((cust) => {
      if (!cust.created_at) return
      const date = new Date(cust.created_at)
      const custMonth = date.getMonth()
      const custYear = date.getFullYear()

      const match = last6Months.find((m) => m.monthIndex === custMonth && m.year === custYear)
      if (match) {
        match.count++
      }
    })

    return last6Months
  }

  const getRsvpTimelineData = (range: '7d' | '30d' | '90d' = '7d') => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const data: { date: string; hadir: number; tidak: number }[] = []
    const now = new Date()

    // 1. Build the list of dates in chronological order
    const dates: string[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
    }
    const startDateStr = dates[0]

    // 2. Parse guests and check if all share the same minute (seeded check)
    const guestsWithDates = globalGuests.map((g) => {
      const isHadir = g.attendance === 'hadir'
      const dateVal = g.created_at ? new Date(g.created_at) : new Date()
      return {
        type: isHadir ? 'hadir' : 'tidak',
        date: dateVal,
      }
    })

    const allSameTime =
      guestsWithDates.length > 1 &&
      guestsWithDates.every(
        (g) => Math.abs(g.date.getTime() - guestsWithDates[0].date.getTime()) < 60000
      )

    let guestEvents: { type: string; dateStr: string }[] = []

    if (allSameTime) {
      // Seeded data fallback: distribute them chronologically across the active range
      guestsWithDates.forEach((g, idx) => {
        const dayOffset = Math.min(idx % days, days - 1)
        const d = new Date()
        d.setDate(now.getDate() - dayOffset)
        guestEvents.push({
          type: g.type,
          dateStr: d.toISOString().split('T')[0],
        })
      })
    } else {
      // Use actual dates (only within the range)
      guestsWithDates.forEach((g) => {
        const dateStr = g.date.toISOString().split('T')[0]
        if (dateStr >= startDateStr) {
          guestEvents.push({
            type: g.type,
            dateStr,
          })
        }
      })
    }

    // 3. Build cumulative counts chronologically
    let runningHadir = 0
    let runningTidak = 0

    dates.forEach((dateStr) => {
      const dayEvents = guestEvents.filter((e) => e.dateStr === dateStr)
      dayEvents.forEach((e) => {
        if (e.type === 'hadir') {
          runningHadir++
        } else {
          runningTidak++
        }
      })
      data.push({
        date: dateStr,
        hadir: runningHadir,
        tidak: runningTidak,
      })
    })

    return data
  }

  const getRsvpRangeStats = (range: '7d' | '30d' | '90d' = '7d') => {
    const timeline = getRsvpTimelineData(range)
    if (timeline.length === 0) return { hadir: 0, tidak: 0 }
    const lastItem = timeline[timeline.length - 1]
    return {
      hadir: lastItem.hadir || 0,
      tidak: lastItem.tidak || 0,
    }
  }

  // Filter search logic
  const filteredCustomers = customers.filter((cust) => {
    // 1. Search query filter
    const q = searchQuery.toLowerCase()
    const nameMatch = `${cust.male_name} ${cust.female_name}`.toLowerCase().includes(q)
    const emailMatch = cust.email.toLowerCase().includes(q)
    const searchMatches = nameMatch || emailMatch

    if (!searchMatches) return false

    // 2. Date filter (based on creation date)
    if (!cust.created_at) return true
    const createdDate = new Date(cust.created_at)
    const now = new Date()

    if (dateFilter === 'year') {
      return createdDate.getFullYear() === now.getFullYear()
    } else if (dateFilter === 'month') {
      return (
        createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
      )
    } else if (dateFilter === 'week') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(now.getDate() - 7)
      return createdDate >= oneWeekAgo
    }

    return true // 'all'
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )
  const renderPageNumbers = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          type="button"
          onClick={() => {
            setCurrentPage(i)
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            currentPage === i
              ? 'bg-[#111111] text-white shadow-sm'
              : 'bg-white border border-[#E2E2E0] hover:bg-[#FAF9F6] text-[#6E6E6C] hover:text-[#111111]'
          }`}
        >
          {i}
        </button>
      )
    }
    return pages
  }

  // Guest list filters and pagination calculations
  const filteredGuests = guests.filter((guest) => {
    if (!guestSearchQuery.trim()) return true
    const q = guestSearchQuery.toLowerCase()
    return guest.name?.toLowerCase().includes(q) || guest.comment?.toLowerCase().includes(q)
  })

  const totalGuestPages = Math.ceil(filteredGuests.length / guestPageSize) || 1
  const paginatedGuests = filteredGuests.slice(
    (guestCurrentPage - 1) * guestPageSize,
    guestCurrentPage * guestPageSize
  )

  const renderGuestPageNumbers = () => {
    const pages = []
    for (let i = 1; i <= totalGuestPages; i++) {
      pages.push(
        <button
          key={i}
          type="button"
          onClick={() => {
            setGuestCurrentPage(i)
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            guestCurrentPage === i
              ? 'bg-[#111111] text-white shadow-sm'
              : 'bg-white border border-[#E2E2E0] hover:bg-[#FAF9F6] text-[#6E6E6C] hover:text-[#111111]'
          }`}
        >
          {i}
        </button>
      )
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] relative">
      {/* Sidebar Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ========================================== */}
      {/* SIDEBAR                                    */}
      {/* ========================================== */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen w-64 bg-white border-r border-[#E2E2E0] flex flex-col p-5 font-sans transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Responsive Header */}
        <div className="flex justify-between items-center border-b border-[#E2E2E0] pb-4 mb-4">
          {selectedCustomer ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111] font-semibold text-xs shrink-0">
                {selectedCustomer.male_name ? selectedCustomer.male_name[0].toUpperCase() : 'C'}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-[#111111] truncate leading-tight">
                  {selectedCustomer.male_name} & {selectedCustomer.female_name}
                </h2>
                <p className="text-[10px] text-[#6E6E6C] uppercase tracking-wider mt-0.5 font-sans font-medium">
                  Workspace Klien
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {serverConfig.woName ? serverConfig.woName[0].toUpperCase() : 'W'}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-semibold text-[#111111] truncate leading-tight">
                  {woProfile.name || serverConfig.woName}
                </h2>
                <p className="text-[10px] text-[#6E6E6C] uppercase tracking-wider mt-0.5 font-sans font-medium">
                  Console Admin
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] rounded-md md:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {selectedCustomer ? (
            <>
              {/* Back to general organizer dashboard */}
              <button
                type="button"
                onClick={() => navigateTo(`/admin/${serverConfig.woSlug}`)}
                className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] mb-3 rounded-xl transition-all cursor-pointer text-left w-full"
              >
                <ArrowLeft size={14} />
                Kembali ke Dashboard
              </button>

              <span className="text-[9px] font-semibold text-[#6E6E6C] tracking-widest uppercase px-4 mb-2 block">
                Menu Undangan
              </span>

              {/* Scoped workspace tabs */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('metadata')
                  setIsSidebarOpen(false)
                }}
                className={`flex items-center gap-3 px-4 py-2.5 text-[13px] text-left w-full transition-all duration-200 rounded-xl ${
                  activeTab === 'metadata'
                    ? 'text-white font-semibold bg-[#111111] shadow-sm'
                    : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                }`}
              >
                <Edit3 size={18} />
                Detail Mempelai
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('stories')
                  setIsSidebarOpen(false)
                }}
                className={`flex items-center gap-3 px-4 py-2.5 text-[13px] text-left w-full transition-all duration-200 rounded-xl ${
                  activeTab === 'stories'
                    ? 'text-white font-semibold bg-[#111111] shadow-sm'
                    : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                }`}
              >
                <BookHeart size={18} />
                Kisah Cerita
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('gallery')
                  setIsSidebarOpen(false)
                }}
                className={`flex items-center gap-3 px-4 py-2.5 text-[13px] text-left w-full transition-all duration-200 rounded-xl ${
                  activeTab === 'gallery'
                    ? 'text-white font-semibold bg-[#111111] shadow-sm'
                    : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                }`}
              >
                <ImageIcon size={18} />
                Galeri Foto
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('guests')
                  setIsSidebarOpen(false)
                }}
                className={`flex items-center gap-3 px-4 py-2.5 text-[13px] text-left w-full transition-all duration-200 rounded-xl ${
                  activeTab === 'guests'
                    ? 'text-white font-semibold bg-[#111111] shadow-sm'
                    : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                }`}
              >
                <MessageSquare size={18} />
                Tamu & RSVP
              </button>
            </>
          ) : (
            <div className="w-full flex-1 flex flex-col justify-between">
              {/* TOP NAVIGATION GROUP */}
              <div className="w-full space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveWoTab('clients')
                    setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 text-[13px] text-left w-full transition-all duration-200 rounded-xl ${
                    activeWoTab === 'clients'
                      ? 'text-white font-semibold bg-[#111111] shadow-sm'
                      : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveWoTab('customers')
                    setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 text-[13px] text-left w-full transition-all duration-200 rounded-xl ${
                    activeWoTab === 'customers'
                      ? 'text-white font-semibold bg-[#111111] shadow-sm'
                      : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                  }`}
                >
                  <Users size={18} />
                  Daftar Klien
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveWoTab('team')
                    setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 text-[13px] text-left w-full transition-all duration-200 rounded-xl ${
                    activeWoTab === 'team'
                      ? 'text-white font-semibold bg-[#111111] shadow-sm'
                      : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                  }`}
                >
                  <Shield size={18} />
                  Tim Staff
                </button>
              </div>

              {/* BOTTOM NAVIGATION GROUP */}
              <div className="w-full space-y-1 mt-auto pt-4 border-t border-[#E2E2E0]/40">
                <button
                  type="button"
                  onClick={() => {
                    setActiveWoTab('settings')
                    setSettingsSubTab('business')
                    setIsSidebarOpen(false)
                  }}
                  className={`flex items-center gap-3 px-4 py-2.5 text-[13px] text-left w-full transition-all duration-200 rounded-xl ${
                    activeWoTab === 'settings'
                      ? 'text-white font-semibold bg-[#111111] shadow-sm'
                      : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                  }`}
                >
                  <Settings size={18} />
                  Pengaturan
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer / User Profile & Logout */}
        <div className="mt-auto px-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center gap-3 p-3 bg-[#FAF9F6] rounded-xl border border-[#E2E2E0] hover:border-[#111111]/30 transition-colors cursor-pointer text-left focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-white font-bold text-[10px] shrink-0">
                  {serverConfig.userEmail
                    ? serverConfig.userEmail.substring(0, 2).toUpperCase()
                    : 'WO'}
                </div>
                <div className="flex-1 overflow-hidden min-w-0">
                  <div className="text-[13px] font-semibold text-[#111111] truncate">
                    {adminUser.name}
                  </div>
                  <div className="text-[10px] text-[#6E6E6C] truncate">Administrator</div>
                </div>
                <MoreVertical size={14} className="text-[#6E6E6C]/40 shrink-0" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 bg-white border border-[#E2E2E0] text-[#111111] rounded-lg p-1.5 shadow-xl origin-[--radix-dropdown-menu-content-transform-origin]">
              <DropdownMenuLabel className="px-2.5 py-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111] font-semibold text-xs shrink-0">
                    {serverConfig.userEmail
                      ? serverConfig.userEmail.substring(0, 2).toUpperCase()
                      : 'WO'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#111111] truncate">
                      {adminUser.name}
                    </div>
                    <div className="text-[9px] text-[#6E6E6C] truncate font-mono mt-0.5">
                      {serverConfig.userEmail}
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#E2E2E0] -mx-1.5 my-1" />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedCustomerId(null)
                  setActiveWoTab('settings')
                  setSettingsSubTab('profile')
                }}
                className="flex items-center gap-2 px-2.5 py-2 text-xs text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] rounded transition-colors cursor-pointer outline-none font-medium"
              >
                <User size={14} className="shrink-0" />
                Akun Saya
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => {
                  setSelectedCustomerId(null)
                  setActiveWoTab('settings')
                  setSettingsSubTab('billing')
                }}
                className="flex items-center gap-2 px-2.5 py-2 text-xs text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] rounded transition-colors cursor-pointer outline-none font-medium"
              >
                <CreditCard size={14} className="shrink-0" />
                Billing / Tagihan
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-[#E2E2E0] -mx-1.5 my-1" />

              <DropdownMenuItem asChild>
                <form
                  action={`/admin/${serverConfig.woSlug}/logout`}
                  method="POST"
                  className="w-full m-0 p-0"
                >
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-[#e57373] hover:text-white hover:bg-[#e57373]/10 rounded transition-colors cursor-pointer text-left border-none bg-transparent outline-none font-medium"
                  >
                    <LogOut size={14} className="shrink-0" />
                    Logout
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN CONTENT AREA                          */}
      {/* ========================================== */}
      <main className="md:pl-64 min-h-screen flex flex-col font-sans relative">
        {/* Mobile Top Navbar Header */}
        <div className="flex items-center justify-between md:hidden border-b border-[#E2E2E0] px-4 py-3 bg-[#FAF9F6]/80 backdrop-blur-xl sticky top-0 z-40">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-[#111111] hover:bg-[#E2E2E0]/40 rounded-lg cursor-pointer transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-base text-[#111111] truncate max-w-[200px]">
            {selectedCustomer
              ? `${selectedCustomer.male_name} & ${selectedCustomer.female_name}`
              : serverConfig.woName}
          </span>
          <div className="w-10 flex justify-end items-center">
            {selectedCustomerId ? (
              invitation && (
                <a
                  href={`/${serverConfig.woSlug}/${invitation.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-[#111111] hover:bg-[#E2E2E0]/40 rounded-lg transition-colors cursor-pointer"
                  title="Lihat Undangan Publik"
                >
                  <ExternalLink size={20} />
                </a>
              )
            ) : activeWoTab === 'clients' ? (
              <button
                type="button"
                onClick={() => setOpenCreateModal(true)}
                className="p-1.5 text-[#111111] hover:bg-[#E2E2E0]/40 rounded-lg transition-colors cursor-pointer"
                title="Tambah Klien"
              >
                <UserPlus size={20} />
              </button>
            ) : activeWoTab === 'team' ? (
              <button
                type="button"
                onClick={() => setShowAddStaffModal(true)}
                className="p-1.5 text-[#111111] hover:bg-[#E2E2E0]/40 rounded-lg transition-colors cursor-pointer"
                title="Undang Staff"
              >
                <UserPlus size={20} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Sticky Glass Header (Desktop) */}
        <header className="hidden md:flex justify-between items-center w-full px-10 lg:px-16 h-16 sticky top-0 z-40 bg-[#FAF9F6]/80 backdrop-blur-xl border-b border-[#E2E2E0]">
          <h2 className="text-xl font-semibold text-[#111111] tracking-tight">
            {selectedCustomer
              ? `${selectedCustomer.male_name} & ${selectedCustomer.female_name}`
              : activeWoTab === 'clients'
                ? 'Dashboard Overview'
                : activeWoTab === 'customers'
                  ? 'Daftar Klien'
                  : activeWoTab === 'team'
                    ? 'Tim Staff'
                    : activeWoTab === 'billing'
                      ? 'Billing & Tagihan'
                      : activeWoTab === 'profile'
                        ? 'Akun Saya'
                        : activeWoTab === 'settings'
                          ? 'Pengaturan WO'
                          : 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            {/* Desktop Action Buttons */}
            {selectedCustomerId ? (
              invitation && (
                <a
                  href={`/${serverConfig.woSlug}/${invitation.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E2E0] hover:border-[#111111] hover:bg-[#FAF9F6] text-[#111111] font-semibold text-xs rounded-lg shadow-sm hover:shadow transition-all text-decoration-none"
                >
                  <ExternalLink size={14} />
                  Lihat Undangan Publik
                </a>
              )
            ) : activeWoTab === 'clients' ? (
              <button
                type="button"
                onClick={() => setOpenCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-medium text-xs rounded-lg shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
              >
                <UserPlus size={14} />
                Tambah Klien
              </button>
            ) : activeWoTab === 'team' ? (
              <button
                type="button"
                onClick={() => setShowAddStaffModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-medium text-xs rounded-lg shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
              >
                <UserPlus size={14} />
                Undang Staff
              </button>
            ) : null}

            <div className="w-8 h-8 rounded-full bg-[#E2E2E0] border border-[#E2E2E0] flex items-center justify-center text-[#111111] font-bold text-[10px] overflow-hidden">
              {serverConfig.userEmail ? serverConfig.userEmail.substring(0, 2).toUpperCase() : 'WO'}
            </div>
          </div>
        </header>

        {/* ========================================== */}
        {/* WO GENERAL DASHBOARD VIEW                  */}
        {/* ========================================== */}
        {!selectedCustomerId ? (
          <div className="px-4 sm:px-6 md:px-8 py-5 md:py-8 w-full max-w-full">
            {/* Alert Messages */}
            {statusAlert && (
              <div
                className={`p-4 mb-6 rounded-lg text-sm font-medium border text-center ${
                  statusAlert.type === 'success'
                    ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32]'
                    : 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828]'
                }`}
              >
                {statusAlert.message}
              </div>
            )}

            {activeWoTab === 'clients' && (
              <>
                {/* Bento Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-semibold uppercase text-[#6E6E6C] tracking-widest">
                        Total Klien
                      </span>
                      <Users size={18} className="text-[#6E6E6C]" />
                    </div>
                    <div>
                      <div className="text-[42px] font-semibold leading-none text-[#111111] tracking-tight">
                        {totalStats.total}
                      </div>
                      <div className="text-[13px] text-[#6E6E6C] mt-1 font-medium">
                        Pasangan terdaftar
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-semibold uppercase text-[#6E6E6C] tracking-widest">
                        Undangan Aktif
                      </span>
                      <CheckCircle size={18} className="text-[#6E6E6C]" />
                    </div>
                    <div>
                      <div className="text-[42px] font-semibold leading-none text-[#2E7D32] tracking-tight">
                        {totalStats.published}
                      </div>
                      <div className="text-[13px] text-[#6E6E6C] mt-1 font-medium">
                        Sudah live & aktif
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#111111] border border-transparent rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm text-white">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-semibold uppercase text-white/60 tracking-widest">
                        Draft
                      </span>
                      <Edit3 size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="text-[42px] font-semibold leading-none tracking-tight">
                        {String(totalStats.draft).padStart(2, '0')}
                      </div>
                      <div className="text-[13px] text-white/60 mt-1 font-medium">
                        Menunggu publikasi
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts & Recent Clients Section */}
                {!loading && (
                  <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-8">
                    {/* Left: Registration Trend Bar Chart (70% width) */}
                    <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-[#111111] text-lg font-medium mb-1">
                          Tren Pendaftaran Klien Baru
                        </h3>
                        <p className="text-xs text-[#6E6E6C] mb-6">6 Bulan Terakhir</p>

                        <div className="h-56 flex items-end justify-between gap-2 px-2 pt-4 relative border-b border-[#E2E2E0]">
                          {/* Y-Axis lines */}
                          <div className="absolute inset-x-0 top-1/4 border-t border-[#E2E2E0]/40 pointer-events-none" />
                          <div className="absolute inset-x-0 top-2/4 border-t border-[#E2E2E0]/40 pointer-events-none" />
                          <div className="absolute inset-x-0 top-3/4 border-t border-[#E2E2E0]/40 pointer-events-none" />

                          {getMonthlyRegistrationStats().map((item, idx) => {
                            const maxVal = Math.max(
                              ...getMonthlyRegistrationStats().map((m) => m.count),
                              1
                            )
                            const barPercent = (item.count / maxVal) * 100
                            // Highlight the last bar to match the Stitch style
                            const isLatest = idx === getMonthlyRegistrationStats().length - 1
                            return (
                              <div
                                key={idx}
                                className="flex-1 flex flex-col items-center group relative z-10"
                              >
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 bg-[#111111] text-[#FAF9F6] text-[10px] font-semibold px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-20">
                                  {item.count} Klien Baru
                                </div>

                                {/* Bar */}
                                <div
                                  style={{ height: `${Math.max(barPercent, 6)}%` }}
                                  className={`w-full max-w-[40px] rounded-t transition-all duration-300 cursor-pointer ${
                                    isLatest ? 'bg-[#111111]' : 'bg-[#F1F1EF] hover:bg-[#111111]'
                                  }`}
                                />

                                {/* Label */}
                                <span className="text-[10px] font-semibold text-[#6E6E6C] mt-2 tracking-wide uppercase">
                                  {item.monthName}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Recent Clients Preview Section (30% width) */}
                    <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 shadow-sm lg:col-span-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="font-serif text-[#111111] text-base font-medium">
                              Klien Baru
                            </h3>
                            <p className="text-[11px] text-[#6E6E6C] mt-0.5">
                              Tinjauan 3 pasangan terbaru
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveWoTab('customers')}
                            className="text-[11px] font-bold text-[#111111] hover:underline cursor-pointer shrink-0"
                          >
                            Kelola &rarr;
                          </button>
                        </div>

                        <div className="space-y-3">
                          {customers.slice(0, 3).map((cust) => (
                            <div
                              key={cust.id}
                              onClick={() =>
                                navigateTo(`/admin/${serverConfig.woSlug}/customers/${cust.id}`)
                              }
                              className="p-3 border border-[#E2E2E0] rounded-xl hover:border-[#111111] transition-all cursor-pointer bg-[#FAF9F6]/30 flex items-center justify-between gap-2.5 group"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-[#111111] text-[13px] group-hover:text-[#111111] transition-colors truncate">
                                  {cust.male_name} & {cust.female_name}
                                </div>
                                <div className="text-[10px] text-[#6E6E6C] mt-0.5 font-mono">
                                  ID: {cust.id.substring(0, 8)}
                                </div>
                              </div>
                              {cust.isActive ? (
                                <span className="px-2 py-0.5 bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 scale-90">
                                  Aktif
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2] rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 scale-90">
                                  Draft
                                </span>
                              )}
                            </div>
                          ))}
                          {customers.length === 0 && (
                            <div className="text-center py-8 text-xs text-[#6E6E6C] italic">
                              Belum ada klien terdaftar.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Editorial Premium Marketing Section (Stitch Style) */}
                <section className="rounded-2xl overflow-hidden relative min-h-[260px] flex items-center p-10 bg-black text-white shadow-lg">
                  <div className="relative z-10 max-w-xl">
                    <span className="inline-block px-2.5 py-0.5 bg-white/10 text-white rounded text-[10px] font-bold uppercase tracking-widest mb-4">
                      Premium Features
                    </span>
                    <h2 className="font-serif text-[32px] leading-[38px] mb-3 text-[#FAF9F6] tracking-tight">
                      Tingkatkan ke Layanan Premium Undangan.
                    </h2>
                    <p className="text-white/60 text-[13px] leading-relaxed mb-6 font-medium max-w-lg">
                      Buka akses penuh ke kustom sub-domain, RSVP Real-Time WhatsApp, fitur kado &
                      amplop digital, lagu latar premium, buku tamu QR Code, serta bebas iklan
                      selamanya.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveWoTab('billing')}
                      className="bg-white text-black px-6 py-2.5 rounded-full text-[13px] font-bold hover:bg-[#E2E2E0] transition-all cursor-pointer active:scale-95 shadow-sm"
                    >
                      Buka Upgrade Paket
                    </button>
                  </div>
                  {/* Subtle abstract gradient background */}
                  <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#f2ca50]/20 via-black to-black" />
                </section>
              </>
            )}

            {/* ========================================== */}
            {/* NEW TABS VIEW: CUSTOMERS (FULL DB TABLE)   */}
            {/* ========================================== */}
            {activeWoTab === 'customers' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                {/* LEFT COLUMN: Main Database Table (xl:col-span-8) */}
                <div className="xl:col-span-8 bg-white border border-[#E2E2E0] rounded-2xl shadow-sm flex flex-col xl:h-[calc(100vh-14rem)] overflow-hidden">
                  {/* Data Table Search & Filters bar */}
                  <div className="p-5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-[#E2E2E0]">
                    <div className="relative flex-grow max-w-md">
                      <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E6C]"
                      />
                      <input
                        type="text"
                        placeholder="Search directory..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value)
                          setCurrentPage(1)
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-[#F1F1EF] border border-[#E2E2E0]/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#111111]/10 text-xs font-sans text-[#111111] placeholder-[#6E6E6C]/60"
                        style={{ height: '38px' }}
                      />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#E2E2E0] bg-white hover:bg-[#FAF9F6] text-xs font-semibold rounded-xl text-[#6E6E6C] hover:text-[#111111] transition-colors cursor-pointer flex-1 sm:flex-initial"
                            style={{ height: '38px' }}
                          >
                            <Filter size={13} className="text-[#6E6E6C]" />
                            <span>
                              {dateFilter === 'all'
                                ? 'All Time'
                                : dateFilter === 'year'
                                  ? 'This Year'
                                  : dateFilter === 'month'
                                    ? 'This Month'
                                    : 'This Week'}
                            </span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 bg-white border border-[#E2E2E0] rounded-xl shadow-lg p-1"
                        >
                          <DropdownMenuLabel className="text-[10px] font-semibold text-[#6E6E6C] uppercase tracking-wider px-2 py-1.5">
                            Rentang Waktu
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="bg-[#E2E2E0] my-1" />
                          {[
                            { val: 'all', label: 'All Time' },
                            { val: 'year', label: 'This Year' },
                            { val: 'month', label: 'This Month' },
                            { val: 'week', label: 'This Week' },
                          ].map((opt) => (
                            <DropdownMenuItem
                              key={opt.val}
                              onClick={() => {
                                setDateFilter(opt.val as any)
                                setCurrentPage(1)
                              }}
                              className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                                dateFilter === opt.val
                                  ? 'bg-[#FAF9F6] text-[#111111] font-semibold'
                                  : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                              }`}
                            >
                              {opt.label}
                              {dateFilter === opt.val && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <button
                        type="button"
                        onClick={() => setOpenCreateModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 shrink-0 flex-1 sm:flex-initial"
                        style={{ height: '38px' }}
                      >
                        <Plus size={14} />
                        <span>Tambah Klien</span>
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-20 text-[#6E6E6C] flex-grow flex items-center justify-center">
                      Memuat data klien...
                    </div>
                  ) : (
                    <div className="flex flex-col flex-grow min-h-0">
                      <div className="overflow-auto flex-grow min-h-[350px]">
                        <Table>
                          <TableHeader className="bg-[#FAF9F6] border-b border-[#E2E2E0] sticky top-0 z-10">
                            <TableRow className="border-b border-[#E2E2E0]">
                              <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider pl-6 py-3.5">
                                Pasangan Pengantin
                              </TableHead>
                              <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider py-3.5">
                                Email Kontak
                              </TableHead>
                              <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider text-center py-3.5">
                                Tanggal Wedding
                              </TableHead>
                              <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider text-center py-3.5">
                                Tamu
                              </TableHead>
                              <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider text-center py-3.5">
                                Tampilan Tema
                              </TableHead>
                              <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider pr-6 py-3.5 text-right">
                                Status & Aksi
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-[#E2E2E0]">
                            {paginatedCustomers.length > 0 ? (
                              paginatedCustomers.map((cust) => (
                                <TableRow
                                  key={cust.id}
                                  className="hover:bg-[#FAF9F6]/50 transition-colors cursor-pointer border-b border-[#E2E2E0]"
                                  onClick={() =>
                                    navigateTo(`/admin/${serverConfig.woSlug}/customers/${cust.id}`)
                                  }
                                >
                                  <TableCell className="pl-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111] font-bold text-xs shrink-0 select-none">
                                        {cust.male_name ? cust.male_name[0].toUpperCase() : ''}
                                        {cust.female_name ? cust.female_name[0].toUpperCase() : ''}
                                      </div>
                                      <div className="min-w-0">
                                        <div className="font-bold text-[#111111] text-[14px] truncate max-w-[200px]">
                                          {cust.male_name} & {cust.female_name}
                                        </div>
                                        <div className="text-[11px] text-[#6E6E6C] mt-0.5 font-medium">
                                          Dibuat{' '}
                                          {new Date(cust.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-4">
                                    <span className="text-xs text-[#6E6E6C] font-mono">
                                      {cust.email || 'tanpa_email@domain.com'}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center text-xs font-semibold text-[#111111] py-4">
                                    {cust.wedding_date ? (
                                      new Date(cust.wedding_date).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                      })
                                    ) : (
                                      <span className="text-[#6E6E6C]/60 font-normal italic">
                                        Belum Diatur
                                      </span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center text-xs font-bold text-[#111111] font-mono py-4">
                                    {cust.guest_count || 0}
                                  </TableCell>
                                  <TableCell className="text-center py-4">
                                    <span className="inline-flex px-2.5 py-1 text-[10px] font-bold bg-[#F1F1EF] text-[#111111] rounded-full uppercase tracking-wider font-sans">
                                      {cust.style === 'image_sequence' ? 'Aeterna' : 'Javanese'}
                                    </span>
                                  </TableCell>
                                  <TableCell
                                    className="pr-6 py-4"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="flex items-center justify-end gap-4">
                                      {cust.isActive ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111]">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D32] animate-pulse" />
                                          <span>Aktif</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E6E6C]">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#C0C0C0]" />
                                          <span>Draft</span>
                                        </span>
                                      )}

                                      {cust.isActive ? (
                                        <a
                                          href={`/${serverConfig.woSlug}/${cust.slug}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="p-1.5 rounded-lg text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] transition-colors"
                                          title="Lihat Halaman Undangan"
                                        >
                                          <ExternalLink size={16} />
                                        </a>
                                      ) : (
                                        <div className="w-8 h-8" />
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="text-center text-[#6E6E6C] py-16 text-sm"
                                >
                                  Tidak ada klien yang cocok dengan filter pencarian.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination footer controls */}
                      <div className="px-6 py-4 bg-[#FAF9F6] border-t border-[#E2E2E0] flex items-center justify-between mt-auto">
                        {(() => {
                          const startRange =
                            filteredCustomers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0
                          const endRange = Math.min(
                            currentPage * pageSize,
                            filteredCustomers.length
                          )
                          return (
                            <div className="text-xs text-[#6E6E6C] font-semibold">
                              Showing {startRange}-{endRange} of {filteredCustomers.length} clients
                            </div>
                          )
                        })()}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center border border-[#E2E2E0] bg-white hover:bg-[#FAF9F6] rounded-lg text-xs font-semibold text-[#6E6E6C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          {renderPageNumbers()}
                          <button
                            type="button"
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-8 h-8 flex items-center justify-center border border-[#E2E2E0] bg-white hover:bg-[#FAF9F6] rounded-lg text-xs font-semibold text-[#6E6E6C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: Stacked Insights (xl:col-span-4) */}
                <div className="xl:col-span-4 flex flex-col gap-6 xl:h-[calc(100vh-14rem)]">
                  {/* Insight 1: Theme Ranking */}
                  <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 shadow-sm flex flex-col flex-1">
                    <h3 className="font-serif text-[#111111] text-lg font-medium mb-1">
                      Desain Tema Terpopuler
                    </h3>
                    <p className="text-xs text-[#6E6E6C] mb-4">
                      Peringkat penggunaan template undangan (Top 5)
                    </p>

                    {(() => {
                      const templateCountsMap: Record<string, number> = {}
                      customers.forEach((c) => {
                        const styleName = c.style || 'java_style'
                        templateCountsMap[styleName] = (templateCountsMap[styleName] || 0) + 1
                      })

                      const getFriendlyStyleName = (style: string) => {
                        if (style === 'java_style') return 'Javanese'
                        if (style === 'image_sequence') return 'Aeterna'
                        return style
                          .split(/[-_]/)
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ')
                      }

                      const topTemplatesData = Object.entries(templateCountsMap)
                        .map(([style, count]) => ({
                          style,
                          name: getFriendlyStyleName(style),
                          value: count,
                        }))
                        .sort((a, b) => b.value - a.value)
                        .slice(0, 5)

                      if (topTemplatesData.length === 0) {
                        topTemplatesData.push({ style: 'java_style', name: 'Javanese', value: 0 })
                      }

                      const BRAND_COLORS = [
                        '#111111', // Black
                        '#f2ca50', // Gold
                        '#6E6E6C', // Gray
                        '#10b981', // Emerald
                        '#f43f5e', // Rose
                      ]

                      const totalTemplates =
                        topTemplatesData.reduce((acc, curr) => acc + curr.value, 0) || 1

                      return (
                        <div className="flex-grow flex flex-col justify-between gap-4">
                          <div className="w-full flex justify-center items-center h-[160px] relative">
                            <svg
                              width="160"
                              height="160"
                              viewBox="0 0 160 160"
                              className="select-none"
                            >
                              {/* Background track circle */}
                              <circle
                                cx="80"
                                cy="80"
                                r="50"
                                fill="transparent"
                                stroke="#F1F1EF"
                                strokeWidth="10"
                              />
                              {topTemplatesData.map((item, index) => {
                                const dash = (item.value / totalTemplates) * 314.159
                                const gap = 314.159 - dash
                                const prevSum = topTemplatesData
                                  .slice(0, index)
                                  .reduce((sum, d) => sum + d.value, 0)
                                const rotationAngle = (prevSum / totalTemplates) * 360 - 90
                                const isHovered = hoveredTemplateIndex === index
                                return (
                                  <circle
                                    key={item.style}
                                    cx="80"
                                    cy="80"
                                    r="50"
                                    fill="transparent"
                                    stroke={BRAND_COLORS[index % BRAND_COLORS.length]}
                                    strokeWidth={isHovered ? 18 : 14}
                                    strokeDasharray={`${dash} ${gap}`}
                                    strokeDashoffset={0}
                                    transform={`rotate(${rotationAngle} 80 80)`}
                                    className="transition-all duration-200 cursor-pointer origin-center"
                                    onMouseEnter={() => setHoveredTemplateIndex(index)}
                                    onMouseLeave={() => setHoveredTemplateIndex(null)}
                                  />
                                )
                              })}
                              {/* Centered Text */}
                              <text
                                x="80"
                                y="75"
                                textAnchor="middle"
                                className="text-[10px] font-semibold fill-[#6E6E6C] uppercase tracking-wider select-none pointer-events-none"
                              >
                                {hoveredTemplateIndex !== null
                                  ? topTemplatesData[hoveredTemplateIndex].name
                                  : 'Total Klien'}
                              </text>
                              <text
                                x="80"
                                y="98"
                                textAnchor="middle"
                                className="text-xl font-bold fill-[#111111] font-serif select-none pointer-events-none"
                              >
                                {hoveredTemplateIndex !== null
                                  ? topTemplatesData[hoveredTemplateIndex].value
                                  : totalTemplates}
                              </text>
                            </svg>
                          </div>

                          {/* Custom grid legend matching brand colors */}
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 pt-2 border-t border-[#E2E2E0]/40 text-[10px] font-semibold text-[#6E6E6C]">
                            {topTemplatesData.map((item, index) => (
                              <div key={item.style} className="flex items-center gap-1.5 min-w-0">
                                <span
                                  className="w-2.5 h-2.5 rounded shrink-0"
                                  style={{
                                    backgroundColor: BRAND_COLORS[index % BRAND_COLORS.length],
                                  }}
                                />
                                <span className="text-[#111111] truncate">{item.name}</span>
                                <span className="text-[#6E6E6C]/60 ml-auto shrink-0 font-mono">
                                  {item.value} ({Math.round((item.value / totalTemplates) * 100)}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </div>

                  {/* Insight 2: RSVP Summary */}
                  <Card className="flex flex-col justify-between flex-1 border border-[#E2E2E0] rounded-2xl shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-[#E2E2E0]/40 py-5">
                      <div className="grid gap-0.5">
                        <CardTitle className="font-serif text-[#111111] text-lg font-medium leading-none">
                          Statistik Kehadiran (RSVP)
                        </CardTitle>
                        <CardDescription className="text-xs text-[#6E6E6C] mt-1 font-medium">
                          {rsvpRange === '7d'
                            ? 'Tren kehadiran 7 hari terakhir'
                            : rsvpRange === '30d'
                              ? 'Tren kehadiran 30 hari terakhir'
                              : 'Tren kehadiran 3 bulan terakhir'}
                        </CardDescription>
                      </div>
                      <Select value={rsvpRange} onValueChange={(val: any) => setRsvpRange(val)}>
                        <SelectTrigger
                          className="w-[130px] rounded-xl border border-[#E2E2E0] text-[11px] font-semibold text-[#111111] bg-transparent hover:bg-[#FAF9F6] focus:ring-1 focus:ring-[#111111]/10 focus:outline-none"
                          style={{ height: '30px' }}
                        >
                          <SelectValue placeholder="Pilih rentang" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border border-[#E2E2E0] bg-white shadow-md">
                          <SelectItem value="7d" className="rounded-lg text-xs cursor-pointer">
                            Last 7 days
                          </SelectItem>
                          <SelectItem value="30d" className="rounded-lg text-xs cursor-pointer">
                            Last 30 days
                          </SelectItem>
                          <SelectItem value="90d" className="rounded-lg text-xs cursor-pointer">
                            Last 3 months
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </CardHeader>

                    <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 flex-grow flex flex-col justify-between">
                      <div className="flex-grow w-full h-[180px] min-h-[180px] mt-2">
                        {(() => {
                          const rsvpData = getRsvpTimelineData(rsvpRange)

                          const rsvpChartConfig = {
                            hadir: {
                              label: 'Hadir',
                              color: '#10b981',
                            },
                            tidak: {
                              label: 'Tidak Hadir',
                              color: '#f43f5e',
                            },
                          } satisfies ChartConfig

                          return (
                            <ChartContainer
                              config={rsvpChartConfig}
                              className="aspect-auto h-full w-full"
                            >
                              <AreaChart
                                data={rsvpData}
                                margin={{ left: -20, right: 5, top: 10, bottom: 0 }}
                              >
                                <defs>
                                  <linearGradient id="fillHadir" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                      offset="5%"
                                      stopColor="var(--color-hadir)"
                                      stopOpacity={0.4}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="var(--color-hadir)"
                                      stopOpacity={0.01}
                                    />
                                  </linearGradient>
                                  <linearGradient id="fillTidak" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                      offset="5%"
                                      stopColor="var(--color-tidak)"
                                      stopOpacity={0.3}
                                    />
                                    <stop
                                      offset="95%"
                                      stopColor="var(--color-tidak)"
                                      stopOpacity={0.01}
                                    />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid
                                  vertical={false}
                                  strokeDasharray="3 3"
                                  stroke="#E2E2E0"
                                  opacity={0.5}
                                />
                                <XAxis
                                  dataKey="date"
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={8}
                                  minTickGap={16}
                                  tickFormatter={(value) => {
                                    const dateObj = new Date(value)
                                    if (rsvpRange === '7d') {
                                      return dateObj.toLocaleDateString('id-ID', {
                                        weekday: 'short',
                                      })
                                    } else {
                                      return dateObj.toLocaleDateString('id-ID', {
                                        month: 'short',
                                        day: 'numeric',
                                      })
                                    }
                                  }}
                                  className="text-[10px] font-semibold fill-[#6E6E6C]"
                                />
                                <ChartTooltip
                                  cursor={false}
                                  content={
                                    <ChartTooltipContent
                                      labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString('id-ID', {
                                          weekday: 'long',
                                          day: 'numeric',
                                          month: 'long',
                                          year: 'numeric',
                                        })
                                      }}
                                      indicator="dot"
                                    />
                                  }
                                />
                                <Area
                                  dataKey="tidak"
                                  type="natural"
                                  fill="url(#fillTidak)"
                                  stroke="var(--color-tidak)"
                                  strokeWidth={2}
                                  stackId="a"
                                  isAnimationActive={false}
                                />
                                <Area
                                  dataKey="hadir"
                                  type="natural"
                                  fill="url(#fillHadir)"
                                  stroke="var(--color-hadir)"
                                  strokeWidth={2}
                                  stackId="a"
                                  isAnimationActive={false}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                              </AreaChart>
                            </ChartContainer>
                          )
                        })()}
                      </div>

                      {/* Footer Legend matching the Area Chart style */}
                      <div className="flex items-center justify-center gap-4 text-[10px] font-semibold text-[#6E6E6C] mt-2 pt-2 border-t border-[#E2E2E0]/40">
                        {(() => {
                          const stats = getRsvpRangeStats(rsvpRange)
                          return (
                            <>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded bg-[#10b981]" />
                                <span>Hadir ({stats.hadir} Tamu)</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded bg-[#f43f5e]" />
                                <span>Tidak Hadir ({stats.tidak} Tamu)</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* TEAM TAB VIEW                              */}
            {/* ========================================== */}
            {activeWoTab === 'team' && (
              <div className="bg-white border border-[#E2E2E0] rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-200">
                {/* Grid Header */}
                <div className="grid grid-cols-12 px-6 py-4 bg-[#FAF9F6] border-b border-[#E2E2E0] text-[11px] font-semibold uppercase text-[#6E6E6C] tracking-widest items-center">
                  <div className="col-span-8 sm:col-span-5">Anggota Tim</div>
                  <div className="col-span-3 text-center hidden sm:block">Hak Akses</div>
                  <div className="col-span-2 text-center hidden sm:block">Status</div>
                  <div className="col-span-4 sm:col-span-2 text-right">Aksi</div>
                </div>
                {/* Grid Rows */}
                <div className="divide-y divide-[#E2E2E0]">
                  {staffList.length > 0 ? (
                    staffList.map((member) => (
                      <div
                        key={member.id}
                        className="grid grid-cols-12 px-6 py-5 items-center hover:bg-[#FAF9F6] hover:translate-x-1 transition-all duration-200 cursor-default group"
                      >
                        <div className="col-span-8 sm:col-span-5 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111] font-bold text-xs shrink-0">
                            {member.name ? member.name.substring(0, 2).toUpperCase() : 'ST'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[15px] font-bold text-[#111111] truncate">
                              {member.name}
                            </div>
                            <div className="text-[13px] text-[#6E6E6C] font-medium truncate">
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <div className="col-span-3 text-center hidden sm:block">
                          <span className="inline-flex px-3 py-1 bg-[#F1F1EF] text-[#111111] text-[11px] font-semibold rounded-full uppercase tracking-wider">
                            {member.role}
                          </span>
                        </div>
                        <div className="col-span-2 justify-center items-center gap-2 hidden sm:flex">
                          <span className="w-2 h-2 rounded-full bg-[#111111]" />
                          <span className="text-[13px] font-medium text-[#111111]">Active</span>
                        </div>
                        <div className="col-span-4 sm:col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(member.id)}
                            disabled={member.email === serverConfig.userEmail}
                            className="p-2 rounded-full hover:bg-[#FFEBEE] text-[#6E6E6C] hover:text-[#C62828] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-16 text-center text-[#6E6E6C] text-sm">
                      Tidak ada anggota tim terdaftar.
                    </div>
                  )}
                </div>
                {/* Grid Footer */}
                <div className="p-6 border-t border-[#E2E2E0] bg-[#FAF9F6]">
                  <span className="text-[13px] font-medium text-[#6E6E6C]">
                    {staffList.length} anggota terdaftar
                  </span>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* BILLING & SUBSCRIPTION TAB VIEW            */}
            {/* ========================================== */}
            {activeWoTab === 'settings' && (
              <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
                <div className="bg-[#FAF9F6] border border-[#E2E2E0]/60 rounded-2xl p-1 flex gap-1 w-full max-w-md">
                  <button
                    type="button"
                    onClick={() => setSettingsSubTab('profile')}
                    className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      settingsSubTab === 'profile'
                        ? 'bg-white shadow-sm border border-[#E2E2E0]/50 text-[#111111] font-bold'
                        : 'text-[#6E6E6C] hover:text-[#111111]'
                    }`}
                  >
                    Akun Saya
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsSubTab('business')}
                    className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      settingsSubTab === 'business'
                        ? 'bg-white shadow-sm border border-[#E2E2E0]/50 text-[#111111] font-bold'
                        : 'text-[#6E6E6C] hover:text-[#111111]'
                    }`}
                  >
                    Pengaturan WO
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettingsSubTab('billing')}
                    className={`flex-1 py-2 text-center text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                      settingsSubTab === 'billing'
                        ? 'bg-white shadow-sm border border-[#E2E2E0]/50 text-[#111111] font-bold'
                        : 'text-[#6E6E6C] hover:text-[#111111]'
                    }`}
                  >
                    Billing / Tagihan
                  </button>
                </div>

                {/* TAB CONTENT: PROFILE (Akun Saya) */}
                {settingsSubTab === 'profile' && (
                  <div className="space-y-8 animate-in fade-in duration-200">
                    {/* Personal Identity Card */}
                    <section>
                      <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-4">
                        Personal Identity
                      </h3>
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111] font-bold text-lg select-none">
                            {adminUser.email ? adminUser.email.substring(0, 2).toUpperCase() : 'AD'}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-[#111111]">{adminUser.name}</h4>
                            <p className="text-xs text-[#6E6E6C] mt-0.5">Owner / Administrator</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowEditProfileModal(true)}
                          className="px-4 py-2 bg-transparent border border-[#E2E2E0] hover:bg-[#FAF9F6] text-[#111111] font-semibold text-xs rounded-xl cursor-pointer transition-all active:scale-95 shrink-0"
                        >
                          Edit Profile
                        </button>
                      </div>
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl mt-4 overflow-hidden divide-y divide-[#E2E2E0] shadow-sm">
                        <div className="p-4 flex justify-between items-center text-xs">
                          <span className="font-semibold text-[#6E6E6C]">Primary Email</span>
                          <span className="text-[#111111] font-mono">{adminUser.email}</span>
                        </div>
                        <div className="p-4 flex justify-between items-center text-xs">
                          <span className="font-semibold text-[#6E6E6C]">Work Phone</span>
                          <span className="text-[#6E6E6C]/60 italic">Belum dikonfigurasi</span>
                        </div>
                      </div>
                    </section>

                    {/* Preference Logic Card */}
                    <section>
                      <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-4">
                        Preference Logic
                      </h3>
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl overflow-hidden divide-y divide-[#E2E2E0] shadow-sm">
                        {/* Email Summaries Row */}
                        <div className="p-5 flex items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111]">
                              <MessageSquare size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#111111]">Email Summaries</h4>
                              <p className="text-xs text-[#6E6E6C] mt-0.5">
                                Daily technical digest of system events
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEmailSummaries(!emailSummaries)}
                            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                              emailSummaries ? 'bg-[#111111]' : 'bg-[#E2E2E0]'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform ${
                                emailSummaries ? 'left-5.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Critical Alerts Row */}
                        <div className="p-5 flex items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111]">
                              <Shield size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#111111]">Critical Alerts</h4>
                              <p className="text-xs text-[#6E6E6C] mt-0.5">
                                Immediate SMS for infrastructure failures
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCriticalAlerts(!criticalAlerts)}
                            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                              criticalAlerts ? 'bg-[#111111]' : 'bg-[#E2E2E0]'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform ${
                                criticalAlerts ? 'left-5.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Deployment Status Row */}
                        <div className="p-5 flex items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111]">
                              <Settings size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#111111]">
                                Deployment Status
                              </h4>
                              <p className="text-xs text-[#6E6E6C] mt-0.5">
                                Browser notifications for CI/CD pipelines
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDeploymentStatus(!deploymentStatus)}
                            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                              deploymentStatus ? 'bg-[#111111]' : 'bg-[#E2E2E0]'
                            }`}
                          >
                            <span
                              className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform ${
                                deploymentStatus ? 'left-5.5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* Security Protocol Card */}
                    <section>
                      <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-4">
                        Security Protocol
                      </h3>
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl overflow-hidden divide-y divide-[#E2E2E0] shadow-sm">
                        {/* Change Password */}
                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              'Fitur ubah password dapat diakses melalui setelan akun Supabase Auth.'
                            )
                          }
                          className="w-full p-5 flex items-center justify-between hover:bg-[#FAF9F6]/50 transition-colors text-left cursor-pointer border-none bg-transparent"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111]">
                              <Settings size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#111111]">
                                Change Master Password
                              </h4>
                              <p className="text-xs text-[#6E6E6C] mt-0.5">
                                Perbarui kata sandi utama akun WO Anda
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-[#6E6E6C]/60" />
                        </button>

                        {/* Two Factor Auth */}
                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              'Fitur autentikasi 2-faktor memerlukan integrasi Google Authenticator.'
                            )
                          }
                          className="w-full p-5 flex items-center justify-between hover:bg-[#FAF9F6]/50 transition-colors text-left cursor-pointer border-none bg-transparent"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111]">
                              <Shield size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#111111]">
                                Two-Factor Authentication
                              </h4>
                              <p className="text-xs text-[#6E6E6C] mt-0.5">
                                Tambahkan keamanan ekstra untuk login staff
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-[#6E6E6C]/60" />
                        </button>

                        {/* Active Sessions */}
                        <div className="p-5 flex items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111]">
                              <CreditCard size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#111111]">Active Sessions</h4>
                              <p className="text-xs text-[#6E6E6C] mt-0.5">
                                1 device currently logged in
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-transparent border border-[#E2E2E0] hover:bg-[#FAF9F6] text-[#111111] font-semibold text-xs rounded-lg cursor-pointer"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* Deactivate Account */}
                    <section>
                      <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                          <h4 className="text-sm font-bold text-[#C62828]">Deactivate Account</h4>
                          <p className="text-xs text-[#C62828]/80 mt-0.5">
                            Permanently remove all administrative access and logs.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            showConfirm({
                              title: 'Nonaktifkan Akun',
                              description:
                                'Apakah Anda yakin ingin menonaktifkan akun WO ini? Tindakan ini permanen.',
                              destructive: true,
                              onConfirm: () => {
                                setStatusAlert({
                                  type: 'error',
                                  message: 'Tindakan dinonaktifkan untuk akun demo.',
                                })
                              },
                            })
                          }}
                          className="px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold text-xs rounded-xl cursor-pointer transition-all active:scale-95 shrink-0"
                        >
                          Deactivate
                        </button>
                      </div>
                    </section>
                  </div>
                )}

                {/* TAB CONTENT: BUSINESS PROFILE (Pengaturan WO) */}
                {settingsSubTab === 'business' && (
                  <form
                    onSubmit={handleUpdateWoProfile}
                    className="space-y-8 animate-in fade-in duration-200"
                  >
                    {/* Business Identity */}
                    <section>
                      <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-4">
                        Identitas Bisnis
                      </h3>
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl overflow-hidden divide-y divide-[#E2E2E0] shadow-sm">
                        <div className="p-6">
                          <label
                            htmlFor="woNameInput"
                            className="block text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider mb-2"
                          >
                            Nama Wedding Organizer
                          </label>
                          <input
                            type="text"
                            id="woNameInput"
                            name="woName"
                            defaultValue={woProfile.name}
                            className="w-full px-4 py-3 border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] text-xs transition-colors"
                            required
                          />
                        </div>
                        <div className="p-6">
                          <label
                            htmlFor="woEmailInput"
                            className="block text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider mb-2"
                          >
                            Email Resmi WO
                          </label>
                          <input
                            type="email"
                            id="woEmailInput"
                            name="woEmail"
                            defaultValue={woProfile.email}
                            className="w-full px-4 py-3 border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] text-xs transition-colors"
                            required
                          />
                        </div>
                      </div>
                    </section>

                    {/* Location & Routing */}
                    <section>
                      <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-4">
                        Lokasi & Routing
                      </h3>
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl overflow-hidden divide-y divide-[#E2E2E0] shadow-sm">
                        <div className="p-6">
                          <label
                            htmlFor="woLocationInput"
                            className="block text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider mb-2"
                          >
                            Domisili / Lokasi Kantor
                          </label>
                          <input
                            type="text"
                            id="woLocationInput"
                            name="woLocation"
                            defaultValue={woProfile.location}
                            className="w-full px-4 py-3 border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] text-xs transition-colors"
                            required
                          />
                        </div>
                        <div className="p-6">
                          <label
                            htmlFor="woSlugInput"
                            className="block text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-wider mb-2"
                          >
                            URL Slug WO
                          </label>
                          <input
                            type="text"
                            id="woSlugInput"
                            name="woSlug"
                            defaultValue={woProfile.slug}
                            className="w-full px-4 py-3 border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] text-xs font-mono transition-colors"
                            required
                          />
                          <p className="mt-2 text-xs text-[#6E6E6C] leading-relaxed">
                            Mengubah slug akan mengubah URL Panel Admin dan semua undangan klien
                            aktif.
                          </p>
                        </div>
                      </div>
                    </section>

                    {/* Submit Button */}
                    <div className="flex justify-start">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-5 py-3 bg-[#111111] hover:bg-[#333333] text-white font-semibold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
                      >
                        <Save size={14} />
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB CONTENT: BILLING & TAGIHAN */}
                {settingsSubTab === 'billing' && (
                  <div className="space-y-8 animate-in fade-in duration-200">
                    {/* Active Subscription Bento */}
                    <section>
                      <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-4">
                        Langganan Aktif
                      </h3>
                      {activePlan ? (
                        <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-xl bg-[#E8F5E9] flex items-center justify-center shrink-0 border border-[#C6F6D5]">
                              <CheckCircle size={24} className="text-[#2E7D32]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h4 className="text-xl font-bold text-[#111111]">
                                  {activePlan.plan?.name || 'Paket Kustom'}
                                </h4>
                                <span className="inline-flex px-2.5 py-0.5 text-[10px] font-bold bg-[#E8F5E9] border border-[#C6F6D5] text-[#2E7D32] rounded-full uppercase tracking-wider">
                                  Aktif
                                </span>
                              </div>
                              <p className="text-xs text-[#6E6E6C] mt-1">
                                Berlaku hingga{' '}
                                <strong>
                                  {new Date(activePlan.end_date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </strong>
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs text-[#6E6E6C]">Biaya Bulanan</span>
                            <div className="text-xl font-bold text-[#111111] mt-0.5">
                              Rp {(activePlan.plan?.price * 10).toLocaleString('id-ID')}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border border-[#E2E2E0] rounded-2xl p-8 text-center shadow-sm">
                          <div className="w-14 h-14 rounded-xl bg-[#FFF3E0] flex items-center justify-center mx-auto mb-4 border border-[#FFE0B2]">
                            <CreditCard size={24} className="text-[#E65100]" />
                          </div>
                          <h4 className="font-semibold text-lg text-[#111111]">
                            Tidak Ada Paket Aktif
                          </h4>
                          <p className="text-xs text-[#6E6E6C] mt-1 max-w-md mx-auto">
                            WO Anda menggunakan akses gratis percobaan. Pilih paket di bawah untuk
                            meningkatkan layanan.
                          </p>
                        </div>
                      )}
                    </section>

                    {/* Plan Cards */}
                    <section>
                      <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-4">
                        Pilih Paket
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic */}
                        <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 flex flex-col justify-between hover:border-[#111111]/30 transition-colors shadow-sm">
                          <div>
                            <h4 className="text-base font-bold text-[#111111]">Basic Plan</h4>
                            <p className="text-xs text-[#6E6E6C] mt-1">
                              Untuk WO perorangan yang baru memulai
                            </p>
                            <div className="my-5">
                              <span className="text-2xl font-bold text-[#111111]">Rp 500rb</span>
                              <span className="text-xs text-[#6E6E6C]"> /bln</span>
                            </div>
                            <ul className="space-y-2.5 text-xs text-[#6E6E6C]">
                              {[
                                'Tema Royal Javanese Heritage',
                                'RSVP Digital (Max 500)',
                                'Timeline Kisah Kasih',
                                'Galeri Pre-Wedding (10 Foto)',
                              ].map((f, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <CheckCircle size={14} className="text-[#2E7D32] shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpgradePlan('a3b1a111-1111-1111-1111-111111111111')
                            }
                            className="w-full mt-6 py-2.5 border border-[#111111] hover:bg-[#FAF9F6] text-[#111111] text-xs font-semibold rounded-xl transition-colors cursor-pointer active:scale-95"
                          >
                            Pilih Paket
                          </button>
                        </div>

                        {/* Premium */}
                        <div className="bg-[#111111] text-white rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden shadow-sm">
                          <div className="absolute top-0 right-0 bg-[#f2ca50] text-[#111111] px-4 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl">
                            Populer
                          </div>
                          <div>
                            <h4 className="text-base font-bold">Premium Plan</h4>
                            <p className="text-xs text-white/60 mt-1">
                              Fitur penuh tanpa batas untuk pertumbuhan bisnis
                            </p>
                            <div className="my-5">
                              <span className="text-2xl font-bold">Rp 1jt</span>
                              <span className="text-xs text-white/60"> /bln</span>
                            </div>
                            <ul className="space-y-2.5 text-xs text-white/70">
                              {[
                                'Semua Tema Desain (Termasuk Aeterna)',
                                'Unlimited RSVP & Buku Tamu',
                                'Galeri & Video Tanpa Batas',
                                'Integrasi Musik Kustom',
                                'Support Prioritas 24/7',
                              ].map((f, i) => (
                                <li key={i} className="flex items-center gap-2">
                                  <CheckCircle size={14} className="text-[#f2ca50] shrink-0" />
                                  {f}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpgradePlan('a3b1a222-2222-2222-2222-222222222222')
                            }
                            className="w-full mt-6 py-2.5 bg-[#f2ca50] hover:bg-[#e5bd43] text-[#111111] text-xs font-bold rounded-xl transition-colors cursor-pointer active:scale-95"
                          >
                            Pilih Paket
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                )}
              </div>
            )}

            {/* Edit Profile Modal */}
            {showEditProfileModal && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-[4px] flex items-center justify-center z-50 transition-all">
                <div className="bg-white border border-[#E2E2E0] rounded-2xl p-8 w-full max-w-md shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-[#111111] text-xl font-medium">
                      Edit Profil Admin
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowEditProfileModal(false)}
                      className="bg-transparent border-none text-[#6E6E6C] hover:text-[#111111] cursor-pointer flex items-center"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateAdminProfile} className="space-y-4">
                    <div>
                      <label
                        htmlFor="adminNameInput"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        id="adminNameInput"
                        name="adminName"
                        defaultValue={adminUser.name}
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#6E6E6C] mb-1.5 uppercase tracking-wider">
                        Email Utama
                      </label>
                      <input
                        type="email"
                        disabled
                        value={adminUser.email}
                        className="w-full px-4 py-2 border border-[#E2E2E0] bg-[#FAF9F6] text-[#6E6E6C] rounded-lg cursor-not-allowed text-sm"
                      />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowEditProfileModal(false)}
                        className="px-4 py-2 bg-transparent border border-[#E2E2E0] hover:bg-[#FAF9F6] text-[#6E6E6C] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ========================================== */}
            {/* ADD STAFF MODAL                            */}
            {/* ========================================== */}
            {showAddStaffModal && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-[4px] flex items-center justify-center z-50 transition-all">
                <div className="bg-white border border-[#E2E2E0] rounded-2xl p-8 w-full max-w-md shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-serif text-[#111111] text-xl font-medium">
                      Tambah Anggota Tim
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddStaffModal(false)}
                      className="bg-transparent border-none text-[#6E6E6C] hover:text-[#111111] cursor-pointer flex items-center"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="p-3 mb-4 rounded-lg bg-[#FFF3E0] border border-[#FFE0B2] text-[#E65100] text-xs leading-relaxed font-sans">
                    <strong>Catatan Penting:</strong> Anggota tim harus sudah terdaftar di sistem
                    Auth. Silakan masukkan User ID (UUID) dari akun mereka agar terhubung dengan
                    organisasi WO Anda.
                  </div>

                  <form onSubmit={handleAddStaffSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="staffName"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Nama Lengkap Staff
                      </label>
                      <input
                        type="text"
                        id="staffName"
                        name="staffName"
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] text-sm"
                        placeholder="Contoh: Rina Amalia"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="staffEmail"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Email Staff
                      </label>
                      <input
                        type="email"
                        id="staffEmail"
                        name="staffEmail"
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] text-sm"
                        placeholder="rina@example.com"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="staffRole"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Role / Hak Akses
                      </label>
                      <select
                        id="staffRole"
                        name="staffRole"
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] text-sm bg-white"
                        style={{ height: '38px' }}
                        required
                      >
                        <option value="editor">Editor (Kelola Klien & Undangan)</option>
                        <option value="admin">Admin (Akses Penuh)</option>
                        <option value="viewer">Viewer (Hanya Lihat)</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="staffUserId"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Supabase User ID (UUID)
                      </label>
                      <input
                        type="text"
                        id="staffUserId"
                        name="staffUserId"
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] text-sm font-mono"
                        placeholder="e.g. fc9724c9-58bd-41a5-b59d-224c650b5dfe"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm rounded-lg transition-colors cursor-pointer mt-6"
                    >
                      <Save size={16} />
                      Simpan Anggota Staff
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Create Client Modal */}
            {openCreateModal && (
              <div className="fixed inset-0 bg-black/30 backdrop-blur-[4px] flex items-center justify-center z-50 transition-all">
                <div className="bg-white border border-[#E2E2E0] rounded-2xl p-8 w-full max-w-md shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-[#111111] text-xl font-medium">
                      Tambah Klien Baru
                    </h3>
                    <button
                      type="button"
                      onClick={() => setOpenCreateModal(false)}
                      className="bg-transparent border-none text-[#6E6E6C] hover:text-[#111111] cursor-pointer flex items-center"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCustomerSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="maleName"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Nama Pengantin Pria
                      </label>
                      <input
                        type="text"
                        id="maleName"
                        name="maleName"
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 transition-all text-sm"
                        placeholder="Contoh: Muhammad"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="femaleName"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Nama Pengantin Wanita
                      </label>
                      <input
                        type="text"
                        id="femaleName"
                        name="femaleName"
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 transition-all text-sm"
                        placeholder="Contoh: Juliana"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Email Kontak Klien
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 transition-all text-sm"
                        placeholder="klien@example.com"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm rounded-lg transition-colors cursor-pointer mt-6"
                    >
                      <Save size={16} />
                      Inisialisasi & Simpan Klien
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        ) : (
          // ==========================================
          // CLIENT SCOPED WORKSPACE VIEW (Tabs UI)
          // ==========================================
          <div className="px-4 sm:px-6 md:px-8 py-5 md:py-8 max-w-[1400px] mx-auto w-full">
            {/* Alert Messages */}
            {statusAlert && (
              <div
                className={`p-4 mb-8 rounded-lg text-sm font-medium border text-center ${
                  statusAlert.type === 'success'
                    ? 'bg-[#E8F5E9] border-[#A5D6A7] text-[#2E7D32]'
                    : 'bg-[#FFEBEE] border-[#FFCDD2] text-[#C62828]'
                }`}
              >
                {statusAlert.message}
              </div>
            )}

            {loading ? (
              <div className="text-center py-24 text-[#6E6E6C] font-medium animate-pulse">
                Memuat detail data klien...
              </div>
            ) : (
              <div className="space-y-10 animate-in fade-in duration-300">
                {/* ========================================== */}
                {/* TAB 1: METADATA / DETAIL UNDANGAN          */}
                {/* ========================================== */}
                {activeTab === 'metadata' && (
                  <div className="bg-white border border-[#E2E2E0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 md:p-8 border-b border-[#E2E2E0]">
                      <h2 className="font-serif text-[#111111] text-2xl font-medium">
                        Detail & Informasi Undangan
                      </h2>
                      <p className="text-xs text-[#6E6E6C] mt-1 font-medium">
                        Kelola data mempelai pria/wanita, jadwal acara, kado digital, dan pengaturan
                        subdomain.
                      </p>
                    </div>

                    <form onSubmit={handleUpdateMetadata} className="flex flex-col flex-grow">
                      {/* Form Tabs Navigation */}
                      <div className="px-6 md:px-8 py-3.5 bg-white border-b border-[#E2E2E0] flex items-center">
                        <Tabs
                          value={formSection}
                          onValueChange={(val) => setFormSection(val as any)}
                          className="w-full"
                        >
                          <TabsList className="bg-[#FAF9F6] p-1 rounded-2xl flex justify-start gap-1 h-auto w-full md:w-auto overflow-x-auto scrollbar-none border border-[#E2E2E0]/60">
                            <TabsTrigger
                              value="groom"
                              className="cursor-pointer rounded-xl text-xs font-semibold px-4 py-2 text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6]/50 data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#E2E2E0]/50 transition-all focus-visible:ring-0 shrink-0 whitespace-nowrap"
                            >
                              Mempelai Pria
                            </TabsTrigger>
                            <TabsTrigger
                              value="bride"
                              className="cursor-pointer rounded-xl text-xs font-semibold px-4 py-2 text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6]/50 data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#E2E2E0]/50 transition-all focus-visible:ring-0 shrink-0 whitespace-nowrap"
                            >
                              Mempelai Wanita
                            </TabsTrigger>
                            <TabsTrigger
                              value="event"
                              className="cursor-pointer rounded-xl text-xs font-semibold px-4 py-2 text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6]/50 data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#E2E2E0]/50 transition-all focus-visible:ring-0 shrink-0 whitespace-nowrap"
                            >
                              Waktu & Tempat
                            </TabsTrigger>
                            <TabsTrigger
                              value="gift"
                              className="cursor-pointer rounded-xl text-xs font-semibold px-4 py-2 text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6]/50 data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#E2E2E0]/50 transition-all focus-visible:ring-0 shrink-0 whitespace-nowrap"
                            >
                              Tanda Kasih Digital
                            </TabsTrigger>
                            <TabsTrigger
                              value="additional"
                              className="cursor-pointer rounded-xl text-xs font-semibold px-4 py-2 text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6]/50 data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#E2E2E0]/50 transition-all focus-visible:ring-0 shrink-0 whitespace-nowrap"
                            >
                              Pengaturan Tambahan
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      {/* Form Content */}
                      <div className="p-6 md:p-8 flex-grow">
                        <Tabs value={formSection} className="w-full">
                          {/* Mempelai Pria */}
                          <TabsContent value="groom" className="space-y-6">
                            <div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nama Lengkap Mempelai Pria
                                  </label>
                                  <input
                                    type="text"
                                    name="groomName"
                                    defaultValue={invitation?.groom_name || ''}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nama Panggilan
                                  </label>
                                  <input
                                    type="text"
                                    name="groomNickname"
                                    defaultValue={invitation?.groom_nickname || ''}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nama Ayah Kandung
                                  </label>
                                  <input
                                    type="text"
                                    name="groomParentFather"
                                    defaultValue={invitation?.groom_parent_father || ''}
                                    placeholder="Nama Ayah"
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nama Ibu Kandung
                                  </label>
                                  <input
                                    type="text"
                                    name="groomParentMother"
                                    defaultValue={invitation?.groom_parent_mother || ''}
                                    placeholder="Nama Ibu"
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                  />
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Mempelai Wanita */}
                          <TabsContent value="bride" className="space-y-6">
                            <div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nama Lengkap Mempelai Wanita
                                  </label>
                                  <input
                                    type="text"
                                    name="brideName"
                                    defaultValue={invitation?.bride_name || ''}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nama Panggilan
                                  </label>
                                  <input
                                    type="text"
                                    name="brideNickname"
                                    defaultValue={invitation?.bride_nickname || ''}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nama Ayah Kandung
                                  </label>
                                  <input
                                    type="text"
                                    name="brideParentFather"
                                    defaultValue={invitation?.bride_parent_father || ''}
                                    placeholder="Nama Ayah"
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nama Ibu Kandung
                                  </label>
                                  <input
                                    type="text"
                                    name="brideParentMother"
                                    defaultValue={invitation?.bride_parent_mother || ''}
                                    placeholder="Nama Ibu"
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                  />
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Waktu & Lokasi */}
                          <TabsContent value="event" className="space-y-6">
                            <div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Waktu Akad Nikah
                                  </label>
                                  <input
                                    type="datetime-local"
                                    name="akadDatetime"
                                    defaultValue={
                                      invitation?.akad_datetime
                                        ? invitation.akad_datetime.substring(0, 16)
                                        : ''
                                    }
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Waktu Resepsi Pernikahan
                                  </label>
                                  <input
                                    type="datetime-local"
                                    name="resepsiDatetime"
                                    defaultValue={
                                      invitation?.resepsi_datetime
                                        ? invitation.resepsi_datetime.substring(0, 16)
                                        : ''
                                    }
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="space-y-5 mt-5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nama Gedung / Lokasi Acara
                                  </label>
                                  <input
                                    type="text"
                                    name="eventLocation"
                                    defaultValue={invitation?.event_location || ''}
                                    placeholder="Contoh: Gedung Sasana Kriya"
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Alamat Lengkap Gedung / Lokasi
                                  </label>
                                  <input
                                    type="text"
                                    name="eventAddress"
                                    defaultValue={invitation?.event_address || ''}
                                    placeholder="Contoh: Jl. Raya TMII, Jakarta Timur"
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Link Google Maps (Share Link)
                                  </label>
                                  <input
                                    type="url"
                                    name="googleMapsUrl"
                                    defaultValue={invitation?.google_maps_url || ''}
                                    placeholder="https://maps.app.goo.gl/..."
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                  />
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Tanda Kasih Digital */}
                          <TabsContent value="gift" className="space-y-6">
                            <div>
                              <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-5">
                                Kado Digital / Rekening Bank
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nama Bank
                                  </label>
                                  <input
                                    type="text"
                                    name="bankName"
                                    defaultValue={invitation?.bank_name || ''}
                                    placeholder="Contoh: BCA / Bank Mandiri"
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nomor Rekening
                                  </label>
                                  <input
                                    type="text"
                                    name="bankAccountNumber"
                                    defaultValue={invitation?.bank_account_number || ''}
                                    placeholder="Contoh: 8098273618"
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Nama Pemilik Rekening
                                  </label>
                                  <input
                                    type="text"
                                    name="bankAccountHolder"
                                    defaultValue={invitation?.bank_account_holder || ''}
                                    placeholder="Contoh: Muhammad Pratama"
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                  />
                                </div>
                              </div>

                              <div className="mt-8 pt-6 border-t border-[#E2E2E0]/50">
                                <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-5">
                                  Akun Dompet Digital / E-Wallet
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                      Nama E-Wallet
                                    </label>
                                    <input
                                      type="text"
                                      name="walletName"
                                      defaultValue={invitation?.wallet_name || ''}
                                      placeholder="Contoh: GoPay / OVO"
                                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                      Nomor E-Wallet / Akun
                                    </label>
                                    <input
                                      type="text"
                                      name="walletNumber"
                                      defaultValue={invitation?.wallet_number || ''}
                                      placeholder="Contoh: 08123456789"
                                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                      Nama Pemilik Akun E-Wallet
                                    </label>
                                    <input
                                      type="text"
                                      name="walletHolder"
                                      defaultValue={invitation?.wallet_holder || ''}
                                      placeholder="Contoh: Juliana Saputri"
                                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Pengaturan Tambahan */}
                          <TabsContent value="additional" className="space-y-6">
                            <div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Subdomain Slug URL
                                  </label>
                                  <input
                                    type="text"
                                    name="slug"
                                    defaultValue={invitation?.slug || ''}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm font-mono transition-all"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Background Music (Audio URL)
                                  </label>
                                  <input
                                    type="text"
                                    name="bgMusicUrl"
                                    defaultValue={invitation?.bg_music_url || ''}
                                    placeholder="Contoh: /audio/wedding-gamelan.mp3"
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                    Pilihan Tema Desain
                                  </label>
                                  <select
                                    name="style"
                                    defaultValue={invitation?.style || 'java_style'}
                                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all bg-white cursor-pointer"
                                    style={{ height: '42px' }}
                                  >
                                    <option value="java_style">
                                      Royal Javanese Heritage (Default)
                                    </option>
                                    <option value="image_sequence">
                                      Aeterna Editorial (Modern Scroll Animation)
                                    </option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Save changes footer */}
                      <div className="px-6 md:px-8 py-5 bg-white border-t border-[#E2E2E0] flex justify-end">
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-6 py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
                        >
                          <Save size={14} />
                          Simpan Perubahan
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ========================================== */}
                {/* TAB 2: TIMELINE STORIES (Love Story)       */}
                {/* ========================================== */}
                {activeTab === 'stories' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Add story form (col-span-4) */}
                    <div className="lg:col-span-4 bg-white border border-[#E2E2E0] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
                      <h3 className="font-serif text-[#111111] text-xl font-medium mb-1">
                        Tambah Kisah
                      </h3>
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-xs text-[#6E6E6C] font-medium">
                          Tulis perjalanan cinta mempelai
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stories.length >= 4 ? 'bg-[#FEE2E2] text-[#C62828]' : 'bg-[#FAF9F6] text-[#6E6E6C]'}`}
                        >
                          {stories.length}/4
                        </span>
                      </div>

                      {stories.length >= 4 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                          <div className="w-10 h-10 bg-[#FEF3C7] rounded-full flex items-center justify-center mb-3">
                            <BookHeart size={18} className="text-[#D97706]" />
                          </div>
                          <p className="text-sm font-semibold text-[#111111] mb-1">
                            Batas Maksimal Tercapai
                          </p>
                          <p className="text-xs text-[#6E6E6C] leading-relaxed max-w-[220px]">
                            Maksimal 4 momen kisah. Hapus salah satu terlebih dahulu untuk menambah
                            yang baru.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleCreateStory} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                              Waktu / Tanggal Momen
                            </label>
                            <input
                              type="text"
                              name="milestoneDate"
                              placeholder="Contoh: September 2021"
                              className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                              Judul Momen
                            </label>
                            <input
                              type="text"
                              name="title"
                              placeholder="Contoh: Pertemuan Pertama"
                              className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                              Pilih Sumber Gambar
                            </label>
                            <div className="flex gap-2 mb-2 p-1 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl">
                              <button
                                type="button"
                                onClick={() => setStoryImageType('url')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                  storyImageType === 'url'
                                    ? 'bg-white text-[#111111] shadow-sm'
                                    : 'text-[#6E6E6C] hover:text-[#111111]'
                                }`}
                              >
                                Tautan URL
                              </button>
                              <button
                                type="button"
                                onClick={() => setStoryImageType('upload')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                  storyImageType === 'upload'
                                    ? 'bg-white text-[#111111] shadow-sm'
                                    : 'text-[#6E6E6C] hover:text-[#111111]'
                                }`}
                              >
                                Unggah Berkas
                              </button>
                            </div>

                            {storyImageType === 'url' ? (
                              <input
                                type="url"
                                name="imageUrl"
                                placeholder="https://images.unsplash.com/..."
                                className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                              />
                            ) : (
                              <input
                                type="file"
                                accept="image/*"
                                className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] border-dashed rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#111111] file:text-white hover:file:bg-[#333333]"
                              />
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                              Narasi / Cerita Momen
                            </label>
                            <textarea
                              name="description"
                              rows={3}
                              placeholder="Jelaskan secara singkat momen berkesan ini..."
                              className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all resize-y placeholder-[#6E6E6C]/50"
                              required
                            ></textarea>
                          </div>

                          <button
                            type="submit"
                            disabled={isUploadingStoryImage}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-[#111111] hover:bg-[#333333] text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 mt-4 disabled:opacity-55 disabled:cursor-not-allowed"
                          >
                            {isUploadingStoryImage ? (
                              <>
                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-1"></span>
                                Mengompres & Mengunggah...
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                Simpan Kisah Baru
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Stories List (col-span-8) */}
                    <div className="lg:col-span-8 bg-white border border-[#E2E2E0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-[#E2E2E0]">
                        <h3 className="font-serif text-[#111111] text-lg font-medium">
                          Daftar Momen Kisah Aktif
                        </h3>
                        <p className="text-xs text-[#6E6E6C] mt-0.5">
                          Semua kronologis kisah romantis yang dipublikasikan
                        </p>
                      </div>

                      <div className="overflow-auto max-h-[600px]">
                        <DndContext
                          sensors={dndSensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                          modifiers={[restrictToVerticalAxis]}
                        >
                          <Table>
                            <TableHeader className="bg-[#FAF9F6] border-b border-[#E2E2E0] sticky top-0 z-10">
                              <TableRow className="border-b border-[#E2E2E0]">
                                <TableHead className="w-16 text-center py-3 pl-4">Urutan</TableHead>
                                <TableHead className="w-36 py-3">Tanggal/Waktu</TableHead>
                                <TableHead className="w-48 py-3">Judul Kisah</TableHead>
                                <TableHead className="py-3">Deskripsi Narasi</TableHead>
                                <TableHead className="w-20 text-center py-3">Preview</TableHead>
                                <TableHead className="w-16 text-center py-3 pr-4">Aksi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <SortableContext
                              items={stories.map((s) => s.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <TableBody className="divide-y divide-[#E2E2E0]">
                                {stories.length > 0 ? (
                                  stories.map((story) => (
                                    <SortableStoryRow
                                      key={story.id}
                                      story={story}
                                      onEdit={setEditingStory}
                                      onDelete={handleDeleteStory}
                                      storiesCount={stories.length}
                                    />
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell
                                      colSpan={6}
                                      className="text-center text-[#6E6E6C] py-16 text-xs italic"
                                    >
                                      Belum ada momen kisah romantis terdaftar untuk pasangan ini.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </SortableContext>
                          </Table>
                        </DndContext>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================== */}
                {/* TAB 3: GALLERY PHOTOS (Pre-Wedding)        */}
                {/* ========================================== */}
                {activeTab === 'gallery' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Add Photo Form (col-span-4) */}
                    <div className="lg:col-span-4 bg-white border border-[#E2E2E0] rounded-2xl p-6 md:p-8 shadow-sm flex flex-col">
                      <h3 className="font-serif text-[#111111] text-xl font-medium mb-1">
                        Unggah Foto
                      </h3>
                      <p className="text-xs text-[#6E6E6C] mb-6 font-medium">
                        Tambah koleksi prewedding pasangan
                      </p>

                      {galleries.length >= 6 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed border-[#E2E2E0] bg-[#FAF9F6] rounded-2xl text-center">
                          <ImageIcon className="w-8 h-8 text-[#6E6E6C]/30 mb-3" />
                          <h4 className="font-semibold text-xs text-[#111111] mb-1">
                            Batas Maksimal Tercapai
                          </h4>
                          <p className="text-[10px] text-[#6E6E6C] max-w-[200px] leading-relaxed">
                            Maksimal 6 foto diperbolehkan di galeri. Hapus salah satu foto untuk
                            mengunggah yang baru.
                          </p>
                        </div>
                      ) : (
                        <form onSubmit={handleCreateGallery} className="space-y-4">
                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                              Sumber Gambar Galeri
                            </label>
                            <div className="flex gap-2 mb-2 p-1 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl">
                              <button
                                type="button"
                                onClick={() => setGalleryImageType('url')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                  galleryImageType === 'url'
                                    ? 'bg-white text-[#111111] shadow-sm'
                                    : 'text-[#6E6E6C] hover:text-[#111111]'
                                }`}
                              >
                                Tautan URL
                              </button>
                              <button
                                type="button"
                                onClick={() => setGalleryImageType('upload')}
                                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                  galleryImageType === 'upload'
                                    ? 'bg-white text-[#111111] shadow-sm'
                                    : 'text-[#6E6E6C] hover:text-[#111111]'
                                }`}
                              >
                                Unggah Berkas
                              </button>
                            </div>

                            {galleryImageType === 'url' ? (
                              <input
                                type="url"
                                name="imageUrl"
                                placeholder="https://images.unsplash.com/..."
                                className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                                required
                              />
                            ) : (
                              <input
                                type="file"
                                accept="image/*"
                                className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] border-dashed rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#111111] file:text-white hover:file:bg-[#333333]"
                              />
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                              Keterangan Foto (Caption)
                            </label>
                            <input
                              type="text"
                              name="caption"
                              placeholder="Contoh: Pose Klasik di Kebun Raya"
                              className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={isUploadingGalleryImage}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-[#111111] hover:bg-[#333333] text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer active:scale-95 mt-4 disabled:opacity-55 disabled:cursor-not-allowed"
                          >
                            {isUploadingGalleryImage ? (
                              <>
                                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-1"></span>
                                Mengompres & Mengunggah...
                              </>
                            ) : (
                              <>
                                <Plus size={14} />
                                Unggah ke Galeri
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Photos list (col-span-8) */}
                    <div className="lg:col-span-8 bg-white border border-[#E2E2E0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-[#E2E2E0]">
                        <h3 className="font-serif text-[#111111] text-lg font-medium">
                          Koleksi Galeri Foto Aktif
                        </h3>
                        <p className="text-xs text-[#6E6E6C] mt-0.5">
                          Semua foto pre-wedding pasangan pengantin yang dipajang (Gunakan
                          drag-and-drop untuk menyusun urutan)
                        </p>
                      </div>

                      <div className="overflow-auto max-h-[600px]">
                        <DndContext
                          sensors={dndSensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEndGallery}
                          modifiers={[restrictToVerticalAxis]}
                        >
                          <Table>
                            <TableHeader className="bg-[#FAF9F6] border-b border-[#E2E2E0] sticky top-0 z-10">
                              <TableRow className="border-b border-[#E2E2E0]">
                                <TableHead className="w-16 text-center py-3 pl-4">Urutan</TableHead>
                                <TableHead className="w-32 py-3">Preview</TableHead>
                                <TableHead className="py-3">URL Sumber Gambar</TableHead>
                                <TableHead className="w-56 py-3">Keterangan / Caption</TableHead>
                                <TableHead className="w-16 text-center py-3 pr-4">Aksi</TableHead>
                              </TableRow>
                            </TableHeader>
                            <SortableContext
                              items={galleries.map((g) => g.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <TableBody className="divide-y divide-[#E2E2E0]">
                                {galleries.length > 0 ? (
                                  galleries.map((photo) => (
                                    <SortableGalleryRow
                                      key={photo.id}
                                      photo={photo}
                                      onEdit={setEditingGallery}
                                      onDelete={handleDeleteGallery}
                                      photosCount={galleries.length}
                                    />
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell
                                      colSpan={5}
                                      className="text-center text-[#6E6E6C] py-16 text-xs italic"
                                    >
                                      Belum ada foto pre-wedding yang ditambahkan ke galeri.
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </SortableContext>
                          </Table>
                        </DndContext>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================== */}
                {/* TAB 4: TAMU & RSVP (Guest Moderation)      */}
                {/* ========================================== */}
                {activeTab === 'guests' && (
                  <div className="space-y-8">
                    {/* Bento Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111] shrink-0">
                          <Users size={20} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold leading-none text-[#111111] tracking-tight">
                            {guests.length}
                          </h3>
                          <p className="text-[10px] text-[#6E6E6C] mt-1.5 font-bold uppercase tracking-wider">
                            Total Tamu Terdaftar
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-[#E8F5E9] border border-[#C6F6D5] flex items-center justify-center text-[#2E7D32] shrink-0">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold leading-none text-[#2E7D32] tracking-tight">
                            {guests.filter((g) => g.attendance === 'hadir').length}
                          </h3>
                          <p className="text-[10px] text-[#6E6E6C] mt-1.5 font-bold uppercase tracking-wider">
                            Konfirmasi Hadir
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 rounded-xl bg-[#FFEBEE] border-[#FFCDD2] flex items-center justify-center text-[#C62828] shrink-0">
                          <XCircle size={20} />
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold leading-none text-[#C62828] tracking-tight">
                            {
                              guests.filter(
                                (g) =>
                                  g.attendance === 'tidak' ||
                                  g.attendance === 'tidak_hadir' ||
                                  g.attendance === 'tidak hadir'
                              ).length
                            }
                          </h3>
                          <p className="text-[10px] text-[#6E6E6C] mt-1.5 font-bold uppercase tracking-wider">
                            Tidak Dapat Hadir
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* RSVP Moderation List Table */}
                    <div className="bg-white border border-[#E2E2E0] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-[#E2E2E0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="relative w-full sm:w-80">
                          <Search
                            size={14}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6E6C]"
                          />
                          <input
                            type="text"
                            placeholder="Cari tamu..."
                            value={guestSearchQuery}
                            onChange={(e) => {
                              setGuestSearchQuery(e.target.value)
                              setGuestCurrentPage(1)
                            }}
                            className="pl-9 pr-3.5 py-2 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-xs transition-all placeholder-[#6E6E6C]/50 w-full"
                          />
                        </div>

                        {invitation && (
                          <form
                            onSubmit={handleCreateGuest}
                            className="flex gap-2 w-full sm:w-auto"
                          >
                            <input
                              type="text"
                              name="guestName"
                              placeholder="Nama tamu baru..."
                              className="px-3.5 py-2 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-xs transition-all placeholder-[#6E6E6C]/50 w-full sm:w-60"
                              required
                            />
                            <button
                              type="submit"
                              className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] hover:bg-[#333333] text-white font-semibold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 shrink-0"
                            >
                              <Plus size={14} />
                              <span>Tambah Tamu</span>
                            </button>
                          </form>
                        )}
                      </div>

                      <div className="overflow-auto max-h-[600px]">
                        <Table>
                          <TableHeader className="bg-[#FAF9F6] border-b border-[#E2E2E0] sticky top-0 z-10">
                            <TableRow className="border-b border-[#E2E2E0]">
                              <TableHead className="w-44 py-3 pl-6">Tanggal/Waktu RSVP</TableHead>
                              <TableHead className="w-52 py-3">Nama Tamu</TableHead>
                              <TableHead className="w-36 py-3 text-center">Konfirmasi</TableHead>
                              <TableHead className="py-3">Doa Restu & Ucapan</TableHead>
                              <TableHead className="w-36 text-center py-3">
                                Tautan Undangan
                              </TableHead>
                              <TableHead className="w-16 text-center py-3 pr-6">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-[#E2E2E0]">
                            {paginatedGuests.length > 0 ? (
                              paginatedGuests.map((guest) => (
                                <TableRow
                                  key={guest.id}
                                  className="hover:bg-[#FAF9F6]/50 transition-colors"
                                >
                                  <TableCell className="text-xs text-[#6E6E6C] pl-6">
                                    {formatDate(guest.created_at)}
                                  </TableCell>
                                  <TableCell className="font-bold text-[#111111] text-[13px]">
                                    {guest.name}
                                  </TableCell>
                                  <TableCell className="py-3">
                                    <div className="flex justify-center">
                                      {guest.attendance === 'hadir' ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C6F6D5]">
                                          Hadir
                                        </span>
                                      ) : guest.attendance === 'tidak' ||
                                        guest.attendance === 'tidak_hadir' ||
                                        guest.attendance === 'tidak hadir' ? (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">
                                          Tidak Hadir
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F1F1EF] text-[#6E6E6C] border border-[#E2E2E0]">
                                          Belum Respon
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-xs text-[#111111] leading-relaxed py-3">
                                    {guest.comment || <span className="text-[#6E6E6C]/30">-</span>}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const url = `${window.location.origin}/${serverConfig.woSlug}/${invitation ? invitation.slug : selectedCustomer?.id}?to=${encodeURIComponent(guest.name)}`
                                        navigator.clipboard.writeText(url).then(() => {
                                          setShowCopyToast(true)
                                          setTimeout(() => setShowCopyToast(false), 2000)
                                        })
                                      }}
                                      className="inline-flex items-center gap-1.5 h-8 px-3 bg-transparent border border-[#E2E2E0] hover:bg-[#FAF9F6] hover:border-[#111111]/30 text-[#111111] font-semibold text-xs rounded-lg cursor-pointer transition-all active:scale-95"
                                    >
                                      <Copy size={12} />
                                      <span>Salin Link</span>
                                    </button>
                                  </TableCell>
                                  <TableCell className="text-center pr-6">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGuest(guest.id)}
                                      className="p-1.5 text-[#C62828] bg-transparent hover:bg-[#FFEBEE] rounded-lg transition-colors cursor-pointer"
                                      title="Hapus Tamu"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="text-center text-[#6E6E6C] py-16 text-xs italic"
                                >
                                  {guestSearchQuery.trim()
                                    ? 'Tidak ada tamu yang cocok dengan filter pencarian.'
                                    : 'Belum ada konfirmasi kehadiran (RSVP) yang masuk dari tamu undangan.'}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination footer controls for guests */}
                      <div className="px-6 py-4 bg-[#FAF9F6] border-t border-[#E2E2E0] flex items-center justify-between mt-auto">
                        {(() => {
                          const startRange =
                            filteredGuests.length > 0
                              ? (guestCurrentPage - 1) * guestPageSize + 1
                              : 0
                          const endRange = Math.min(
                            guestCurrentPage * guestPageSize,
                            filteredGuests.length
                          )
                          return (
                            <div className="text-xs text-[#6E6E6C] font-semibold">
                              Showing {startRange}-{endRange} of {filteredGuests.length} guests
                            </div>
                          )
                        })()}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setGuestCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={guestCurrentPage === 1}
                            className="w-8 h-8 flex items-center justify-center border border-[#E2E2E0] bg-white hover:bg-[#FAF9F6] rounded-lg text-xs font-semibold text-[#6E6E6C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          {renderGuestPageNumbers()}
                          <button
                            type="button"
                            onClick={() =>
                              setGuestCurrentPage((prev) => Math.min(prev + 1, totalGuestPages))
                            }
                            disabled={guestCurrentPage === totalGuestPages}
                            className="w-8 h-8 flex items-center justify-center border border-[#E2E2E0] bg-white hover:bg-[#FAF9F6] rounded-lg text-xs font-semibold text-[#6E6E6C] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Toast notifier for copy */}
                    {showCopyToast && (
                      <div className="fixed bottom-8 right-8 bg-[#111111] text-[#FAF9F6] px-6 py-3 rounded-lg font-semibold text-sm shadow-xl z-50">
                        Tautan personal disalin ke clipboard!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Confirm Dialog (replaces native confirm()) */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent className="rounded-2xl border-[#E2E2E0] bg-white max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif text-[#111111] text-lg">
              {confirmDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[#6E6E6C] leading-relaxed">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-2">
            <AlertDialogCancel
              className="rounded-xl border-[#E2E2E0] text-[#111111] hover:bg-[#FAF9F6] text-xs font-semibold px-5"
              onClick={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className={`rounded-xl text-xs font-semibold px-5 ${
                confirmDialog.destructive
                  ? 'bg-[#C62828] hover:bg-[#B71C1C] text-white'
                  : 'bg-[#111111] hover:bg-[#333333] text-white'
              }`}
              onClick={() => {
                confirmDialog.onConfirm()
                setConfirmDialog((prev) => ({ ...prev, open: false }))
              }}
            >
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Story Dialog */}
      <Dialog
        open={editingStory !== null}
        onOpenChange={(open) => {
          if (!open) setEditingStory(null)
        }}
      >
        <DialogContent className="rounded-2xl border-[#E2E2E0] bg-white max-w-lg p-6 md:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-serif text-[#111111] text-xl font-medium">
              Edit Momen Kisah
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6E6E6C] mt-1 font-medium">
              Ubah rincian momen kisah romantis yang sudah ada
            </DialogDescription>
          </DialogHeader>

          {editingStory && (
            <form onSubmit={handleUpdateStory} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                    Tanggal / Waktu Momen
                  </label>
                  <input
                    type="text"
                    name="milestoneDate"
                    defaultValue={editingStory.milestone_date}
                    placeholder="Contoh: JULI 2023"
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                    Judul Kisah
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingStory.title}
                    placeholder="Contoh: Lamaran"
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                  Sumber Gambar Ilustrasi
                </label>
                <div className="flex gap-2 mb-2 p-1 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEditStoryImageType('url')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      editStoryImageType === 'url'
                        ? 'bg-white text-[#111111] shadow-sm'
                        : 'text-[#6E6E6C] hover:text-[#111111]'
                    }`}
                  >
                    Tautan URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditStoryImageType('upload')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      editStoryImageType === 'upload'
                        ? 'bg-white text-[#111111] shadow-sm'
                        : 'text-[#6E6E6C] hover:text-[#111111]'
                    }`}
                  >
                    Unggah Berkas
                  </button>
                </div>

                {editStoryImageType === 'url' ? (
                  <input
                    type="url"
                    name="imageUrl"
                    defaultValue={editingStory.image_url || ''}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] border-dashed rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#111111] file:text-white hover:file:bg-[#333333]"
                    />
                    {editingStory.image_url && (
                      <p className="text-[10px] text-[#6E6E6C]">
                        * Biarkan kosong jika tidak ingin mengubah gambar yang sudah ada.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                  Narasi / Cerita Momen
                </label>
                <textarea
                  name="description"
                  defaultValue={editingStory.description}
                  rows={4}
                  placeholder="Jelaskan secara singkat momen berkesan ini..."
                  className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all resize-y placeholder-[#6E6E6C]/50"
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E2E0] mt-6">
                <button
                  type="button"
                  onClick={() => setEditingStory(null)}
                  className="px-5 py-2.5 border border-[#E2E2E0] text-[#111111] hover:bg-[#FAF9F6] font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingEditStoryImage}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {isUploadingEditStoryImage ? (
                    <>
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-1"></span>
                      Mengunggah...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Gallery Dialog */}
      <Dialog
        open={editingGallery !== null}
        onOpenChange={(open) => {
          if (!open) setEditingGallery(null)
        }}
      >
        <DialogContent className="rounded-2xl border-[#E2E2E0] bg-white max-w-lg p-6 md:p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-serif text-[#111111] text-xl font-medium">
              Edit Foto Galeri
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6E6E6C] mt-1 font-medium">
              Ubah rincian foto pre-wedding yang sudah dipajang
            </DialogDescription>
          </DialogHeader>

          {editingGallery && (
            <form onSubmit={handleUpdateGallery} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                  Sumber Gambar Galeri
                </label>
                <div className="flex gap-2 mb-2 p-1 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setEditGalleryImageType('url')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      editGalleryImageType === 'url'
                        ? 'bg-white text-[#111111] shadow-sm'
                        : 'text-[#6E6E6C] hover:text-[#111111]'
                    }`}
                  >
                    Tautan URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditGalleryImageType('upload')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      editGalleryImageType === 'upload'
                        ? 'bg-white text-[#111111] shadow-sm'
                        : 'text-[#6E6E6C] hover:text-[#111111]'
                    }`}
                  >
                    Unggah Berkas
                  </button>
                </div>

                {editGalleryImageType === 'url' ? (
                  <input
                    type="url"
                    name="imageUrl"
                    defaultValue={editingGallery.image_url}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                    required
                  />
                ) : (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] border-dashed rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#111111] file:text-white hover:file:bg-[#333333]"
                    />
                    <p className="text-[10px] text-[#6E6E6C]">
                      * Biarkan kosong jika tidak ingin mengubah gambar yang sudah ada.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                  Keterangan Foto (Caption)
                </label>
                <input
                  type="text"
                  name="caption"
                  defaultValue={editingGallery.caption || ''}
                  placeholder="Contoh: Pose Klasik di Kebun Raya"
                  className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-sm transition-all placeholder-[#6E6E6C]/50"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E2E0] mt-6">
                <button
                  type="button"
                  onClick={() => setEditingGallery(null)}
                  className="px-5 py-2.5 border border-[#E2E2E0] text-[#111111] hover:bg-[#FAF9F6] font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploadingEditGalleryImage}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {isUploadingEditGalleryImage ? (
                    <>
                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-1"></span>
                      Mengunggah...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
