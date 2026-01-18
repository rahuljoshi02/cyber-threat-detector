import { Hero } from "@/components/home/hero"
import { Features } from "@/components/home/features"
import { TechStack } from "@/components/home/tech-stack"
import { ModelInfo } from "@/components/home/model-info"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <TechStack />
      <ModelInfo />
    </div>
  )
}