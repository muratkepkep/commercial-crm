```typescript
import * as React from "react"
import { Calculator, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function FloatingCalculator() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [columnCount, setColumnCount] = React.useState("")
    const [columnSpacing, setColumnSpacing] = React.useState("")
    const [width, setWidth] = React.useState("")
    const [result, setResult] = React.useState<number | null>(null)

    const calculateArea = () => {
        const cols = parseFloat(columnCount)
        const spacing = parseFloat(columnSpacing)
        const w = parseFloat(width)

        if (!isNaN(cols) && !isNaN(spacing) && !isNaN(w)) {
            const length = (cols - 1) * spacing
            const area = length * w
            setResult(area)
        }
    }

    return (
        <>
            {/* Floating Button */}
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-md bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 opacity-90 hover:opacity-100"
                size="icon"
                title="Sanayi Hesaplayıcı"
            >
                <Calculator className="h-5 w-5 text-white" />
            </Button>

            {/* Calculator Dialog */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <Card className="max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Sanayi Alanı Hesaplayıcı</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardDescription>
                                Kolon ve aks bilgilerine göre kapalı alanı hesaplayın.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="columnCount">Ayak Sayısı (Adet)</Label>
                                <Input
                                    id="columnCount"
                                    type="number"
                                    placeholder="Örn: 6"
                                    value={columnCount}
                                    onChange={(e) => setColumnCount(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="columnSpacing">Ayak Aralığı (m)</Label>
                                <Input
                                    id="columnSpacing"
                                    type="number"
                                    placeholder="Örn: 7"
                                    value={columnSpacing}
                                    onChange={(e) => setColumnSpacing(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="width">Genişlik (m)</Label>
                                <Input
                                    id="width"
                                    type="number"
                                    placeholder="Örn: 20"
                                    value={width}
                                    onChange={(e) => setWidth(e.target.value)}
                                />
                            </div>

                            {result !== null && (
                                <div className="rounded-md bg-primary/10 p-4 text-center border border-primary/20">
                                    <span className="text-sm text-muted-foreground">Hesaplanan Alan:</span>
                                    <div className="text-2xl font-bold text-primary">
                                        {result.toLocaleString("tr-TR")} m²
                                    </div>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-between">
                            <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Kapat
                            </Button>
                            <Button onClick={calculateArea}>
                                Hesapla
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </>
    )
}
```
