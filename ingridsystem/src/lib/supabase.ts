import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jlpzacknodgrmpkhckga.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpscHphY2tub2Rncm1wa2hja2dhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3OTM2MzIsImV4cCI6MjA5MTM2OTYzMn0.BAVX60PcjPE6OTjfwgEGMKRjEbqAHGiFLz_bQnC2wzI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
