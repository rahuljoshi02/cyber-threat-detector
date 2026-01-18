"use client"

import Link from "next/link"
import { Shield } from "lucide-react"
import { Button } from "./ui/button"
import { usePathname } from "next/navigation"

export function Navbar() {
  const pathname = usePathname()
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="w-full max-w-7xl mx-auto flex h-16 items-center justify-between px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
          <Shield className="h-6 w-6 text-blue-500" />
          <span>Cyber Threat Detector</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href="/detect">
            <Button 
              variant={pathname === "/detect" ? "default" : "ghost"}
              size="sm"
            >
              Detector
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}