import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Hero = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Theme Toggle - Desktop only */}
      <div className="absolute top-4 right-4 z-50 hidden md:block">
        <ThemeToggle />
      </div>
      
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float animate-delay-1000"></div>
      </div>

      {/* Content */}
      <main className="relative z-10 text-center max-w-5xl mx-auto space-y-8 animate-fade-in-up" role="main">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 text-sm font-medium mb-4" role="status" aria-label="Platform tagline">
          <Sparkles className="w-4 h-4 text-primary" aria-hidden="true" />
          <span>Master AI Prompting Through Play</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-8xl font-display font-black tracking-tight" id="main-heading">
          <span className="text-gradient">Prompt Battle</span>
          <br />
          <span className="text-foreground">Arena</span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium px-4">
          Command the AI, Rule the Arena. Learn prompt engineering through interactive lessons, compete in epic battles, and climb the global leaderboard.
        </p>

        <nav className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 w-full px-4" role="navigation" aria-label="Main actions">
          <Link to="/learn" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="group relative overflow-hidden bg-gradient-to-r from-primary to-primary-glow hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 text-primary-foreground font-bold px-6 sm:px-8 py-6 text-base sm:text-lg w-full"
              aria-label="Start learning prompt engineering"
            >
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" aria-hidden="true" />
              Start Learning
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Button>
          </Link>

          <Link to="/arena" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              variant="outline"
              className="group border-2 border-secondary hover:bg-secondary/10 hover:border-secondary-glow px-6 sm:px-8 py-6 text-base sm:text-lg font-bold w-full"
              aria-label="Enter solo arena challenges"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
              Solo Arena
            </Button>
          </Link>

          <Link to="/battle" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              variant="outline"
              className="group border-2 border-primary hover:bg-primary/10 hover:border-primary-glow px-6 sm:px-8 py-6 text-base sm:text-lg font-bold w-full"
              aria-label="Join multiplayer prompt battle"
            >
              <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" aria-hidden="true" />
              Prompt Battle
            </Button>
          </Link>
        </nav>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4 sm:gap-8 pt-16 max-w-2xl mx-auto" aria-label="Platform statistics">
          <div className="glass rounded-2xl p-4 sm:p-6 border border-primary/20 hover:border-primary/40 transition-colors" role="article">
            <div className="text-3xl sm:text-4xl font-display font-bold text-gradient" aria-label="5 interactive lessons">5</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">Interactive Lessons</div>
          </div>
          <div className="glass rounded-2xl p-4 sm:p-6 border border-secondary/20 hover:border-secondary/40 transition-colors" role="article">
            <div className="text-3xl sm:text-4xl font-display font-bold text-gradient" aria-label="Unlimited battle challenges">∞</div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">Battle Challenges</div>
          </div>
          <div className="glass rounded-2xl p-4 sm:p-6 border border-primary/20 hover:border-primary/40 transition-colors" role="article">
            <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-secondary mx-auto mb-2" aria-hidden="true" />
            <div className="text-xs sm:text-sm text-muted-foreground">Global Leaderboard</div>
          </div>
        </section>
      </main>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
          <div className="w-1 h-3 rounded-full bg-primary animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
