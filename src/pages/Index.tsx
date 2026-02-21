import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, Calendar, Sparkles, ArrowRight, Share2, MessageSquare } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded flex items-center justify-center bg-primary/10 border border-primary/20">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-serif font-semibold text-lg text-foreground">MeetSpark</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Networking</p>
              </div>
            </div>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link to="/dashboard">
                Open Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="font-serif text-4xl md:text-6xl font-medium text-foreground mb-6">
              Make Networking<br />
              <span className="italic text-primary">Actually Work</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI-powered matching platform that connects the right people at your events. 
              Create events, share registration links, and let AI find the perfect matches.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground glow-gold">
                <Link to="/dashboard">
                  <Calendar className="w-5 h-5 mr-2" />
                  Create Your Event
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border hover:border-primary">
                <Link to="/dashboard">
                  <Users className="w-5 h-5 mr-2" />
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-sans font-semibold text-foreground">Shareable Forms</CardTitle>
                <CardDescription>
                  Create events and share registration links. Participants fill in their details, 
                  and data flows directly to your dashboard.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-sans font-semibold text-foreground">AI Matching</CardTitle>
                <CardDescription>
                  Our AI analyzes roles, interests, and skills to suggest optimal networking pairs. 
                  No more random introductions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="font-sans font-semibold text-foreground">Meeting Requests</CardTitle>
                <CardDescription>
                  Participants can request meetings with each other. Track requests, 
                  acceptances, and schedule networking time effectively.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* How It Works */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h3 className="font-serif text-2xl font-medium text-center text-foreground mb-8">How It Works</h3>
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold border border-primary/20">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Create an Event</h4>
                  <p className="text-muted-foreground">Set up your hackathon, meetup, or conference in seconds</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold border border-primary/20">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Share the Link</h4>
                  <p className="text-muted-foreground">Send your unique registration link to participants</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-semibold border border-primary/20">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Let AI Match</h4>
                  <p className="text-muted-foreground">Generate smart matches or let participants find each other</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Network Effectively</h4>
                  <p className="text-muted-foreground">Meaningful connections that lead to real collaborations</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              Built with ✨ for hackers, makers, and connectors
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
