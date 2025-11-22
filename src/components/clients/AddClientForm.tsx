import * as React from "react"
import type { ClientRole, SearchType } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SheetFooter } from "@/components/ui/sheet"

interface AddClientFormProps {
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

export function AddClientForm({ onSubmit, onCancel }: AddClientFormProps) {
    const [role, setRole] = React.useState<ClientRole>("alici")
    const [searchType, setSearchType] = React.useState<SearchType>("satilik_ariyor")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        const data = Object.fromEntries(formData)
        onSubmit({ ...data, role, search_type: searchType })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
                <Label htmlFor="full_name">Ad Soyad</Label>
                <Input id="full_name" name="full_name" required placeholder="Ahmet Yılmaz" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" name="phone" type="tel" placeholder="0532 555 55 55" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select value={role} onValueChange={(v) => setRole(v as ClientRole)}>
                        <SelectTrigger><SelectValue placeholder="Rol Seçiniz" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="alici">Alıcı</SelectItem>
                            <SelectItem value="satici">Satıcı</SelectItem>
                            <SelectItem value="kiraci">Kiracı</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Arayış Tipi</Label>
                <Select value={searchType} onValueChange={(v) => setSearchType(v as SearchType)}>
                    <SelectTrigger><SelectValue placeholder="Ne Arıyor?" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="satilik_ariyor">Satılık Arıyor</SelectItem>
                        <SelectItem value="kiralik_ariyor">Kiralık Arıyor</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="current_job">Mevcut İşi / Mesleği</Label>
                <Input id="current_job" name="current_job" placeholder="Tekstil İmalatı" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="planned_activity" className="text-primary font-bold">
                    Yapacağı İş (Önemli)
                </Label>
                <Input id="planned_activity" name="planned_activity" placeholder="Plastik Enjeksiyon Fabrikası" className="border-primary/50 bg-primary/5" />
                <p className="text-xs text-muted-foreground">
                    Bu bilgi, uygun mülk eşleşmesi için kritiktir.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="budget_min">Min Bütçe</Label>
                    <Input id="budget_min" name="budget_min" type="number" placeholder="1.000.000" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="budget_max">Max Bütçe</Label>
                    <Input id="budget_max" name="budget_max" type="number" placeholder="5.000.000" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notlar</Label>
                <Input id="notes" name="notes" placeholder="Ek notlar..." />
            </div>

            <SheetFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
                <Button type="submit">Kaydet</Button>
            </SheetFooter>
        </form>
    )
}
