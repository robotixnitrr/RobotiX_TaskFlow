'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, Clock, Users, Shield, Zap, Globe, Star, TrendingUp } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"

export default function Home() {
  const { user } = useAuth()
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-white to-white/40  p-2 rounded-lg">
              <Avatar>
                <AvatarImage src="/logoBlack.png" alt="RobotiX Logo" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold">
                  R
                </AvatarFallback>
              </Avatar>
              {/* <Image src={"/logoBlack.png"} alt="R"/> */}
              {/* <CheckCircle className="h-6 w-6 text-white" /> */}
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              ROBOTiX TaskFlow
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <ModeToggle />
            {user ? (
              <Link href="/dashboard">
                <Button className="gradient-bg border-0 focus-ring">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="focus-ring">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="gradient-bg border-0 focus-ring">Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header >

      <main className="flex-1">
        {/* Hero Section with Enhanced Styling */}
        <section className="relative flex items-center h-[calc(100vh-4rem)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-background to-brand-100 dark:from-brand-900/20 dark:via-background dark:to-brand-800/20" />
          <div className="container relative space-y-6 py-12 md:py-24 lg:py-32">
            <div className="mx-auto flex max-w-[64rem] flex-col items-center space-y-6 text-center">
              <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1] animate-fade-in">
                Streamline ROBOTiX team&apos;s workflow with{" "}
                <span className="bg-gradient-to-r from-primary via-brand-500 to-brand-600 bg-clip-text text-transparent">
                  TaskFlow
                </span>
              </h1>

              <p className="max-w-[46rem] text-lg text-muted-foreground sm:text-xl animate-fade-in">
                Assign, track, and complete tasks efficiently. Keep your team organized and focused on what matters most
                with our modern task management solution.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row animate-fade-in">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="gradient-bg border-0 gap-2 focus-ring hover:scale-105 transition-transform"
                  >
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {!user &&
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="focus-ring hover:scale-105 transition-transform">
                      Sign In
                    </Button>
                  </Link>
                }
              </div>
            </div>
          </div>
        </section >

        {/* Features Section with Enhanced Cards */}
        < section className="container py-12 md:py-24 lg:py-32" >
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            <div className="group flex flex-col items-center space-y-4 rounded-xl border p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 gradient-card">
              <div className="rounded-full bg-gradient-to-br from-blue-500 to-blue-600 p-3">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Role-Based Access</h3>
              <p className="text-muted-foreground">
                Separate dashboards for assigners and assignees with appropriate permissions and workflows.
              </p>
              <div className="flex items-center gap-1 text-sm text-primary font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>Boost productivity by 40%</span>
              </div>
            </div>

            <div className="group flex flex-col items-center space-y-4 rounded-xl border p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 gradient-card">
              <div className="rounded-full bg-gradient-to-br from-green-500 to-green-600 p-3">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Smart Task Management</h3>
              <p className="text-muted-foreground">
                Create, assign, and track tasks with priorities, due dates, statuses, and detailed descriptions.
              </p>
              <div className="flex items-center gap-1 text-sm text-primary font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>Save 2 hours daily</span>
              </div>
            </div>

            <div className="group flex flex-col items-center space-y-4 rounded-xl border p-8 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 gradient-card">
              <div className="rounded-full bg-gradient-to-br from-purple-500 to-purple-600 p-3">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold">Real-time Updates</h3>
              <p className="text-muted-foreground">
                Get notified when tasks are assigned to you or when their status changes with instant updates.
              </p>
              <div className="flex items-center gap-1 text-sm text-primary font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>99.9% uptime</span>
              </div>
            </div>
          </div>
        </section >

        {/* Enhanced Features Section */}
        < section className="border-t bg-gradient-to-br from-muted/30 via-background to-muted/50" >
          <div className="container py-12 md:py-24 lg:py-32">
            <div className="mx-auto max-w-5xl">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  Everything you need to manage tasks
                </h2>
                <p className="text-lg text-muted-foreground">
                  Built with modern technologies for a seamless experience
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="rounded-lg bg-gradient-to-br from-red-500 to-red-600 p-2">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Secure & Reliable</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Built with security best practices and reliable data storage with 256-bit encryption
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 p-2">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Fast & Responsive</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Optimized for speed with responsive design for all devices and lightning-fast load times
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 p-2">
                    <Globe className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Modern Technology</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Built with Next.js, MongoDB, and modern web standards for optimal performance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section >
      </main >

      <footer className="border-t py-6 md:py-0 bg-gradient-to-r from-muted/50 to-muted/30">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="gradient-bg p-1.5 rounded-lg">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} TaskFlow. Built with Next.js and MongoDB.
          </p>
        </div>
      </footer>
    </div >
  )
}
