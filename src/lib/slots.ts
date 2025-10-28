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
  const currentMinute = now.getMinutes();
  
  // Start from next available slot (current time + prep time)
  const startTime = new Date(now);
  startTime.setMinutes(
    Math.ceil((currentMinute + config.slots.prepTimeMins) / config.slots.intervalMins) * config.slots.intervalMins
  );
  
  // Generate slots until 4:00 AM (next day)
  const endTime = new Date(now);
  endTime.setHours(4, 0, 0, 0);
  if (endTime <= now) {
    endTime.setDate(endTime.getDate() + 1);
  }
  
  const current = new Date(startTime);
  
  while (current < endTime) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current);
    slotEnd.setMinutes(slotEnd.getMinutes() + config.slots.intervalMins);
    
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
  const today = new Date();
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const start = new Date(today);
  start.setHours(startHour, startMinute, 0, 0);
  
  const end = new Date(today);
  end.setHours(endHour, endMinute, 0, 0);
  
  // If end time is before start time, it's next day
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }
  
  return { start, end };
}

export function isSlotAvailable(slot: TimeSlot): boolean {
  return slot.available && slot.currentOrders < slot.maxOrders;
}
