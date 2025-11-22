import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleReset = () => {
        if (confirm('Tüm veriler silinecek ve varsayılan admin oluşturulacak. Emin misiniz?')) {
            localStorage.clear()
            window.location.reload()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const success = await login(username, password)

        if (success) {
            navigate('/properties')
        } else {
            setError('Kullanıcı adı veya şifre hatalı')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-6">Giriş Yap</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                <div className="space-y-4">
                    <div>
                        <Label>Kullanıcı Adı</Label>
                        <Input value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Şifre</Label>
                        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Giriş</Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={handleReset}
                    >
                        Verileri Sıfırla (Sorun Varsa)
                    </Button>
                </div>

                <p className="text-sm text-gray-500 mt-4">
                    Varsayılan: admin / admin123
                </p>
            </form>
        </div>
    )
}
