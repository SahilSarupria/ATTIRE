import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Cpu, Scissors, DollarSign } from "lucide-react"
import Header from "@/components/Header"


export default function HowItWorksPage() {
  return (
   
   
    <div className="container mx-auto py-12 px-4">
      <>
      <Header />
      <p><br></br><br></br></p>
    </>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">How DXRKICE Works</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Our AI-powered platform transforms your ideas into custom clothing designs with just a few steps.
        </p>

        <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Mic className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Describe Your Vision</CardTitle>
                <CardDescription>
                  Use your voice, upload a reference ImageIcon, or type a detailed description of your dream clothing
                  item.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our system processes your input to understand exactly what you're looking for. The more details you
                provide, the better the results will be. Mention colors, patterns, materials, and any special features
                you want.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>AI Design Generation</CardTitle>
                <CardDescription>
                  Our advanced AI models transform your description into a photorealistic clothing design.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Using state-of-the-art image generation technology, our system creates a high-fidelity visualization of
                your custom clothing item. The AI has been trained on thousands of fashion designs to ensure accuracy
                and quality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Cost Estimation</CardTitle>
                <CardDescription>
                  Get an instant estimate of manufacturing costs based on your design's complexity and materials.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our system analyzes your design to calculate material costs, labor requirements, and complexity factors.
                This gives you a transparent breakdown of the manufacturing costs before you commit to an order.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Scissors className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Production & Delivery</CardTitle>
                <CardDescription>
                  Once you approve the design, our skilled craftspeople bring it to life with precision.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your approved design is converted into manufacturing specifications and produced by our expert team. We
                use high-quality materials and rigorous quality control to ensure your custom clothing item matches the
                AI-generated design with over 99% accuracy.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-muted p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Our Accuracy Guarantee</h2>
          <p className="mb-4">
            We're committed to delivering custom clothing that matches your AI-generated design with over 99% accuracy.
            If you're not satisfied with the final product, we offer:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Free alterations to address any discrepancies</li>
            {/* <li>Full refund if we can't meet your expectations</li> */}
            <li>Detailed quality reports showing how we matched your design specifications</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
