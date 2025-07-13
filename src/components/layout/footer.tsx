import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-transparent text-foreground/60">
      <div className="flex items-center justify-between py-4 px-4">
        <p className="text-sm">© 2024 All rights reserved - MIT License</p>
        <Button variant="ghost" size="icon" asChild>
          <Link href="https://github.com/damianclancig/weather-wise" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository">
            <Github className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </footer>
  );
}
