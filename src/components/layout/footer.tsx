
'use client';

import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-foreground/60">
      <div className="container mx-auto flex items-center justify-between py-4 px-4">
        <div className="text-sm">
           <p>© {currentYear} {t('footer.rights')}</p>
           <p>
            {t('footer.designedBy')}{' '}
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
