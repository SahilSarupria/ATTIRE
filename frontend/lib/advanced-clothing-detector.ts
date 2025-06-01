// Advanced clothing detection with pattern recognition
export class AdvancedClothingDetector {
  private patterns = {
    // Common clothing silhouettes and their characteristics
    shirt: {
      aspectRatio: { min: 0.6, max: 1.4 },
      position: { top: 0.1, bottom: 0.6 },
      width: { min: 0.3, max: 0.7 },
    },
    pants: {
      aspectRatio: { min: 0.4, max: 0.8 },
      position: { top: 0.4, bottom: 0.9 },
      width: { min: 0.3, max: 0.6 },
    },
    dress: {
      aspectRatio: { min: 0.3, max: 0.7 },
      position: { top: 0.1, bottom: 0.8 },
      width: { min: 0.4, max: 0.8 },
    },
    jacket: {
      aspectRatio: { min: 0.7, max: 1.3 },
      position: { top: 0.05, bottom: 0.65 },
      width: { min: 0.4, max: 0.8 },
    },
  }

  async detectClothingRegions(imageUrl: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("Could not get canvas context"))
            return
          }

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          // Apply edge detection and region analysis
          const regions = this.performRegionAnalysis(ctx, canvas.width, canvas.height)
          resolve(regions)
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageUrl
    })
  }

  private performRegionAnalysis(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data

    // Apply simple edge detection
    const edges = this.detectEdges(data, width, height)

    // Find connected regions
    const regions = this.findConnectedRegions(edges, width, height)

    // Filter and classify regions
    const clothingRegions = this.classifyRegions(regions, width, height)

    return clothingRegions
  }

  private detectEdges(data: Uint8ClampedArray, width: number, height: number): boolean[] {
    const edges = new Array(width * height).fill(false)
    const threshold = 30

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4

        // Get current pixel intensity
        const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3

        // Check neighboring pixels
        const neighbors = [
          ((y - 1) * width + x) * 4, // top
          ((y + 1) * width + x) * 4, // bottom
          (y * width + (x - 1)) * 4, // left
          (y * width + (x + 1)) * 4, // right
        ]

        let maxDiff = 0
        for (const nIdx of neighbors) {
          const neighbor = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3
          maxDiff = Math.max(maxDiff, Math.abs(current - neighbor))
        }

        edges[y * width + x] = maxDiff > threshold
      }
    }

    return edges
  }

  private findConnectedRegions(edges: boolean[], width: number, height: number) {
    const visited = new Array(width * height).fill(false)
    const regions = []

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x

        if (!visited[idx] && !edges[idx]) {
          const region = this.floodFill(edges, visited, x, y, width, height)
          if (region.pixels.length > 100) {
            // Filter small regions
            regions.push(region)
          }
        }
      }
    }

    return regions
  }

  private floodFill(
    edges: boolean[],
    visited: boolean[],
    startX: number,
    startY: number,
    width: number,
    height: number,
  ) {
    const stack = [{ x: startX, y: startY }]
    const pixels = []
    let minX = startX,
      maxX = startX,
      minY = startY,
      maxY = startY

    while (stack.length > 0) {
      const { x, y } = stack.pop()!
      const idx = y * width + x

      if (x < 0 || x >= width || y < 0 || y >= height || visited[idx] || edges[idx]) {
        continue
      }

      visited[idx] = true
      pixels.push({ x, y })

      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)

      // Add neighbors to stack
      stack.push({ x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 })
    }

    return {
      pixels,
      bounds: { minX, maxX, minY, maxY },
      width: maxX - minX,
      height: maxY - minY,
    }
  }

  private classifyRegions(regions: any[], imageWidth: number, imageHeight: number) {
    const clothingRegions = []

    for (const region of regions) {
      const { bounds, width: regionWidth, height: regionHeight } = region

      // Calculate relative position and size
      const relativeX = bounds.minX / imageWidth
      const relativeY = bounds.minY / imageHeight
      const relativeWidth = regionWidth / imageWidth
      const relativeHeight = regionHeight / imageHeight
      const aspectRatio = regionWidth / regionHeight

      // Try to match against clothing patterns
      for (const [clothingType, pattern] of Object.entries(this.patterns)) {
        if (this.matchesPattern(relativeX, relativeY, relativeWidth, relativeHeight, aspectRatio, pattern)) {
          clothingRegions.push({
            type: clothingType,
            coordinates: {
              x: relativeX * 100,
              y: relativeY * 100,
              width: relativeWidth * 100,
              height: relativeHeight * 100,
            },
            confidence: this.calculateConfidence(
              relativeX,
              relativeY,
              relativeWidth,
              relativeHeight,
              aspectRatio,
              pattern,
            ),
          })
          break
        }
      }
    }

    return clothingRegions
  }

  private matchesPattern(
    x: number,
    y: number,
    width: number,
    height: number,
    aspectRatio: number,
    pattern: any,
  ): boolean {
    // Check if the region matches the expected pattern for this clothing type
    const positionMatch = y >= pattern.position.top && y <= pattern.position.bottom
    const widthMatch = width >= pattern.width.min && width <= pattern.width.max
    const aspectMatch = aspectRatio >= pattern.aspectRatio.min && aspectRatio <= pattern.aspectRatio.max

    return positionMatch && widthMatch && aspectMatch
  }

  private calculateConfidence(
    x: number,
    y: number,
    width: number,
    height: number,
    aspectRatio: number,
    pattern: any,
  ): number {
    // Calculate how well the region matches the expected pattern
    let confidence = 0.5

    // Position confidence
    const positionCenter = (pattern.position.top + pattern.position.bottom) / 2
    const positionDistance = Math.abs(y - positionCenter)
    confidence += (1 - positionDistance) * 0.3

    // Size confidence
    const widthCenter = (pattern.width.min + pattern.width.max) / 2
    const widthDistance = Math.abs(width - widthCenter) / widthCenter
    confidence += (1 - widthDistance) * 0.2

    return Math.min(1, Math.max(0, confidence))
  }
}
