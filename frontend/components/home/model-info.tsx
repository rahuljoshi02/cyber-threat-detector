import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const capabilities = [
  "95%+ accuracy on test data",
  "Detects DoS, Probe, R2L, and U2R attacks",
  "12 key features for efficient prediction",
  "Trained on NSL-KDD benchmark dataset",
  "Real-time probability scoring",
  "Risk level classification (Low, Medium, High, Critical)",
]

export function ModelInfo() {
  return (
    <section className="w-full px-4 py-20 bg-muted/50">
      <div className="mx-auto max-w-6xl">
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold">
              About the Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-muted-foreground text-center">
              This system uses a <strong>Random Forest Classifier</strong> trained on the NSL-KDD dataset,
              a widely-used benchmark for network intrusion detection systems.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {capabilities.map((capability) => (
                <div key={capability} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-muted-foreground">{capability}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}