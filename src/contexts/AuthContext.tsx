import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '@/types'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
    logout: () => Promise<void>
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>(null!)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Supabase session'ı kontrol et
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    role: 'admin', // Default role, profiles tablosundan çekilebilir
                    created_at: session.user.created_at
                } as User)
            }
            setIsLoading(false)
        })

        // Auth state değişikliklerini dinle
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email,
                    role: 'admin',
                    created_at: session.user.created_at
                } as User)
            } else {
                setUser(null)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) throw error

            if (data.user) {
                setUser({
                    id: data.user.id,
                    email: data.user.email,
                    role: 'admin',
                    created_at: data.user.created_at
                } as User)
                return true
            }
            return false
        } catch (error) {
            console.error('Login error:', error)
            return false
        }
    }

    const logout = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    // Loading state sırasında hiçbir şey render etme
    if (isLoading) {
        return null
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
