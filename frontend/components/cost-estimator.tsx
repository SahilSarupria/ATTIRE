"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface CostEstimatorProps {
  prompt: string
  onEstimationComplete: (cost: number, breakdown: any) => void
}

export function CostEstimator({ prompt, onEstimationComplete }: CostEstimatorProps) {
  const [designType, setDesignType] = useState<string>("shirt")
  const [isEstimating, setIsEstimating] = useState(false)
  const { toast } = useToast()

  // This component is no longer needed - removed manufacturing cost estimation

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

        <Button className="w-full" onClick={() => {}} disabled={true}>
          Estimation Removed
        </Button>
      </CardContent>
    </Card>
  )
}
