
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader, MapPin } from "lucide-react";
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

interface SearchControlsProps {
  formAction: (payload: FormData) => void;
  onRefreshLocation: () => void;
}

export function SearchControls({ formAction, onRefreshLocation }: SearchControlsProps) {
  const { t } = useTranslation();
  const { pending } = useFormStatus();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    if (formRef.current) {
      const form = formRef.current;
      const locationInput = form.elements.namedItem('location') as HTMLInputElement;
      locationInput.value = suggestion.name;
      form.requestSubmit();
      setShowSuggestions(false);
      setQuery('');
    }
  };
  
  const handleRefresh = () => {
    setQuery('');
    onRefreshLocation();
  }

  const handleFormAction = (formData: FormData) => {
      formAction(formData);
      setQuery('');
  }

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
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [query]);
  
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
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
    <div ref={searchContainerRef} className="flex items-center space-x-2 w-full">
      <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={pending} aria-label="Use my location">
        <MapPin />
      </Button>
      <form ref={formRef} action={handleFormAction} className="relative flex flex-grow items-center space-x-2">
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
        {showSuggestions && (
          <div className="absolute top-full mt-2 w-full bg-popover rounded-md shadow-lg border border-border/60 z-50">
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
      </form>
    </div>
  );
}
