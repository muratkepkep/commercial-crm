import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Plus, Save } from 'lucide-react'
import { hashPassword, getRoleDisplayName } from '@/lib/auth'

export function UserManagement() {
    const { user: currentUser } = useAuth()
    const [users, setUsers] = useState<User[]>([])
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Form states
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        role: 'viewer' as UserRole
    })

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        const { data } = await getUsers()
        setUsers(data || [])
    }

    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            full_name: '',
            role: 'viewer'
        })
        setIsAdding(false)
        setEditingId(null)
        setError('')
    }

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        try {
            if (!formData.username || !formData.password || !formData.full_name) {
                throw new Error('Lütfen tüm alanları doldurun')
            }

            const password_hash = await hashPassword(formData.password)

            await createUser({
                username: formData.username,
                email: formData.username + '@crm.local',
                password: formData.password,
                passwordConfirm: formData.password,
                full_name: formData.full_name,
                role: formData.role
            })

            setSuccess('Kullanıcı başarıyla eklendi')
            loadUsers()
            resetForm()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu')
        }
    }

    const handleUpdateUser = async (id: string) => {
        setError('')
        setSuccess('')

        try {
            const updates: any = {
                full_name: formData.full_name,
                role: formData.role,
                username: formData.username
            }

            if (formData.password) {
                updates.password_hash = await hashPassword(formData.password)
            }

            await updateUser(id, updates)
            setSuccess('Kullanıcı güncellendi')
            loadUsers()
            resetForm()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu')
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return

        try {
            await deleteUser(id)
            setSuccess('Kullanıcı silindi')
            loadUsers()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Bir hata oluştu')
        }
    }

    const startEdit = (user: User) => {
        setEditingId(user.id)
        setFormData({
            username: user.username,
            password: '', // Password intentionally empty
            full_name: user.full_name,
            role: user.role
        })
        setIsAdding(false)
    }

    if (currentUser?.role !== 'admin') return null

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Kullanıcı Yönetimi</CardTitle>
                {!isAdding && !editingId && (
                    <Button onClick={() => setIsAdding(true)} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Yeni Kullanıcı
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

                {(isAdding || editingId) && (
                    <div className="bg-slate-50 p-4 rounded-lg mb-6 border">
                        <h3 className="font-medium mb-4">{isAdding ? 'Yeni Kullanıcı Ekle' : 'Kullanıcı Düzenle'}</h3>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Kullanıcı Adı</Label>
                                    <Input
                                        value={formData.username}
                                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Ad Soyad</Label>
                                    <Input
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Şifre {editingId && '(Değiştirmek için doldurun)'}</Label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Rol</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(v: UserRole) => setFormData({ ...formData, role: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Yönetici (Admin)</SelectItem>
                                            <SelectItem value="editor">Editör</SelectItem>
                                            <SelectItem value="viewer">İzleyici</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <Button variant="outline" onClick={resetForm}>İptal</Button>
                                <Button onClick={isAdding ? handleAddUser : () => handleUpdateUser(editingId!)}>
                                    <Save className="w-4 h-4 mr-2" />
                                    Kaydet
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kullanıcı Adı</TableHead>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.username}</TableCell>
                                <TableCell>{user.full_name}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'default' : user.role === 'editor' ? 'secondary' : 'outline'}>
                                        {getRoleDisplayName(user.role)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => startEdit(user)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        {user.username !== 'admin' && user.id !== currentUser?.id && (
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDeleteUser(user.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
