import bcrypt from 'bcryptjs'
import type { UserRole } from '@/types'

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, 10)
}

/**
 * Verify a password against a hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash)
}

/**
 * Check if user can edit properties/clients
 */
export const canEdit = (role: UserRole): boolean => {
    return role === 'admin' || role === 'editor'
}

/**
 * Check if user can delete properties/clients
 */
export const canDelete = (role: UserRole): boolean => {
    return role === 'admin'
}

/**
 * Check if user can manage other users
 */
export const canManageUsers = (role: UserRole): boolean => {
    return role === 'admin'
}

/**
 * Get role display name in Turkish
 */
export const getRoleDisplayName = (role: UserRole): string => {
    const names = {
        admin: 'Yönetici',
        editor: 'Editör',
        viewer: 'Görüntüleyici'
    }
    return names[role]
}

/**
 * Get role permissions description
 */
export const getRolePermissions = (role: UserRole): string[] => {
    const permissions = {
        admin: ['Tüm yetkiler', 'Kullanıcı yönetimi', 'Mülk ekle/düzenle/sil', 'Müşteri ekle/düzenle/sil'],
        editor: ['Mülk ekle/düzenle', 'Müşteri ekle/düzenle', 'Görüntüleme'],
        viewer: ['Sadece görüntüleme']
    }
    return permissions[role]
}
