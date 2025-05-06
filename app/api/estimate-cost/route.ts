import type { NextRequest } from "next/server"

// This would ideally be stored in a database
const MATERIAL_COSTS = {
  cotton: 5,
  silk: 15,
  wool: 12,
  polyester: 3,
  denim: 8,
  leather: 25,
  linen: 10,
}

const COMPLEXITY_FACTORS = {
  embroidery: 1.5,
  print: 1.2,
  beading: 1.8,
  sequins: 1.6,
  applique: 1.4,
  pleats: 1.3,
  ruffles: 1.3,
}

const BASE_LABOR_COST = 20 // Base labor cost in dollars

export async function POST(req: NextRequest) {
  try {
    const { prompt, designType } = await req.json()

    if (!prompt) {
      return Response.json({ error: "No prompt provided" }, { status: 400 })
    }

    // Analyze the prompt to determine materials and complexity
    const promptLower = prompt.toLowerCase()

    // Determine primary material
    let primaryMaterial = "cotton" // Default
    let materialCost = MATERIAL_COSTS.cotton

    for (const material of Object.keys(MATERIAL_COSTS)) {
      if (promptLower.includes(material)) {
        primaryMaterial = material
        materialCost = MATERIAL_COSTS[material as keyof typeof MATERIAL_COSTS]
        break
      }
    }

    // Determine complexity factors
    let complexityMultiplier = 1.0
    const complexityFeatures = []

    for (const feature of Object.keys(COMPLEXITY_FACTORS)) {
      if (promptLower.includes(feature)) {
        complexityFeatures.push(feature)
        complexityMultiplier *= COMPLEXITY_FACTORS[feature as keyof typeof COMPLEXITY_FACTORS]
      }
    }

    // Calculate size-based cost
    let sizeCost = 1.0
    if (promptLower.includes("large") || promptLower.includes(" xl") || promptLower.includes("extra large")) {
      sizeCost = 1.2
    } else if (promptLower.includes("small") || promptLower.includes(" xs") || promptLower.includes("extra small")) {
      sizeCost = 0.9
    }

    // Calculate design type cost
    let designTypeCost = 1.0
    switch (designType) {
      case "shirt":
      case "t-shirt":
        designTypeCost = 1.0
        break
      case "dress":
        designTypeCost = 1.5
        break
      case "jacket":
      case "coat":
        designTypeCost = 2.0
        break
      case "pants":
      case "trousers":
        designTypeCost = 1.2
        break
      default:
        designTypeCost = 1.0
    }

    // Calculate final cost
    const materialTotal = materialCost * sizeCost
    const laborCost = BASE_LABOR_COST * complexityMultiplier * designTypeCost
    const totalCost = materialTotal + laborCost

    // Round to 2 decimal places
    const finalCost = Math.round(totalCost * 100) / 100

    return Response.json({
      estimatedCost: finalCost,
      breakdown: {
        material: {
          type: primaryMaterial,
          cost: Math.round(materialTotal * 100) / 100,
        },
        labor: Math.round(laborCost * 100) / 100,
        complexityFeatures,
        complexityMultiplier: Math.round(complexityMultiplier * 100) / 100,
      },
    })
  } catch (error) {
    console.error("Cost estimation error:", error)
    return Response.json({ error: "Failed to estimate cost" }, { status: 500 })
  }
}
