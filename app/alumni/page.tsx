import Link from "next/link"
import { Navigation } from "@/components/layout/navigation"
import { Footer } from "@/components/sections/footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Github, Linkedin } from "lucide-react"

// Alumni data - expanded version of the data in alumni-section.tsx
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
    graduationYear: 2021,
    testimonial:
      "My time at RobotiX Club shaped my career path and gave me invaluable leadership experience that I use every day in my current role.",
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
    graduationYear: 2022,
    testimonial:
      "The hands-on experience I gained working on complex robotics projects prepared me perfectly for my role at Boston Dynamics.",
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
    graduationYear: 2020,
    testimonial:
      "The mentorship opportunities at RobotiX Club helped me develop my leadership skills, which were crucial when founding my own tech startup.",
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
    graduationYear: 2019,
    testimonial:
      "The research experience I gained at RobotiX Club was instrumental in securing my position at MIT and continues to influence my academic work.",
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
    graduationYear: 2023,
    testimonial:
      "Working on autonomous systems at RobotiX directly translated to my work at Tesla. The club gave me a platform to apply theoretical knowledge to real-world problems.",
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
    graduationYear: 2022,
    testimonial:
      "The satellite project we worked on at RobotiX was my gateway into aerospace engineering. It gave me the confidence to pursue my dream job at SpaceX.",
  },
  {
    id: 7,
    name: "Emma Thompson",
    position: "Former Executive Member",
    years: "2018-2021",
    currentRole: "Product Manager at Microsoft",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Led the software development team and coordinated cross-functional projects.",
    achievements: ["Best Software Project Award", "Tech Leadership Summit Speaker"],
    skills: ["Product Management", "Software Development", "Team Leadership"],
    linkedin: "https://linkedin.com/in/emmathompson",
    github: "https://github.com/emmathompson",
    graduationYear: 2021,
    testimonial:
      "The cross-functional collaboration skills I developed at RobotiX Club are invaluable in my product management role, where I bridge technical and business requirements daily.",
  },
  {
    id: 8,
    name: "David Kim",
    position: "Former Core Coordinator",
    years: "2017-2020",
    currentRole: "Robotics Researcher at DARPA",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Specialized in human-robot interaction and developed innovative control interfaces.",
    achievements: ["Innovation in HRI Award", "Published in Robotics Journal"],
    skills: ["Human-Robot Interaction", "Interface Design", "User Testing"],
    linkedin: "https://linkedin.com/in/davidkim",
    github: "https://github.com/davidkim",
    graduationYear: 2020,
    testimonial:
      "My work on human-robot interaction at RobotiX Club laid the foundation for my research career and continues to influence my approach to robotics design.",
  },
  {
    id: 9,
    name: "Sophia Martinez",
    position: "Former Head Coordinator",
    years: "2016-2019",
    currentRole: "Founder & CEO of RoboSolutions",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Transformed the club's structure and established industry partnerships that continue today.",
    achievements: ["Entrepreneur of the Year", "Secured $1M in Seed Funding"],
    skills: ["Entrepreneurship", "Strategic Planning", "Robotics"],
    linkedin: "https://linkedin.com/in/sophiamartinez",
    github: "https://github.com/sophiamartinez",
    graduationYear: 2019,
    testimonial:
      "Leading RobotiX Club taught me how to build and manage teams, secure resources, and execute a vision - all skills that were essential when founding my own robotics company.",
  },
]

export default function AlumniPage() {
  // Group alumni by graduation year for the tabs
  const alumniByYear = alumniData.reduce(
    (acc, alumni) => {
      const year = alumni.graduationYear.toString()
      if (!acc[year]) {
        acc[year] = []
      }
      acc[year].push(alumni)
      return acc
    },
    {} as Record<string, typeof alumniData>,
  )

  // Sort years in descending order
  const years = Object.keys(alumniByYear).sort((a, b) => Number.parseInt(b) - Number.parseInt(a))

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="text-4xl font-bold mb-4">Alumni Network</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Our alumni have gone on to achieve remarkable success in various fields. Connect with former RobotiX Club
            members and see where their journey has taken them.
          </p>
        </div>

        <div className="mb-12">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <blockquote className="text-lg italic">
                "The RobotiX Club alumni network represents a powerful community of innovators, researchers, and
                industry leaders who continue to push the boundaries of technology and robotics across the globe."
              </blockquote>
              <div className="mt-4 font-semibold">— RobotiX Club Faculty Advisor</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={years[0]} className="space-y-8">
          <div className="overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="all">All Alumni</TabsTrigger>
              {years.map((year) => (
                <TabsTrigger key={year} value={year}>
                  Batch {year}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {alumniData.map((alumni) => (
                <AlumniCard key={alumni.id} alumni={alumni} />
              ))}
            </div>
          </TabsContent>

          {years.map((year) => (
            <TabsContent key={year} value={year} className="space-y-8">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {alumniByYear[year].map((alumni) => (
                  <AlumniCard key={alumni.id} alumni={alumni} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Are You an Alumni?</h2>
          <p className="text-muted-foreground mb-6">
            If you're a former RobotiX Club member and would like to be featured on this page, we'd love to hear from
            you and share your success story.
          </p>
          <Button size="lg">Connect With Us</Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}

interface AlumniCardProps {
  alumni: (typeof alumniData)[0]
}

function AlumniCard({ alumni }: AlumniCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={alumni.avatar || "/placeholder.svg"} alt={alumni.name} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-semibold">
              {alumni.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">{alumni.name}</CardTitle>
            <CardDescription className="text-primary font-medium">{alumni.position}</CardDescription>
            <p className="text-sm text-muted-foreground">{alumni.years}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Current Position</h4>
          <p>{alumni.currentRole}</p>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Bio</h4>
          <p className="text-sm">{alumni.bio}</p>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Testimonial</h4>
          <p className="text-sm italic">{alumni.testimonial}</p>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Key Achievements</h4>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {alumni.achievements.map((achievement, i) => (
              <li key={i}>{achievement}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {alumni.skills.map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <div className="px-6 pb-6 mt-2 flex gap-3">
        {alumni.linkedin && (
          <a
            href={alumni.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Linkedin className="h-5 w-5" />
            <span className="sr-only">LinkedIn</span>
          </a>
        )}
        {alumni.github && (
          <a
            href={alumni.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-5 w-5" />
            <span className="sr-only">GitHub</span>
          </a>
        )}
      </div>
    </Card>
  )
}
