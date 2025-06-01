// Server-side clothing analyzer that doesn't use browser APIs
export interface ClothingElement {
  id: string
  name: string
  type: "top" | "bottom" | "outerwear" | "footwear" | "accessory"
  price: number
  fabric: string
  color: string
  coordinates: {
    x: number
    y: number
    width: number
    height: number
  }
  confidence: number
}

export interface AnalysisResult {
  elements: ClothingElement[]
  totalItems: number
  dominantColors: string[]
  estimatedComplexity: "simple" | "moderate" | "complex"
}

export class ServerClothingAnalyzer {
  private clothingTypes = {
    tops: ["shirt", "t-shirt", "tshirt", "blouse", "tank", "sweater", "hoodie", "cardigan", "vest", "top"],
    bottoms: ["pants", "jeans", "trousers", "shorts", "skirt", "dress", "leggings", "bottom"],
    outerwear: ["jacket", "coat", "blazer", "cardigan", "vest", "hoodie", "outerwear"],
    footwear: ["shoes", "boots", "sneakers", "sandals", "heels", "flats", "footwear"],
    accessories: ["hat", "cap", "scarf", "belt", "bag", "purse", "watch", "jewelry", "accessory"],
  }

  private fabricTypes = [
    "cotton",
    "silk",
    "wool",
    "polyester",
    "denim",
    "leather",
    "linen",
    "cashmere",
    "velvet",
    "satin",
    "chiffon",
    "jersey",
    "flannel",
    "corduroy",
    "canvas",
    "tweed",
  ]

  private colorKeywords = [
    "black",
    "white",
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "pink",
    "orange",
    "brown",
    "gray",
    "grey",
    "navy",
    "beige",
    "cream",
    "maroon",
    "teal",
    "olive",
    "burgundy",
    "khaki",
    "tan",
    "coral",
    "mint",
    "lavender",
    "turquoise",
  ]

  private priceRanges = {
    shirt: { min: 25, max: 80 },
    "t-shirt": { min: 15, max: 45 },
    tshirt: { min: 15, max: 45 },
    blouse: { min: 35, max: 120 },
    pants: { min: 40, max: 150 },
    jeans: { min: 50, max: 200 },
    dress: { min: 60, max: 300 },
    jacket: { min: 80, max: 400 },
    coat: { min: 100, max: 500 },
    shoes: { min: 60, max: 300 },
    boots: { min: 80, max: 350 },
    sneakers: { min: 70, max: 250 },
    sweater: { min: 45, max: 180 },
    hoodie: { min: 35, max: 120 },
  }

  private clothingPatterns = {
    shirt: {
      position: { top: 0.1, bottom: 0.6 },
      width: { min: 0.3, max: 0.7 },
      aspectRatio: { min: 0.6, max: 1.4 },
    },
    pants: {
      position: { top: 0.4, bottom: 0.9 },
      width: { min: 0.3, max: 0.6 },
      aspectRatio: { min: 0.4, max: 0.8 },
    },
    dress: {
      position: { top: 0.1, bottom: 0.8 },
      width: { min: 0.4, max: 0.8 },
      aspectRatio: { min: 0.3, max: 0.7 },
    },
    jacket: {
      position: { top: 0.05, bottom: 0.65 },
      width: { min: 0.4, max: 0.8 },
      aspectRatio: { min: 0.7, max: 1.3 },
    },
  }

  async analyzeImage(imageUrl: string, originalPrompt: string): Promise<AnalysisResult> {
    try {
      // Analyze the prompt for clothing items and context
      const promptAnalysis = this.analyzePrompt(originalPrompt)

      // Generate clothing elements based on prompt analysis
      const elements = this.generateClothingElements(promptAnalysis)

      return {
        elements,
        totalItems: elements.length,
        dominantColors: promptAnalysis.colors,
        estimatedComplexity: this.calculateComplexity(elements, originalPrompt),
      }
    } catch (error) {
      console.error("Error in server clothing analysis:", error)
      return this.getFallbackAnalysis(originalPrompt)
    }
  }

  private analyzePrompt(prompt: string): any {
    const lowerPrompt = prompt.toLowerCase()
    const detectedItems = []
    const colors = []
    const fabrics = []
    const styles = []

    // Detect clothing types with confidence scoring
    for (const [category, items] of Object.entries(this.clothingTypes)) {
      for (const item of items) {
        if (lowerPrompt.includes(item)) {
          const confidence = this.calculateItemConfidence(item, lowerPrompt)
          detectedItems.push({
            item,
            category: this.mapCategoryToType(category),
            confidence,
            baseItem: item,
          })
        }
      }
    }

    // Remove duplicates and keep highest confidence items
    const uniqueItems = this.deduplicateItems(detectedItems)

    // Detect colors
    for (const color of this.colorKeywords) {
      if (lowerPrompt.includes(color)) {
        colors.push(color)
      }
    }

    // Detect fabrics
    for (const fabric of this.fabricTypes) {
      if (lowerPrompt.includes(fabric)) {
        fabrics.push(fabric)
      }
    }

    // Detect style keywords
    const styleKeywords = ["casual", "formal", "vintage", "modern", "classic", "trendy", "elegant", "sporty"]
    for (const style of styleKeywords) {
      if (lowerPrompt.includes(style)) {
        styles.push(style)
      }
    }

    return {
      items: uniqueItems,
      colors: colors.length > 0 ? colors : ["mixed"],
      fabrics: fabrics.length > 0 ? fabrics : ["cotton blend"],
      styles: styles,
      complexity: this.assessPromptComplexity(lowerPrompt),
      originalPrompt: prompt,
    }
  }

  private calculateItemConfidence(item: string, prompt: string): number {
    let confidence = 0.7 // Base confidence

    // Increase confidence for exact matches
    if (prompt.includes(` ${item} `) || prompt.startsWith(item) || prompt.endsWith(item)) {
      confidence += 0.2
    }

    // Increase confidence for descriptive context
    const descriptors = ["wearing", "with", "style", "design", "custom", "made"]
    for (const descriptor of descriptors) {
      if (prompt.includes(descriptor)) {
        confidence += 0.1
        break
      }
    }

    return Math.min(1.0, confidence)
  }

  private deduplicateItems(items: any[]): any[] {
    const itemMap = new Map()

    for (const item of items) {
      const key = item.category
      if (!itemMap.has(key) || itemMap.get(key).confidence < item.confidence) {
        itemMap.set(key, item)
      }
    }

    return Array.from(itemMap.values())
  }

  private mapCategoryToType(category: string): "top" | "bottom" | "outerwear" | "footwear" | "accessory" {
    const mapping: Record<string, "top" | "bottom" | "outerwear" | "footwear" | "accessory"> = {
      tops: "top",
      bottoms: "bottom",
      outerwear: "outerwear",
      footwear: "footwear",
      accessories: "accessory",
    }
    return mapping[category] || "top"
  }

  private generateClothingElements(promptAnalysis: any): ClothingElement[] {
    const elements: ClothingElement[] = []

    if (promptAnalysis.items.length > 0) {
      // Generate elements for detected items
      promptAnalysis.items.forEach((item: any, index: number) => {
        const coordinates = this.generateCoordinatesForItem(item.category, index, promptAnalysis.items.length)
        const element = this.createClothingElement(item, promptAnalysis, coordinates, index)
        elements.push(element)
      })
    } else {
      // Create a general element if no specific items detected
      const generalElement = this.createGeneralElement(promptAnalysis)
      elements.push(generalElement)
    }

    // Add complementary items based on detected items
    const complementaryElements = this.generateComplementaryItems(elements, promptAnalysis)
    elements.push(...complementaryElements)

    return elements
  }

  private generateCoordinatesForItem(type: string, index: number, totalItems: number) {
    const baseCoordinates = {
      top: { x: 25, y: 15, width: 50, height: 35 },
      bottom: { x: 25, y: 50, width: 50, height: 40 },
      outerwear: { x: 20, y: 10, width: 60, height: 50 },
      footwear: { x: 30, y: 85, width: 40, height: 15 },
      accessory: { x: 35, y: 5, width: 30, height: 15 },
    }

    const base = baseCoordinates[type as keyof typeof baseCoordinates] || baseCoordinates.top

    // Add variation for multiple items of same type
    const variation = index * 3
    const horizontalOffset = (index % 2) * 10

    return {
      x: Math.max(5, Math.min(85, base.x + horizontalOffset)),
      y: Math.max(5, Math.min(85, base.y + variation)),
      width: Math.max(20, Math.min(70, base.width)),
      height: Math.max(15, Math.min(60, base.height)),
    }
  }

  private createClothingElement(item: any, promptAnalysis: any, coordinates: any, index: number): ClothingElement {
    const basePrice = this.priceRanges[item.baseItem as keyof typeof this.priceRanges] || { min: 30, max: 100 }

    // Apply complexity and style multipliers
    let complexityMultiplier = 1.0
    switch (promptAnalysis.complexity) {
      case "complex":
        complexityMultiplier = 1.5
        break
      case "moderate":
        complexityMultiplier = 1.2
        break
      default:
        complexityMultiplier = 1.0
    }

    // Style multipliers
    const styleMultiplier =
      promptAnalysis.styles.includes("formal") || promptAnalysis.styles.includes("elegant") ? 1.3 : 1.0

    const finalPrice = Math.round(
      (basePrice.min + Math.random() * (basePrice.max - basePrice.min)) * complexityMultiplier * styleMultiplier,
    )

    return {
      id: `${item.baseItem}_${index}`,
      name: this.capitalizeWords(item.baseItem.replace(/[-_]/g, " ")),
      type: item.category,
      price: finalPrice,
      fabric: this.selectFabric(item.baseItem, promptAnalysis.fabrics),
      color: promptAnalysis.colors[index % promptAnalysis.colors.length] || "Multi-Color",
      coordinates,
      confidence: item.confidence,
    }
  }

  private selectFabric(itemType: string, detectedFabrics: string[]): string {
    if (detectedFabrics.length > 0 && detectedFabrics[0] !== "cotton blend") {
      return this.capitalizeWords(detectedFabrics[0])
    }

    // Default fabrics based on item type
    const defaultFabrics: Record<string, string> = {
      "t-shirt": "Cotton",
      tshirt: "Cotton",
      shirt: "Cotton",
      jeans: "Denim",
      pants: "Cotton Twill",
      dress: "Polyester Blend",
      jacket: "Polyester",
      sweater: "Wool Blend",
      hoodie: "Cotton Fleece",
    }

    return defaultFabrics[itemType] || "Cotton Blend"
  }

  private generateComplementaryItems(existingElements: ClothingElement[], promptAnalysis: any): ClothingElement[] {
    const complementary: ClothingElement[] = []
    const existingTypes = new Set(existingElements.map((e) => e.type))

    // If we have a top but no bottom, suggest a bottom
    if (existingTypes.has("top") && !existingTypes.has("bottom") && existingElements.length < 3) {
      complementary.push(this.createComplementaryElement("bottom", "pants", promptAnalysis, existingElements.length))
    }

    // If we have bottoms but no top, suggest a top
    if (existingTypes.has("bottom") && !existingTypes.has("top") && existingElements.length < 3) {
      complementary.push(this.createComplementaryElement("top", "shirt", promptAnalysis, existingElements.length))
    }

    // Add footwear if outfit is complete but no shoes
    if (
      (existingTypes.has("top") || existingTypes.has("bottom")) &&
      !existingTypes.has("footwear") &&
      existingElements.length < 4
    ) {
      complementary.push(this.createComplementaryElement("footwear", "shoes", promptAnalysis, existingElements.length))
    }

    return complementary
  }

  private createComplementaryElement(
    type: string,
    itemName: string,
    promptAnalysis: any,
    index: number,
  ): ClothingElement {
    const coordinates = this.generateCoordinatesForItem(type, index, index + 1)
    const basePrice = this.priceRanges[itemName as keyof typeof this.priceRanges] || { min: 40, max: 100 }

    return {
      id: `complementary_${itemName}_${index}`,
      name: this.capitalizeWords(itemName),
      type: type as any,
      price: Math.round(basePrice.min + Math.random() * (basePrice.max - basePrice.min)),
      fabric: this.selectFabric(itemName, promptAnalysis.fabrics),
      color: promptAnalysis.colors[index % promptAnalysis.colors.length] || "Neutral",
      coordinates,
      confidence: 0.6, // Lower confidence for generated items
    }
  }

  private createGeneralElement(promptAnalysis: any): ClothingElement {
    return {
      id: "custom_design",
      name: "Custom Design",
      type: "top",
      price: 89.99,
      fabric: promptAnalysis.fabrics[0] || "Mixed Materials",
      color: promptAnalysis.colors[0] || "As Designed",
      coordinates: { x: 15, y: 15, width: 70, height: 70 },
      confidence: 0.8,
    }
  }

  private assessPromptComplexity(prompt: string): "simple" | "moderate" | "complex" {
    const complexityIndicators = [
      "embroidery",
      "embroidered",
      "pattern",
      "patterned",
      "print",
      "printed",
      "detailed",
      "intricate",
      "layered",
      "textured",
      "beading",
      "beaded",
      "sequins",
      "sequined",
      "applique",
      "pleated",
      "ruffled",
      "tailored",
      "custom",
      "designer",
      "luxury",
    ]

    const complexityScore = complexityIndicators.reduce((score, indicator) => {
      return score + (prompt.includes(indicator) ? 1 : 0)
    }, 0)

    // Also consider length and detail of prompt
    const wordCount = prompt.split(" ").length
    const lengthScore = wordCount > 20 ? 2 : wordCount > 10 ? 1 : 0

    const totalScore = complexityScore + lengthScore

    if (totalScore >= 4) return "complex"
    if (totalScore >= 2) return "moderate"
    return "simple"
  }

  private calculateComplexity(elements: ClothingElement[], prompt: string): "simple" | "moderate" | "complex" {
    const elementCount = elements.length
    const promptComplexity = this.assessPromptComplexity(prompt.toLowerCase())

    if (elementCount >= 4 || promptComplexity === "complex") return "complex"
    if (elementCount >= 2 || promptComplexity === "moderate") return "moderate"
    return "simple"
  }

  private getFallbackAnalysis(prompt: string): AnalysisResult {
    const promptAnalysis = this.analyzePrompt(prompt)

    return {
      elements: [
        {
          id: "fallback_design",
          name: "Custom Clothing Design",
          type: "top",
          price: 79.99,
          fabric: promptAnalysis.fabrics[0] || "Cotton Blend",
          color: promptAnalysis.colors[0] || "Multi-Color",
          coordinates: { x: 20, y: 20, width: 60, height: 60 },
          confidence: 0.7,
        },
      ],
      totalItems: 1,
      dominantColors: promptAnalysis.colors,
      estimatedComplexity: promptAnalysis.complexity,
    }
  }

  private capitalizeWords(str: string): string {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }
}
