"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CostEstimatorProps {
  prompt: string
  onEstimationComplete: (cost: number, breakdown: any) => void
}

export function CostEstimator({ prompt, onEstimationComplete }: CostEstimatorProps) {
  const [designType, setDesignType] = useState<string>("shirt")
  const [isEstimating, setIsEstimating] = useState(false)
  const { toast } = useToast()

  const estimateCost = async () => {
    if (!prompt) {
      toast({
        title: "Missing Information",
        description: "Please provide a design description first.",
        variant: "destructive",
      })
      return
    }

    setIsEstimating(true)

    try {
      const response = await fetch("/api/estimate-cost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          designType,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      onEstimationComplete(data.estimatedCost, data.breakdown)
    } catch (error) {
      console.error("Error estimating cost:", error)
      toast({
        title: "Estimation Failed",
        description: "There was an error estimating the cost. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEstimating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estimate Manufacturing Cost</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="design-type" className="text-sm font-medium">
            Clothing Type
          </label>
          <Select value={designType} onValueChange={setDesignType}>
            <SelectTrigger id="design-type">
              <SelectValue placeholder="Select clothing type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shirt">T-Shirt / Shirt</SelectItem>
              <SelectItem value="dress">Dress</SelectItem>
              <SelectItem value="jacket">Jacket / Coat</SelectItem>
              <SelectItem value="pants">Pants / Trousers</SelectItem>
              <SelectItem value="skirt">Skirt</SelectItem>
              <SelectItem value="sweater">Sweater</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full" onClick={estimateCost} disabled={isEstimating || !prompt}>
          {isEstimating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Estimate Cost
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
