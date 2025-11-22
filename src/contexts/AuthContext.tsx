import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '@/types'
import { pb } from '@/lib/pocketbase'

interface AuthContextType {
    user: User | null
    login: (username: string, password: string) => Promise<boolean>
    logout: () => void
    isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>(null!)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // PocketBase authStore'dan mevcut kullanıcıyı yükle
        const authData = pb.authStore.model
        if (authData && pb.authStore.isValid) {
            setUser(authData as User)
        }
        setIsLoading(false)

        // Auth state değişikliklerini dinle
        const unsubscribe = pb.authStore.onChange((_token, model) => {
            setUser(model as User | null)
        })

        return () => {
            unsubscribe()
        }
    }, [])

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            // PocketBase ile login (username veya email ile giriş yapılabilir)
            const authData = await pb.collection('users').authWithPassword(username, password)

            if (authData.record) {
                setUser(authData.record as User)
                return true
            }
            return false
        } catch (error) {
            console.error('Login error:', error)
            return false
        }
    }

    const logout = () => {
        pb.authStore.clear()
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
