export interface TeamMember {
  id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'collaborator' | 'freelancer'
  avatar_url?: string
  phone?: string
  specialty?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  instagram?: string
  facebook?: string
  tiktok?: string
  service_types: string[]
  status: 'active' | 'inactive' | 'paused'
  monthly_value: number
  ads_budget: number
  contract_start?: string
  contract_end?: string
  notes?: string
  avatar_url?: string
  color: string
  created_at: string
  updated_at: string
}

export interface ContentPiece {
  id: string
  client_id: string
  title: string
  content_type: 'story' | 'feed' | 'reel' | 'social_media'
  platforms: string[]
  status: 'raw_uploaded' | 'approved_raw' | 'edited_uploaded' | 'approved' | 'scheduled' | 'posted'
  raw_url?: string
  edited_url?: string
  thumbnail_url?: string
  caption?: string
  hashtags: string[]
  scheduled_date?: string
  posted_date?: string
  uploaded_by?: string
  approved_by?: string
  approved_at?: string
  notes?: string
  duration_seconds?: number
  file_size_mb?: number
  created_at: string
  updated_at: string
  client?: Client
  uploader?: TeamMember
}

export interface Campaign {
  id: string
  client_id: string
  name: string
  platform: 'meta' | 'google'
  objective?: string
  status: 'active' | 'paused' | 'ended' | 'draft'
  budget: number
  budget_period: 'daily' | 'monthly'
  start_date?: string
  end_date?: string
  impressions: number
  clicks: number
  conversions: number
  spend: number
  ctr: number
  cpc: number
  cpm: number
  roas: number
  reach: number
  notes?: string
  campaign_id_external?: string
  created_at: string
  updated_at: string
  client?: Client
}

export interface Task {
  id: string
  title: string
  description?: string
  client_id?: string
  assigned_to?: string
  created_by?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
  completed_at?: string
  attachments: Attachment[]
  tags: string[]
  created_at: string
  updated_at: string
  client?: Client
  assignee?: TeamMember
}

export interface Attachment {
  name: string
  url: string
  size: number
  type: string
  uploaded_at: string
}

export interface FinancialRecord {
  id: string
  client_id: string
  type: 'invoice' | 'payment' | 'expense'
  description?: string
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date?: string
  paid_date?: string
  payment_method?: string
  reference_month?: string
  notes?: string
  created_at: string
  updated_at: string
  client?: Client
}

export interface Meeting {
  id: string
  title: string
  client_id?: string
  participants: string[]
  meeting_date: string
  duration_minutes: number
  location?: string
  meeting_link?: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  created_by?: string
  created_at: string
  updated_at: string
  client?: Client
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message?: string
  read: boolean
  related_id?: string
  related_type?: string
  action_url?: string
  created_at: string
}

export interface Partnership {
  id: string
  name: string
  type: string
  email?: string
  phone?: string
  instagram?: string
  payment_type: 'fixed' | 'per_project' | 'hourly'
  rate: number
  portfolio_url?: string
  notes?: string
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export type Priority = 'low' | 'medium' | 'high' | 'urgent'
export type ContentStatus = 'raw_uploaded' | 'approved_raw' | 'edited_uploaded' | 'approved' | 'scheduled' | 'posted'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type FinancialStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'
export type ClientStatus = 'active' | 'inactive' | 'paused'
