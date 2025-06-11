import { Navigation } from "@/components/layout/navigation"
import { HeroSection } from "@/components/sections/hero-section"
import { AboutSection } from "@/components/sections/about-section"
import { FeaturedProjectsSection } from "@/components/sections/featured-projects-section"
import { TeamHighlightsSection } from "@/components/sections/team-highlights-section"
import { ContactSection } from "@/components/sections/contact-section"
import { Footer } from "@/components/sections/footer"
import { AlumniSection } from "@/components/sections/alumni-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="nav h-[5rem]">
        <Navigation />
      </div>
      <HeroSection />
      <AboutSection />
      <FeaturedProjectsSection />
      <TeamHighlightsSection />
      <AlumniSection />
      <ContactSection />
      <Footer />
    </div>
  )
}
