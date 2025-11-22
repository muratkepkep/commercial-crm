import * as React from "react"
import { Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface IndustrialCalculatorProps {
    onCalculate: (area: number) => void;
}

export function IndustrialCalculator({ onCalculate }: IndustrialCalculatorProps) {
    const [open, setOpen] = React.useState(false)
    const [columnCount, setColumnCount] = React.useState("")
    const [columnSpacing, setColumnSpacing] = React.useState("")
    const [width, setWidth] = React.useState("")
    const [result, setResult] = React.useState<number | null>(null)

    const calculateArea = () => {
        const cols = parseFloat(columnCount)
        const spacing = parseFloat(columnSpacing)
        const w = parseFloat(width)

        if (!isNaN(cols) && !isNaN(spacing) && !isNaN(w)) {
            // Formula: (Ayak Sayısı - 1) * Ayak Aralığı * Genişlik
            // Assuming "Ayak Sayısı" refers to columns along the length
            // Length = (cols - 1) * spacing
            // Area = Length * Width
            const length = (cols - 1) * spacing
            const area = length * w
            setResult(area)
        }
    }

    const handleApply = () => {
        if (result !== null) {
            onCalculate(result)
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                    <Calculator className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Sanayi Alanı Hesaplayıcı</DialogTitle>
                    <DialogDescription>
                        Kolon ve aks bilgilerine göre kapalı alanı hesaplayın.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="columnCount" className="text-right col-span-2">
                            Ayak Sayısı (Adet)
                        </Label>
                        <Input
                            id="columnCount"
                            type="number"
                            value={columnCount}
                            onChange={(e) => setColumnCount(e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="columnSpacing" className="text-right col-span-2">
                            Ayak Aralığı (m)
                        </Label>
                        <Input
                            id="columnSpacing"
                            type="number"
                            value={columnSpacing}
                            onChange={(e) => setColumnSpacing(e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="width" className="text-right col-span-2">
                            Genişlik (m)
                        </Label>
                        <Input
                            id="width"
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                            className="col-span-2"
                        />
                    </div>
                </div>

                {result !== null && (
                    <div className="rounded-md bg-muted p-4 text-center mb-4">
                        <span className="text-sm text-muted-foreground">Hesaplanan Alan:</span>
                        <div className="text-2xl font-bold text-primary">
                            {result.toLocaleString("tr-TR")} m²
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={calculateArea}>
                        Hesapla
                    </Button>
                    <Button type="button" onClick={handleApply} disabled={result === null}>
                        Uygula
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
