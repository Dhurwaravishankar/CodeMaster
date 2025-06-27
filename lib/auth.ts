import { supabase } from './supabase'
import type { Database } from './database.types'

type User = Database['public']['Tables']['users']['Row']

interface SignupData {
  name: string
  email: string
  password: string
  role: 'user' | 'admin'
  adminCode?: string
}

interface LoginData {
  email: string
  password: string
}

export async function createUserAccount(data: SignupData): Promise<User> {
  try {
    // Validate admin code if role is admin
    if (data.role === 'admin' && data.adminCode !== '123456') {
      throw new Error('Invalid admin code')
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
          role: data.role
        }
      }
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: data.role,
      })
      .select()
      .single()

    if (userError) {
      console.error('User profile creation error:', userError)
      // If user profile creation fails, still return the auth user data
      return {
        id: authData.user.id,
        email: data.email,
        name: data.name,
        role: data.role,
        image: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    return userData
  } catch (error) {
    console.error('Account creation error:', error)
    throw error
  }
}

export async function loginUser(data: LoginData): Promise<User> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to login')
    }

    // Get user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (userError) {
      console.error('User profile fetch error:', userError)
      // If user profile doesn't exist, create it
      const { data: newUserData, error: createError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.user_metadata?.full_name || authData.user.email!.split('@')[0],
          role: 'user',
          image: authData.user.user_metadata?.avatar_url
        })
        .select()
        .single()

      if (createError) {
        console.error('User profile creation error:', createError)
        // Return minimal user data
        return {
          id: authData.user.id,
          email: authData.user.email!,
          name: authData.user.user_metadata?.full_name || authData.user.email!.split('@')[0],
          role: 'user',
          image: authData.user.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      return newUserData
    }

    return userData
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export async function loginWithGoogle(): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Google login error:', error)
    throw error
  }
}

export async function logoutUser(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return null
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Get current user error:', error)
      // If user profile doesn't exist, create it
      const { data: newUserData, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.full_name || user.email!.split('@')[0],
          role: 'user',
          image: user.user_metadata?.avatar_url
        })
        .select()
        .single()

      if (createError) {
        console.error('User profile creation error:', createError)
        return null
      }

      return newUserData
    }

    return userData
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}