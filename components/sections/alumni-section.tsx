"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Linkedin, Github, Award, MapPin, Calendar, Star } from 'lucide-react'
import Link from "next/link"

// Alumni data
const alumniData = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    position: "Former Head Coordinator",
    years: "2018-2021",
    currentRole: "AI Research Scientist at Google",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Led the club through its formative years and established key partnerships with industry leaders.",
    achievements: ["Best Robotics Project Award 2020", "IEEE Conference Speaker", "3 Published Papers"],
    skills: ["Machine Learning", "Robotics", "Computer Vision"],
    linkedin: "https://linkedin.com/in/sarahjohnson",
    github: "https://github.com/sarahjohnson",
    featured: true,
    company: "Google",
    location: "Mountain View, CA"
  },
  {
    id: 2,
    name: "Michael Chen",
    position: "Former Core Coordinator",
    years: "2019-2022",
    currentRole: "Senior Robotics Engineer at Boston Dynamics",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Specialized in mechanical design and robotics integration. Led the award-winning autonomous drone project.",
    achievements: ["Robotics Challenge Winner 2021", "University Medal for Excellence"],
    skills: ["Mechanical Design", "Drone Technology", "Control Systems"],
    linkedin: "https://linkedin.com/in/michaelchen",
    github: "https://github.com/michaelchen",
    featured: true,
    company: "Boston Dynamics",
    location: "Waltham, MA"
  },
  {
    id: 3,
    name: "Priya Patel",
    position: "Former Executive Member",
    years: "2017-2020",
    currentRole: "CTO at TechInnovate Startup",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Focused on IoT applications and smart systems. Mentored over 30 junior members during her time at the club.",
    achievements: ["Smart Cities Hackathon Winner", "Women in Tech Scholarship Recipient"],
    skills: ["IoT", "Embedded Systems", "Project Management"],
    linkedin: "https://linkedin.com/in/priyapatel",
    github: "https://github.com/priyapatel",
    featured: false,
    company: "TechInnovate",
    location: "San Francisco, CA"
  },
  {
    id: 4,
    name: "James Wilson",
    position: "Former Overall Coordinator",
    years: "2016-2019",
    currentRole: "PhD Researcher at MIT",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Founded the club's research division and established the annual robotics showcase event.",
    achievements: ["University Innovation Grant", "Best Undergraduate Thesis"],
    skills: ["Research Methods", "AI Ethics", "Public Speaking"],
    linkedin: "https://linkedin.com/in/jameswilson",
    github: "https://github.com/jameswilson",
    featured: true,
    company: "MIT",
    location: "Cambridge, MA"
  },
  {
    id: 5,
    name: "Aisha Rahman",
    position: "Former Core Coordinator",
    years: "2020-2023",
    currentRole: "Machine Learning Engineer at Tesla",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Specialized in computer vision and autonomous systems. Led the self-driving robot project.",
    achievements: ["National Robotics Competition Finalist", "Grace Hopper Conference Speaker"],
    skills: ["Computer Vision", "Deep Learning", "Autonomous Systems"],
    linkedin: "https://linkedin.com/in/aisharahman",
    github: "https://github.com/aisharahman",
    featured: false,
    company: "Tesla",
    location: "Austin, TX"
  },
  {
    id: 6,
    name: "Carlos Rodriguez",
    position: "Former Executive Member",
    years: "2019-2022",
    currentRole: "Hardware Engineer at SpaceX",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Focused on hardware integration and aerospace applications. Designed the club's first satellite prototype.",
    achievements: ["Aerospace Engineering Excellence Award", "NASA Internship"],
    skills: ["Hardware Design", "Aerospace Systems", "3D Modeling"],
    linkedin: "https://linkedin.com/in/carlosrodriguez",
    github: "https://github.com/carlosrodriguez",
    featured: false,
    company: "SpaceX",
    location: "Hawthorne, CA"
  },
]

export function AlumniSection() {
  const [showAll, setShowAll] = useState(false)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  
  const displayedAlumni = showAll ? alumniData : alumniData.slice(0, 3)

  return (
    <section id="alumni" className="relative py-32 px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-purple-950/20"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-cyan-400/5 to-blue-400/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-200/20 dark:border-blue-800/20 mb-6">
            <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Hall of Fame</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
            Distinguished Alumni
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Our alumni have gone on to shape the future at world's leading technology companies and research institutions
          </p>
        </div>

        {/* Alumni Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayedAlumni.map((alumni, index) => (
            <Card 
              key={alumni.id} 
              className="group relative overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
              onMouseEnter={() => setHoveredCard(alumni.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Featured Badge */}
              {alumni.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full text-white text-xs font-medium shadow-lg">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </div>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 group-hover:to-purple-500/10 transition-all duration-500"></div>
              
              {/* Animated Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm scale-105"></div>

              <CardContent className="p-8 relative z-10">
                {/* Profile Section */}
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-xl group-hover:scale-110 transition-transform duration-300">
                      <AvatarImage src={alumni.avatar || "/placeholder.svg"} alt={alumni.name} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                        {alumni.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{alumni.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-1">{alumni.position}</p>
                  <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                    <Calendar className="h-3 w-3" />
                    {alumni.years}
                  </div>
                </div>

                {/* Current Role */}
                <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800/50 dark:to-blue-900/20 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Position</div>
                  <div className="text-slate-900 dark:text-white font-medium mb-2">{alumni.currentRole}</div>
                  <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                    <MapPin className="h-3 w-3" />
                    {alumni.location}
                  </div>
                </div>

                {/* Bio */}
                <div className="mb-6">
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{alumni.bio}</p>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Expertise</div>
                  <div className="flex flex-wrap gap-2">
                    {alumni.skills.slice(0, 3).map((skill, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="text-xs px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border-0 hover:scale-105 transition-transform duration-200"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Achievements */}
                <div className="mb-6">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Key Achievements</div>
                  <div className="space-y-1">
                    {alumni.achievements.slice(0, 2).map((achievement, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                        {achievement}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Social Links */}
                <div className="flex justify-center gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                  {alumni.linkedin && (
                    <a 
                      href={alumni.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-110 hover:shadow-lg transition-all duration-200"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {alumni.github && (
                    <a 
                      href={alumni.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:scale-110 hover:shadow-lg transition-all duration-200"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More/Less Button */}
        <div className="text-center mt-16">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={() => setShowAll(!showAll)}
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              {showAll ? 'Show Less' : 'View All Alumni'}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            
            <Link href="/alumni">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 hover:scale-105"
              >
                Alumni Directory
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: "50+", label: "Alumni Network" },
            { number: "25+", label: "Tech Companies" },
            { number: "15+", label: "Countries" },
            { number: "100%", label: "Career Success" }
          ].map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                {stat.number}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}