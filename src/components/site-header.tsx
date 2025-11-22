import Link from "next/link";
import { BrainCircuit } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="font-bold">QuizAI</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4 text-sm lg:gap-6">
            <Link
                href="/#features"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
                Features
            </Link>
             <Link
                href="/#demo"
                className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
                Demo
            </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
           <ThemeToggle />
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link href="/auth">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
