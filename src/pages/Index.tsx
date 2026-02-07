import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { 
  LayeredDiamondsIcon, 
  OverlappingCirclesIcon, 
  SunburstIcon,
  SparkleIcon 
} from "@/components/icons/GeometricIcons";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header - minimal, no border */}
        <header className="py-6">
          <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <SparkleIcon className="text-primary" size={28} />
              <span className="font-serif text-xl text-foreground tracking-tight">
                Meet<span className="text-primary">Spark</span>
              </span>
            </Link>
            <Link 
              to="/dashboard" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard →
            </Link>
          </div>
        </header>

        {/* Hero Section - generous spacing */}
        <main className="flex-1 container mx-auto px-6 md:px-12 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center mb-24 md:mb-32">
            <h1 className="font-serif text-5xl md:text-7xl font-medium text-foreground mb-8 leading-[1.1]">
              Make Networking<br />
              <em className="text-primary">Actually Work</em>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-relaxed">
              AI-powered matching platform that connects the right people at your events. 
              Create events, share registration links, and let AI find the perfect matches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                <Link to="/dashboard">
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Your Event
                </Link>
              </Button>
              <Link 
                to="/dashboard" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View Dashboard →
              </Link>
            </div>
          </div>

          {/* Features - free-flowing, no boxes */}
          <div className="grid md:grid-cols-3 gap-16 md:gap-12 max-w-4xl mx-auto mb-24 md:mb-32">
            {/* Feature 1 */}
            <div className="text-center">
              <LayeredDiamondsIcon className="text-charcoal mx-auto mb-6" size={56} />
              <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                Shareable Forms
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Create events and share registration links. Participants fill in their details, 
                and data flows directly to your dashboard.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <OverlappingCirclesIcon className="text-charcoal mx-auto mb-6" size={56} />
              <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                AI Matching
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our AI analyzes roles, interests, and skills to suggest optimal networking pairs. 
                No more random introductions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <SunburstIcon className="text-charcoal mx-auto mb-6" size={56} />
              <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                Meeting Requests
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Participants can request meetings with each other. Track requests, 
                acceptances, and schedule networking time.
              </p>
            </div>
          </div>

          {/* How It Works - minimal list */}
          <div className="max-w-lg mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl font-medium text-center text-foreground mb-12">
              How It Works
            </h2>
            <div className="space-y-8">
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

        {/* Footer - minimal */}
        <footer className="py-8">
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
