
'use client';

import { useTranslation } from "@/hooks/use-translation";

// Synodic month length (in days)
const SYNODIC_MONTH = 29.530588853;
// Known new moon date (Julian date for Jan 6, 2000)
const KNOWN_NEW_MOON_JD = 2451549.5; 
const PHASES = ['new_moon', 'waxing_crescent', 'first_quarter', 'waxing_gibbous', 'full_moon', 'waning_gibbous', 'third_quarter', 'waning_crescent'];
const MAJOR_PHASES = ['new_moon', 'first_quarter', 'full_moon', 'third_quarter'];

interface MoonCalendarProps {
    date: Date;
    latitude: number;
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

function getMoonInfo(currentDate: Date): { phaseName: string; illumination: number, age: number } {
  if (!currentDate || isNaN(currentDate.getTime())) {
    return { phaseName: 'new_moon', illumination: 0, age: 0 };
  }
  const currentJD = toJulian(currentDate);
  const age = (currentJD - KNOWN_NEW_MOON_JD) % SYNODIC_MONTH;
  const phaseValue = age / SYNODIC_MONTH; // value from 0 to 1
  
  const phaseIndex = Math.floor(phaseValue * 8 + 0.5) % 8;
  const illumination = 0.5 * (1 - Math.cos(2 * Math.PI * phaseValue));
  
  return {
    phaseName: PHASES[phaseIndex],
    illumination: Math.round(illumination * 100),
    age: age
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

const PhaseIcon = ({ phaseName, latitude }: { phaseName: string, latitude: number }) => {
  const isSouthernHemisphere = latitude < 0;

  let path;
  // For major phases, we flip the quarter moon drawing
  switch (phaseName) {
      case 'new_moon':
          path = <circle cx="12" cy="12" r="10" fill="black" stroke="currentColor" strokeWidth="0.5" />;
          break;
      case 'first_quarter':
          // In the South, first quarter looks like a "D" shape on the left
          path = <path d={isSouthernHemisphere ? "M12 2 a 10 10 0 0 0 0 20 V2z" : "M12 2 a 10 10 0 0 1 0 20 V2z"} fill="currentColor" />;
          break;
      case 'full_moon':
          path = <circle cx="12" cy="12" r="10" fill="currentColor" />;
          break;
      case 'third_quarter':
           // In the South, third quarter looks like a "D" shape on the right
          path = <path d={isSouthernHemisphere ? "M12 2 a 10 10 0 0 1 0 20 V2z" : "M12 2 a 10 10 0 0 0 0 20 V2z"} fill="currentColor" />;
          break;
      default: // Should not happen for major phases
          path = <circle cx="12" cy="12" r="10" fill="black" stroke="currentColor" strokeWidth="0.5" />;
          break;
  }
  
  return (
      <svg viewBox="0 0 24 24" className="w-8 h-8 text-foreground/80">
          {path}
      </svg>
  );
};


const CurrentMoonIcon = ({ age, latitude }: { age: number; latitude: number }) => {
    const isSouthernHemisphere = latitude < 0;
    const phase = age / SYNODIC_MONTH; // Progress from 0 (new) to 1 (new)
    
    // Constants for our SVG
    const cx = 12, cy = 12, r = 10;

    // The angle of the terminator (the line between light and shadow)
    const angle = phase * 2 * Math.PI;
    
    // The x-radius of the ellipse that forms the terminator
    // It's `r` at full/new moon and `0` at quarter moons
    const terminatorXRadius = r * Math.cos(angle);

    // Determine the sweep-flag for the SVG arc path. This controls the curve's direction.
    // For waxing phases (0 to 0.5), we draw the lit part. For waning (0.5 to 1), we draw the lit part.
    const sweepFlag = phase < 0.5 ? 1 : 0;
    
    // The core logic: A single path that draws the lit portion.
    // It starts at the top of the moon, draws a half-circle, then draws the terminator ellipse back to the top.
    const path = `
        M ${cx}, ${cy - r}
        A ${r},${r} 0 1,${sweepFlag} ${cx},${cy + r}
        A ${terminatorXRadius},${r} 0 1,${sweepFlag} ${cx},${cy - r}
        Z
    `;

    // For the southern hemisphere, we simply flip the entire SVG horizontally.
    const transform = isSouthernHemisphere ? 'scale(-1, 1) translate(-24, 0)' : '';

    return (
        <svg viewBox="0 0 24 24" className="w-24 h-24 text-foreground">
            <g transform={transform}>
                <circle cx={cx} cy={cy} r={r} fill="black" stroke="white" strokeWidth="0.2" />
                <path d={path} fill="currentColor" />
            </g>
        </svg>
    );
};


export function MoonCalendar({ date, latitude }: MoonCalendarProps) {
  const { t } = useTranslation();

  if (!date || isNaN(date.getTime())) {
    // When a forecast day is selected, it first renders with the old 'today' date
    // which might be invalid if it was an ISO string. This prevents a crash.
    return null; 
  }

  const upcomingPhases = getUpcomingMajorPhases(date);
  const currentPhase = getMoonInfo(date);
  
  return (
    <div className="p-1">
      <h3 className="text-xl font-bold mb-4">{t('moonCalendarTitle')}</h3>
      
      {/* Current Moon Phase Display */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-6">
          <CurrentMoonIcon age={currentPhase.age} latitude={latitude} />
          <p className="text-lg font-semibold capitalize">{t(`moon.${currentPhase.phaseName}`)}</p>
          <p className="text-sm text-foreground/80">{t('illumination', {percent: currentPhase.illumination})}</p>
      </div>

      {/* Upcoming Major Phases */}
      <div className="grid grid-cols-4 gap-2 text-center">
          {upcomingPhases.map((phase) => (
              <div key={phase.name} className="flex flex-col items-center p-2 rounded-lg bg-white/5 gap-1">
                  <PhaseIcon phaseName={phase.name} latitude={latitude} />
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
  );
}
