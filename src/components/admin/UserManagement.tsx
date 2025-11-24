// UserManagement is disabled for Supabase - use Supabase Dashboard for user management
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
// import { Badge } from '@/components/ui/badge'
// import { Trash2, Edit, Plus, Save } from 'lucide-react'
// import { hashPassword, getRoleDisplayName } from '@/lib/auth'

export function UserManagement() {
    // Supabase Auth handles user management through dashboard
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Kullanıcı Yönetimi</h2>
            <p className="text-gray-600">
                Supabase Dashboard'dan kullanıcı yönetimi yapabilirsiniz:
                <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                    Supabase Dashboard'a Git
                </a>
            </p>
            <p className="text-sm text-gray-500 mt-4">
                Authentication → Users menüsünden yeni kullanıcılar ekleyebilir, silebilir ve yönetebilirsiniz.
            </p>
        </div>
    )
}

/*
OLD CODE - DISABLED FOR SUPABASE

All PocketBase user management code has been disabled.
Use Supabase Dashboard for user management instead.
*/
