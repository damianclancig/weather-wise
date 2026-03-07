'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { GlassCard } from '@/components/ui/glass-card';
import { useTranslation } from '@/hooks/use-translation';
import { AlertCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    const { t } = useTranslation();

    return (
        <div className="relative flex flex-col min-h-dvh transition-all duration-700">
            {/* Background layer matching WeatherMain */}
            <div className="fixed inset-0 z-0 bg-slate-950">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black/80" />
            </div>

            <div className="relative z-10 flex flex-col min-h-dvh pointer-events-none">
                {/* Header */}
                <header className="shrink-0 pointer-events-auto">
                    <Header />
                </header>

                {/* Main content */}
                <main className="flex-1 flex flex-col items-center justify-center w-full px-4 py-8 mx-auto pointer-events-auto">
                    <GlassCard className="max-w-md p-8 flex flex-col items-center text-center gap-6">
                        <div className="bg-destructive/10 p-4 rounded-full">
                            <AlertCircle className="w-16 h-16 text-destructive" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-white">
                                {t('notFound.title')}
                            </h1>
                            <p className="text-slate-400">
                                {t('notFound.message')}
                            </p>
                        </div>

                        <Button asChild size="lg" className="rounded-full px-8 gap-2 font-semibold">
                            <Link href="/">
                                <Home className="w-5 h-5" />
                                {t('notFound.button')}
                            </Link>
                        </Button>
                    </GlassCard>
                </main>

                {/* Footer */}
                <footer className="shrink-0 w-full pointer-events-auto">
                    <Footer />
                </footer>
            </div>
        </div>
    );
}
