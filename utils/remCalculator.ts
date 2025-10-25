export const REM_CYCLE_MINUTES = 90;
export const FALL_ASLEEP_MINUTES = 15;

export interface SuggestedTime {
  time: string;
  cycles: number;
  totalSleep: string;
}

export function parseTime(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

export function formatTime(hours: number, minutes: number): string {
  const h = hours % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function addMinutes(timeString: string, minutesToAdd: number): string {
  const { hours, minutes } = parseTime(timeString);
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return formatTime(newHours, newMinutes);
}

export function calculateMinutesBetween(startTime: string, endTime: string): number {
  const start = parseTime(startTime);
  const end = parseTime(endTime);

  let startMinutes = start.hours * 60 + start.minutes;
  let endMinutes = end.hours * 60 + end.minutes;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  return endMinutes - startMinutes;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function calculateWakeTimes(sleepTime: string, wakeTime: string): SuggestedTime[] {
  const suggestions: SuggestedTime[] = [];
  const totalAvailableMinutes = calculateMinutesBetween(sleepTime, wakeTime);

  const maxCycles = Math.floor((totalAvailableMinutes - FALL_ASLEEP_MINUTES) / REM_CYCLE_MINUTES);

  for (let cycles = maxCycles; cycles >= 3; cycles--) {
    const sleepDuration = cycles * REM_CYCLE_MINUTES;
    const wakeUpTime = addMinutes(sleepTime, FALL_ASLEEP_MINUTES + sleepDuration);

    suggestions.push({
      time: wakeUpTime,
      cycles: cycles,
      totalSleep: formatDuration(sleepDuration),
    });
  }

  return suggestions;
}

export function calculateSleepTimes(wakeTime: string): SuggestedTime[] {
  const suggestions: SuggestedTime[] = [];

  for (let cycles = 6; cycles >= 4; cycles--) {
    const sleepDuration = cycles * REM_CYCLE_MINUTES;
    const totalMinutesBack = FALL_ASLEEP_MINUTES + sleepDuration;

    const { hours: wakeHours, minutes: wakeMinutes } = parseTime(wakeTime);
    const totalWakeMinutes = wakeHours * 60 + wakeMinutes;
    const sleepMinutes = totalWakeMinutes - totalMinutesBack;

    const sleepHours = Math.floor((sleepMinutes + 24 * 60) / 60) % 24;
    const sleepMins = ((sleepMinutes % 60) + 60) % 60;

    suggestions.push({
      time: formatTime(sleepHours, sleepMins),
      cycles: cycles,
      totalSleep: formatDuration(sleepDuration),
    });
  }

  return suggestions;
}
