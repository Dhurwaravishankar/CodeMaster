import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using demo mode.')
  console.warn('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file')
  console.warn('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'Missing')
  console.warn('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing')
}

// Use placeholder values if environment variables are missing (for demo purposes)
const finalUrl = supabaseUrl || 'https://demo.supabase.co'
const finalKey = supabaseAnonKey || 'demo-key'

export const supabase = createClient(finalUrl, finalKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Database types
export interface User {
  id: string
  name: string
  email: string
  userId: string
  created_at?: string
  updated_at?: string
}

export interface Contest {
  id: string
  title: string
  description: string
  date: string
  start_time: string
  duration: string
  type: string
  status: 'upcoming' | 'active' | 'completed'
  created_by: string
  created_at: string
  updated_at: string
}

// User table operations
export const userOperations = {
  // Fetch all users
  async getAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching users:', error)
      throw error
    }
    
    return data || []
  },

  // Insert new user
  async insertUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    if (error) {
      console.error('Error inserting user:', error)
      throw error
    }
    
    return data
  },

  // Get user by userId (auth.user.id)
  async getUserByUserId(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('userId', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user by userId:', error)
      throw error
    }
    
    return data || null
  },

  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating user:', error)
      throw error
    }
    
    return data
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }
}