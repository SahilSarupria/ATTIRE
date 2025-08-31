"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Leaf, Star, Shirt, Info, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Fabric {
  fabric_id: string
  fabric_name: string
  fabric_type: string
  description: string
  estimated_price: number
  price_per_yard: number
  recommendation_score: number
  is_premium: boolean
  is_sustainable: boolean
  sustainability_score: number
  durability_score: number
  comfort_score: number
  care_instructions: string
  color_options: string[]
  stock_quantity: number
}

interface FabricSelectorProps {
  clothingType: string
  onFabricSelect: (fabric: Fabric) => void
  selectedFabricId?: string
  budgetRange?: [number, number]
}

export function FabricSelector({ clothingType, onFabricSelect, selectedFabricId, budgetRange }: FabricSelectorProps) {
  const [fabrics, setFabrics] = useState<Fabric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [localBudgetRange, setLocalBudgetRange] = useState<[number, number]>(budgetRange || [20, 200])
  const [filterSustainable, setFilterSustainable] = useState(false)
  const [filterPremium, setFilterPremium] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchFabricRecommendations()
  }, [clothingType, localBudgetRange, filterSustainable, filterPremium])

  const fetchFabricRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        clothing_type: clothingType,
        min_budget: localBudgetRange[0].toString(),
        max_budget: localBudgetRange[1].toString(),
      })

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/fabric-recommendations/?${params}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch fabric recommendations")
      }

      const data = await response.json()

      let filteredFabrics = data.recommendations || []

      // Apply filters
      if (filterSustainable) {
        filteredFabrics = filteredFabrics.filter((f: Fabric) => f.is_sustainable)
      }

      if (filterPremium) {
        filteredFabrics = filteredFabrics.filter((f: Fabric) => f.is_premium)
      }

      setFabrics(filteredFabrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      toast({
        title: "Error",
        description: "Failed to load fabric recommendations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFabricSelect = (fabric: Fabric) => {
    onFabricSelect(fabric)
    toast({
      title: "Fabric Selected",
      description: `Selected ${fabric.fabric_name} for ${clothingType}`,
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "text-green-600"
    if (score >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return "Excellent"
    if (score >= 0.6) return "Good"
    return "Fair"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-5 w-5" />
            Fabric Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading fabric recommendations...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-5 w-5" />
            Fabric Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchFabricRecommendations} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shirt className="h-5 w-5" />
          Fabric Recommendations for {clothingType}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="recommendations" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Budget Range: ${localBudgetRange[0]} - ${localBudgetRange[1]}
                </label>
                <Slider
                  value={localBudgetRange}
                  onValueChange={(value) => setLocalBudgetRange(value as [number, number])}
                  max={500}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant={filterSustainable ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterSustainable(!filterSustainable)}
                  className="flex items-center gap-2"
                >
                  <Leaf className="h-4 w-4" />
                  Sustainable Only
                </Button>

                <Button
                  variant={filterPremium ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterPremium(!filterPremium)}
                  className="flex items-center gap-2"
                >
                  <Star className="h-4 w-4" />
                  Premium Only
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {fabrics.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No fabric recommendations found for your criteria.</p>
                <Button
                  onClick={() => {
                    setLocalBudgetRange([20, 500])
                    setFilterSustainable(false)
                    setFilterPremium(false)
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {fabrics.map((fabric) => (
                  <Card
                    key={fabric.fabric_id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedFabricId === fabric.fabric_id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => handleFabricSelect(fabric)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{fabric.fabric_name}</h3>
                            {selectedFabricId === fabric.fabric_id && <Check className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-sm text-muted-foreground capitalize">{fabric.fabric_type}</p>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">${fabric.estimated_price.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground">${fabric.price_per_yard.toFixed(2)}/yard</div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{fabric.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {fabric.is_premium && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        {fabric.is_sustainable && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            <Leaf className="h-3 w-3 mr-1" />
                            Sustainable
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          Score: {(fabric.recommendation_score * 100).toFixed(0)}%
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-center">
                                <div className={`font-medium ${getScoreColor(fabric.durability_score)}`}>
                                  {getScoreLabel(fabric.durability_score)}
                                </div>
                                <div className="text-muted-foreground">Durability</div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Durability Score: {(fabric.durability_score * 100).toFixed(0)}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-center">
                                <div className={`font-medium ${getScoreColor(fabric.comfort_score)}`}>
                                  {getScoreLabel(fabric.comfort_score)}
                                </div>
                                <div className="text-muted-foreground">Comfort</div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Comfort Score: {(fabric.comfort_score * 100).toFixed(0)}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="text-center">
                                <div className={`font-medium ${getScoreColor(fabric.sustainability_score)}`}>
                                  {getScoreLabel(fabric.sustainability_score)}
                                </div>
                                <div className="text-muted-foreground">Eco-Friendly</div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Sustainability Score: {(fabric.sustainability_score * 100).toFixed(0)}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {fabric.care_instructions && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Info className="h-3 w-3" />
                            {fabric.care_instructions}
                          </div>
                        </div>
                      )}

                      {fabric.color_options && fabric.color_options.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">Available colors:</div>
                          <div className="flex flex-wrap gap-1">
                            {fabric.color_options.slice(0, 5).map((color) => (
                              <Badge key={color} variant="outline" className="text-xs">
                                {color}
                              </Badge>
                            ))}
                            {fabric.color_options.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{fabric.color_options.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
                        <span>Stock: {fabric.stock_quantity} yards</span>
                        <span>Recommendation: {(fabric.recommendation_score * 100).toFixed(0)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
