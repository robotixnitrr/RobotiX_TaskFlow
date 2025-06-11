"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Users, Target, Lightbulb, Rocket, Shield } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export function AboutSection() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: Zap,
      title: "Innovation Excellence",
      description: "Pioneering breakthrough technologies through hands-on research, collaborative development, and cutting-edge experimentation.",
      color: "from-blue-500 via-blue-600 to-cyan-500",
      delay: "0s"
    },
    {
      icon: Users,
      title: "Global Community", 
      description: "Building an inclusive ecosystem of brilliant minds, fostering mentorship, knowledge sharing, and lifelong connections.",
      color: "from-emerald-500 via-green-600 to-teal-500",
      delay: "0.2s"
    },
    {
      icon: Target,
      title: "Strategic Vision",
      description: "Pursuing ambitious goals with precision, maintaining world-class standards while pushing technological boundaries.",
      color: "from-purple-500 via-violet-600 to-indigo-500",
      delay: "0.4s"
    },
    {
      icon: Lightbulb,
      title: "Creative Solutions",
      description: "Transforming complex challenges into elegant solutions through innovative thinking and interdisciplinary collaboration.",
      color: "from-amber-500 via-orange-600 to-red-500",
      delay: "0.6s"
    },
    {
      icon: Rocket,
      title: "Future-Ready",
      description: "Preparing tomorrow's leaders with advanced skills in AI, robotics, and emerging technologies for industry leadership.",
      color: "from-pink-500 via-rose-600 to-red-500",
      delay: "0.8s"
    },
    {
      icon: Shield,
      title: "Ethical Leadership",
      description: "Championing responsible innovation, ensuring our technologies serve humanity while maintaining the highest ethical standards.",
      color: "from-slate-500 via-gray-600 to-zinc-500",
      delay: "1s"
    }
  ]

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="py-32 px-4 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-primary mb-8">
            <Target className="h-5 w-5" />
            <span className="text-sm font-semibold tracking-wide uppercase">Our Foundation</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Redefining Tomorrow
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light">
            We are a revolutionary collective of innovators, engineers, and visionaries 
            dedicated to <span className="text-primary font-semibold">transforming possibilities</span> into 
            reality through robotics and artificial intelligence.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`group relative overflow-hidden border-0 bg-gradient-to-br from-background/80 to-muted/50 backdrop-blur-xl hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 ${
                isVisible ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{
                animationDelay: feature.delay,
                animationFillMode: 'forwards'
              }}
            >
              {/* Hover Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Glow Effect */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
              
              <CardHeader className="relative z-10 pb-4">
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                </div>
                
                <CardTitle className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <p className="text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300">
                  {feature.description}
                </p>
              </CardContent>

              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-3xl" />
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-24">
          <div className="inline-flex items-center gap-4 px-8 py-4 rounded-full bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-background flex items-center justify-center text-xs font-bold text-primary-foreground"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Join 50+ innovators shaping the future
            </span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }

        .bg-grid-pattern {
          background-image: radial-gradient(circle, #000 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </section>
  )
}