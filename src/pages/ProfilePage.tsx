import { useAuth } from "@/contexts/AuthContext"
import { UserManagement } from "@/components/admin/UserManagement"
import { PasswordChangeForm } from "@/components/profile/PasswordChangeForm"
import { DataManager } from "@/components/common/DataManager"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getRoleDisplayName } from "@/lib/auth"
import { User, Shield, Key } from "lucide-react"

export default function ProfilePage() {
    const { user, logout } = useAuth()

    if (!user) return null

    return (
        <div className="space-y-6 pb-20">
            <h1 className="text-2xl font-bold px-1">Profil Ayarları</h1>

            {/* User Info Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {(user.full_name || user.username || user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user.full_name || user.username || user.email || 'Kullanıcı'}</h2>
                                <p className="text-gray-500 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    @{user.username || user.email || 'user'}
                                </p>
                                <div className="mt-2">
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                        <Shield className="w-3 h-3 mr-1" />
                                        {getRoleDisplayName(user.role || 'admin')}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="text-sm text-red-600 hover:text-red-700 font-medium underline decoration-red-200 underline-offset-4"
                        >
                            Çıkış Yap
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Password Change */}
            <PasswordChangeForm />

            {/* Admin Panel - Only visible to admins */}
            {(user.role === 'admin' || !user.role) && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1 pt-4 border-t">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Yönetici Paneli</h2>
                    </div>
                    <UserManagement />
                </div>
            )}

            {/* Data Management */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1 pt-4 border-t">
                    <Key className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Veri Yönetimi</h2>
                </div>
                <DataManager />
            </div>
        </div>
    )
}
