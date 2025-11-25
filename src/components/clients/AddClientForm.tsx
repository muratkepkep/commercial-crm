import * as React from "react"
import type { ClientRole, ClientIntent, Client } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SheetFooter } from "@/components/ui/sheet"

interface AddClientFormProps {
    initialData?: Partial<Client>
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export function AddClientForm({ initialData, onSubmit, onCancel }: AddClientFormProps) {
    const [role, setRole] = React.useState<ClientRole>(initialData?.role || "alici")
    const [searchType, setSearchType] = React.useState<string>(initialData?.search_type || "satilik_ariyor")
    const [clientIntent, setClientIntent] = React.useState<ClientIntent | "">(initialData?.client_intent || "")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const rawData = Object.fromEntries(formData)

        // Sayısal alanları temizle (boş string "" yerine null gönderilmeli)
        const cleanData: any = {
            ...rawData,
            role,
            search_type: searchType || undefined,
            client_intent: clientIntent || undefined
        }

        const numericFields = ['budget_min', 'budget_max']
        numericFields.forEach(field => {
            if (cleanData[field] === "") {
                cleanData[field] = null
            } else if (cleanData[field]) {
                cleanData[field] = parseFloat(cleanData[field])
            }
        })

        onSubmit(cleanData)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
            <div className="flex-1 space-y-6 py-4 pb-24">
                <div className="space-y-2">
                    <Label htmlFor="full_name">Ad Soyad *</Label>
                    <Input id="full_name" name="full_name" required placeholder="Ahmet Yılmaz" defaultValue={initialData?.full_name} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <Input id="phone" name="phone" type="tel" placeholder="0532 555 55 55" defaultValue={initialData?.phone || ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="role">Rol *</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as ClientRole)}>
                            <SelectTrigger><SelectValue placeholder="Rol Seçiniz" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="alici">Alıcı</SelectItem>
                                <SelectItem value="satici">Satıcı</SelectItem>
                                <SelectItem value="kiraci">Kiracı</SelectItem>
                                <SelectItem value="ev_sahibi">Ev Sahibi / Fabrika Sahibi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Ne Yapmak İstiyor?</Label>
                    <Select value={clientIntent} onValueChange={(v) => setClientIntent(v as ClientIntent)}>
                        <SelectTrigger><SelectValue placeholder="Seçiniz (İsteğe bağlı)" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">-- Seçiniz --</SelectItem>
                            <SelectItem value="almak_istiyor">Almak İstiyor (Satın Almak)</SelectItem>
                            <SelectItem value="satmak_istiyor">Satmak İstiyor</SelectItem>
                            <SelectItem value="kiralamak_istiyor">Kiralamak İstiyor (Kiracı Olarak)</SelectItem>
                            <SelectItem value="kiraya_vermek_istiyor">Kiraya Vermek İstiyor</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {role === "ev_sahibi" && (
                    <div className="space-y-2">
                        <Label htmlFor="owned_property_info">Sahip Olduğu Mülk</Label>
                        <Input
                            id="owned_property_info"
                            name="owned_property_info"
                            placeholder="Örn: Kiralık Fabrikası var, Satılık Evi var"
                            defaultValue={(initialData as any)?.owned_property_info || ''}
                        />
                        <p className="text-xs text-muted-foreground">
                            Müşterinin sahip olduğu kiralık/satılık mülkleri belirtin
                        </p>
                    </div>
                )}

                {(role === "alici" || role === "kiraci") && (
                    <div className="space-y-2">
                        <Label>Arayış Tipi</Label>
                        <Select value={searchType} onValueChange={setSearchType}>
                            <SelectTrigger><SelectValue placeholder="Ne Arıyor?" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="satilik_ariyor">Satılık Arıyor</SelectItem>
                                <SelectItem value="kiralik_ariyor">Kiralık Arıyor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="current_job">Mevcut İşi / Mesleği</Label>
                    <Input id="current_job" name="current_job" placeholder="Tekstil İmalatı" defaultValue={initialData?.current_job || ''} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="planned_activity" className="text-primary font-bold">
                        Yapacağı İş (Önemli)
                    </Label>
                    <Input id="planned_activity" name="planned_activity" placeholder="Plastik Enjeksiyon Fabrikası" className="border-primary/50 bg-primary/5" defaultValue={initialData?.planned_activity || ''} />
                    <p className="text-xs text-muted-foreground">
                        Bu bilgi, uygun mülk eşleşmesi için kritiktir.
                    </p>
                </div>

                {(role === "alici" || role === "kiraci") && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="budget_min">Min Bütçe</Label>
                            <Input id="budget_min" name="budget_min" type="number" placeholder="1.000.000" defaultValue={initialData?.budget_min || ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="budget_max">Max Bütçe</Label>
                            <Input id="budget_max" name="budget_max" type="number" placeholder="5.000.000" defaultValue={initialData?.budget_max || ''} />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="notes">Notlar</Label>
                    <Input id="notes" name="notes" placeholder="Ek notlar..." defaultValue={initialData?.notes || ''} />
                </div>
            </div>

            <SheetFooter className="sticky bottom-0 bg-background pt-4 pb-safe border-t mt-auto">
                <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
                <Button type="submit">{initialData ? 'Güncelle' : 'Kaydet'}</Button>
            </SheetFooter>
        </form>
    )
}
