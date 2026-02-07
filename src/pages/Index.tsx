import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { 
  LayeredDiamondsIcon, 
  OverlappingCirclesIcon, 
  SunburstIcon,
  SparkleIcon 
} from "@/components/icons/GeometricIcons";
import { NetworkBackground } from "@/components/NetworkBackground";
import { CornerBracket, CornerBracketFlipped } from "@/components/icons/DecorativeLines";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Network Background - subtle, fixed */}
      <div className="fixed inset-0 z-0 pointer-events-none text-charcoal opacity-[0.10]">
        <NetworkBackground />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header - minimal */}
        <header className="py-6">
          <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <SparkleIcon className="text-primary" size={32} />
              <span className="font-serif text-xl text-foreground tracking-tight">
                Meet<span className="text-primary">Spark</span>
              </span>
            </Link>
            <Link 
              to="/dashboard" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Dashboard
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Hero Section - with corner bracket decoration */}
        <main className="flex-1 container mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="relative max-w-3xl mx-auto text-center mb-40 md:mb-56">
            {/* Decorative corner bracket - top right */}
            <CornerBracket 
              className="hidden md:block absolute -top-8 -right-16 text-charcoal rotate-90" 
              size={80} 
            />
            
            <h1 className="font-serif text-5xl md:text-7xl font-medium text-foreground mb-8 leading-[1.1]">
              Make Networking<br />
              <em className="text-primary">Actually Work</em>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
              AI-powered matching platform that connects the right people at your events. 
              Create events, share registration links, and let AI find the perfect matches.
            </p>
            
            {/* CTAs as text links - no rectangular buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                to="/dashboard" 
                className="text-link-cta group"
              >
                <Calendar className="w-5 h-5" />
                Create Your Event
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View Dashboard →
              </Link>
            </div>
          </div>

          {/* Features - asymmetric staggered layout with enhanced diagonal flow */}
          <div className="max-w-5xl mx-auto mb-40 md:mb-56">
            <div className="relative space-y-16 md:space-y-0 md:min-h-[520px]">
              {/* Feature 1 - offset left */}
              <div className="md:absolute md:left-[10%] md:top-0 text-center md:text-left md:max-w-xs">
                <LayeredDiamondsIcon className="text-charcoal mx-auto md:mx-0 mb-6" size={56} />
                <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                  Shareable Forms
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Create events and share registration links. Participants fill in their details, 
                  and data flows directly to your dashboard.
                </p>
              </div>

              {/* Feature 2 - center-right, significantly lower */}
              <div className="md:absolute md:left-[45%] md:top-[200px] text-center md:text-left md:max-w-xs">
                <OverlappingCirclesIcon className="text-charcoal mx-auto md:mx-0 mb-6" size={56} />
                <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                  AI Matching
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our AI analyzes roles, interests, and skills to suggest optimal networking pairs. 
                  No more random introductions.
                </p>
              </div>

              {/* Feature 3 - right, middle height */}
              <div className="md:absolute md:left-[70%] md:top-[80px] text-center md:text-left md:max-w-xs">
                <SunburstIcon className="text-charcoal mx-auto md:mx-0 mb-6" size={56} />
                <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                  Meeting Requests
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Participants can request meetings with each other. Track requests, 
                  acceptances, and schedule networking time.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works - minimal list with asymmetric divider */}
          <div className="max-w-lg mx-auto md:ml-[15%] md:mr-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-12">
              How It Works
            </h2>
            <div className="space-y-10">
              <div className="flex gap-6 items-start">
                <span className="text-sm font-medium text-primary w-6 flex-shrink-0">01</span>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Create an Event</h4>
                  <p className="text-sm text-muted-foreground">Set up your hackathon, meetup, or conference in seconds</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <span className="text-sm font-medium text-primary w-6 flex-shrink-0">02</span>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Share the Link</h4>
                  <p className="text-sm text-muted-foreground">Send your unique registration link to participants</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <span className="text-sm font-medium text-primary w-6 flex-shrink-0">03</span>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Let AI Match</h4>
                  <p className="text-sm text-muted-foreground">Generate smart matches or let participants find each other</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <span className="text-sm font-medium text-primary w-6 flex-shrink-0">04</span>
                <div>
                  <h4 className="font-medium text-foreground mb-1">Network Effectively</h4>
                  <p className="text-sm text-muted-foreground">Meaningful connections that lead to real collaborations</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer - minimal with decorative bracket */}
        <footer className="py-8 relative">
          <CornerBracketFlipped 
            className="hidden md:block absolute bottom-4 right-12 text-charcoal" 
            size={60} 
          />
          <div className="container mx-auto px-6 md:px-12 text-center">
            <p className="text-xs text-muted-foreground">
              Built with ✨ for hackers, makers, and connectors
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
