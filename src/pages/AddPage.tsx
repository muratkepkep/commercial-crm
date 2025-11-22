import { PropertyForm } from "@/components/properties/PropertyForm"
import { AddClientForm } from "@/components/clients/AddClientForm"
import { MapPicker } from "@/components/common/MapPicker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { createProperty, createClient } from "@/lib/db"
import type { Property } from "@/types"
import { useAuth } from "@/contexts/AuthContext"
import { ShieldAlert } from "lucide-react"

export default function AddPage() {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const { user } = useAuth()

    const handlePropertySubmit = async (propertyData: Partial<Property>) => {
        setIsSaving(true)
        try {
            const dataWithLocation = location
                ? { ...propertyData, lat: location.lat, lng: location.lng }
                : propertyData

            const { data } = await createProperty({
                ...dataWithLocation,
                status: 'active'
            })

            if (data) {
                alert("✅ Mülk başarıyla kaydedildi!")
                setLocation(null)
            }
            return data
        } catch (error: any) {
            console.error('Error saving property:', error)
            alert(`❌ Hata: ${error.message || "Mülk kaydedilemedi."}`)
            throw error
        } finally {
            setIsSaving(false)
        }
    }

    const handleClientSubmit = async (clientData: any) => {
        setIsSaving(true)
        try {
            const { data } = await createClient(clientData)

            if (data) {
                alert("✅ Müşteri başarıyla kaydedildi!")
            }
            return data
        } catch (error: any) {
            console.error('Error saving client:', error)
            alert(`❌ Hata: ${error.message || "Müşteri kaydedilemedi."}`)
            throw error
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="pb-20">
            <Tabs defaultValue="property" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="property">Mülk Ekle</TabsTrigger>
                    <TabsTrigger value="client">Müşteri Ekle</TabsTrigger>
                </TabsList>

                <TabsContent value="property">
                    <div className="space-y-6">
                        <PropertyForm onSubmit={handlePropertySubmit} isLoading={isSaving} />
                        <div className="space-y-2 px-4">
                            <h3 className="text-sm font-medium">Konum Seçimi</h3>
                            <MapPicker onLocationSelect={(lat, lng) => setLocation({ lat, lng })} />
                            {location && (
                                <p className="text-xs text-muted-foreground">
                                    Seçilen konum: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                </p>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="client">
                    <div className="px-4 pt-4">
                        <AddClientForm
                            onSubmit={handleClientSubmit}
                            onCancel={() => console.log("İptal edildi")}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
