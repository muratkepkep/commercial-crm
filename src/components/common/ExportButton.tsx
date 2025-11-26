import * as React from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ExportButtonProps {
    data: any[]
    filename: string
    entityName: string // e.g., "Portföyler", "Müşteriler"
    format?: 'json' | 'csv'
    className?: string
}

export function ExportButton({ data, filename, entityName, format = 'json', className }: ExportButtonProps) {
    const [loading, setLoading] = React.useState(false)

    const handleExport = () => {
        setLoading(true)
        try {
            if (data.length === 0) {
                alert('Dışa aktarılacak veri yok!')
                setLoading(false)
                return
            }

            if (format === 'json') {
                const jsonStr = JSON.stringify(data, null, 2)
                const blob = new Blob([jsonStr], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${filename}.json`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
            } else {
                // CSV export
                const allKeys = new Set<string>()
                data.forEach(item => {
                    Object.keys(item).forEach(key => allKeys.add(key))
                })
                const headers = Array.from(allKeys)

                const csvRows = []
                csvRows.push(headers.join(','))

                data.forEach(item => {
                    const values = headers.map(header => {
                        const value = item[header]
                        if (value === null || value === undefined) return ''
                        if (typeof value === 'object') return JSON.stringify(value).replace(/,/g, ';')
                        return String(value).replace(/,/g, ';')
                    })
                    csvRows.push(values.join(','))
                })

                const csvStr = csvRows.join('\n')
                const bom = '\uFEFF' // UTF-8 BOM for Excel
                const blob = new Blob([bom + csvStr], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${filename}.csv`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
            }
        } catch (error) {
            console.error('Export error:', error)
            alert('Dışa aktarma hatası!')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            disabled={loading || data.length === 0}
            className={className}
            onClick={handleExport}
        >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Dışa Aktarılıyor...' : `${entityName} Dışa Aktar (${data.length})`}
        </Button>
    )
}
