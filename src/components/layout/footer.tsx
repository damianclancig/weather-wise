import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/40 bg-transparent text-foreground/60">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <div className="text-sm">
           <p>© {currentYear} All rights reserved - MIT License</p>
           <p>
            Diseño y desarrollo por{' '}
            <Link href="https://clancig.com.ar" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80">
                clancig.com.ar
            </Link>
           </p>
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href="https://github.com/damianclancig/weather-wise" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository">
            <Github className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </footer>
  );
}
