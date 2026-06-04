import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Toaster, toast } from 'sonner'
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.js'
import { Combobox } from '../components/ui/combobox.js'
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
  AlertCircle,
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

interface Customer {
  id: string
  wo_id?: string
  wo_name?: string
  wo_slug?: string
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

interface WeddingOrganization {
  id: string
  name: string
  slug: string
  email: string
  location: string | null
  plan_id: string | null
  created_at: string
  plan?: {
    name: string
    price: number
  } | null
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

  const canDelete = true

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
  // Ensure the 'gallery' bucket exists
  await ensureBucketExists('gallery')

  // Convert image to WebP
  const webpBlob = await convertToWebP(file, 0.8)

  // Generate a clean unique filename inside 'gallery' bucket
  const extension = 'webp'
  const randomStr = Math.random().toString(36).substring(2, 10)
  const timestamp = Date.now()
  const fileName = `${timestamp}_${randomStr}.${extension}`

  // Upload webp blob to bucket
  const { error } = await supabase.storage
    .from('gallery')
    .upload(fileName, webpBlob, {
      contentType: 'image/webp',
      cacheControl: '31536000',
      upsert: false,
    })

  if (error) throw error

  // Get public URL
  const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(fileName)
  return urlData.publicUrl
}

const bankOptions = [
  {
    label: "State-Owned Banks",
    options: [
      { label: "Bank Mandiri", value: "Bank Mandiri" },
      { label: "BNI", value: "BNI" },
      { label: "BRI", value: "BRI" },
      { label: "BTN", value: "BTN" },
      { label: "BSI (Bank Syariah Indonesia)", value: "BSI" }
    ]
  },
  {
    label: "Private Banks",
    options: [
      { label: "BCA", value: "BCA" },
      { label: "CIMB Niaga", value: "CIMB Niaga" },
      { label: "Danamon", value: "Danamon" },
      { label: "Permata", value: "Permata" },
      { label: "OCBC NISP", value: "OCBC NISP" },
      { label: "Panin", value: "Panin" },
      { label: "Mega", value: "Mega" },
      { label: "Sinarmas", value: "Sinarmas" }
    ]
  },
  {
    label: "Digital Banks",
    options: [
      { label: "Bank Jago", value: "Jago" },
      { label: "Blu by BCA Digital", value: "Blu by BCA" },
      { label: "SeaBank", value: "SeaBank" },
      { label: "Jenius (BTPN)", value: "Jenius (BTPN)" },
      { label: "Neo Commerce", value: "Neo Commerce" },
      { label: "Allo Bank", value: "Allo Bank" }
    ]
  }
];

const walletOptions = [
  {
    label: "Popular",
    options: [
      { label: "GoPay", value: "GoPay" },
      { label: "OVO", value: "OVO" },
      { label: "DANA", value: "DANA" },
      { label: "ShopeePay", value: "ShopeePay" },
      { label: "LinkAja", value: "LinkAja" }
    ]
  },
  {
    label: "Others",
    options: [
      { label: "PayPal", value: "PayPal" },
      { label: "QRIS (Universal)", value: "QRIS" }
    ]
  }
];

export default function App() {
  const { slug_wo } = useParams<{ slug_wo: string }>()

  // Platform Admin state
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false)
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'wos' | 'clients'>('overview')
  const [allWos, setAllWos] = useState<WeddingOrganization[]>([])
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [plans, setPlans] = useState<any[]>([])
  const [selectedWoIdForNewClient, setSelectedWoIdForNewClient] = useState<string>('')
  const [globalStats, setGlobalStats] = useState({
    totalWos: 0,
    totalCustomers: 0,
    activeSubscriptions: 0,
    totalTemplates: 0,
  })
  const [openCreateWoModal, setOpenCreateWoModal] = useState(false)
  const [editingWo, setEditingWo] = useState<WeddingOrganization | null>(null)
  const [woId, setWoId] = useState<string | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname
  const [activeTab, setActiveTab] = useState('metadata') // 'metadata' | 'stories' | 'gallery' | 'guests'
  const [formSection, setFormSection] = useState<
    'groom' | 'bride' | 'event' | 'gift' | 'additional'
  >('groom')

  // General WO Dashboard tabs state (Synced with URL search params)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeWoTab = (searchParams.get('tab') || 'clients') as 'clients' | 'customers' | 'settings' | 'billing' | 'profile'
  const setActiveWoTab = (tab: string) => {
    setSearchParams({ tab })
  }
  const [woProfile, setWoProfile] = useState({
    name: '',
    slug: slug_wo || '',
    email: '',
    location: '',
  })
  const [activePlan, setActivePlan] = useState<any>(null)
  const [adminUser, setAdminUser] = useState({
    name: 'Administrator',
    email: '',
    phone: '',
    avatarUrl: '',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // App-wide state
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [totalStats, setTotalStats] = useState({ total: 0, published: 0, draft: 0 })
  const [globalGuests, setGlobalGuests] = useState<any[]>([])

  // Points Billing States
  const [pointsBalance, setPointsBalance] = useState<number>(0)
  const [topupHistory, setTopupHistory] = useState<any[]>([])
  const [pointUsage, setPointUsage] = useState<any[]>([])
  const [loadingBilling, setLoadingBilling] = useState(false)

  // Selected Couple States
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null)

  const [paymentMethods, setPaymentMethods] = useState<Array<{
    type: 'bank' | 'wallet'
    name: string
    number: string
    holder: string
  }>>([])

  useEffect(() => {
    if (invitation) {
      const methods: Array<{
        type: 'bank' | 'wallet'
        name: string
        number: string
        holder: string
      }> = []
      if (invitation.bank_name || invitation.bank_account_number || invitation.bank_account_holder) {
        methods.push({
          type: 'bank',
          name: invitation.bank_name || '',
          number: invitation.bank_account_number || '',
          holder: invitation.bank_account_holder || '',
        })
      }
      if (invitation.wallet_name || invitation.wallet_number || invitation.wallet_holder) {
        methods.push({
          type: 'wallet',
          name: invitation.wallet_name || '',
          number: invitation.wallet_number || '',
          holder: invitation.wallet_holder || '',
        })
      }
      setPaymentMethods(methods)
    } else {
      setPaymentMethods([])
    }
  }, [invitation])

  const handleAddPaymentMethod = () => {
    if (paymentMethods.length >= 2) return
    setPaymentMethods([
      ...paymentMethods,
      { type: 'bank', name: '', number: '', holder: '' }
    ])
  }

  const handleRemovePaymentMethod = (index: number) => {
    setPaymentMethods(paymentMethods.filter((_, i) => i !== index))
  }

  const handleUpdatePaymentMethod = (index: number, field: 'type' | 'name' | 'number' | 'holder', value: string) => {
    const updated = [...paymentMethods]
    updated[index] = {
      ...updated[index],
      [field]: value
    }
    setPaymentMethods(updated)
  }

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

  // Custom premium animated toast state
  const [toastInfo, setToastInfo] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [toastAnimationClass, setToastAnimationClass] = useState('')

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
  const [shouldDeleteAvatar, setShouldDeleteAvatar] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [emailSummaries, setEmailSummaries] = useState(true)
  const [criticalAlerts, setCriticalAlerts] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState(true)

  // Interactive templates chart hover state
  const [hoveredTemplateIndex, setHoveredTemplateIndex] = useState<number | null>(null)
  const [rsvpRange, setRsvpRange] = useState<'7d' | '30d' | '90d'>('7d')

  // Fetch org data and current user on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const user = userData?.user
        
        const hasHash = window.location.hash.includes('access_token') || window.location.hash.includes('id_token')
        const hasCode = window.location.search.includes('code=')

        if (!user) {
          if (hasHash || hasCode) {
            // Wait for PKCE / OAuth redirect exchange to complete
            return
          }
          window.location.href = '/login'
          return
        }

        const userEmail = user.email?.toLowerCase()
          const isAdmin = userEmail === 'admin@ablarsy.com' || user.user_metadata?.role === 'admin'
          setIsPlatformAdmin(isAdmin)
          
          // Fetch user profile from database
          const { data: profiles } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
          
          const profile = profiles && profiles.length > 0 ? profiles[0] : null
          
          const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture
          const googleName = user.user_metadata?.full_name || user.user_metadata?.name

          setAdminUser({
            name: profile?.name || googleName || user.email?.split('@')[0] || 'Administrator',
            email: user.email || '',
            phone: profile?.phone || '',
            avatarUrl: profile?.avatar_url || googleAvatar || '',
          })

          let userWoSlug = user.user_metadata?.wo_slug || user.user_metadata?.slug_wo

          if (!userWoSlug && !isAdmin && userEmail) {
            // 1. Force refresh session to get latest metadata from auth database (e.g. after registration otp verification)
            const { data: refreshData } = await supabase.auth.refreshSession()
            if (refreshData?.user) {
              userWoSlug = refreshData.user.user_metadata?.wo_slug || refreshData.user.user_metadata?.slug_wo
            }
            
            // 2. Fallback: Check if user's email matches a wedding organization's email
            if (!userWoSlug) {
              const { data: org } = await supabase
                .from('wedding_organization')
                .select('slug')
                .eq('email', userEmail)
                .maybeSingle()

              if (org) {
                userWoSlug = org.slug
                // Update user metadata in Supabase Auth so it is cached/persisted for subsequent logins
                const { data: updatedUserData } = await supabase.auth.updateUser({
                  data: {
                    wo_slug: org.slug,
                    role: 'admin'
                  }
                })
                if (updatedUserData?.user) {
                  userWoSlug = updatedUserData.user.user_metadata?.wo_slug || updatedUserData.user.user_metadata?.slug_wo
                }
              }
            }
          }

          if (isAdmin) {
            // Admin user - allow scoped WO workspace navigation
          } else {
            // Normal user
            if (!slug_wo) {
              if (userWoSlug) {
                navigate(`/admin/${userWoSlug}`, { replace: true })
              } else {
                window.location.href = `/signup?email=${encodeURIComponent(userEmail)}&provider=google`
                return
              }
            } else if (slug_wo !== userWoSlug) {
              navigate(`/admin/${userWoSlug}`, { replace: true })
            }
          }

          if (slug_wo) {
            const { data: orgData } = await supabase
              .from('wedding_organization')
              .select('id, name, slug, location, email')
              .eq('slug', slug_wo)
              .single()
            
            if (orgData) {
              setWoId(orgData.id)
              setWoProfile({
                name: orgData.name,
                slug: orgData.slug,
                email: orgData.email || '',
                location: orgData.location || '',
              })
            }
          }
      } catch (err) {
        console.error('Error initializing app:', err)
      } finally {
        setIsAuthReady(true)
      }
    }
    initApp()
  }, [slug_wo])

  // Listen to auth state changes to handle OAuth redirect session load
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const hasHash = window.location.hash.includes('access_token') || window.location.hash.includes('id_token')
        const hasCode = window.location.search.includes('code=')
        if (hasHash || hasCode) {
          // Clean up the URL and reload
          window.location.href = window.location.origin + window.location.pathname
        }
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Inactivity timeout guard (30 minutes)
  useEffect(() => {
    const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
    const STORAGE_KEY = 'admin_last_activity'

    // Set initial activity timestamp on load
    localStorage.setItem(STORAGE_KEY, Date.now().toString())

    const updateActivity = () => {
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
    }

    // Add listeners with throttling
    let throttleTimeout: any = null
    const handleUserActivity = () => {
      if (throttleTimeout) return
      throttleTimeout = setTimeout(() => {
        updateActivity()
        throttleTimeout = null
      }, 5000) // Throttle to once every 5 seconds
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'mousedown', 'touchstart']
    events.forEach(event => window.addEventListener(event, handleUserActivity))

    // Interval to check for inactivity
    const interval = setInterval(async () => {
      const lastActivity = localStorage.getItem(STORAGE_KEY)
      if (lastActivity) {
        const diff = Date.now() - parseInt(lastActivity, 10)
        if (diff > TIMEOUT_MS) {
          console.warn('Session expired due to inactivity.')
          clearInterval(interval)
          // Log out
          await supabase.auth.signOut()
          window.location.href = '/login?expired=true'
        }
      }
    }, 10000) // Check every 10 seconds

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity))
      clearInterval(interval)
      if (throttleTimeout) clearTimeout(throttleTimeout)
    }
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

  // Toast close helper
  const closeToast = () => {
    setToastAnimationClass('animate-toast-out')
    setTimeout(() => {
      setToastInfo(null)
    }, 250) // matching our transition duration (250ms)
  }

  // Toast listener for retrofitted statusAlert state
  useEffect(() => {
    if (statusAlert) {
      setToastInfo(statusAlert)
      setToastAnimationClass('animate-toast-in')
      
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        setToastAnimationClass('animate-toast-out')
        setTimeout(() => {
          setToastInfo(null)
        }, 250)
      }, 3000)
      
      setStatusAlert(null)
      return () => clearTimeout(timer)
    }
  }, [statusAlert])

  // Fetch WO couples/dashboard stats
  useEffect(() => {
    if (!isAuthReady) return

    if (isPlatformAdmin && !slug_wo && !selectedCustomerId) {
      fetchPlatformAdminData()
    } else if (!selectedCustomerId) {
      fetchDashboardData()
      fetchWoProfile()
      fetchPlanInfo()
      if (activeWoTab === 'billing' || settingsSubTab === 'billing') {
        fetchBillingData()
      }
    } else {
      fetchCoupleData(selectedCustomerId)
    }
  }, [selectedCustomerId, isAuthReady, activeWoTab, settingsSubTab, isPlatformAdmin, activeAdminTab, slug_wo, woId])

  const fetchBillingData = async () => {
    if (!woId) return
    setLoadingBilling(true)
    try {
      const { data: woData, error: woError } = await supabase
        .from('wedding_organization')
        .select('points_balance')
        .eq('id', woId)
        .single()
      if (woError) throw woError
      setPointsBalance(woData?.points_balance || 0)

      const { data: topupData, error: topupError } = await supabase
        .from('wo_topup_history')
        .select('*')
        .eq('wo_id', woId)
        .order('created_at', { ascending: false })
      if (topupError) throw topupError
      setTopupHistory(topupData || [])

      const { data: usageData, error: usageError } = await supabase
        .from('wo_point_usage')
        .select('*')
        .eq('wo_id', woId)
        .order('created_at', { ascending: false })
      if (usageError) throw usageError
      setPointUsage(usageData || [])
    } catch (err: any) {
      console.error('Error fetching billing data:', err)
    } finally {
      setLoadingBilling(false)
    }
  }

  const handleTopUpPoint = async (points: number, price: number, method: string) => {
    if (!woId) return
    try {
      const { error: insertError } = await supabase.from('wo_topup_history').insert({
        wo_id: woId,
        points_added: points,
        amount_paid: price,
        payment_method: method,
        status: 'completed',
      })
      if (insertError) throw insertError

      const { error: balanceError } = await supabase
        .from('wedding_organization')
        .update({ points_balance: pointsBalance + points })
        .eq('id', woId)
      if (balanceError) throw balanceError

      setStatusAlert({ type: 'success', message: `Top up ${points} Poin berhasil dilakukan!` })
      fetchBillingData()
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal melakukan top up: ${err.message}` })
    }
  }

  const fetchDashboardData = async () => {
    if (!woId) {
      setCustomers([])
      return
    }
    setLoading(true)
    try {
      // 1. Fetch customers filtered by the logged-in organization's ID
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .eq('wo_id', woId)
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

  const fetchPlatformAdminData = async () => {
    setLoading(true)
    try {
      const { data: wosData, error: wosErr } = await supabase
        .from('wedding_organization')
        .select(`
          *,
          plan:plan_id (
            name,
            price
          )
        `)
        .order('created_at', { ascending: false })
      if (wosErr) throw wosErr
      const fetchedWos = wosData || []
      setAllWos(fetchedWos)

      const { data: activePlans } = await supabase
        .from('wo_plan')
        .select('id')
        .eq('status', 'active')
      const planCount = activePlans?.length || 0

      const { data: templatesData } = await supabase
        .from('templates')
        .select('id')
      const templatesCount = templatesData?.length || 0

      const { data: custsData, error: custsErr } = await supabase
        .from('customers')
        .select(`
          *,
          wedding_organization:wo_id (
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false })
      if (custsErr) throw custsErr
      const fetchedCustomers = custsData || []

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
          wo_name: c.wedding_organization?.name || 'Unknown WO',
          wo_slug: c.wedding_organization?.slug || '',
          isActive: !!linkedInv,
          slug: linkedInv?.slug || '',
          style: linkedInv?.style || 'java_style',
          wedding_date: linkedInv ? linkedInv.akad_datetime || linkedInv.resepsi_datetime : null,
          guest_count: linkedInv ? guestCountsMap[linkedInv.id] || 0 : 0,
        }
      })

      setAllCustomers(mapped)
      setGlobalStats({
        totalWos: fetchedWos.length,
        totalCustomers: mapped.length,
        activeSubscriptions: planCount,
        totalTemplates: templatesCount,
      })

      const { data: plansList } = await supabase.from('plan').select('*')
      if (plansList) setPlans(plansList)

    } catch (err: any) {
      console.error('Error fetching platform admin data:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateWoDetails = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingWo) return
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const slug = formData.get('slug') as string
    const location = formData.get('location') as string
    const planId = formData.get('planId') as string

    try {
      const { error } = await supabase
        .from('wedding_organization')
        .update({
          name,
          email,
          slug,
          location: location || null,
          plan_id: planId || null,
        })
        .eq('id', editingWo.id)

      if (error) throw error

      setEditingWo(null)
      setStatusAlert({ type: 'success', message: 'Detail Wedding Organizer berhasil diperbarui!' })
      setTimeout(() => setStatusAlert(null), 3000)
      fetchPlatformAdminData()
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal memperbarui WO: ${err.message}` })
      setTimeout(() => setStatusAlert(null), 3000)
    }
  }

  const handleDeleteWo = async (id: string) => {
    showConfirm({
      title: 'Apakah Anda yakin?',
      description: 'Tindakan ini tidak dapat dibatalkan. Organisasi beserta semua data klien dan undangan terkait akan dihapus secara permanen.',
      destructive: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('wedding_organization').delete().eq('id', id)
          if (error) throw error
          setStatusAlert({ type: 'success', message: 'Wedding Organizer berhasil dihapus!' })
          setTimeout(() => setStatusAlert(null), 3000)
          fetchPlatformAdminData()
        } catch (err: any) {
          setStatusAlert({ type: 'error', message: `Gagal menghapus WO: ${err.message}` })
          setTimeout(() => setStatusAlert(null), 3000)
        }
      }
    })
  }

  const handleCreateWoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const location = formData.get('location') as string
    const planId = formData.get('planId') as string

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      const { data: newWo, error: woError } = await supabase
        .from('wedding_organization')
        .insert({
          name,
          slug,
          location: location || null,
          email,
          plan_id: planId || null,
        })
        .select()
        .single()

      if (woError) throw woError

      if (planId) {
        await supabase.from('wo_plan').insert({
          wo_id: newWo.id,
          plan_id: planId,
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
      }

      setOpenCreateWoModal(false)
      setStatusAlert({ type: 'success', message: 'Wedding Organizer baru berhasil didaftarkan!' })
      setTimeout(() => setStatusAlert(null), 3000)
      fetchPlatformAdminData()
    } catch (err: any) {
      window.alert(`Gagal menambah WO: ${err.message}`)
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    showConfirm({
      title: 'Apakah Anda yakin?',
      description: 'Tindakan ini tidak dapat dibatalkan. Seluruh data klien ini akan dihapus secara permanen.',
      destructive: true,
      onConfirm: async () => {
        try {
          let query = supabase.from('customers').delete().eq('id', id)
          if (!isPlatformAdmin && woId) {
            query = query.eq('wo_id', woId)
          }
          const { error } = await query
          if (error) throw error
          setStatusAlert({ type: 'success', message: 'Data klien berhasil dihapus secara permanen.' })
          setTimeout(() => setStatusAlert(null), 3000)
          
          if (selectedCustomerId === id) {
            navigateTo(isPlatformAdmin && !slug_wo ? '/admin' : `/admin/${slug_wo || ''}`)
          }

          if (isPlatformAdmin) {
            fetchPlatformAdminData()
          } else {
            fetchDashboardData()
          }
        } catch (err: any) {
          setStatusAlert({ type: 'error', message: `Gagal menghapus data klien: ${err.message}` })
          setTimeout(() => setStatusAlert(null), 3000)
        }
      }
    })
  }

  const fetchWoProfile = async () => {
    if (!woId) return
    try {
      const { data, error } = await supabase
        .from('wedding_organization')
        .select('*')
        .eq('id', woId)
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

  const fetchPlanInfo = async () => {
    if (!woId) return
    try {
      const { data: woPlans } = await supabase
        .from('wo_plan')
        .select('*, plan(*)')
        .eq('wo_id', woId)
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
    let slug = formData.get('woSlug') as string

    // Validate and clean slug
    slug = slug.trim().toLowerCase()
    slug = slug.replace(/\s+/g, '-') // convert spaces to '-'
    slug = slug.replace(/[^a-z0-9-]/g, '') // remove characters that are not alphanumeric or '-'
    slug = slug.replace(/-+/g, '-') // collapse multiple hyphens
    slug = slug.replace(/^-|-$/g, '') // remove leading/trailing hyphens

    if (!slug) {
      setStatusAlert({ type: 'error', message: 'Slug URL tidak boleh kosong atau hanya berisi karakter khusus.' })
      return
    }

    if (slug.length < 3) {
      setStatusAlert({ type: 'error', message: 'Slug URL minimal harus 3 karakter.' })
      return
    }

    try {
      // Check if slug is already taken by another organization
      const { data: existingOrg, error: checkError } = await supabase
        .from('wedding_organization')
        .select('id')
        .eq('slug', slug)
        .neq('id', woId)
        .maybeSingle()

      if (checkError) throw checkError
      if (existingOrg) {
        setStatusAlert({ type: 'error', message: 'Slug URL ini sudah digunakan oleh organisasi lain. Silakan pilih yang lain.' })
        return
      }

      const { error } = await supabase
        .from('wedding_organization')
        .update({ name, location, email, slug })
        .eq('id', woId)

      if (error) throw error

      // Update user metadata in Supabase Auth so it is cached/persisted
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          wo_slug: slug,
          slug_wo: slug
        }
      })
      if (authErr) throw authErr

      setWoProfile({ name, location, email, slug })
      setStatusAlert({ type: 'success', message: 'Profil Wedding Organizer berhasil disimpan!' })
      setTimeout(() => setStatusAlert(null), 3000)

      if (slug !== slug_wo) {
        window.location.href = `/admin/${slug}`
      }
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal memperbarui profil: ${err.message}` })
    }
  }

  const handleUpgradePlan = async (planId: string) => {
    if (!woId) return
    try {
      // 1. Expire all current plans for this WO
      await supabase
        .from('wo_plan')
        .update({ status: 'expired' })
        .eq('wo_id', woId)
        .eq('status', 'active')

      // 2. Insert new active plan
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + 30)

      const { error } = await supabase.from('wo_plan').insert({
        wo_id: woId,
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

  const handleUpdateAdminProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setIsSavingProfile(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error('User tidak ditemukan')
      const name = formData.get('adminName') as string
      const phone = formData.get('adminPhone') as string
      const avatarFile = formData.get('adminAvatar') as File | null

      let avatarUrl = adminUser.avatarUrl

      if (shouldDeleteAvatar) {
        // Delete old avatar image if exists
        if (adminUser.avatarUrl) {
          try {
            const match = adminUser.avatarUrl.match(/\/gallery\/([^?#]+)/)
            if (match && match[1]) {
              const oldFilename = decodeURIComponent(match[1])
              await supabase.storage.from('gallery').remove([oldFilename])
            }
          } catch (storageErr) {
            console.error('Gagal menghapus file lama dari storage:', storageErr)
          }
        }
        avatarUrl = ''
        setShouldDeleteAvatar(false)
      } else if (avatarFile && avatarFile.size > 0) {
        // Upload new avatar image
        avatarUrl = await uploadImageToStorage(avatarFile)

        // Delete old avatar image if exists
        if (adminUser.avatarUrl) {
          try {
            const match = adminUser.avatarUrl.match(/\/gallery\/([^?#]+)/)
            if (match && match[1]) {
              const oldFilename = decodeURIComponent(match[1])
              await supabase.storage.from('gallery').remove([oldFilename])
            }
          } catch (storageErr) {
            console.error('Gagal menghapus file lama dari storage:', storageErr)
          }
        }
      }

      // Upsert into user_profiles
      const { error: dbErr } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          name,
          phone,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })

      if (dbErr) throw dbErr

      setAdminUser({
        name,
        email: user.email || '',
        phone: phone || '',
        avatarUrl: avatarUrl || '',
      })

      setShowEditProfileModal(false)
      setStatusAlert({ type: 'success', message: 'Profil Admin berhasil disimpan!' })
      setTimeout(() => setStatusAlert(null), 3000)
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal memperbarui profil: ${err.message}` })
      setTimeout(() => setStatusAlert(null), 3000)
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const oldPassword = formData.get('oldPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!oldPassword) {
      setStatusAlert({ type: 'error', message: 'Silakan masukkan kata sandi lama Anda.' })
      setTimeout(() => setStatusAlert(null), 3000)
      return
    }

    if (newPassword.length < 6) {
      setStatusAlert({ type: 'error', message: 'Sandi baru harus minimal 6 karakter.' })
      setTimeout(() => setStatusAlert(null), 3000)
      return
    }

    if (newPassword !== confirmPassword) {
      setStatusAlert({ type: 'error', message: 'Konfirmasi sandi tidak cocok.' })
      setTimeout(() => setStatusAlert(null), 3000)
      return
    }

    setIsChangingPassword(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) throw new Error('User tidak ditemukan')

      // Verify old password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: oldPassword,
      })
      if (signInError) {
        throw new Error('Kata sandi lama salah.')
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setShowChangePasswordModal(false)
      setStatusAlert({ type: 'success', message: 'Kata sandi berhasil diperbarui!' })
      setTimeout(() => setStatusAlert(null), 3000)
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal memperbarui sandi: ${err.message}` })
      setTimeout(() => setStatusAlert(null), 3000)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!adminUser.email) return
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(adminUser.email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error
      setStatusAlert({ type: 'success', message: `Link atur ulang kata sandi telah dikirim ke ${adminUser.email}!` })
      setTimeout(() => setStatusAlert(null), 4000)
    } catch (err: any) {
      setStatusAlert({ type: 'error', message: `Gagal mengirim email reset: ${err.message}` })
      setTimeout(() => setStatusAlert(null), 4000)
    }
  }

  const fetchCoupleData = async (customerId: string) => {
    setLoading(true)
    try {
      // 1. Fetch couple metadata
      let query = supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)

      if (!isPlatformAdmin && woId) {
        query = query.eq('wo_id', woId)
      }

      const { data: cust, error: custErr } = await query.single()

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
    navigate(path)
    setIsSidebarOpen(false)
  }

  // Create new customer & auto-initialise invitation record
  const handleCreateCustomerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const maleName = formData.get('maleName') as string
    const femaleName = formData.get('femaleName') as string
    const email = formData.get('email') as string

    const targetWoId = isPlatformAdmin ? selectedWoIdForNewClient : woId
    if (!targetWoId) {
      window.alert('Harap pilih Wedding Organizer terlebih dahulu.')
      return
    }

    try {
      // 1. Insert customer
      const { data: newCust, error: custErr } = await supabase
        .from('customers')
        .insert({
          wo_id: targetWoId,
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
      if (isPlatformAdmin) {
        fetchPlatformAdminData()
      } else {
        fetchDashboardData()
      }
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
      title: 'Apakah Anda yakin?',
      description: 'Tindakan ini tidak dapat dibatalkan. Momen kisah ini akan dihapus secara permanen.',
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
    showConfirm({
      title: 'Apakah Anda yakin?',
      description: 'Tindakan ini tidak dapat dibatalkan. Foto ini akan dihapus secara permanen dari galeri.',
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
      title: 'Apakah Anda yakin?',
      description: 'Tindakan ini tidak dapat dibatalkan. Konfirmasi kehadiran tamu ini akan dihapus secara permanen.',
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
        attendance: 'ragu', // pending
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

  if (!isAuthReady) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#111111] border-t-transparent"></span>
          <p className="text-sm font-medium text-[#6E6E6C] font-serif tracking-wide">Memuat Sesi...</p>
        </div>
      </div>
    )
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
        className={`fixed inset-y-0 left-0 z-50 h-screen bg-white border-r border-[#E2E2E0] flex flex-col p-5 font-sans transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        } ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header & Toggle */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2E2E0] relative min-h-[45px]">
          <div className="flex flex-col min-w-0">
            {/* Brand Logo Text */}
            <span className="text-2xl font-bold tracking-tight text-[#111111] font-serif transition-all duration-300 select-none">
              {isSidebarCollapsed ? 'W.' : 'Wednity.'}
            </span>

            {/* Subtitle with Smooth Fade & Slide */}
            <div className={`overflow-hidden transition-all duration-300 origin-left flex flex-col ${
              isSidebarCollapsed 
                ? 'opacity-0 max-w-0 max-h-0 pointer-events-none scale-95 mt-0' 
                : 'opacity-100 max-w-[180px] scale-100 mt-0.5'
            }`}>
              <p className="text-[10px] text-[#6E6E6C] uppercase tracking-wider font-sans font-semibold truncate leading-none">
                {selectedCustomer 
                  ? `${selectedCustomer.male_name} & ${selectedCustomer.female_name}`
                  : (isPlatformAdmin ? 'CONSOLE ADMIN' : woProfile.name)}
              </p>
            </div>
          </div>

          {/* Toggle Sidebar Collapse Button (Desktop Only) - Floating on the border line */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden md:flex items-center justify-center w-6 h-6 rounded-full border border-[#E2E2E0] bg-white text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] shadow-sm hover:shadow active:scale-95 transition-all duration-300 cursor-pointer absolute -right-8 top-1.5 z-50"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {/* Close button for mobile sidebar */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] rounded-md md:hidden cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto no-scrollbar">
          {selectedCustomer ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (window.history.state && window.history.state.idx > 0) {
                    navigate(-1)
                  } else {
                    navigateTo(slug_wo ? `/admin/${slug_wo}?tab=customers` : '/admin')
                  }
                }}
                title="Kembali ke Dashboard"
                className={`flex items-center w-full py-2.5 rounded-xl transition-all duration-300 group cursor-pointer text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] mb-3 ${
                  isSidebarCollapsed ? 'justify-center px-0' : 'px-4'
                }`}
              >
                <ArrowLeft size={16} className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" />
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 origin-left text-xs font-semibold ${
                  isSidebarCollapsed ? 'opacity-0 max-w-0 ml-0 pointer-events-none' : 'opacity-100 max-w-[160px] ml-3'
                }`}>
                  Kembali ke Dashboard
                </span>
              </button>

              <span className={`text-[9px] font-semibold text-[#6E6E6C] tracking-widest uppercase mb-2 block transition-all duration-300 ${
                isSidebarCollapsed ? 'opacity-0 max-h-0 overflow-hidden pointer-events-none' : 'opacity-100 max-h-4 px-4'
              }`}>
                Menu Undangan
              </span>

              {/* Scoped workspace tabs */}
              {[
                { id: 'metadata', label: 'Detail Mempelai', icon: Edit3 },
                { id: 'stories', label: 'Kisah Cerita', icon: BookHeart },
                { id: 'gallery', label: 'Galeri Foto', icon: ImageIcon },
                { id: 'guests', label: 'Tamu & RSVP', icon: MessageSquare }
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id)
                      setIsSidebarOpen(false)
                    }}
                    title={item.label}
                    className={`flex items-center w-full py-2.5 rounded-xl transition-all duration-300 group cursor-pointer text-left ${
                      isSidebarCollapsed ? 'justify-center px-0' : 'px-4'
                    } ${
                      isActive
                        ? 'text-white font-semibold bg-[#111111] shadow-sm'
                        : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                    }`}
                  >
                    <IconComponent size={18} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 origin-left text-[13px] ${
                      isSidebarCollapsed ? 'opacity-0 max-w-0 ml-0 pointer-events-none' : 'opacity-100 max-w-[160px] ml-3'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </>
          ) : (
            <div className="w-full flex-1 flex flex-col justify-between">
              {/* TOP NAVIGATION GROUP */}
              <div className="w-full space-y-1">
                {isPlatformAdmin && !slug_wo ? (
                  <>
                    {[
                      { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
                      { id: 'wos', label: 'Daftar Organisasi', icon: Shield },
                      { id: 'clients', label: 'Daftar Klien Global', icon: Users }
                    ].map((item) => {
                      const IconComponent = item.icon;
                      const isActive = activeAdminTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveAdminTab(item.id)
                            setIsSidebarOpen(false)
                          }}
                          title={item.label}
                          className={`flex items-center w-full py-2.5 rounded-xl transition-all duration-300 group cursor-pointer text-left ${
                            isSidebarCollapsed ? 'justify-center px-0' : 'px-4'
                          } ${
                            isActive
                              ? 'text-white font-semibold bg-[#111111] shadow-sm'
                              : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                          }`}
                        >
                          <IconComponent size={18} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
                          <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 origin-left text-[13px] ${
                            isSidebarCollapsed ? 'opacity-0 max-w-0 ml-0 pointer-events-none' : 'opacity-100 max-w-[160px] ml-3'
                          }`}>
                            {item.label}
                          </span>
                        </button>
                      )
                    })}
                  </>
                ) : (
                  <>
                    {isPlatformAdmin && slug_wo && (
                      <button
                        type="button"
                        onClick={() => navigateTo('/admin')}
                        title="Kembali ke Admin Console"
                        className={`flex items-center w-full py-2.5 rounded-xl transition-all duration-300 group cursor-pointer text-left text-amber-700 hover:text-amber-900 hover:bg-amber-50/50 mb-3 border border-amber-200/40 ${
                          isSidebarCollapsed ? 'justify-center px-0' : 'px-4'
                        }`}
                      >
                        <ArrowLeft size={14} className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" />
                        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 origin-left text-xs font-semibold ${
                          isSidebarCollapsed ? 'opacity-0 max-w-0 ml-0 pointer-events-none' : 'opacity-100 max-w-[160px] ml-3'
                        }`}>
                          Kembali ke Admin Console
                        </span>
                      </button>
                    )}

                    {[
                      { id: 'clients', label: 'Dashboard', icon: LayoutDashboard, tabType: 'activeWoTab' },
                      { id: 'customers', label: 'Daftar Klien', icon: Users, tabType: 'activeWoTab' }
                    ].map((item) => {
                      const IconComponent = item.icon;
                      const isActive = activeWoTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setActiveWoTab(item.id)
                            setIsSidebarOpen(false)
                          }}
                          title={item.label}
                          className={`flex items-center w-full py-2.5 rounded-xl transition-all duration-300 group cursor-pointer text-left ${
                            isSidebarCollapsed ? 'justify-center px-0' : 'px-4'
                          } ${
                            isActive
                              ? 'text-white font-semibold bg-[#111111] shadow-sm'
                              : 'text-[#6E6E6C] hover:bg-[#FAF9F6] hover:text-[#111111]'
                          }`}
                        >
                          <IconComponent size={18} className="shrink-0 transition-transform duration-300 group-hover:scale-105" />
                          <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 origin-left text-[13px] ${
                            isSidebarCollapsed ? 'opacity-0 max-w-0 ml-0 pointer-events-none' : 'opacity-100 max-w-[160px] ml-3'
                          }`}>
                            {item.label}
                          </span>
                        </button>
                      )
                    })}
                  </>
                )}
              </div>

              {/* Removed BOTTOM NAVIGATION GROUP for Pengaturan */}
            </div>
          )}
        </nav>

        {/* Sidebar Footer / User Profile & Logout */}
        <div className="mt-auto pt-4 border-t border-[#E2E2E0]/40">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`w-full flex items-center bg-[#FAF9F6] rounded-xl border border-[#E2E2E0] hover:border-[#111111]/30 transition-all duration-300 cursor-pointer text-left focus:outline-none ${
                  isSidebarCollapsed ? 'justify-center p-2' : 'gap-3 p-3'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#111111] flex items-center justify-center text-white font-bold text-[10px] shrink-0 transition-transform duration-300 hover:scale-105 overflow-hidden">
                  {adminUser.avatarUrl ? (
                    <img src={adminUser.avatarUrl} alt={adminUser.name} className="w-full h-full object-cover" />
                  ) : (
                    adminUser.email
                      ? adminUser.email.substring(0, 2).toUpperCase()
                      : 'WO'
                  )}
                </div>
                <div className={`flex-1 overflow-hidden min-w-0 transition-all duration-300 flex items-center justify-between ${
                  isSidebarCollapsed ? 'opacity-0 max-w-0 ml-0 pointer-events-none' : 'opacity-100 max-w-[160px] ml-1'
                }`}>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold text-[#111111] truncate">
                      {adminUser.name}
                    </div>
                    <div className="text-[10px] text-[#6E6E6C] truncate">Administrator</div>
                  </div>
                  <MoreVertical size={14} className="text-[#6E6E6C]/40 shrink-0 ml-1.5" />
                </div>
              </button>
            </DropdownMenuTrigger>
 
            <DropdownMenuContent className="w-56 bg-white border border-[#E2E2E0] text-[#111111] rounded-lg p-1.5 shadow-xl origin-[--radix-dropdown-menu-content-transform-origin]">
              <DropdownMenuLabel className="px-2.5 py-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111] font-semibold text-xs shrink-0 overflow-hidden">
                    {adminUser.avatarUrl ? (
                      <img src={adminUser.avatarUrl} alt={adminUser.name} className="w-full h-full object-cover" />
                    ) : (
                      adminUser.email
                        ? adminUser.email.substring(0, 2).toUpperCase()
                        : 'WO'
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#111111] truncate">
                      {adminUser.name}
                    </div>
                    <div className="text-[9px] text-[#6E6E6C] truncate font-mono mt-0.5">
                      {adminUser.email}
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#E2E2E0] -mx-1.5 my-1" />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedCustomerId(null)
                  if (isPlatformAdmin && !slug_wo) {
                    setActiveAdminTab('settings')
                  } else {
                    setActiveWoTab('settings')
                    setSettingsSubTab('profile')
                  }
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

              {!isPlatformAdmin && (
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedCustomerId(null)
                    setActiveWoTab('settings')
                    setSettingsSubTab('business')
                  }}
                  className="flex items-center gap-2 px-2.5 py-2 text-xs text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] rounded transition-colors cursor-pointer outline-none font-medium"
                >
                  <Settings size={14} className="shrink-0" />
                  Pengaturan
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator className="bg-[#E2E2E0] -mx-1.5 my-1" />

              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await supabase.auth.signOut()
                    window.location.href = '/login'
                  } catch (err) {
                    console.error('Logout error:', err)
                  }
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-[#e57373] hover:text-white hover:bg-[#e57373]/90 rounded transition-colors cursor-pointer text-left font-medium"
              >
                <LogOut size={14} className="shrink-0" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN CONTENT AREA                          */}
      {/* ========================================== */}
      <main className={`transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'} min-h-screen flex flex-col font-sans relative`}>
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
              : isPlatformAdmin
                ? activeAdminTab === 'overview'
                  ? 'Overview'
                  : activeAdminTab === 'wos'
                    ? 'Daftar Organisasi'
                    : 'Klien Global'
                : woProfile.name}
          </span>
          <div className="w-10 flex justify-end items-center">
            {selectedCustomerId ? (
              invitation && (
                <a
                  href={`/${slug_wo}/${invitation.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-[#111111] hover:bg-[#E2E2E0]/40 rounded-lg transition-colors cursor-pointer"
                  title="Lihat Undangan Publik"
                >
                  <ExternalLink size={20} />
                </a>
              )
            ) : (isPlatformAdmin && activeAdminTab === 'clients') || (!isPlatformAdmin && activeWoTab === 'clients') ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedWoIdForNewClient(allWos[0]?.id || '')
                  setOpenCreateModal(true)
                }}
                className="p-1.5 text-[#111111] hover:bg-[#E2E2E0]/40 rounded-lg transition-colors cursor-pointer"
                title="Tambah Klien"
              >
                <UserPlus size={20} />
              </button>
            ) : isPlatformAdmin && activeAdminTab === 'wos' ? (
              <button
                type="button"
                onClick={() => setOpenCreateWoModal(true)}
                className="p-1.5 text-[#111111] hover:bg-[#E2E2E0]/40 rounded-lg transition-colors cursor-pointer"
                title="Tambah WO"
              >
                <Plus size={20} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Sticky Glass Header (Desktop) */}
        <header className="hidden md:flex justify-between items-center w-full px-10 lg:px-16 h-16 sticky top-0 z-40 bg-[#FAF9F6]/80 backdrop-blur-xl border-b border-[#E2E2E0]">
          <h2 className="text-xl font-semibold text-[#111111] tracking-tight">
            {selectedCustomer
              ? `${selectedCustomer.male_name} & ${selectedCustomer.female_name}`
              : isPlatformAdmin
                ? activeAdminTab === 'overview'
                  ? 'Platform Overview'
                  : activeAdminTab === 'wos'
                    ? 'Daftar Wedding Organizer'
                    : 'Daftar Klien Global'
                : activeWoTab === 'clients'
                  ? 'Dashboard Overview'
                  : activeWoTab === 'customers'
                    ? 'Daftar Klien'
                    : 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            {/* Desktop Action Buttons */}
            {selectedCustomerId ? (
              invitation && (
                <a
                  href={`/${slug_wo}/${invitation.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E2E2E0] hover:border-[#111111] hover:bg-[#FAF9F6] text-[#111111] font-semibold text-xs rounded-lg shadow-sm hover:shadow transition-all text-decoration-none"
                >
                  <ExternalLink size={14} />
                  Lihat Undangan Publik
                </a>
              )
            ) : (isPlatformAdmin && activeAdminTab === 'clients') || (!isPlatformAdmin && activeWoTab === 'clients') ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedWoIdForNewClient(allWos[0]?.id || '')
                  setOpenCreateModal(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-medium text-xs rounded-lg shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
              >
                <UserPlus size={14} />
                Tambah Klien
              </button>
            ) : isPlatformAdmin && activeAdminTab === 'overview' ? (
              <button
                type="button"
                onClick={() => setOpenCreateWoModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-medium text-xs rounded-lg shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
              >
                <Plus size={14} />
                Tambah Organisasi Baru
              </button>
            ) : null}
          </div>
        </header>

        {/* ========================================== */}
        {/* WO GENERAL DASHBOARD VIEW                  */}
        {/* ========================================== */}
        {!selectedCustomerId ? (
          <div className="px-4 sm:px-6 md:px-8 py-5 md:py-8 w-full max-w-full">


            {isPlatformAdmin && !slug_wo ? (
              <>
                {/* 1. OVERVIEW VIEW */}
                {activeAdminTab === 'overview' && (
                  <div className="space-y-8 animate-in fade-in duration-200">
                    {/* Bento Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-semibold uppercase text-[#6E6E6C] tracking-widest">
                            Total Organisasi Terdaftar
                          </span>
                          <Shield size={18} className="text-[#6E6E6C]" />
                        </div>
                        <div>
                          <div className="text-[42px] font-semibold leading-none text-[#111111] tracking-tight">
                            {globalStats.totalWos}
                          </div>
                          <div className="text-[13px] text-[#6E6E6C] mt-1 font-medium">
                            Mitra Organisasi
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-semibold uppercase text-[#6E6E6C] tracking-widest">
                            Total Pasangan Klien
                          </span>
                          <Users size={18} className="text-[#6E6E6C]" />
                        </div>
                        <div>
                          <div className="text-[42px] font-semibold leading-none text-[#111111] tracking-tight">
                            {globalStats.totalCustomers}
                          </div>
                          <div className="text-[13px] text-[#6E6E6C] mt-1 font-medium">
                            Mempelai terdaftar
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#111111] border border-transparent rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm text-white">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-semibold uppercase text-white/60 tracking-widest">
                            Paket Langganan Aktif
                          </span>
                          <CreditCard size={18} className="text-white" />
                        </div>
                        <div>
                          <div className="text-[42px] font-semibold leading-none text-[#f2ca50] tracking-tight">
                            {globalStats.activeSubscriptions}
                          </div>
                          <div className="text-[13px] text-white/60 mt-1 font-medium">
                            Subscription aktif
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm">
                        <div className="flex justify-between items-start">
                          <span className="text-[11px] font-semibold uppercase text-[#6E6E6C] tracking-widest">
                            Katalog Desain
                          </span>
                          <LayoutDashboard size={18} className="text-[#6E6E6C]" />
                        </div>
                        <div>
                          <div className="text-[42px] font-semibold leading-none text-[#111111] tracking-tight">
                            {globalStats.totalTemplates}
                          </div>
                          <div className="text-[13px] text-[#6E6E6C] mt-1 font-medium">
                            Pilihan tema aktif
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart Section */}
                    {!loading && (
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl p-6 shadow-sm flex flex-col">
                        <div>
                          <h3 className="font-serif text-[#111111] text-lg font-medium mb-1">
                            Grafik Pertumbuhan Registrasi
                          </h3>
                          <p className="text-xs text-[#6E6E6C] mb-6">Tren Pendaftaran Mitra & Klien (6 Bulan Terakhir)</p>

                          <div className="h-64 w-full mt-2">
                            {(() => {
                              const chartData = getMonthlyRegistrationStats()
                              
                              const getPlatformOverviewChartData = () => {
                                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
                                const last6Months: any[] = []
                                const now = new Date()

                                for (let i = 5; i >= 0; i--) {
                                  const d = new Date()
                                  d.setMonth(now.getMonth() - i)
                                  last6Months.push({
                                    monthName: months[d.getMonth()],
                                    year: d.getFullYear(),
                                    monthIndex: d.getMonth(),
                                    wosCount: 0,
                                    clientsCount: 0,
                                  })
                                }

                                allWos.forEach((wo) => {
                                  if (!wo.created_at) return
                                  const date = new Date(wo.created_at)
                                  const match = last6Months.find((m) => m.monthIndex === date.getMonth() && m.year === date.getFullYear())
                                  if (match) match.wosCount++
                                })

                                allCustomers.forEach((c) => {
                                  if (!c.created_at) return
                                  const date = new Date(c.created_at)
                                  const match = last6Months.find((m) => m.monthIndex === date.getMonth() && m.year === date.getFullYear())
                                  if (match) match.clientsCount++
                                })

                                return last6Months
                              }

                              const pChartData = getPlatformOverviewChartData()
                              const growthConfig = {
                                wos: { label: 'Wedding Organizer', color: '#f2ca50' },
                                clients: { label: 'Pasangan Klien', color: '#111111' },
                              } satisfies ChartConfig

                              return (
                                <ChartContainer config={growthConfig} className="h-full w-full">
                                  <AreaChart data={pChartData} margin={{ left: -20, right: 5, top: 10, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id="fillWos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f2ca50" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f2ca50" stopOpacity={0.01} />
                                      </linearGradient>
                                      <linearGradient id="fillClients" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#111111" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#111111" stopOpacity={0.01} />
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E2E2E0" opacity={0.5} />
                                    <XAxis
                                      dataKey="monthName"
                                      tickLine={false}
                                      axisLine={false}
                                      tickMargin={8}
                                      className="text-[10px] font-semibold fill-[#6E6E6C]"
                                    />
                                    <ChartTooltip
                                      cursor={false}
                                      content={
                                        <ChartTooltipContent
                                          labelFormatter={(value) => `Bulan ${value}`}
                                          indicator="dot"
                                        />
                                      }
                                    />
                                    <Area
                                      dataKey="wosCount"
                                      name="wos"
                                      type="monotone"
                                      fill="url(#fillWos)"
                                      stroke="#f2ca50"
                                      strokeWidth={2}
                                      isAnimationActive={false}
                                    />
                                    <Area
                                      dataKey="clientsCount"
                                      name="clients"
                                      type="monotone"
                                      fill="url(#fillClients)"
                                      stroke="#111111"
                                      strokeWidth={2}
                                      isAnimationActive={false}
                                    />
                                    <ChartLegend content={<ChartLegendContent />} />
                                  </AreaChart>
                                </ChartContainer>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. DAFTAR WO TABLE */}
                {activeAdminTab === 'wos' && (
                  <div className="bg-white border border-[#E2E2E0] rounded-2xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-200">
                    <div className="p-5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-[#E2E2E0]">
                      <div className="relative flex-grow max-w-md">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E6C]" />
                        <input
                          type="text"
                          placeholder="Cari Organisasi..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-[#F1F1EF] border border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-[#111111]/10 text-xs text-[#111111] placeholder-[#6E6E6C]/60 h-10"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenCreateWoModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer h-10 shrink-0"
                      >
                        <Plus size={14} />
                        <span>Tambah Organisasi Baru</span>
                      </button>
                    </div>

                    <div className="overflow-auto min-h-[350px]">
                      <Table>
                        <TableHeader className="bg-[#FAF9F6] border-b border-[#E2E2E0]">
                          <TableRow className="border-b border-[#E2E2E0]">
                            <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider pl-6 py-3.5">
                              Nama Organisasi
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider py-3.5">
                              Slug URL
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider py-3.5">
                              Email Kontak
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider text-center py-3.5">
                              Paket Layanan
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider text-center py-3.5">
                              Bergabung
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider pr-6 py-3.5 text-right">
                              Aksi
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-[#E2E2E0]">
                          {allWos.filter(wo => wo.name.toLowerCase().includes(searchQuery.toLowerCase()) || wo.slug.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                            allWos.filter(wo => wo.name.toLowerCase().includes(searchQuery.toLowerCase()) || wo.slug.toLowerCase().includes(searchQuery.toLowerCase())).map((wo) => (
                              <TableRow key={wo.id} className="hover:bg-[#FAF9F6]/50 transition-colors border-b border-[#E2E2E0]">
                                <TableCell className="pl-6 py-4">
                                  <div>
                                    <div className="font-bold text-[#111111] text-[14px]">{wo.name}</div>
                                    <div className="text-[11px] text-[#6E6E6C] mt-0.5 font-medium">{wo.location || 'Lokasi tidak diset'}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4 font-mono text-xs">/admin/{wo.slug}</TableCell>
                                <TableCell className="py-4 font-mono text-xs">{wo.email}</TableCell>
                                <TableCell className="text-center py-4">
                                  <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${wo.plan?.name?.includes('Premium') ? 'bg-[#FFF9C4] text-[#F57F17] border border-[#FFF59D]' : 'bg-[#E2E2E0] text-[#6E6E6C]'}`}>
                                    {wo.plan?.name || 'Free / Demo'}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center text-xs font-semibold text-[#6E6E6C] py-4">
                                  {new Date(wo.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </TableCell>
                                <TableCell className="pr-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => navigateTo(`/admin/${wo.slug}`)}
                                      className="p-1.5 rounded-lg text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer border border-[#E2E2E0]"
                                    >
                                      <ExternalLink size={14} />
                                      <span>Workspace</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingWo(wo)}
                                      className="p-1.5 rounded-lg text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                                      title="Edit Organisasi"
                                    >
                                      <Edit3 size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteWo(wo.id)}
                                      className="p-1.5 rounded-lg text-[#f43f5e] hover:bg-[#fff5f5] transition-colors cursor-pointer"
                                      title="Hapus Organisasi"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-[#6E6E6C] py-16 text-sm">
                                Tidak ada organisasi terdaftar.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* 3. DAFTAR KLIEN GLOBAL TABLE */}
                {activeAdminTab === 'clients' && (
                  <div className="bg-white border border-[#E2E2E0] rounded-2xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-200">
                    <div className="p-5 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-[#E2E2E0]">
                      <div className="relative flex-grow max-w-md">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6E6C]" />
                        <input
                          type="text"
                          placeholder="Cari pasangan pengantin / email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-[#F1F1EF] border border-transparent rounded-xl focus:outline-none focus:ring-1 focus:ring-[#111111]/10 text-xs text-[#111111] placeholder-[#6E6E6C]/60 h-10"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedWoIdForNewClient(allWos[0]?.id || '')
                          setOpenCreateModal(true)
                        }}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-xs rounded-xl shadow-sm hover:shadow transition-all cursor-pointer h-10 shrink-0"
                      >
                        <UserPlus size={14} />
                        <span>Tambah Klien</span>
                      </button>
                    </div>

                    <div className="overflow-auto min-h-[350px]">
                      <Table>
                        <TableHeader className="bg-[#FAF9F6] border-b border-[#E2E2E0]">
                          <TableRow className="border-b border-[#E2E2E0]">
                            <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider pl-6 py-3.5">
                              Pasangan Pengantin
                            </TableHead>
                            <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider py-3.5">
                              Wedding Organizer
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
                            <TableHead className="text-xs font-semibold text-[#6E6E6C] uppercase tracking-wider pr-6 py-3.5 text-right">
                              Aksi
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-[#E2E2E0]">
                          {allCustomers.filter(c => `${c.male_name} ${c.female_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                            allCustomers.filter(c => `${c.male_name} ${c.female_name}`.toLowerCase().includes(searchQuery.toLowerCase()) || c.email.toLowerCase().includes(searchQuery.toLowerCase())).map((cust) => (
                              <TableRow key={cust.id} className="hover:bg-[#FAF9F6]/50 transition-colors border-b border-[#E2E2E0]">
                                <TableCell className="pl-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111] font-bold text-xs shrink-0 select-none">
                                      {cust.male_name ? cust.male_name[0].toUpperCase() : ''}
                                      {cust.female_name ? cust.female_name[0].toUpperCase() : ''}
                                    </div>
                                    <div>
                                      <div className="font-bold text-[#111111] text-[14px]">{cust.male_name} & {cust.female_name}</div>
                                      <div className="text-[11px] text-[#6E6E6C] mt-0.5 font-medium">
                                        Dibuat {new Date(cust.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <span
                                    onClick={() => navigateTo(`/admin/${cust.wo_slug}`)}
                                    className="px-2.5 py-1 text-[11px] font-bold bg-[#FFFDE7] border border-[#FFF59D] text-[#F57F17] hover:bg-[#FFF9C4] rounded-lg cursor-pointer transition-colors"
                                  >
                                    {cust.wo_name}
                                  </span>
                                </TableCell>
                                <TableCell className="py-4 font-mono text-xs">{cust.email}</TableCell>
                                <TableCell className="text-center text-xs font-semibold text-[#111111] py-4">
                                  {cust.wedding_date ? (
                                    new Date(cust.wedding_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                  ) : (
                                    <span className="text-[#6E6E6C]/60 font-normal italic">Belum Diatur</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center text-xs font-bold text-[#111111] font-mono py-4">
                                  {cust.guest_count || 0}
                                </TableCell>
                                <TableCell className="pr-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2.5">
                                    <button
                                      type="button"
                                      onClick={() => navigateTo(`/admin/${cust.wo_slug}/customers/${cust.id}`)}
                                      className="p-1.5 rounded-lg text-[#6E6E6C] hover:text-[#111111] hover:bg-[#FAF9F6] transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer border border-[#E2E2E0]"
                                    >
                                      <Settings size={14} />
                                      <span>Kelola</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCustomer(cust.id)}
                                      className="p-1.5 rounded-lg text-[#f43f5e] hover:bg-[#fff5f5] transition-colors cursor-pointer"
                                      title="Hapus Klien"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-[#6E6E6C] py-16 text-sm">
                                Tidak ada klien pengantin yang cocok.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* 4. PLATFORM ADMIN ACCOUNT SETTINGS */}
                {activeAdminTab === 'settings' && (
                  <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
                    {/* Personal Identity Section */}
                    <section>
                      <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-4">
                        Personal Identity
                      </h3>
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl shadow-sm overflow-hidden">
                        {/* Upper profile header */}
                        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[#E2E2E0]/60">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xl select-none shadow-sm overflow-hidden">
                              {adminUser.avatarUrl ? (
                                <img src={adminUser.avatarUrl} alt={adminUser.name} className="w-full h-full object-cover" />
                              ) : (
                                adminUser.email ? adminUser.email.substring(0, 2).toUpperCase() : 'AD'
                              )}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-[#111111]">{adminUser.name}</h4>
                              <p className="text-xs text-[#6E6E6C] mt-0.5 font-medium">Owner / Administrator</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowEditProfileModal(true)}
                            className="px-4 py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-semibold text-xs rounded-xl cursor-pointer transition-all active:scale-95 shrink-0 shadow-sm"
                          >
                            Edit Profile
                          </button>
                        </div>

                        {/* Lower profile details grid */}
                        <div className="p-6 bg-[#FAF9F6]/30 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-semibold text-[#6E6E6C] uppercase tracking-wider block">Primary Email</span>
                            <div className="text-xs font-mono text-[#111111] bg-white border border-[#E2E2E0] px-4 py-3 rounded-xl shadow-sm">
                              {adminUser.email}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-semibold text-[#6E6E6C] uppercase tracking-wider block">Work Phone</span>
                            <div className={`text-xs bg-white border border-[#E2E2E0] px-4 py-3 rounded-xl shadow-sm ${adminUser.phone ? 'text-[#111111] font-mono' : 'text-[#6E6E6C]/60 italic'}`}>
                              {adminUser.phone || 'Belum dikonfigurasi'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Security Protocol Card */}
                    <section>
                      <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-4">
                        Security Protocol
                      </h3>
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl shadow-sm overflow-hidden divide-y divide-[#E2E2E0]/60">
                        {/* Change Password */}
                        <button
                          type="button"
                          onClick={() => setShowChangePasswordModal(true)}
                          className="w-full p-6 flex items-center justify-between hover:bg-[#FAF9F6]/50 transition-all duration-300 text-left cursor-pointer border-none bg-transparent group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111]">
                              <Settings size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#111111]">
                                Ubah Kata Sandi Utama
                              </h4>
                              <p className="text-xs text-[#6E6E6C] mt-0.5">
                                Perbarui kata sandi utama akun Anda
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-[#6E6E6C]/60 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>

                        {/* Active Sessions */}
                        <div className="p-6 flex items-center justify-between gap-6">
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
                            className="px-3.5 py-2 bg-transparent border border-[#E2E2E0] hover:bg-[#FAF9F6] text-[#111111] font-semibold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    </section>
                  </div>
                )}
              </>
            ) : (
              <>
                {isPlatformAdmin && slug_wo && (
                  <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-amber-900">Mode Platform Admin</h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Anda sedang mengelola workspace untuk Wedding Organizer <span className="font-semibold text-amber-955">{woProfile.name}</span>.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo('/admin')}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl cursor-pointer transition-all hover:shadow-md flex items-center gap-2 active:scale-95 shrink-0"
                    >
                      <ArrowLeft size={13} />
                      Kembali ke Platform Console
                    </button>
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
                                navigateTo(`/admin/${slug_wo}/customers/${cust.id}`)
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
                                    navigateTo(`/admin/${slug_wo}/customers/${cust.id}`)
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
                                          href={`/${slug_wo}/${cust.slug}`}
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

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCustomer(cust.id)}
                                        className="p-1.5 rounded-lg text-[#f43f5e] hover:bg-[#fff5f5] hover:text-[#e11d48] transition-colors cursor-pointer"
                                        title="Hapus Klien"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="py-16 text-center select-none"
                                >
                                  {customers.length === 0 ? (
                                    <div className="max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
                                      <div className="w-16 h-16 rounded-2xl bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#6E6E6C] mb-5 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                        <Users size={32} className="stroke-[1.5]" />
                                      </div>
                                      <h3 className="text-base font-semibold text-[#111111] mb-2 tracking-tight">
                                        Mulai Kelola Klien Baru
                                      </h3>
                                      <p className="text-xs text-[#6E6E6C] mb-6 leading-relaxed max-w-sm mx-auto">
                                        Anda belum memiliki klien terdaftar. Tambahkan klien atau pasangan pengantin pertama Anda untuk mulai membuat website undangan pernikahan yang premium.
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => setOpenCreateModal(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#111111] hover:bg-[#2A2A28] text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow transition-all duration-300 transform active:scale-95 cursor-pointer"
                                      >
                                        <Plus size={14} />
                                        <span>Tambah Klien Pertama</span>
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="max-w-md mx-auto flex flex-col items-center justify-center p-6 text-center">
                                      <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#6E6E6C] mb-4">
                                        <Search size={24} className="stroke-[1.5]" />
                                      </div>
                                      <h3 className="text-sm font-semibold text-[#111111] mb-1.5">
                                        Pencarian Tidak Ditemukan
                                      </h3>
                                      <p className="text-xs text-[#6E6E6C] mb-5 max-w-[280px] mx-auto leading-relaxed">
                                        Tidak ada klien yang cocok dengan kata kunci "{searchQuery}" atau filter tanggal yang dipilih.
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSearchQuery('')
                                          setDateFilter('all')
                                          setCurrentPage(1)
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E2E2E0] bg-white hover:bg-[#FAF9F6] text-[#6E6E6C] hover:text-[#111111] text-xs font-semibold rounded-lg shadow-sm transition-all duration-200 cursor-pointer"
                                      >
                                        <X size={12} />
                                        <span>Reset Filter & Pencarian</span>
                                      </button>
                                    </div>
                                  )}
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
                    Profil Organisasi
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

                {settingsSubTab === 'profile' && (
                  <div className="space-y-8 animate-in fade-in duration-200">
                    {/* Personal Identity Section */}
                    <section>
                      <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-4">
                        Personal Identity
                      </h3>
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl shadow-sm overflow-hidden">
                        {/* Upper profile header */}
                        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-[#E2E2E0]/60">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xl select-none shadow-sm overflow-hidden">
                              {adminUser.avatarUrl ? (
                                <img src={adminUser.avatarUrl} alt={adminUser.name} className="w-full h-full object-cover" />
                              ) : (
                                adminUser.email ? adminUser.email.substring(0, 2).toUpperCase() : 'AD'
                              )}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-[#111111]">{adminUser.name}</h4>
                              <p className="text-xs text-[#6E6E6C] mt-0.5 font-medium">Owner / Administrator</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowEditProfileModal(true)}
                            className="px-4 py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-semibold text-xs rounded-xl cursor-pointer transition-all active:scale-95 shrink-0 shadow-sm"
                          >
                            Edit Profile
                          </button>
                        </div>

                        {/* Lower profile details grid */}
                        <div className="p-6 bg-[#FAF9F6]/30 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-semibold text-[#6E6E6C] uppercase tracking-wider block">Primary Email</span>
                            <div className="text-xs font-mono text-[#111111] bg-white border border-[#E2E2E0] px-4 py-3 rounded-xl shadow-sm">
                              {adminUser.email}
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-semibold text-[#6E6E6C] uppercase tracking-wider block">Work Phone</span>
                            <div className={`text-xs bg-white border border-[#E2E2E0] px-4 py-3 rounded-xl shadow-sm ${adminUser.phone ? 'text-[#111111] font-mono' : 'text-[#6E6E6C]/60 italic'}`}>
                              {adminUser.phone || 'Belum dikonfigurasi'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Security Protocol Card */}
                    <section>
                      <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest mb-4">
                        Security Protocol
                      </h3>
                      <div className="bg-white border border-[#E2E2E0] rounded-2xl shadow-sm overflow-hidden divide-y divide-[#E2E2E0]/60">
                        {/* Change Password */}
                        <button
                          type="button"
                          onClick={() => setShowChangePasswordModal(true)}
                          className="w-full p-6 flex items-center justify-between hover:bg-[#FAF9F6]/50 transition-all duration-300 text-left cursor-pointer border-none bg-transparent group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E2E2E0] flex items-center justify-center text-[#111111]">
                              <Settings size={16} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-[#111111]">
                                Ubah Kata Sandi Utama
                              </h4>
                              <p className="text-xs text-[#6E6E6C] mt-0.5">
                                Perbarui kata sandi utama akun Anda
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-[#6E6E6C]/60 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>

                        {/* Active Sessions */}
                        <div className="p-6 flex items-center justify-between gap-6">
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
                            className="px-3.5 py-2 bg-transparent border border-[#E2E2E0] hover:bg-[#FAF9F6] text-[#111111] font-semibold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* Deactivate Account */}
                    <section>
                      <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-sm">
                        <div>
                          <h4 className="text-sm font-bold text-[#C62828]">Nonaktifkan Akun</h4>
                          <p className="text-xs text-[#C62828]/80 mt-0.5">
                            Hapus semua akses administratif secara permanen.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            showConfirm({
                              title: 'Apakah Anda yakin?',
                              description:
                                'Tindakan ini tidak dapat dibatalkan. Akun Anda akan dinonaktifkan secara permanen.',
                              destructive: true,
                              onConfirm: () => {
                                setStatusAlert({
                                  type: 'error',
                                  message: 'Tindakan dinonaktifkan untuk akun demo.',
                                })
                              },
                            })
                          }}
                          className="px-4 py-2.5 bg-[#C62828] hover:bg-[#B71C1C] text-white font-semibold text-xs rounded-xl cursor-pointer transition-all active:scale-95 shrink-0 shadow-sm"
                        >
                          Nonaktifkan
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
                            Nama Organisasi
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
                            Email Resmi Organisasi
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
                            Slug URL Organisasi
                          </label>
                          <input
                            type="text"
                            id="woSlugInput"
                            name="woSlug"
                            defaultValue={woProfile.slug}
                            onChange={(e) => {
                              let value = e.target.value
                              value = value.toLowerCase().replace(/[^a-z0-9\s-]/g, '')
                              value = value.replace(/\s+/g, '-')
                              e.target.value = value
                            }}
                            onBlur={(e) => {
                              let value = e.target.value
                              value = value.trim().toLowerCase()
                              value = value.replace(/[^a-z0-9-]/g, '')
                              value = value.replace(/-+/g, '-')
                              value = value.replace(/^-|-$/g, '')
                              e.target.value = value
                            }}
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
                            Organisasi Anda menggunakan akses gratis percobaan. Pilih paket di bawah untuk
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
                              Untuk bisnis perorangan yang baru memulai
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
          </>
        )}


            {/* Create Client Modal */}
            <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
              <DialogContent className="rounded-2xl border-[#E2E2E0] bg-white max-w-md p-8">
                <DialogHeader className="mb-6">
                  <DialogTitle className="font-serif text-[#111111] text-xl font-medium">
                    Tambah Klien Baru
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateCustomerSubmit} className="space-y-4">
                  {isPlatformAdmin && (
                    <div>
                      <label
                        htmlFor="selectedWoIdForNewClient"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Wedding Organizer Pemilik
                      </label>
                      <select
                        id="selectedWoIdForNewClient"
                        value={selectedWoIdForNewClient}
                        onChange={(e) => setSelectedWoIdForNewClient(e.target.value)}
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 text-sm bg-white"
                        style={{ height: '38px' }}
                        required
                      >
                        <option value="">Pilih Wedding Organizer...</option>
                        {allWos.map((wo) => (
                          <option key={wo.id} value={wo.id}>
                            {wo.name} ({wo.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

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
              </DialogContent>
            </Dialog>

            {/* Create WO Modal */}
            <Dialog open={openCreateWoModal} onOpenChange={setOpenCreateWoModal}>
              <DialogContent className="rounded-2xl border-[#E2E2E0] bg-white max-w-md p-8">
                <DialogHeader className="mb-6">
                  <DialogTitle className="font-serif text-[#111111] text-xl font-medium flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-500" />
                    Daftarkan WO Baru
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreateWoSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="woName"
                      className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                    >
                      Nama Wedding Organizer
                    </label>
                    <input
                      type="text"
                      id="woName"
                      name="name"
                      className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 transition-all text-sm"
                      placeholder="Contoh: Royal Wedding Organizer"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="woEmail"
                      className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                    >
                      Email Kontak WO
                    </label>
                    <input
                      type="email"
                      id="woEmail"
                      name="email"
                      className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 transition-all text-sm"
                      placeholder="wo@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="woLocation"
                      className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                    >
                      Lokasi / Kota
                    </label>
                    <input
                      type="text"
                      id="woLocation"
                      name="location"
                      className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 transition-all text-sm"
                      placeholder="Contoh: Jakarta"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="woPlan"
                      className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                    >
                      Paket Langganan
                    </label>
                    <select
                      id="woPlan"
                      name="planId"
                      className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 text-sm bg-white"
                      style={{ height: '38px' }}
                    >
                      <option value="">Tanpa Paket / Free</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Rp {p.price?.toLocaleString('id-ID') || 0})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm rounded-lg transition-colors cursor-pointer mt-6"
                  >
                    <Save size={16} />
                    Daftarkan WO
                  </button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit WO Modal */}
            <Dialog open={editingWo !== null} onOpenChange={(open) => { if (!open) setEditingWo(null); }}>
              <DialogContent className="rounded-2xl border-[#E2E2E0] bg-white max-w-md p-8">
                <DialogHeader className="mb-6">
                  <DialogTitle className="font-serif text-[#111111] text-xl font-medium flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-amber-500" />
                    Ubah Detail WO
                  </DialogTitle>
                </DialogHeader>

                {editingWo && (
                  <form onSubmit={handleUpdateWoDetails} className="space-y-4">
                    <div>
                      <label
                        htmlFor="editWoName"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Nama Wedding Organizer
                      </label>
                      <input
                        type="text"
                        id="editWoName"
                        name="name"
                        defaultValue={editingWo.name}
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 transition-all text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="editWoSlug"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Slug URL WO
                      </label>
                      <input
                        type="text"
                        id="editWoSlug"
                        name="slug"
                        defaultValue={editingWo.slug}
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 transition-all text-sm font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="editWoEmail"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Email Kontak WO
                      </label>
                      <input
                        type="email"
                        id="editWoEmail"
                        name="email"
                        defaultValue={editingWo.email}
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 transition-all text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="editWoLocation"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Lokasi / Kota
                      </label>
                      <input
                        type="text"
                        id="editWoLocation"
                        name="location"
                        defaultValue={editingWo.location || ''}
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 transition-all text-sm"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="editWoPlan"
                        className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
                      >
                        Paket Langganan
                      </label>
                      <select
                        id="editWoPlan"
                        name="planId"
                        defaultValue={editingWo.plan_id || ''}
                        className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] focus:ring-2 focus:ring-[#111111]/5 text-sm bg-white"
                        style={{ height: '38px' }}
                      >
                        <option value="">Tanpa Paket / Free</option>
                        {plans.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Rp {p.price?.toLocaleString('id-ID') || 0})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[#111111] hover:bg-[#333333] text-[#FAF9F6] font-semibold text-sm rounded-lg transition-colors cursor-pointer mt-6"
                    >
                      <Save size={16} />
                      Simpan Perubahan
                    </button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          // ==========================================
          // CLIENT SCOPED WORKSPACE VIEW (Tabs UI)
          // ==========================================
          <div className="px-4 sm:px-6 md:px-8 py-5 md:py-8 max-w-[1400px] mx-auto w-full">
            {isPlatformAdmin && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm animate-in fade-in slide-in-from-top duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Mode Platform Admin</h4>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Anda sedang mengelola klien <span className="font-semibold text-amber-950">{selectedCustomer?.male_name} & {selectedCustomer?.female_name}</span> secara langsung.
                    </p>
                  </div>
                </div>
                 <button
                  type="button"
                  onClick={() => {
                    if (window.history.state && window.history.state.idx > 0) {
                      navigate(-1)
                    } else {
                      navigateTo('/admin')
                    }
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl cursor-pointer transition-all hover:shadow-md flex items-center gap-2 active:scale-95 shrink-0"
                >
                  <ArrowLeft size={13} />
                  Kembali ke Platform Console
                </button>
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
                        <div className="w-full">
                          {/* Mempelai Pria */}
                          <div className={formSection === 'groom' ? "space-y-6" : "hidden"}>
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
                          </div>

                          {/* Mempelai Wanita */}
                          <div className={formSection === 'bride' ? "space-y-6" : "hidden"}>
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
                          </div>

                          {/* Waktu & Lokasi */}
                          <div className={formSection === 'event' ? "space-y-6" : "hidden"}>
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
                          </div>


                           {/* Tanda Kasih Digital */}
                          <div className={formSection === 'gift' ? "space-y-6" : "hidden"}>
                            <div>
                              <div className="flex items-start md:items-center justify-between mb-6 gap-4 flex-col md:flex-row">
                                <div>
                                  <h3 className="text-[11px] font-semibold text-[#6E6E6C] uppercase tracking-widest">
                                    Payment Methods
                                  </h3>
                                  <p className="text-xs text-[#6E6E6C] mt-1 leading-relaxed">
                                    Configure up to 2 receiving accounts for digital gifts from your guests.
                                  </p>
                                </div>
                                {paymentMethods.length < 2 && (
                                  <button
                                    type="button"
                                    onClick={handleAddPaymentMethod}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded-xl transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
                                  >
                                    <Plus size={12} />
                                    <span>Add Method</span>
                                  </button>
                                )}
                              </div>

                              {/* Hidden form fields for compatibility with handleUpdateMetadata */}
                              <input type="hidden" name="bankName" value={paymentMethods[0]?.name || ''} />
                              <input type="hidden" name="bankAccountNumber" value={paymentMethods[0]?.number || ''} />
                              <input type="hidden" name="bankAccountHolder" value={paymentMethods[0]?.holder || ''} />
                              <input type="hidden" name="walletName" value={paymentMethods[1]?.name || ''} />
                              <input type="hidden" name="walletNumber" value={paymentMethods[1]?.number || ''} />
                              <input type="hidden" name="walletHolder" value={paymentMethods[1]?.holder || ''} />

                              {paymentMethods.length === 0 ? (
                                <div 
                                  onClick={handleAddPaymentMethod}
                                  className="border-2 border-dashed border-[#E2E2E0] hover:border-[#111111]/30 bg-[#FAF9F6]/30 hover:bg-[#FAF9F6]/60 rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 group"
                                >
                                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E2E0] flex items-center justify-center text-[#6E6E6C] mx-auto mb-4 group-hover:scale-105 transition-transform">
                                    <CreditCard size={20} className="stroke-[1.5]" />
                                  </div>
                                  <span className="block text-sm font-semibold text-[#111111] mb-1">
                                    No Payment Methods Configured
                                  </span>
                                  <span className="block text-xs text-[#6E6E6C] max-w-xs mx-auto leading-relaxed">
                                    Click here to add a bank transfer or digital wallet as a receiving account.
                                  </span>
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 gap-5">
                                  {paymentMethods.map((method, index) => (
                                    <div 
                                      key={index} 
                                      className="border border-[#E2E2E0] bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
                                    >
                                      {/* Card Header */}
                                      <div className="flex items-center justify-between px-6 py-3.5 bg-[#FAF9F6] border-b border-[#E2E2E0]">
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E2E0] flex items-center justify-center">
                                            {method.type === 'bank' ? (
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#111111]">
                                                <rect x="1" y="20" width="22" height="2" rx="1" />
                                                <path d="M12 2L2 8h20L12 2z" />
                                                <path d="M4 8v12" /><path d="M8 8v12" /><path d="M12 8v12" /><path d="M16 8v12" /><path d="M20 8v12" />
                                              </svg>
                                            ) : (
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#111111]">
                                                <rect x="2" y="5" width="20" height="14" rx="2" />
                                                <line x1="2" y1="10" x2="22" y2="10" />
                                              </svg>
                                            )}
                                          </div>
                                          <span className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">
                                            {method.type === 'bank' ? 'Bank Transfer' : 'Digital Wallet'} · #{index + 1}
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemovePaymentMethod(index)}
                                          className="p-1.5 text-[#6E6E6C] hover:text-[#EF4444] hover:bg-white border border-transparent hover:border-red-200 rounded-lg transition-all cursor-pointer"
                                          title="Remove"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>

                                      {/* Card Body */}
                                      <div className="p-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                          <div>
                                            <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                              Channel Type
                                            </label>
                                            <Select
                                              value={method.type}
                                              onValueChange={(val) => handleUpdatePaymentMethod(index, 'type', val)}
                                            >
                                              <SelectTrigger className="w-full h-10 bg-[#FAF9F6] border-[#E2E2E0] rounded-xl text-[16px] md:text-sm focus:ring-0 focus:ring-offset-0 focus:border-[#111111] transition-all cursor-pointer">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent className="rounded-xl border border-[#E2E2E0] bg-white shadow-md">
                                                <SelectItem value="bank" className="text-sm cursor-pointer">Bank Transfer</SelectItem>
                                                <SelectItem value="wallet" className="text-sm cursor-pointer">Digital Wallet (E-Wallet)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div>
                                            <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                              {method.type === 'bank' ? 'Bank Provider' : 'Wallet Provider'}
                                            </label>
                                            <Combobox
                                              options={method.type === 'bank' ? bankOptions : walletOptions}
                                              value={method.name}
                                              onValueChange={(val) => handleUpdatePaymentMethod(index, 'name', val)}
                                              placeholder={method.type === 'bank' ? 'Select bank...' : 'Select wallet...'}
                                              searchPlaceholder={method.type === 'bank' ? 'Search bank...' : 'Search wallet...'}
                                            />
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                                          <div>
                                            <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                              {method.type === 'bank' ? 'Account Number' : 'Phone / Account ID'}
                                            </label>
                                            <input
                                              type="text"
                                              value={method.number}
                                              onChange={(e) => handleUpdatePaymentMethod(index, 'number', e.target.value)}
                                              placeholder={method.type === 'bank' ? 'e.g. 8098273618' : 'e.g. 08123456789'}
                                              className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-[16px] md:text-sm transition-all placeholder-[#6E6E6C]/50"
                                            />
                                          </div>

                                          <div>
                                            <label className="block text-[10px] font-semibold text-[#111111] mb-1.5 uppercase tracking-wider">
                                              Account Holder Name
                                            </label>
                                            <input
                                              type="text"
                                              value={method.holder}
                                              onChange={(e) => handleUpdatePaymentMethod(index, 'holder', e.target.value)}
                                              placeholder="Full name as registered"
                                              className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#E2E2E0] rounded-xl focus:outline-none focus:border-[#111111] focus:bg-white text-[16px] md:text-sm transition-all placeholder-[#6E6E6C]/50"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}

                                  {paymentMethods.length < 2 && (
                                    <button
                                      type="button"
                                      onClick={handleAddPaymentMethod}
                                      className="border border-dashed border-[#E2E2E0] hover:border-[#111111]/30 bg-[#FAF9F6]/10 hover:bg-[#FAF9F6]/40 rounded-2xl py-4 flex items-center justify-center gap-2 text-xs font-semibold text-[#6E6E6C] hover:text-[#111111] transition-all duration-200 cursor-pointer"
                                    >
                                      <Plus size={14} />
                                      <span>Add Another Payment Method</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Pengaturan Tambahan */}
                          <div className={formSection === 'additional' ? "space-y-6" : "hidden"}>
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

                              {/* Danger Zone */}
                              <div className="mt-8 pt-8 border-t border-[#E2E2E0]/80">
                                <h5 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                                  Zona Bahaya
                                </h5>
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                  <div className="space-y-1">
                                    <p className="text-xs font-bold text-[#111111]">
                                      Hapus Klien Ini
                                    </p>
                                    <p className="text-[11px] text-[#6E6E6C]">
                                      Setelah dihapus, seluruh data klien ini termasuk undangan, kisah cinta, galeri pre-wedding, dan konfirmasi kehadiran (RSVP) akan dihapus secara permanen dan tidak dapat dipulihkan.
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomer(selectedCustomerId!)}
                                    className="px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs rounded-xl cursor-pointer transition-colors active:scale-95 shrink-0"
                                  >
                                    Hapus Klien Permanen
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
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
                        {galleries.length > 0 && galleries.length < 3 && (
                          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2 shadow-sm animate-pulse">
                            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                              <span className="font-semibold">Jumlah Foto Belum Valid:</span> Galeri foto harus kosong (0 foto) atau memiliki minimal 3 foto agar tampil sempurna di undangan. Saat ini terdapat {galleries.length} foto.
                            </div>
                          </div>
                        )}
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
                                        const url = `${window.location.origin}/${slug_wo}/${invitation ? invitation.slug : selectedCustomer?.id}?to=${encodeURIComponent(guest.name)}`
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

      {/* Edit Profile Modal */}
      <Dialog open={showEditProfileModal} onOpenChange={(open) => {
        if (!open) {
          setShowEditProfileModal(false);
          setShouldDeleteAvatar(false);
        }
      }}>
        <DialogContent className="rounded-2xl border-[#E2E2E0] bg-white max-w-md p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-serif text-[#111111] text-xl font-medium">
              Edit Profil
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateAdminProfile} className="space-y-4">
            {/* Profile Photo Upload */}
            <div className="flex items-center gap-4 py-2 border-b border-[#E2E2E0]/60 mb-4">
              <div className="relative w-16 h-16 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xl select-none shadow-sm overflow-hidden shrink-0">
                {adminUser.avatarUrl && !shouldDeleteAvatar ? (
                  <img src={adminUser.avatarUrl} alt={adminUser.name} className="w-full h-full object-cover" />
                ) : (
                  adminUser.email ? adminUser.email.substring(0, 2).toUpperCase() : 'AD'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-semibold text-[#111111] uppercase tracking-wider mb-1">
                  Foto Profil
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    name="adminAvatar"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setShouldDeleteAvatar(false);
                      }
                    }}
                    className="block w-full text-xs text-[#6E6E6C] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#111111] file:text-white hover:file:bg-[#333333] file:cursor-pointer transition-colors"
                  />
                  {adminUser.avatarUrl && !shouldDeleteAvatar && (
                    <button
                      type="button"
                      onClick={() => setShouldDeleteAvatar(true)}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold border border-red-200 transition-colors cursor-pointer shrink-0"
                      title="Hapus foto profil"
                    >
                      Hapus
                    </button>
                  )}
                  {shouldDeleteAvatar && (
                    <button
                      type="button"
                      onClick={() => setShouldDeleteAvatar(false)}
                      className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-[#111111] rounded-lg text-xs font-semibold border border-[#E2E2E0] transition-colors cursor-pointer shrink-0"
                    >
                      Batal Hapus
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-[#6E6E6C] mt-1">Format: JPG, PNG, WebP. Maks 10MB.</p>
              </div>
            </div>

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
              <label
                htmlFor="adminPhoneInput"
                className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
              >
                No. Telepon / WhatsApp
              </label>
              <input
                type="tel"
                id="adminPhoneInput"
                name="adminPhone"
                defaultValue={adminUser.phone}
                placeholder="Contoh: 081234567890"
                className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] text-sm"
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
                disabled={isSavingProfile}
                className="px-4 py-2 bg-transparent border border-[#E2E2E0] hover:bg-[#FAF9F6] text-[#6E6E6C] text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-4 py-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isSavingProfile ? (
                  <>
                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-0.5"></span>
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showChangePasswordModal} onOpenChange={setShowChangePasswordModal}>
        <DialogContent className="rounded-2xl border-[#E2E2E0] bg-white max-w-md p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="font-serif text-[#111111] text-xl font-medium">
              Ubah Kata Sandi Utama
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  htmlFor="oldPasswordInput"
                  className="block text-xs font-semibold text-[#111111] uppercase tracking-wider"
                >
                  Kata Sandi Lama
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[11px] text-[#6E6E6C] hover:text-[#111111] underline cursor-pointer bg-transparent border-none p-0 transition-colors"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <input
                type="password"
                id="oldPasswordInput"
                name="oldPassword"
                placeholder="Masukkan kata sandi lama Anda"
                className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="newPasswordInput"
                className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
              >
                Kata Sandi Baru
              </label>
              <input
                type="password"
                id="newPasswordInput"
                name="newPassword"
                placeholder="Minimal 6 karakter"
                className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="confirmPasswordInput"
                className="block text-xs font-semibold text-[#111111] mb-1.5 uppercase tracking-wider"
              >
                Konfirmasi Kata Sandi Baru
              </label>
              <input
                type="password"
                id="confirmPasswordInput"
                name="confirmPassword"
                placeholder="Ulangi kata sandi baru"
                className="w-full px-4 py-2 border border-[#E2E2E0] rounded-lg focus:outline-none focus:border-[#111111] text-sm"
                required
              />
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(false)}
                disabled={isChangingPassword}
                className="px-4 py-2 bg-transparent border border-[#E2E2E0] hover:bg-[#FAF9F6] text-[#6E6E6C] text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isChangingPassword}
                className="px-4 py-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer active:scale-95 disabled:opacity-55 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isChangingPassword ? (
                  <>
                    <span className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-0.5"></span>
                    Memperbarui...
                  </>
                ) : (
                  'Ubah Kata Sandi'
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Premium Glassmorphic Toast Notification Overlay */}
      {toastInfo && (
        <div className={`fixed bottom-6 right-6 z-[9999] ${toastAnimationClass}`}>
          <div className="flex items-center gap-3 bg-[#111111]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.24)] pl-4.5 pr-11 py-3.5 max-w-sm relative select-none">
            {toastInfo.type === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-[#4ADE80]/15 flex items-center justify-center shrink-0">
                <CheckCircle size={14} className="text-[#4ADE80]" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#F87171]/15 flex items-center justify-center shrink-0">
                <XCircle size={14} className="text-[#F87171]" />
              </div>
            )}

            <p className="text-xs font-semibold text-white/95 leading-normal tracking-tight">
              {toastInfo.message}
            </p>

            <button
              type="button"
              onClick={closeToast}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-transparent hover:bg-white/10 border-none text-white/40 hover:text-white transition-all cursor-pointer flex items-center justify-center active:scale-90"
              title="Tutup"
            >
              <X size={13} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
