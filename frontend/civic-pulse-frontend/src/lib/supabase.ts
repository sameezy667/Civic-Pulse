import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export const uploadImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const { error } = await supabase.storage
    .from('report-images')
    .upload(fileName, file)
  
  if (error) throw error
  
  const { data: { publicUrl } } = supabase.storage
    .from('report-images')
    .getPublicUrl(fileName)
  
  return publicUrl
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
  
  // Check if user is admin based on email or metadata
  const isAdmin = email.includes('admin') || data.user?.user_metadata?.role === 'admin'
  
  // Update user metadata with role if admin
  if (isAdmin && data.user) {
    await supabase.auth.updateUser({
      data: { role: 'admin' }
    })
  }
  
  return data
}

export const signUp = async (email: string, password: string, name: string, role?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        name,
        full_name: name,
        role: role || 'client'
      }
    }
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Types for the reports database
export interface Report {
  id: string
  title: string
  description: string
  category: string
  latitude: number | null
  longitude: number | null
  address: string | null
  image_url: string | null
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
  user_id: string
}

// Report operations
export const createReport = async (report: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'status'>) => {
  const { data, error } = await supabase
    .from('reports')
    .insert([{
      ...report,
      status: 'open'
    }])
    .select()
  
  if (error) throw error
  return data[0]
}

export const fetchReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const fetchUserReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const updateReportStatus = async (id: string, status: Report['status']) => {
  const { data, error } = await supabase
    .from('reports')
    .update({ status })
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}
