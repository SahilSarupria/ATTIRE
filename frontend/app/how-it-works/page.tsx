"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Instagram,
  Twitter,
  MapPin,
  Mail,
  Mic,
  Cpu,
  Scissors,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Zap,
  Shield,
  Clock,
  Users,
  ChevronDown,
  Play,
  ImageIcon,
  Type,
  Palette,
  Brain,
  Calculator,
  Truck,
  Award,
  Target,
} from "lucide-react"
import Header from "@/components/Header"
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion"
import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"

const steps = [
  {
    icon: Mic,
    title: "Describe Your Vision",
    subtitle: "Multiple Input Methods",
    description:
      "Transform your ideas into detailed descriptions using voice, images, or text. Our AI understands your creative language.",
    details:
      "Whether you sketch on paper, have a reference photo, or can only describe it in words, our advanced AI processes all forms of input. The system analyzes colors, textures, patterns, fit preferences, and style elements to create a comprehensive understanding of your vision. The more specific you are about materials, occasions, and personal style, the more accurate your final design will be.",
    duration: "30 seconds",
    tips: "Pro tip: Mention specific colors, occasions, and style preferences for best results",
    methods: [
      { icon: Mic, label: "Voice Recording", desc: "Speak naturally about your design" },
      { icon: ImageIcon, label: "Image Upload", desc: "Upload inspiration photos or sketches" },
      { icon: Type, label: "Text Description", desc: "Write detailed specifications" },
    ],
  },
  {
    icon: Cpu,
    title: "AI Design Generation",
    subtitle: "Advanced Neural Processing",
    description:
      "Our cutting-edge AI transforms your input into photorealistic designs with incredible detail and accuracy.",
    details:
      "Using state-of-the-art diffusion models and fashion-specific training data, our AI generates multiple design variations. The system considers fabric drape, color theory, seasonal trends, and manufacturing feasibility. Each design includes technical specifications, material suggestions, and construction details that ensure your vision can be brought to life.",
    duration: "2-3 minutes",
    tips: "Multiple design variations are generated - you can refine and iterate",
    methods: [
      { icon: Brain, label: "Neural Processing", desc: "Advanced AI interpretation" },
      { icon: Palette, label: "Style Generation", desc: "Color and pattern optimization" },
      { icon: Sparkles, label: "Quality Enhancement", desc: "Professional finishing touches" },
    ],
  },
  {
    icon: DollarSign,
    title: "Smart Cost Analysis",
    subtitle: "Transparent Pricing",
    description:
      "Get detailed cost breakdowns with no hidden fees. Understand exactly what goes into your custom piece.",
    details:
      "Our intelligent pricing system analyzes fabric costs, construction complexity, labor time, and finishing requirements. You'll see itemized costs for materials, craftsmanship, quality control, and shipping. The system also suggests cost-effective alternatives without compromising your design vision, helping you make informed decisions about your investment.",
    duration: "Instant",
    tips: "See alternative material options to optimize your budget",
    methods: [
      { icon: Calculator, label: "Material Costs", desc: "Fabric and component pricing" },
      { icon: Clock, label: "Labor Analysis", desc: "Construction time estimation" },
      { icon: Target, label: "Complexity Scoring", desc: "Design difficulty assessment" },
    ],
  },
  {
    icon: Scissors,
    title: "Expert Production",
    subtitle: "Artisan Craftsmanship",
    description: "Master craftspeople bring your design to life using premium materials and time-tested techniques.",
    details:
      "Your approved design enters our production pipeline where experienced pattern makers, cutters, and seamstresses work with precision tools and premium materials. Each piece undergoes multiple quality checkpoints, from initial cutting to final pressing. Our artisans have decades of experience in custom clothing and understand how to translate digital designs into perfectly fitted, durable garments.",
    duration: "7-14 days",
    tips: "Track your order progress with real-time updates",
    methods: [
      { icon: Scissors, label: "Precision Cutting", desc: "Computer-guided fabric cutting" },
      { icon: Users, label: "Expert Assembly", desc: "Hand-finished by master tailors" },
      { icon: Award, label: "Quality Assurance", desc: "Multi-point inspection process" },
    ],
  },
]

const features = [
  { icon: Zap, title: "Lightning Fast", description: "Design generation in under 3 minutes" },
  { icon: Sparkles, title: "AI-Powered", description: "Advanced machine learning technology" },
  { icon: Shield, title: "Premium Quality", description: "Professional-grade materials and craftsmanship" },
]

const processHighlights = [
  {
    title: "Intelligent Input Processing",
    description: "Our AI understands context, style preferences, and technical requirements from any input method.",
    icon: Brain,
  },
  {
    title: "Design Iteration Support",
    description: "Refine and perfect your design with unlimited revisions during the generation phase.",
    icon: Target,
  },
  {
    title: "Production Transparency",
    description: "Track every step from design approval to delivery with real-time progress updates.",
    icon: Truck,
  },
]

export default function HowItWorksPage() {
  const [expandedStep, setExpandedStep] = useState<number | null>(0) // Start with first step expanded
  const [currentStep, setCurrentStep] = useState(0)
  const [stepLockTime, setStepLockTime] = useState<number>(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const stepsContainerRef = useRef<HTMLDivElement>(null)
const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
const stepChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)


  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, -30])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  // Smooth spring animation for timeline progress
  const springProgress = useSpring(currentStep, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  })

  const timelineHeight = useTransform(springProgress, [0, steps.length - 1], ["0%", "100%"])

  // Enhanced scroll behavior
  useEffect(() => {
    const stepsContainer = stepsContainerRef.current
    if (!stepsContainer) return

    // Add smooth scrolling behavior
    stepsContainer.style.scrollBehavior = "smooth"

    return () => {
      if (stepsContainer) {
        stepsContainer.style.scrollBehavior = "auto"
      }
    }
  }, [])

  // Debounced step change with minimum view time
  const debouncedStepChange = useCallback(
    (newStep: number) => {
      const now = Date.now()
      const timeSinceLastChange = now - stepLockTime
      const minViewTime = 600

      // Clear any existing timeout
      if (stepChangeTimeoutRef.current) {
        clearTimeout(stepChangeTimeoutRef.current)
      }

      // If enough time has passed since last step change, allow immediate change
      if (timeSinceLastChange >= minViewTime) {
        setCurrentStep(newStep)
        setExpandedStep(newStep) // Auto-expand the current step
        setStepLockTime(now)
      } else {
        // Otherwise, delay the change
        const delay = minViewTime - timeSinceLastChange
        stepChangeTimeoutRef.current = setTimeout(() => {
          setCurrentStep(newStep)
          setExpandedStep(newStep) // Auto-expand the current step
          setStepLockTime(Date.now())
        }, delay)
      }
    },
    [stepLockTime],
  )

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true)

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Set scrolling to false after scroll stops
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 100)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      if (stepChangeTimeoutRef.current) {
        clearTimeout(stepChangeTimeoutRef.current)
      }
    }
  }, [])

  // Enhanced step change handler
  const handleStepInView = useCallback(
    (index: number) => {
      if (index !== currentStep) {
        debouncedStepChange(index)
      }
    },
    [currentStep, debouncedStepChange],
  )

  // Manual toggle for clicking on cards
  const toggleStep = (index: number) => {
    if (expandedStep === index) {
      // If clicking on expanded step, collapse it
      setExpandedStep(null)
    } else {
      // If clicking on different step, expand it and update current step
      setExpandedStep(index)
      setCurrentStep(index)
    }
  }

  return (
    <div className="min-h-screen bg-background" ref={containerRef}>
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 sm:pt-0 py-12 sm:py-16 lg:py-20 px-4">
        <motion.div className="absolute inset-0 bg-muted/30" style={{ y, opacity }} />
        <div className="container mx-auto max-w-5xl text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
          >
            <Badge variant="secondary" className="mb-4 sm:mb-6 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              AI-Powered Fashion Design
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
              How DXRKICE Works
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
              Transform your wildest fashion ideas into reality with our revolutionary AI-powered platform. From concept
              to creation in just four intelligent steps.
            </p>

            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mb-8 sm:mb-12 px-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2 + index * 0.1,
                    ease: [0.25, 0.25, 0, 1],
                  }}
                  className="flex items-center gap-2 bg-card/90 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full shadow-sm border hover:shadow-md hover:scale-105 transition-all duration-300"
                >
                  <feature.icon className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-foreground whitespace-nowrap">
                    {feature.title}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Highlights */}
      <section className="py-12 sm:py-16 px-4 bg-muted/20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Why Choose DXRKICE</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the perfect blend of cutting-edge technology and traditional craftsmanship
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {processHighlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.2,
                  ease: [0.25, 0.25, 0, 1],
                }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105">
                  <CardContent className="p-4 sm:p-6 text-center">
                    <div className="bg-primary/10 p-3 sm:p-4 rounded-full w-fit mx-auto mb-3 sm:mb-4">
                      <highlight.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">{highlight.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{highlight.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section - Card-Based Layout */}
      <section className="py-12 sm:py-16 lg:py-20 px-4" ref={stepsContainerRef}>
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Your Design Journey
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
              Follow these four simple steps to transform your fashion vision into reality
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line with Smooth Progress */}
            <div className="absolute left-4 sm:left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
            <motion.div
              className="absolute left-4 sm:left-8 top-0 w-0.5 bg-primary hidden md:block"
              style={{ height: timelineHeight }}
              transition={{ type: "spring", stiffness: 80, damping: 25 }}
            />

            <div className="grid gap-6 sm:gap-8 lg:gap-12">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: index * 0.1,
                    ease: [0.25, 0.25, 0, 1],
                  }}
                  viewport={{
                    once: true,
                    margin: "-20px",
                    amount: 0.3,
                  }}
                  onViewportEnter={() => handleStepInView(index)}
                  className="relative"
                >
                  {/* Timeline Dot with Active State */}
                  <motion.div
                    className={`absolute left-2.5 sm:left-6.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-background border-3 sm:border-4 hidden md:block z-10 transition-all duration-500 ${
                      currentStep >= index ? "border-primary shadow-lg scale-110" : "border-border"
                    }`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: currentStep >= index ? 1.1 : 1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1 + 0.3,
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                    viewport={{ once: true }}
                  />

                  <div className="md:ml-12 lg:ml-16 w-full">
                    <Card
                      className={`group hover:shadow-xl transition-all duration-500 cursor-pointer overflow-hidden ${
                        currentStep === index
                          ? "ring-2 ring-primary/30 shadow-lg bg-primary/5"
                          : "hover:shadow-lg hover:scale-[1.01]"
                      } ${expandedStep === index ? "shadow-xl" : ""}`}
                      onClick={() => toggleStep(index)}
                    >
                      <div
                        className={`absolute inset-0 transition-opacity duration-500 ${
                          currentStep === index
                            ? "bg-primary/8 opacity-100"
                            : "bg-primary/3 opacity-0 group-hover:opacity-100"
                        }`}
                      />

                      <CardHeader className="relative p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 lg:gap-8">
                          <motion.div
                            className={`bg-primary/10 p-3 sm:p-4 lg:p-5 rounded-2xl shadow-sm group-hover:shadow-lg transition-all duration-500 flex-shrink-0 ${
                              currentStep === index ? "bg-primary/20 shadow-md scale-105" : ""
                            }`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <step.icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                              <Badge
                                variant={currentStep === index ? "default" : "outline"}
                                className="text-xs font-medium w-fit transition-all duration-500"
                              >
                                Step {index + 1}
                              </Badge>
                              <span className="text-xs sm:text-sm text-muted-foreground">{step.subtitle}</span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground sm:ml-auto">
                                <Clock className="w-3 h-3" />
                                {step.duration}
                              </div>
                            </div>
                            <div className="flex items-start sm:items-center justify-between gap-4">
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">
                                  {step.title}
                                </CardTitle>
                                <CardDescription className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
                                  {step.description}
                                </CardDescription>
                              </div>
                              <motion.div
                                animate={{ rotate: expandedStep === index ? 180 : 0 }}
                                transition={{ duration: 0.4, ease: [0.25, 0.25, 0, 1] }}
                                className="flex-shrink-0"
                              >
                                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <AnimatePresence mode="wait">
                        {expandedStep === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              duration: 0.6,
                              ease: [0.25, 0.25, 0, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <CardContent className="relative pt-0 p-4 sm:p-6 lg:p-8">
                              <Separator className="mb-6 sm:mb-8" />

                              <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                              >
                                <p className="text-muted-foreground leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
                                  {step.details}
                                </p>

                                {step.tips && (
                                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8">
                                    <div className="flex items-start gap-3">
                                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                                      <p className="text-xs sm:text-sm lg:text-base text-foreground font-medium">
                                        {step.tips}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Methods */}
                                <div className="mb-8">
                                  <h4 className="font-semibold text-foreground mb-4 sm:mb-6 text-base sm:text-lg">
                                    What's Included:
                                  </h4>
                                  <div className="grid gap-4 sm:gap-5">
                                    {step.methods.map((method, methodIndex) => (
                                      <motion.div
                                        key={method.label}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                          duration: 0.5,
                                          delay: methodIndex * 0.1,
                                          ease: [0.25, 0.25, 0, 1],
                                        }}
                                        className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 lg:p-6 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors duration-300"
                                      >
                                        <method.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary mt-0.5 flex-shrink-0" />
                                        <div className="min-w-0">
                                          <span className="text-sm sm:text-base font-medium text-foreground block mb-1">
                                            {method.label}
                                          </span>
                                          <span className="text-xs sm:text-sm text-muted-foreground">
                                            {method.desc}
                                          </span>
                                        </div>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>

                                {/* Create Button for Last Step */}
                                {index === steps.length - 1 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="mt-8 pt-6 sm:pt-8 border-t border-border"
                                  >
                                    <div className="text-center">
                                      <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base lg:text-lg">
                                        Ready to bring your vision to life?
                                      </p>
                                      <Link href="/create">
                                        <motion.div
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        >
                                          <Button
                                            size="lg"
                                            className="px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg lg:text-xl font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
                                          >
                                            <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                                            Start Creating Now
                                            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                                          </Button>
                                        </motion.div>
                                      </Link>
                                    </div>
                                  </motion.div>
                                )}

                                {index < steps.length - 1 && (
                                  <div className="flex items-center gap-2 text-sm sm:text-base text-muted-foreground font-medium">
                                    <span>Next Step</span>
                                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </div>
                                )}
                              </motion.div>
                            </CardContent>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quality & Craftsmanship Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 bg-muted">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 sm:px-4 py-2 rounded-full mb-4 sm:mb-6">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-xs sm:text-sm">Quality & Craftsmanship</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
              Exceptional Results, Every Time
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Our commitment to excellence drives everything we do. From cutting-edge AI technology to skilled
              craftsmanship, we're dedicated to bringing your vision to life with remarkable precision.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.25, 0, 1] }}
            viewport={{ once: true }}
          >
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8">
                <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Our Commitment</h3>
                    <div className="space-y-4 sm:space-y-6">
                      {[
                        {
                          title: "Advanced AI Technology",
                          desc: "State-of-the-art machine learning for precise design generation and pattern optimization",
                        },
                        {
                          title: "Master Craftspeople",
                          desc: "Expert artisans with decades of experience in custom clothing and haute couture techniques",
                        },
                        {
                          title: "Premium Materials",
                          desc: "Carefully sourced fabrics and components from trusted suppliers worldwide",
                        },
                        {
                          title: "Meticulous Quality Control",
                          desc: "Multi-stage inspection process ensuring every detail meets our exacting standards",
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={item.title}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.6,
                            delay: index * 0.1,
                            ease: [0.25, 0.25, 0, 1],
                          }}
                          viewport={{ once: true }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-foreground font-medium text-sm sm:text-base mb-1">{item.title}</p>
                            <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <motion.div
                      className="text-center"
                      initial={{ scale: 0.8, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3,
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                      }}
                      viewport={{ once: true }}
                    >
                      <div className="bg-primary/10 p-6 sm:p-8 rounded-full mb-4 sm:mb-6">
                        <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                      </div>
                      <div className="text-foreground font-semibold mb-2 text-sm sm:text-base">
                        Excellence in Every Stitch
                      </div>
                      <div className="text-muted-foreground text-xs sm:text-sm">
                        Combining innovation with traditional craftsmanship
                      </div>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <footer className="w-full border-t border-orange-900/30 bg-black py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">DXRKICE</h3>
              <p className="max-w-[250px] text-sm text-gray-400">
                Sustainable, ethical fashion for the modern individual.
              </p>
              <div className="flex space-x-4">
                <Button
                  onClick={() => window.open("https://www.instagram.com/", "_blank")}
                  size="icon"
                  variant="ghost"
                  className="hover:text-orange-500 transition-colors duration-300"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Button>
                <Button
                  onClick={() => window.open("https://twitter.com/", "_blank")}
                  size="icon"
                  variant="ghost"
                  className="hover:text-orange-500 transition-colors duration-300"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Shop</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Women
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Men
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Accessories
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Sale
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 shrink-0" />
                  <span className="text-gray-400">123 Fashion St, Design District, CA 90210</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Mail className="h-5 w-5 shrink-0" />
                  <span className="text-gray-400">hello@DXRKICE.com</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2023 DXRKICE. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
