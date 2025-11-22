import { Download, Upload, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRef } from "react"

interface ExportData {
    version: string
    exportDate: string
    clients: any[]
    properties: any[]
    todos: any[]
    coordinates: any[]
}

export function DataManager() {
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleExport = async () => {
        try {
            // TODO: Fetch from Supabase when integrated
            const data: ExportData = {
                version: "1.0",
                exportDate: new Date().toISOString(),
                clients: [], // Will be populated from Supabase
                properties: [], // Will be populated from Supabase
                todos: [], // Will be populated from Supabase
                coordinates: [], // Map coordinates
            }

            const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: "application/json",
            })

            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `crm-backup-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            alert("✅ Veriler başarıyla dışa aktarıldı!")
        } catch (error) {
            console.error("Export error:", error)
            alert("❌ Dışa aktarma sırasında hata oluştu!")
        }
    }

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target?.result as string) as ExportData

                // TODO: Save to Supabase when integrated
                console.log("Imported data:", data)

                alert(`✅ Veriler başarıyla içe aktarıldı!\n\nMüşteriler: ${data.clients?.length || 0}\nPortföyler: ${data.properties?.length || 0}\nGörevler: ${data.todos?.length || 0}`)

                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                }
            } catch (error) {
                console.error("Import error:", error)
                alert("❌ İçe aktarma sırasında hata oluştu! Dosya formatı kontrol edin.")
            }
        }
        reader.readAsText(file)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Veri Yönetimi
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                    Tüm verilerinizi JSON formatında yedekleyin veya geri yükleyin.
                </p>

                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleExport}
                >
                    <Download className="h-4 w-4 mr-2" />
                    Verileri Dışa Aktar (.json)
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
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Verileri İçe Aktar (.json)
                    </Button>
                </div>

                <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                        <strong>Yedeklenen veriler:</strong>
                        <br />• Müşteri defteri
                        <br />• Portföyler (görsel URL'leri dahil)
                        <br />• To-Do listesi
                        <br />• Harita koordinatları
                        <br />• Ada-Parsel bilgileri
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
