import { Badge } from "@/components/ui/badge"

const technologies = [
  "Next.js 14",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "FastAPI",
  "Python",
  "Scikit-learn",
  "Pandas",
  "Random Forest",
]

export function TechStack() {
  return (
    <section className="w-full px-4 py-20">
      <div className="mx-auto max-w-6xl text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold">Built With</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {technologies.map((tech) => (
            <Badge 
              key={tech} 
              variant="secondary" 
              className="px-4 py-2 text-sm font-medium"
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  )
}