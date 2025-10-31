import { config } from './config';

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  maxOrders: number;
  currentOrders: number;
}

export function generateTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const now = new Date();
  
  // Calculate minimum start time (current time + prep time)
  const minStartTime = new Date(now.getTime() + config.slots.prepTimeMins * 60 * 1000);
  
  // Generate slots for the next 24 hours from now for testing/iteration
  const startDate = new Date(minStartTime);
  const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  // Round start time up to next interval
  const startMinutes = startDate.getMinutes();
  const roundedMinutes = Math.ceil(startMinutes / config.slots.intervalMins) * config.slots.intervalMins;
  startDate.setMinutes(roundedMinutes, 0, 0);
  
  // Ensure start time is at least minStartTime
  if (startDate < minStartTime) {
    startDate.setMinutes(startDate.getMinutes() + config.slots.intervalMins);
  }
  
  // Original restaurant hours logic commented out for reference (for when you want to restore it):
  // Determine if we're generating slots for today or tomorrow
  // const currentHour = now.getHours();
  // const today = new Date(now);
  // today.setHours(0, 0, 0, 0);
  // 
  // let startDate: Date;
  // let endDate: Date;
  // 
  // if (currentHour >= 12 && currentHour < 24) {
  //   // We're between 12:00 and midnight - generate slots from now until 06:00 tomorrow
  //   startDate = new Date(now);
  //   endDate = new Date(today);
  //   endDate.setDate(endDate.getDate() + 1);
  //   endDate.setHours(6, 0, 0, 0);
  // } else if (currentHour >= 0 && currentHour < 6) {
  //   // We're between midnight and 6:00 AM - generate slots until 06:00 today
  //   startDate = new Date(now);
  //   endDate = new Date(today);
  //   endDate.setHours(6, 0, 0, 0);
  // } else {
  //   // We're before 12:00 - start from 12:00 today, end at 06:00 tomorrow
  //   startDate = new Date(today);
  //   startDate.setHours(12, 0, 0, 0);
  //   if (startDate <= now) {
  //     startDate = new Date(minStartTime);
  //   }
  //   endDate = new Date(today);
  //   endDate.setDate(endDate.getDate() + 1);
  //   endDate.setHours(6, 0, 0, 0);
  // }
  
  const current = new Date(startDate);
  
  while (current < endDate) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current);
    slotEnd.setMinutes(slotEnd.getMinutes() + config.slots.intervalMins);
    
    // Don't create slots that go past the 24-hour window
    if (slotEnd > endDate) {
      break;
    }
    
    // Check if slot is in the past
    const isPast = slotStart <= now;
    
    // For now, assume all slots are available (in real app, check against database)
    const available = !isPast;
    
    slots.push({
      start: formatTime(slotStart),
      end: formatTime(slotEnd),
      available,
      maxOrders: config.slots.maxPerSlot,
      currentOrders: 0, // This would come from database in real app
    });
    
    current.setMinutes(current.getMinutes() + config.slots.intervalMins);
    
    // Prevent infinite loop (24 hours / 15 min intervals = 96 slots max)
    if (slots.length > 200) break;
  }
  
  return slots;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function parseTimeSlot(timeSlot: string): { start: Date; end: Date } {
  const [startTime, endTime] = timeSlot.split('-');
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Try today first
  const startDate = new Date(today);
  startDate.setHours(startHour, startMinute, 0, 0);
  
  // If the slot time has already passed today, it must be tomorrow
  // (slots are always in the future)
  if (startDate <= now) {
    startDate.setDate(startDate.getDate() + 1);
  }
  
  // End time is on the same date as start, or next day if it wraps around
  const endDate = new Date(startDate);
  endDate.setHours(endHour, endMinute, 0, 0);
  
  // If end time is before start time, it's next day (e.g., 23:45-00:00)
  if (endDate <= startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }
  
  return { start: startDate, end: endDate };
}

export function isSlotAvailable(slot: TimeSlot): boolean {
  return slot.available && slot.currentOrders < slot.maxOrders;
}
