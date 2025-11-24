import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const success = await login(email, password)

        if (success) {
            navigate('/properties')
        } else {
            setError('Email veya şifre hatalı')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-96">
                <h1 className="text-2xl font-bold mb-6">Ticari Emlak CRM - Giriş</h1>
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

                <div className="space-y-4">
                    <div>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            required
                        />
                    </div>
                    <div>
                        <Label>Şifre</Label>
                        <Input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Giriş Yap
                    </Button>
                </div>

                <p className="text-sm text-gray-500 mt-6 text-center">
                    Supabase Dashboard'dan hesap oluşturun
                </p>
            </form>
        </div>
    )
}
