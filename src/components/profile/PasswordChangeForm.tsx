import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { localDB } from '@/lib/local-db'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Save } from 'lucide-react'

export function PasswordChangeForm() {
    const { user } = useAuth()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        if (!user) return

        try {
            if (newPassword !== confirmPassword) {
                throw new Error('Yeni şifreler eşleşmiyor')
            }

            if (newPassword.length < 6) {
                throw new Error('Yeni şifre en az 6 karakter olmalıdır')
            }

            // Verify current password
            const isValid = await verifyPassword(currentPassword, user.password_hash)
            if (!isValid) {
                throw new Error('Mevcut şifre hatalı')
            }

            // Update password
            const newHash = await hashPassword(newPassword)
            await localDB.updateUser(user.id, { password_hash: newHash })

            setSuccess('Şifreniz başarıyla güncellendi')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Şifre Değiştir</CardTitle>
            </CardHeader>
            <CardContent>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label>Mevcut Şifre</Label>
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label>Yeni Şifre</Label>
                        <Input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label>Yeni Şifre (Tekrar)</Label>
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit">
                        <Save className="w-4 h-4 mr-2" />
                        Şifreyi Güncelle
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
