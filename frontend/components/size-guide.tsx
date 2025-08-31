"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Ruler, User, Info } from "lucide-react"

interface SizeGuideProps {
  isOpen: boolean
  onClose: () => void
  clothingType: string
  selectedSize?: string
  onSizeSelect: (size: string) => void
}

// Size data for different clothing types
const sizeData = {
  shirt: {
    name: "Shirt",
    sizes: {
      XS: { chest: "32-34", length: "26", shoulder: "16", fit: "Slim fit, close to body" },
      S: { chest: "34-36", length: "27", shoulder: "17", fit: "Comfortable fit with slight room" },
      M: { chest: "38-40", length: "28", shoulder: "18", fit: "Regular fit, most popular" },
      L: { chest: "42-44", length: "29", shoulder: "19", fit: "Relaxed fit with more room" },
      XL: { chest: "46-48", length: "30", shoulder: "20", fit: "Loose fit, very comfortable" },
    },
    measurements: ["chest", "length", "shoulder"],
    fitAreas: [
      { name: "chest", label: "Chest", y: 35, color: "#3b82f6" },
      { name: "length", label: "Length", y: 65, color: "#10b981" },
      { name: "shoulder", label: "Shoulder", y: 25, color: "#f59e0b" },
    ],
  },
  dress: {
    name: "Dress",
    sizes: {
      XS: { bust: "32-34", waist: "24-26", hips: "34-36", length: "36", fit: "Form-fitting silhouette" },
      S: { bust: "34-36", waist: "26-28", hips: "36-38", length: "37", fit: "Fitted with slight ease" },
      M: { bust: "38-40", waist: "30-32", hips: "40-42", length: "38", fit: "Comfortable fit" },
      L: { bust: "42-44", waist: "34-36", hips: "44-46", length: "39", fit: "Relaxed fit" },
      XL: { bust: "46-48", waist: "38-40", hips: "48-50", length: "40", fit: "Loose, flowing fit" },
    },
    measurements: ["bust", "waist", "hips", "length"],
    fitAreas: [
      { name: "bust", label: "Bust", y: 35, color: "#3b82f6" },
      { name: "waist", label: "Waist", y: 45, color: "#10b981" },
      { name: "hips", label: "Hips", y: 55, color: "#f59e0b" },
      { name: "length", label: "Length", y: 75, color: "#8b5cf6" },
    ],
  },
  jacket: {
    name: "Jacket",
    sizes: {
      XS: { chest: "34-36", length: "24", shoulder: "17", sleeve: "24", fit: "Tailored, close fit" },
      S: { chest: "36-38", length: "25", shoulder: "18", sleeve: "25", fit: "Fitted with layering room" },
      M: { chest: "40-42", length: "26", shoulder: "19", sleeve: "26", fit: "Classic fit" },
      L: { chest: "44-46", length: "27", shoulder: "20", sleeve: "27", fit: "Comfortable, roomy" },
      XL: { chest: "48-50", length: "28", shoulder: "21", sleeve: "28", fit: "Oversized, relaxed" },
    },
    measurements: ["chest", "length", "shoulder", "sleeve"],
    fitAreas: [
      { name: "chest", label: "Chest", y: 35, color: "#3b82f6" },
      { name: "length", label: "Length", y: 60, color: "#10b981" },
      { name: "shoulder", label: "Shoulder", y: 25, color: "#f59e0b" },
      { name: "sleeve", label: "Sleeve", y: 40, color: "#8b5cf6" },
    ],
  },
  pants: {
    name: "Pants",
    sizes: {
      XS: { waist: "26-28", hips: "34-36", inseam: "30", rise: "9", fit: "Slim, tapered fit" },
      S: { waist: "28-30", hips: "36-38", inseam: "31", rise: "9.5", fit: "Fitted through leg" },
      M: { waist: "32-34", hips: "40-42", inseam: "32", rise: "10", fit: "Regular, straight fit" },
      L: { waist: "36-38", hips: "44-46", inseam: "33", rise: "10.5", fit: "Relaxed fit" },
      XL: { waist: "40-42", hips: "48-50", inseam: "34", rise: "11", fit: "Loose, comfortable" },
    },
    measurements: ["waist", "hips", "inseam", "rise"],
    fitAreas: [
      { name: "waist", label: "Waist", y: 45, color: "#3b82f6" },
      { name: "hips", label: "Hips", y: 55, color: "#10b981" },
      { name: "inseam", label: "Inseam", y: 70, color: "#f59e0b" },
      { name: "rise", label: "Rise", y: 50, color: "#8b5cf6" },
    ],
  },
}

// Default to shirt if clothing type not found
const getClothingData = (type: string) => {
  const normalizedType = type.toLowerCase()
  if (normalizedType.includes("dress")) return sizeData.dress
  if (normalizedType.includes("jacket") || normalizedType.includes("coat") || normalizedType.includes("blazer"))
    return sizeData.jacket
  if (normalizedType.includes("pants") || normalizedType.includes("trouser") || normalizedType.includes("jean"))
    return sizeData.pants
  return sizeData.shirt
}

// Human silhouette SVG component
const HumanSilhouette = ({
  selectedSize,
  clothingData,
  activeArea,
}: {
  selectedSize?: string
  clothingData: any
  activeArea?: string
}) => {
  const sizeScale = {
    XS: 0.85,
    S: 0.92,
    M: 1.0,
    L: 1.08,
    XL: 1.15,
  }

  const scale = selectedSize ? sizeScale[selectedSize as keyof typeof sizeScale] || 1 : 1

  return (
    <div className="relative w-full max-w-[200px] mx-auto">
      <svg viewBox="0 0 100 120" className="w-full h-auto">
        {/* Human silhouette */}
        <g transform={`scale(${scale}) translate(${(1 - scale) * 50}, ${(1 - scale) * 10})`}>
          {/* Head */}
          <circle cx="50" cy="12" r="8" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />

          {/* Torso */}
          <path
            d="M35 25 Q35 20 42 20 L58 20 Q65 20 65 25 L65 60 Q65 65 58 65 L42 65 Q35 65 35 60 Z"
            fill="#e5e7eb"
            stroke="#9ca3af"
            strokeWidth="0.5"
          />

          {/* Arms */}
          <path d="M35 30 Q25 25 20 35 Q25 45 35 40" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
          <path d="M65 30 Q75 25 80 35 Q75 45 65 40" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />

          {/* Legs */}
          <path
            d="M42 65 L42 110 Q42 115 47 115 Q52 115 52 110 L52 65"
            fill="#e5e7eb"
            stroke="#9ca3af"
            strokeWidth="0.5"
          />
          <path
            d="M58 65 L58 110 Q58 115 53 115 Q48 115 48 110 L48 65"
            fill="#e5e7eb"
            stroke="#9ca3af"
            strokeWidth="0.5"
          />
        </g>

        {/* Measurement indicators */}
        {clothingData.fitAreas.map((area: any) => (
          <g key={area.name} opacity={activeArea === area.name ? 1 : 0.6}>
            {/* Measurement line */}
            <line
              x1="20"
              y1={area.y}
              x2="80"
              y2={area.y}
              stroke={area.color}
              strokeWidth="1.5"
              strokeDasharray={activeArea === area.name ? "none" : "2,2"}
            />
            {/* Measurement points */}
            <circle cx="20" cy={area.y} r="2" fill={area.color} />
            <circle cx="80" cy={area.y} r="2" fill={area.color} />
            {/* Label */}
            <text x="85" y={area.y + 1} fontSize="6" fill={area.color} className="font-medium">
              {area.label}
            </text>
          </g>
        ))}

        {/* Size indicator */}
        {selectedSize && (
          <text x="50" y="10" textAnchor="middle" fontSize="8" fill="#374151" className="font-bold">
            Size {selectedSize}
          </text>
        )}
      </svg>
    </div>
  )
}

export function SizeGuide({ isOpen, onClose, clothingType, selectedSize, onSizeSelect }: SizeGuideProps) {
  const [activeTab, setActiveTab] = useState("visual")
  const [hoveredArea, setHoveredArea] = useState<string>()

  const clothingData = getClothingData(clothingType)
  const sizes = Object.keys(clothingData.sizes)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader className="pb-3 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Ruler className="h-4 w-4 sm:h-5 sm:w-5" />
            {clothingData.name} Size Guide
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="visual" className="text-xs sm:text-sm">
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Visual</span>
              <span className="sm:hidden">Visual</span>
            </TabsTrigger>
            <TabsTrigger value="measurements" className="text-xs sm:text-sm">
              <Ruler className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Measurements</span>
              <span className="sm:hidden">Sizes</span>
            </TabsTrigger>
            <TabsTrigger value="fit" className="text-xs sm:text-sm">
              <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Fit Guide</span>
              <span className="sm:hidden">Fit</span>
            </TabsTrigger>
          </TabsList>

          {/* Visual Tab */}
          <TabsContent value="visual" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Silhouette */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-4 text-center text-sm sm:text-base">How it fits</h3>
                  <HumanSilhouette selectedSize={selectedSize} clothingData={clothingData} activeArea={hoveredArea} />

                  {/* Size selector */}
                  <div className="mt-4 sm:mt-6">
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 text-center">
                      Select size to preview fit:
                    </p>
                    <div className="flex gap-1.5 sm:gap-2 justify-center flex-wrap">
                      {sizes.map((size) => (
                        <Button
                          key={size}
                          variant={selectedSize === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => onSizeSelect(size)}
                          className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Measurement areas */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold mb-4 text-sm sm:text-base">Measurement Areas</h3>
                  <div className="space-y-3">
                    {clothingData.fitAreas.map((area: any) => (
                      <div
                        key={area.name}
                        className="flex items-center gap-3 p-2 sm:p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                        onMouseEnter={() => setHoveredArea(area.name)}
                        onMouseLeave={() => setHoveredArea(undefined)}
                      >
                        <div
                          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: area.color }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-xs sm:text-sm">{area.label}</p>
                          {selectedSize && (
                            <p className="text-xs text-muted-foreground">
                              {clothingData.sizes[selectedSize][area.name]}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedSize && (
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs sm:text-sm font-medium text-primary mb-1">Size {selectedSize} Fit:</p>
                      <p className="text-xs text-muted-foreground">{clothingData.sizes[selectedSize].fit}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Measurements Tab */}
          <TabsContent value="measurements" className="space-y-4">
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold">Size</th>
                        {clothingData.measurements.map((measurement: string) => (
                          <th
                            key={measurement}
                            className="text-center py-2 sm:py-3 px-1 sm:px-2 font-semibold capitalize"
                          >
                            {measurement}
                          </th>
                        ))}
                        <th className="text-left py-2 sm:py-3 px-1 sm:px-2 font-semibold">Fit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizes.map((size) => (
                        <tr
                          key={size}
                          className={`border-b hover:bg-muted/50 cursor-pointer transition-colors ${
                            selectedSize === size ? "bg-primary/5 border-primary/20" : ""
                          }`}
                          onClick={() => onSizeSelect(size)}
                        >
                          <td className="py-2 sm:py-3 px-1 sm:px-2 font-medium">
                            <div className="flex items-center gap-2">
                              {size}
                              {selectedSize === size && (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </td>
                          {clothingData.measurements.map((measurement: string) => (
                            <td key={measurement} className="text-center py-2 sm:py-3 px-1 sm:px-2">
                              {clothingData.sizes[size][measurement]}"
                            </td>
                          ))}
                          <td className="py-2 sm:py-3 px-1 sm:px-2 text-xs text-muted-foreground max-w-[120px] sm:max-w-none">
                            {clothingData.sizes[size].fit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fit Guide Tab */}
          <TabsContent value="fit" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sizes.map((size) => (
                <Card
                  key={size}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedSize === size ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                  onClick={() => onSizeSelect(size)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h4 className="font-semibold text-sm sm:text-base">Size {size}</h4>
                      {selectedSize === size && <Badge className="text-xs">Selected</Badge>}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                      {clothingData.sizes[size].fit}
                    </p>
                    <div className="space-y-1">
                      {clothingData.measurements.slice(0, 2).map((measurement: string) => (
                        <div key={measurement} className="flex justify-between text-xs">
                          <span className="capitalize text-muted-foreground">{measurement}:</span>
                          <span className="font-medium">{clothingData.sizes[size][measurement]}"</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Fit tips */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold mb-3 text-sm sm:text-base">Fit Tips</h3>
                <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <p>• Measurements are in inches and represent body measurements, not garment measurements</p>
                  <p>• For the best fit, measure yourself and compare to our size chart</p>
                  <p>• If you're between sizes, consider your preferred fit (fitted vs. relaxed)</p>
                  <p>• Custom alterations can be requested in the manufacturing notes</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action buttons */}
        <div className="flex gap-2 sm:gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1 text-xs sm:text-sm bg-transparent">
            Close
          </Button>
          {selectedSize && (
            <Button
              onClick={() => {
                onSizeSelect(selectedSize)
                onClose()
              }}
              className="flex-1 text-xs sm:text-sm"
            >
              Confirm Size {selectedSize}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
