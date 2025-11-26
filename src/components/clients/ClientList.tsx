import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Phone, Briefcase, Factory, Pencil, Building2, Trash2 } from "lucide-react"
import type { Client, ClientRole } from "@/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AddClientForm } from "./AddClientForm"
import { getClients, createClient, updateClient, deleteClient } from "@/lib/db"
import { ExportButton } from "@/components/common/ExportButton"

export function ClientList() {
    const [clients, setClients] = React.useState<Client[]>([])
    const [loading, setLoading] = React.useState(true)
    const [filter, setFilter] = React.useState<ClientRole | "all">("all")
    const [isAddOpen, setIsAddOpen] = React.useState(false)
    const [editingClient, setEditingClient] = React.useState<Client | null>(null)

    const loadClients = async () => {
        try {
            const { data } = await getClients()
            setClients(data || [])
        } catch (error) {
            console.error('Error loading clients:', error)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        loadClients()
    }, [])

    const filteredClients = React.useMemo(() => filter === "all" ? clients : clients.filter(c => c.role === filter), [clients, filter])

    const handleAddClient = async (data: any) => {
        console.log('🔵 handleAddClient called with data:', data)
        try {
            console.log('🔵 Calling createClient...')
            const result = await createClient(data)
            console.log('🔵 createClient result:', result)

            if (result.error) {
                console.error('🔴 createClient returned error:', result.error)
                alert(`❌ Hata: ${result.error.message || JSON.stringify(result.error)}`)
                return
            }

            console.log('🔵 Client created successfully, reloading list...')
            await loadClients()
            setIsAddOpen(false)
            alert("✅ Müşteri eklendi!")
        } catch (error: any) {
            console.error('🔴 Exception in handleAddClient:', error)
            alert(`❌ Hata: ${error.message || 'Beklenmeyen hata'}`)
        }
    }

    const handleEditClient = async (data: any) => {
        if (!editingClient) return

        try {
            const result = await updateClient(editingClient.id, data)
            if (result.error) {
                alert(`❌ Hata: ${result.error.message || JSON.stringify(result.error)}`)
                return
            }

            await loadClients()
            setEditingClient(null)
            alert("✅ Müşteri güncellendi!")
        } catch (error: any) {
            console.error('Update error:', error)
            alert(`❌ Hata: ${error.message}`)
        }
    }

    const handleDeleteClient = async (client: Client) => {
        if (!confirm(`"${client.full_name}" müşterisini silmek istediğinizden emin misiniz?`)) {
            return
        }

        try {
            const result = await deleteClient(client.id)
            if (result.error) {
                alert(`❌ Hata: ${result.error.message || JSON.stringify(result.error)}`)
                return
            }

            await loadClients()
            alert("✅ Müşteri silindi!")
        } catch (error: any) {
            console.error('Delete error:', error)
            alert(`❌ Hata: ${error.message}`)
        }
    }

    const getRoleLabel = (role: ClientRole) => {
        if (role === "alici") return "Alıcı"
        if (role === "satici") return "Satıcı"
        if (role === "kiraci") return "Kiracı"
        if (role === "ev_sahibi") return "Ev Sahibi"
        return "Bilinmiyor"
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-4 pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Müşteri Defteri</h1>
                <div className="flex gap-2">
                    <ExportButton
                        data={clients}
                        filename={`musteriler-${new Date().toISOString().split('T')[0]}`}
                        entityName="Müşteriler"
                    />
                    <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <SheetTrigger asChild>
                            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg"><Plus className="h-6 w-6" /></Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
                            <SheetHeader className="mb-4">
                                <SheetTitle>Yeni Müşteri Ekle</SheetTitle>
                                <SheetDescription>Müşteri bilgilerini ve taleplerini giriniz.</SheetDescription>
                            </SheetHeader>
                            <AddClientForm onSubmit={handleAddClient} onCancel={() => setIsAddOpen(false)} />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)} className="w-full">
                <TabsList className="w-full grid grid-cols-5 p-1.5 bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-xl border border-primary/20 shadow-lg">
                    <TabsTrigger value="all" className="text-xs font-semibold data-[state=active]:bg-white/90 data-[state=active]:text-primary data-[state=active]:shadow-md rounded-lg transition-all">
                        <span className="mr-1">📊</span>TÜMÜ
                    </TabsTrigger>
                    <TabsTrigger value="alici" className="text-xs font-semibold data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:shadow-md rounded-lg transition-all">
                        <span className="mr-1">💰</span>ALICI
                    </TabsTrigger>
                    <TabsTrigger value="satici" className="text-xs font-semibold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-lg transition-all">
                        <span className="mr-1">🏷️</span>SATICI
                    </TabsTrigger>
                    <TabsTrigger value="kiraci" className="text-xs font-semibold data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg transition-all">
                        <span className="mr-1">🔑</span>KİRACI
                    </TabsTrigger>
                    <TabsTrigger value="ev_sahibi" className="text-xs font-semibold data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-md rounded-lg transition-all">
                        <span className="mr-1">🏢</span>MÜLK SAHİBİ
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {filteredClients.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Henüz müşteri eklenmemiş.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {filteredClients.map((client) => (
                            <motion.div key={client.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                                <Card className="overflow-hidden border-none shadow-md bg-white/80 dark:bg-black/40 backdrop-blur-md">
                                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg">{client.full_name}</h3>
                                            <Badge variant="default" className="mt-1">{getRoleLabel(client.role)}</Badge>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => setEditingClient(client)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClient(client)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => window.open(`tel:${client.phone}`)}>
                                                <Phone className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-2 space-y-3">
                                        {client.current_job && <div className="flex items-center text-sm text-muted-foreground"><Briefcase className="mr-2 h-4 w-4 opacity-70" /><span>{client.current_job}</span></div>}
                                        {client.planned_activity && <div className="flex items-center text-sm font-medium text-primary"><Factory className="mr-2 h-4 w-4" /><span>{client.planned_activity}</span></div>}
                                        {(client as any).client_intent && (
                                            <div className="flex items-center text-sm text-blue-700 dark:text-blue-400">
                                                <span className="mr-2">🎯</span>
                                                <span>
                                                    {(client as any).client_intent === 'almak_istiyor' ? 'Almak İstiyor' :
                                                        (client as any).client_intent === 'satmak_istiyor' ? 'Satmak İstiyor' :
                                                            (client as any).client_intent === 'kiralamak_istiyor' ? 'Kiralamak İstiyor' :
                                                                (client as any).client_intent === 'kiraya_vermek_istiyor' ? 'Kiraya Vermek İstiyor' : ''}
                                                </span>
                                            </div>
                                        )}
                                        {(client as any).search_type && (
                                            <div className="flex items-center text-sm text-purple-700 dark:text-purple-400">
                                                <span className="mr-2">🔍</span>
                                                <span>
                                                    {(client as any).search_type === 'satilik_ariyor' ? 'Satılık Arıyor' : 'Kiralık Arıyor'}
                                                </span>
                                            </div>
                                        )}
                                        {(client as any).owned_property_info && String((client as any).owned_property_info).trim() && <div className="flex items-center text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded"><Building2 className="mr-2 h-4 w-4" /><span>{(client as any).owned_property_info}</span></div>}
                                        {client.notes && <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md mt-2">{client.notes}</p>}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <Sheet open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
                    <SheetHeader className="mb-4">
                        <SheetTitle>Müşteriyi Düzenle</SheetTitle>
                        <SheetDescription>Müşteri bilgilerini güncelleyin.</SheetDescription>
                    </SheetHeader>
                    {editingClient && (
                        <AddClientForm
                            initialData={editingClient}
                            onSubmit={handleEditClient}
                            onCancel={() => setEditingClient(null)}
                        />
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
