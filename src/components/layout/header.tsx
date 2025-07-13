'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader, Sun } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";
import type { CitySuggestion } from '@/lib/types';
import { getCitySuggestions } from '@/app/actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();

  return (
    <Button type="submit" disabled={pending} aria-label={t('search')}>
      {pending ? <Loader className="animate-spin" /> : <Search />}
    </Button>
  );
}

interface HeaderProps {
  formAction: (payload: FormData) => void;
}

export function Header({ formAction }: HeaderProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    if (formRef.current) {
      const form = formRef.current;
      const locationInput = form.elements.namedItem('location') as HTMLInputElement;
      locationInput.value = suggestion.name;
      setQuery(suggestion.name);
      setShowSuggestions(false);
      form.requestSubmit();
    }
  };

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const debounceTimeout = setTimeout(async () => {
      const newSuggestions = await getCitySuggestions(query);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [query]);
  
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
      setShowSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
           <Sun className="h-6 w-6 mr-2 text-yellow-400" />
          <span className="font-bold text-xl">WeatherWise</span>
        </div>
        <div className="flex items-center space-x-2 relative">
          <form ref={formRef} action={formAction} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="text"
              name="location"
              placeholder={t('searchPlaceholder')}
              className="bg-card/80 border-border/60 focus:ring-ring"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >=3 && setShowSuggestions(true)}
              autoComplete="off"
            />
            <SubmitButton />
          </form>
           {showSuggestions && (
            <div className="absolute top-full mt-2 w-full max-w-sm bg-card rounded-md shadow-lg border border-border/60 z-10">
              <ul>
                {suggestions.map((s, index) => (
                  <li
                    key={`${s.lat}-${s.lon}-${index}`}
                    className="px-4 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleSuggestionClick(s)}
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
