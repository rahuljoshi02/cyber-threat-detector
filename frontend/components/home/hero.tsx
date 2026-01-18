import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Github, ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="w-full px-4 py-20 md:py-32">
      <div className="mx-auto max-w-6xl text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full" />
            <Shield className="relative h-24 w-24 text-blue-500" />
          </div>
        </div>
        
        {/* Heading */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Cyber Threat Detector
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            AI-powered network intrusion detection using machine learning. 
            Analyze connections in real-time or batch process thousands of records.
          </p>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/detect">
            <Button size="lg" className="text-lg px-8">
              Try Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <a 
            href="https://github.com/rahuljoshi02/cyber-threat-detector" 
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" variant="outline" className="text-lg px-8">
              <Github className="mr-2 h-5 w-5" />
              View Code
            </Button>
          </a>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 pt-8 max-w-2xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-blue-500">95%+</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-500">4</div>
            <div className="text-sm text-muted-foreground">Attack Types</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-500">&lt;1s</div>
            <div className="text-sm text-muted-foreground">Analysis Time</div>
          </div>
        </div>
      </div>
    </section>
  )
}