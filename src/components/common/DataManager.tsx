import { Download, Upload, Database, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRef, useState } from "react"
import { exportAllData, importData, getPropertyImages, getPropertyImageUrl } from "@/lib/db"
import JSZip from "jszip"

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
                    Tüm verilerinizi ve görselleri ZIP dosyası olarak yedekleyin.
                    USB'ye kopyalayıp güvenle saklayabilirsiniz.
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
                        <strong>💾 ZIP içeriği:</strong>
                        <br />• data.json (Tüm veriler)
                        <br />• images/ klasörü (Tüm görseller)
                        <br />• Müşteriler, mülkler, görevler
                        <br /><br />
                        <strong>✅ Avantajlar:</strong>
                        <br />• Gerçek görseller (base64 değil!)
                        <br />• Küçük dosya boyutu
                        <br />• USB'ye kopyalayabilirsiniz
                        <br />• Başka bilgisayara taşıyabilirsiniz
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
