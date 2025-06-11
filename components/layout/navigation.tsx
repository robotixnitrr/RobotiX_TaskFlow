"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Sparkles, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { ModeToggle } from "../mode-toggle"

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/#about" },
  { name: "Projects", href: "/projects" },
  { name: "Team", href: "/team" },
  { name: "Alumni", href: "/#alumni" },
  { name: "Contact", href: "/#contact" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const pathname = usePathname()
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 20)

      // Update active section based on scroll position
      const sections = ["hero", "about", "projects", "team", "alumni", "contact"]
      let current = ""

      sections.forEach((section) => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom > 100) {
            current = section
          }
        }
      })

      setActiveSection(current)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setIsOpen(false)

    // Handle anchor links with smooth scrolling
    if (href.startsWith("/#")) {
      const element = document.querySelector(href.substring(1))
      if (element) {
        element.scrollIntoView({ 
          behavior: "smooth",
          block: "start"
        })
      }
    }
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && !activeSection
    if (href.startsWith("/#")) {
      const section = href.substring(2)
      return activeSection === section
    }
    return pathname === href
  }

  return (
    <>
      {/* Navigation blur overlay */}
      <div 
        className={cn(
          "fixed inset-x-0 top-0 z-40 h-20 transition-all duration-700",
          isScrolled 
            ? "bg-gradient-to-b from-background/95 via-background/80 to-transparent backdrop-blur-xl" 
            : "bg-transparent"
        )}
      />
      
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-all duration-500",
          isScrolled 
            ? "py-2" 
            : "py-4"
        )}
      >
        <div className="container mx-auto px-4">
          <div 
            className={cn(
              "flex h-14 items-center justify-between rounded-2xl border backdrop-blur-md transition-all duration-500",
              isScrolled 
                ? "bg-background/95 shadow-lg shadow-primary/5 border-primary/10" 
                : "bg-background/50 border-border/50"
            )}
          >
            {/* Logo with enhanced animation */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className={cn(
                "relative flex items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-105",
                isScrolled ? "h-9 w-9" : "h-10 w-10"
              )}>
                {/* <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300" />
                <div className="absolute inset-0.5 rounded-[10px] bg-gradient-to-br from-primary-foreground/20 to-transparent" /> */}
                <span className="relative group-hover:scale-110 transition-transform duration-300">
                  {/* R */}
                <img src="./logoBlack.png" alt="" className="dark:hidden"/>
                <img src="./logoWhite.png" alt="" className="hidden dark:block"/>
                </span>
                {/* <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-primary/60 animate-pulse" /> */}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none group-hover:text-primary transition-colors duration-300">
                  RobotiX Club
                </span>
                <span className="text-xs text-muted-foreground leading-none">
                  Innovation Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation with enhanced hover effects */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => handleNavClick(item.href)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl group",
                    isActive(item.href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <span className="relative z-10">{item.name}</span>
                  {/* Active indicator */}
                  {isActive(item.href) && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 animate-pulse" />
                  )}
                  {/* Hover effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <ModeToggle />

              <div className="hidden md:flex items-center space-x-2">
                {user ? (
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="group hover:bg-primary/10 hover:text-primary transition-all duration-300"
                    >
                      Dashboard
                      <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-300" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-primary/10 hover:text-primary transition-all duration-300"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group"
                      >
                        Join Club
                        <Sparkles className="ml-1 h-3 w-3 group-hover:rotate-12 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu trigger */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="px-2 hover:bg-primary/10 transition-all duration-300"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-[320px] border-l-primary/20 bg-background/95 backdrop-blur-xl"
                >
                  <div className="flex flex-col space-y-6 mt-8">
                    {/* Mobile logo */}
                    <div className="flex items-center space-x-3 px-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">R</span>
                      </div>
                      <span className="font-bold text-lg">RobotiX Club</span>
                    </div>

                    {/* Mobile navigation */}
                    <div className="space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => handleNavClick(item.href)}
                          className={cn(
                            "flex items-center justify-between px-4 py-3 text-lg font-medium rounded-xl transition-all duration-300 group",
                            isActive(item.href)
                              ? "text-primary bg-primary/10 border border-primary/20"
                              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                          )}
                        >
                          <span>{item.name}</span>
                          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      ))}
                    </div>

                    {/* Mobile actions */}
                    <div className="space-y-3 pt-6 border-t border-border/50">
                      {user ? (
                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-between group hover:bg-primary/10"
                          >
                            Dashboard
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </Link>
                      ) : (
                        <>
                          <Link href="/login" onClick={() => setIsOpen(false)}>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-between group hover:bg-primary/10"
                            >
                              Login
                              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </Button>
                          </Link>
                          <Link href="/register" onClick={() => setIsOpen(false)}>
                            <Button 
                              className="w-full bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/25 group"
                            >
                              Join Club
                              <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                            </Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}