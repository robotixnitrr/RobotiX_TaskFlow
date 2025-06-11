import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Github, ExternalLink } from "lucide-react"
import { APP_CONFIG, ROUTES } from "@/lib/constants"

export function Footer() {
  const footerSections = [
    {
      title: "Quick Links",
      links: [
        { href: ROUTES.team, label: "Team" },
        { href: ROUTES.projects, label: "Projects" },
        { href: ROUTES.login, label: "Member Portal" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "#", label: "Documentation" },
        { href: "#", label: "Tutorials" },
        { href: "#", label: "Blog" },
      ],
    },
  ]

  return (
    <footer className="border-t border-border/50 py-12 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/logoBlack.png" alt="RobotiX Logo" />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-semibold text-sm">
                  R
                </AvatarFallback>
              </Avatar>
              <span className="text-lg font-bold">{APP_CONFIG.name}</span>
            </div>
            <p className="text-sm text-muted-foreground">{APP_CONFIG.description}</p>
          </div>

          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <div className="space-y-2 text-sm">
                {section.links.map((link, linkIndex) => (
                  <Link
                    key={linkIndex}
                    href={link.href}
                    className="block text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 {APP_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
