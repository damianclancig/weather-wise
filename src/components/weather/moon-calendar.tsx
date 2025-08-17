
'use client';

import { useTranslation } from "@/hooks/use-translation";
import { GlassCard } from "../ui/glass-card";

// Synodic month length (in days)
const SYNODIC_MONTH = 29.530588853;
// Known new moon date (Julian date for Jan 6, 2000)
const KNOWN_NEW_MOON_JD = 2451549.5; 
const PHASES = ['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'third_quarter', 'waning_crescent'];
const MAJOR_PHASES = ['new_moon', 'first_quarter', 'full_moon', 'third_quarter'];

interface MoonCalendarProps {
    date: Date;
}

function toJulian(date: Date): number {
  if (!date || isNaN(date.getTime())) return 0;
  const time = date.getTime();
  const tzoffset = date.getTimezoneOffset() * 60000;
  // Calculate Julian Day for UTC
  return (time - tzoffset) / 86400000 + 2440587.5;
}

function fromJulian(jd: number): Date {
  if (jd === 0) return new Date();
  const date = new Date((jd - 2440587.5) * 86400000);
  // The date is in UTC, return it as is. Formatting should handle timezone.
  return date;
}

function getMoonInfo(currentDate: Date): { phaseName: string; illumination: number } {
  if (!currentDate || isNaN(currentDate.getTime())) {
    return { phaseName: 'new_moon', illumination: 0 };
  }
  const currentJD = toJulian(currentDate);
  const age = (currentJD - KNOWN_NEW_MOON_JD) % SYNODIC_MONTH;
  const phaseValue = age / SYNODIC_MONTH; // value from 0 to 1
  
  const phaseIndex = Math.floor(phaseValue * 8 + 0.5) % 8;
  const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * phaseValue));
  
  return {
    phaseName: PHASES[phaseIndex],
    illumination: Math.round(illumination * 100)
  };
}

function getUpcomingMajorPhases(currentDate: Date): { name: string; date: Date }[] {
  if (!currentDate || isNaN(currentDate.getTime())) {
    return [];
  }
  const currentJD = toJulian(currentDate);
  const cycles = (currentJD - KNOWN_NEW_MOON_JD) / SYNODIC_MONTH;
  const currentCycle = Math.floor(cycles);

  const results: { name: string; date: Date }[] = [];
  
  // Look in the current and next two cycles to find the next 4 unique major phases
  for (let cycle = 0; cycle < 3 && results.length < 4; cycle++) {
    for (let i = 0; i < MAJOR_PHASES.length; i++) {
      const phaseOffset = i * 0.25;
      const phaseJD = KNOWN_NEW_MOON_JD + (currentCycle + cycle + phaseOffset) * SYNODIC_MONTH;
      
      if (phaseJD >= currentJD) {
        const phaseName = MAJOR_PHASES[i];
        // Ensure we don't add duplicates
        if (!results.some(p => p.name === phaseName)) {
           results.push({ name: phaseName, date: fromJulian(phaseJD) });
        }
      }
    }
  }

  // Sort and slice to get the next 4
  return results.sort((a,b) => a.date.getTime() - b.date.getTime()).slice(0, 4);
}

const PhaseIcon = ({ phaseName }: { phaseName: string }) => {
  const iconMap: Record<string, JSX.Element> = {
    new_moon: <circle key="nm" cx="12" cy="12" r="10" fill="black" stroke="currentColor" strokeWidth="0.5" />,
    first_quarter: <path key="fq" d="M12 2 a 10 10 0 0 1 0 20 V2z" fill="currentColor" />,
    full_moon: <circle key="fm" cx="12" cy="12" r="10" fill="currentColor" />,
    third_quarter: <path key="tq" d="M12 2 a 10 10 0 0 0 0 20 V2z" fill="currentColor" />,
  };
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 text-foreground/80">
      {iconMap[phaseName] || iconMap.new_moon}
    </svg>
  );
};

const CurrentMoonIcon = ({ phaseName, illumination }: { phaseName: string; illumination: number }) => {
  // Simple heuristic to determine if it's waxing or waning for crescent/gibbous
  const isWaxing = phaseName?.includes('waxing') || phaseName === 'first_quarter';

  const r = 10; // radius
  const cx = 12;
  const cy = 12;
  
  let path;
  if (!phaseName || phaseName === 'new_moon') {
      path = <circle cx={cx} cy={cy} r={r} fill="black" stroke="currentColor" strokeWidth="0.5" />;
  } else if (phaseName === 'full_moon') {
      path = <circle cx={cx} cy={cy} r={r} fill="currentColor" />;
  } else if (phaseName === 'first_quarter') {
      path = <path d={`M12 2 a ${r} ${r} 0 0 1 0 ${2*r} V 2 Z`} fill="currentColor" />;
  } else if (phaseName === 'third_quarter') {
      path = <path d={`M12 2 a ${r} ${r} 0 0 0 0 ${2*r} V 2 Z`} fill="currentColor" />;
  } else {
       // Crescent and Gibbous phases
      const isGibbous = phaseName.includes('gibbous');
      const sweepFlag = isWaxing ? 1 : 0;
      const largeArcFlag = isGibbous ? 1 : 0;
      
      // We calculate the x-radius of the ellipse to simulate illumination
      const xRadius = r * Math.abs(1 - (illumination / 50));
      
      const start = `M12,2`;
      const arc1 = `A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} 12,22`;
      // The second arc is an ellipse
      const arc2 = `A ${xRadius} ${r} 0 ${largeArcFlag} ${sweepFlag === 1 ? 0 : 1} 12,2`;

      path = <path d={`${start} ${arc1} ${arc2} Z`} fill="currentColor" />;
  }


  return (
    <svg viewBox="0 0 24 24" className="w-24 h-24 text-foreground">
      <defs>
        <mask id="moon-mask">
          <circle cx={cx} cy={cy} r={r} fill="white" />
        </mask>
      </defs>
      <g mask="url(#moon-mask)">
        <circle cx={cx} cy={cy} r={r} fill="black" stroke="white" strokeWidth="0.5" />
        {path}
      </g>
    </svg>
  );
};


export function MoonCalendar({ date }: MoonCalendarProps) {
  const { t } = useTranslation();

  if (!date || isNaN(date.getTime())) {
    return null; // Or a loading/error state
  }

  const upcomingPhases = getUpcomingMajorPhases(date);
  const currentPhase = getMoonInfo(date);
  
  return (
    <GlassCard>
      <div className="p-1">
        <h3 className="text-xl font-bold mb-4">{t('moonCalendarTitle')}</h3>
        
        {/* Current Moon Phase Display */}
        <div className="flex flex-col items-center justify-center text-center gap-2 mb-6">
            <CurrentMoonIcon phaseName={currentPhase.phaseName} illumination={currentPhase.illumination} />
            <p className="text-lg font-semibold capitalize">{t(`moon.${currentPhase.phaseName}`)}</p>
            <p className="text-sm text-foreground/80">{t('illumination', {percent: currentPhase.illumination})}</p>
        </div>

        {/* Upcoming Major Phases */}
        <div className="grid grid-cols-4 gap-2 text-center">
            {upcomingPhases.map((phase) => (
                <div key={phase.name} className="flex flex-col items-center p-2 rounded-lg bg-white/5 gap-1">
                    <PhaseIcon phaseName={phase.name} />
                    <p className="font-semibold capitalize text-xs">{t(`moon.${phase.name}`)}</p>
                    <p className="text-xs text-foreground/80">{phase.date.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        timeZone: 'UTC'
                    })}</p>
                </div>
            ))}
        </div>
      </div>
    </GlassCard>
  );
}
