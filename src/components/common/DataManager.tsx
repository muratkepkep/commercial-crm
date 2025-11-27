import { Download, Upload, Database, Loader2, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRef, useState } from "react"
import { exportAllData, importData, getPropertyImages, getPropertyImageUrl } from "@/lib/db"
import JSZip from "jszip"
import * as XLSX from "xlsx"

interface ExportData {
    version: string
    exportDate: string
    clients: any[]
    properties: any[]
    todos: any[]
}

export function DataManager() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [exportLoading, setExportLoading] = useState(false)
    const [importLoading, setImportLoading] = useState(false)

    const handleExport = async () => {
        try {
            setExportLoading(true)

            // Supabase'den tüm verileri çek
            const jsonData = await exportAllData()
            const data = JSON.parse(jsonData)

            // ZIP oluştur
            const zip = new JSZip()

            // JSON verisini ekle
            zip.file("data.json", jsonData)

            // Her property için görselleri ZIP'e ekle
            const imageFolder = zip.folder("images")

            if (data.properties && Array.isArray(data.properties)) {
                for (const property of data.properties) {
                    const { data: images } = await getPropertyImages(property.id)

                    if (images && images.length > 0) {
                        for (let i = 0; i < images.length; i++) {
                            const img = images[i]
                            try {
                                const url = getPropertyImageUrl(img.storage_path)
                                const response = await fetch(url)
                                const blob = await response.blob()

                                // Dosya adı: propertyId_index_originalName.ext
                                const ext = img.file_name.split('.').pop()
                                const fileName = `${property.id}_${i}.${ext}`
                                imageFolder?.file(fileName, blob)
                            } catch (error) {
                                console.error(`Error downloading image ${img.file_name}:`, error)
                            }
                        }
                    }
                }
            }

            // ZIP'i oluştur ve indir
            const zipBlob = await zip.generateAsync({ type: "blob" })
            const url = URL.createObjectURL(zipBlob)
            const a = document.createElement("a")
            a.href = url
            a.download = `crm-backup-${new Date().toISOString().split('T')[0]}.zip`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            alert("✅ Veriler ve görseller başarıyla ZIP olarak dışa aktarıldı!")
        } catch (error) {
            console.error("Export error:", error)
            alert("❌ Dışa aktarma sırasında hata oluştu!")
        } finally {
            setExportLoading(false)
        }
    }

    const handleExportExcel = async () => {
        try {
            setExportLoading(true)

            const jsonData = await exportAllData()
            const data = JSON.parse(jsonData)

            const wb = XLSX.utils.book_new()

            // Müşteriler sheet'i
            if (data.clients && Array.isArray(data.clients)) {
                const clientsData = data.clients.map((client: any) => ({
                    'Ad Soyad': client.full_name || '',
                    'Telefon': client.phone || '',
                    'Email': client.email || '',
                    'Rol': client.role === 'alici' ? 'Alıcı' :
                        client.role === 'satici' ? 'Satıcı' :
                            client.role === 'kiraci' ? 'Kiracı' :
                                client.role === 'ev_sahibi' ? 'Ev Sahibi / Fabrika Sahibi' : '',
                    'Ne Yapmak İstiyor': client.client_intent === 'almak_istiyor' ? 'Almak İstiyor' :
                        client.client_intent === 'satmak_istiyor' ? 'Satmak İstiyor' :
                            client.client_intent === 'kiralamak_istiyor' ? 'Kiralamak İstiyor' :
                                client.client_intent === 'kiraya_vermek_istiyor' ? 'Kiraya Vermek İstiyor' : '',
                    'Arayış': client.search_type === 'satilik_ariyor' ? 'Satılık Arıyor' :
                        client.search_type === 'kiralik_ariyor' ? 'Kiralık Arıyor' : '',
                    'Mevcut İşi': client.current_job || '',
                    'Yapacağı İş': client.planned_activity || '',
                    'Min Bütçe': client.budget_min || '',
                    'Max Bütçe': client.budget_max || '',
                    'Sahip Olduğu Mülk': client.owned_property_info || '',
                    'Notlar': client.notes || '',
                    'Tarih': client.created_at ? new Date(client.created_at).toLocaleDateString('tr-TR') : ''
                }))
                const ws = XLSX.utils.json_to_sheet(clientsData)
                XLSX.utils.book_append_sheet(wb, ws, "Müşteriler")
            }

            // Mülkler sheet'i
            if (data.properties && Array.isArray(data.properties)) {
                const propertiesData = data.properties.map((prop: any) => ({
                    'Başlık': prop.title || '',
                    'Kategori': prop.property_category === 'daire' ? 'Daire' :
                        prop.property_category === 'fabrika' ? 'Fabrika' :
                            prop.property_category === 'arsa' ? 'Arsa' :
                                prop.property_category === 'ofis' ? 'Ofis' :
                                    prop.property_category === 'depo' ? 'Depo' :
                                        prop.property_category === 'arazi' ? 'Arazi' : '',
                    'İlan': prop.listing_type === 'satilik' ? 'Satılık' : prop.listing_type === 'kiralik' ? 'Kiralık' : '',
                    'Fiyat': prop.price || '',
                    'Para Birimi': prop.currency || '',
                    'Şehir': prop.city || '',
                    'İlçe': prop.district || '',
                    'Adres': prop.address || '',
                    'Kapalı Alan m²': prop.closed_area_m2 || '',
                    'Açık Alan m²': prop.open_area_m2 || '',
                    'Yükseklik m': prop.height_m || '',
                    'Enerji kW': prop.power_kw || '',
                    'Ada': prop.ada || '',
                    'Parsel': prop.parsel || '',
                    'Enlem': prop.lat || '',
                    'Boylam': prop.lng || '',
                    'Oda Sayısı': prop.room_count || '',
                    'Kat': prop.floor_number || '',
                    'Bina Yaşı': prop.building_age || '',
                    'Isıtma': prop.heating_type || '',
                    'Balkon': prop.balcony ? 'Evet' : 'Hayır',
                    'Asansör': prop.elevator ? 'Evet' : 'Hayır',
                    'Eşyalı': prop.furnished ? 'Evet' : 'Hayır',
                    'Otopark': prop.parking_spots || '',
                    'Vinç': prop.crane ? 'Evet' : 'Hayır',
                    'Giriş Yüksekliği m': prop.entrance_height_m || '',
                    'İdari Bina': prop.administrative_building ? 'Evet' : 'Hayır',
                    'Zemin Yüklemesi': prop.ground_loading ? 'Evet' : 'Hayır',
                    'İmar': prop.zoning_status || '',
                    'Gabari': prop.gabari || '',
                    'KAK': prop.kak || '',
                    'Açıklama': prop.description || '',
                    'Durum': prop.status === 'active' ? 'Aktif' : prop.status === 'sold' ? 'Satıldı' : prop.status === 'rented' ? 'Kiralandı' : '',
                    'Tarih': prop.created_at ? new Date(prop.created_at).toLocaleDateString('tr-TR') : ''
                }))
                const ws = XLSX.utils.json_to_sheet(propertiesData)
                XLSX.utils.book_append_sheet(wb, ws, "Mülkler")
            }

            // Görevler sheet'i
            if (data.todos && Array.isArray(data.todos)) {
                const todosData = data.todos.map((todo: any) => ({
                    'Görev': todo.task || '',
                    'Tamamlandı': todo.is_completed ? 'Evet' : 'Hayır',
                    'Termin': todo.due_date ? new Date(todo.due_date).toLocaleDateString('tr-TR') : '',
                    'Tarih': todo.created_at ? new Date(todo.created_at).toLocaleDateString('tr-TR') : ''
                }))
                const ws = XLSX.utils.json_to_sheet(todosData)
                XLSX.utils.book_append_sheet(wb, ws, "Görevler")
            }

            XLSX.writeFile(wb, `crm-export-${new Date().toISOString().split('T')[0]}.xlsx`)
            alert("✅ Veriler başarıyla Excel'e aktarıldı!")
        } catch (error) {
            console.error("Excel export error:", error)
            alert("❌ Excel'e aktarma sırasında hata oluştu!")
        } finally {
            setExportLoading(false)
        }
    }

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                setImportLoading(true)
                const jsonString = e.target?.result as string
                const data = JSON.parse(jsonString) as ExportData

                // Supabase'e kaydet
                const result = await importData(jsonString)

                if (result.success) {
                    alert(`✅ Veriler başarıyla içe aktarıldı!\n\nMüşteriler: ${data.clients?.length || 0}\nMülkler: ${data.properties?.length || 0}\nGörevler: ${data.todos?.length || 0}`)

                    // Sayfayı yenile
                    setTimeout(() => {
                        window.location.reload()
                    }, 1000)
                } else {
                    throw new Error(result.error)
                }

                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
            } catch (error) {
                console.error("Import error:", error)
                alert("❌ İçe aktarma sırasında hata oluştu! Dosya formatı kontrol edin.")
            } finally {
                setImportLoading(false)
            }
        }
        reader.readAsText(file)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Veri Yedekleme
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                    <strong>Excel:</strong> Analiz için tablo formatında<br />
                    <strong>ZIP:</strong> Görseller + JSON (tam yedek)
                </p>

                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleExport}
                    disabled={exportLoading}
                >
                    {exportLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    {exportLoading ? 'Hazırlanıyor...' : 'Verileri Dışa Aktar (.zip)'}
                </Button>

                <Button
                    variant="outline"
                    className="w-full justify-start bg-green-50 hover:bg-green-100 border-green-200"
                    onClick={handleExportExcel}
                    disabled={exportLoading}
                >
                    {exportLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                    )}
                    {exportLoading ? 'Hazırlanıyor...' : 'Excel Olarak Dışa Aktar (.xlsx)'}
                </Button>

                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                        id="file-import"
                    />
                    <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={importLoading}
                    >
                        {importLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Upload className="h-4 w-4 mr-2" />
                        )}
                        {importLoading ? 'İçe Aktarılıyor...' : 'Verileri İçe Aktar (.json)'}
                    </Button>
                </div>

                <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                        <strong>📊 Excel (.xlsx):</strong>
                        <br />• Her tablo ayrı sheet'te
                        <br />• Harita koordinatları dahil
                        <br />• Türkçe başlıklar
                        <br />• Excel'de analiz / filtreleme
                        <br /><br />
                        <strong>💾 ZIP (.zip):</strong>
                        <br />• data.json + images/
                        <br />• Tam yedekleme
                        <br />• USB'ye taşıyabilirsiniz
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
