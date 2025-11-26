import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Home, BookOpen, Swords, Trophy, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/learn", label: "Learn", icon: BookOpen },
    { to: "/arena", label: "Solo Arena", icon: Swords },
    { to: "/battle", label: "Battle", icon: Users },
    { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed top-4 right-4 z-50 flex gap-2">
      <ThemeToggle />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="glass border-primary/30"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="glass border-primary/30 w-[280px]">
          <SheetHeader>
            <SheetTitle className="text-2xl font-display font-bold text-gradient">
              Prompt Battle
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-3 mt-8" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                    isActive(item.to)
                      ? "bg-primary/20 border-2 border-primary"
                      : "glass border border-primary/20 hover:border-primary/40"
                  }`}
                  aria-current={isActive(item.to) ? "page" : undefined}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}
