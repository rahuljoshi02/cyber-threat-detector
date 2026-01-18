import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Upload, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Real-Time Detection",
    description: "Analyze individual network connections instantly with our trained Random Forest model achieving 95%+ accuracy.",
  },
  {
    icon: Upload,
    title: "Batch Processing",
    description: "Upload CSV files and process thousands of connections in seconds with our optimized batch endpoint.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Get comprehensive threat reports with probability scores, risk levels, and exportable results.",
  },
]

export function Features() {
  return (
    <section className="w-full px-4 py-20 bg-muted/50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Features</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to detect and analyze network threats
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="mb-4 p-3 bg-blue-950 w-fit rounded-lg">
                  <feature.icon className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}