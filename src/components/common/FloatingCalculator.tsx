import * as React from "react"
import { Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IndustrialCalculator } from "@/components/properties/IndustrialCalculator"

export function FloatingCalculator() {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <>
            {/* Floating Button */}
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-110"
                size="icon"
            >
                <Calculator className="h-6 w-6 text-white" />
            </Button>

            {/* Calculator Dialog */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div className="max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <IndustrialCalculator onCalculate={(area) => {
                            console.log("Calculated area:", area)
                            setIsOpen(false)
                        }} />
                        <Button
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => setIsOpen(false)}
                        >
                            Kapat
                        </Button>
                    </div>
                </div>
            )}
        </>
    )
}
