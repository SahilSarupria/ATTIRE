import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { capitalize } from "@/lib/utils"

interface CostBreakdownProps {
  cost: number
  breakdown: {
    material: {
      type: string
      cost: number
    }
    labor: number
    complexityFeatures: string[]
    complexityMultiplier: number
  }
}

export function CostBreakdown({ cost, breakdown }: CostBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Manufacturing Cost Estimate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="text-lg font-bold">Total Estimate:</span>
          <span className="text-2xl font-bold">${cost.toFixed(2)}</span>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Material ({capitalize(breakdown.material.type)}):</span>
            <span className="font-medium">${breakdown.material.cost.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">Labor:</span>
            <span className="font-medium">${breakdown.labor.toFixed(2)}</span>
          </div>

          {breakdown.complexityFeatures.length > 0 && (
            <div className="space-y-1">
              <span className="text-sm">Complexity Features:</span>
              <div className="flex flex-wrap gap-1">
                {breakdown.complexityFeatures.map((feature) => (
                  <Badge key={feature} variant="outline">
                    {capitalize(feature)}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Complexity Multiplier:</span>
                <span>x{breakdown.complexityMultiplier.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground mt-4">
          <p>This is an estimate based on the design description and may vary based on final specifications.</p>
        </div>
      </CardContent>
    </Card>
  )
}
