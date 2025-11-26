import { PropertyForm } from "@/components/properties/PropertyForm"
import { AddClientForm } from "@/components/clients/AddClientForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { createProperty, createClient, uploadPropertyImages } from "@/lib/db"

export default function AddPage() {
    const [isSaving, setIsSaving] = useState(false)

    const handlePropertySubmit = async (propertyData: any) => {
        setIsSaving(true)
        try {
            // Extract image files
            const imageFiles = (propertyData as any)._imageFiles as File[] | undefined
            delete (propertyData as any)._imageFiles // Remove from property data

            const { data, error } = await createProperty({
                ...propertyData,
                status: 'active'
            })

            if (error) throw new Error(error)

            if (data) {
                // Upload images if any
                if (imageFiles && imageFiles.length > 0) {
                    const { error: uploadError } = await uploadPropertyImages(data.id, imageFiles)
                    if (uploadError) {
                        console.error('Image upload error:', uploadError)
                        alert("⚠️ Mülk kaydedildi ama görseller yüklenemedi. Lütfen düzenleyerek tekrar deneyin.")
                    } else {
                        alert(`✅ Mülk ve ${imageFiles.length} görsel başarıyla kaydedildi!`)
                    }
                } else {
                    alert("✅ Mülk başarıyla kaydedildi!")
                }
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
                    <PropertyForm onSubmit={handlePropertySubmit} isLoading={isSaving} />
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
