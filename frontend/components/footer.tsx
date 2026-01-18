import { Github, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t mt-20">
      <div className="w-full max-w-7xl mx-auto px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8 text-center md:text-left">
          {/* Left side */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Cyber Threat Detector</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              AI-powered network intrusion detection system built with Next.js and FastAPI.
              Trained on NSL-KDD dataset with 95%+ accuracy.
            </p>
          </div>
          
          {/* Right side */}
          <div className="space-y-4 md:text-right">
            <h3 className="text-lg font-semibold">Connect</h3>
            <div className="flex gap-4 justify-center md:justify-end">
              <a 
                href="https://github.com/rahuljoshi02" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/rahul-joshi-903442243/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="mailto:rahul.joshi1208@gmail.com"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>Built by Rahul Joshi • {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}