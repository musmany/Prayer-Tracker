// utils.js

// Utility to format time from 24hr to 12hr AM/PM
export function formatTimeTo12Hour(timeStr) {
  const [hour, minute] = timeStr.split(':').map(Number);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
}

// Utility to get today's date in YYYY-MM-DD format
export function getTodayDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0]; // returns '2025-07-28'
}

// Utility to get current timestamp in readable format
export function getCurrentTimestampString() {
  return new Date().toLocaleString(); // e.g. '7/28/2025, 8:35:00 AM'
}

// List of five prayers in order
export const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Icons (you can customize later)
export const PRAYER_ICONS = {
  Fajr: '🌅',
  Dhuhr: '🌞',
  Asr: '☀️',
  Maghrib: '🌇',
  Isha: '🌌'
};

// Colors for UI (optional)
export const PRAYER_COLORS = {
  Fajr: 'bg-blue-100',
  Dhuhr: 'bg-yellow-100',
  Asr: 'bg-orange-100',
  Maghrib: 'bg-pink-100',
  Isha: 'bg-purple-100'
};

// Converts API prayer name to standard app name if needed
export function normalizePrayerName(name) {
  const map = {
    Fajr: 'Fajr',
    Dhuhr: 'Dhuhr',
    Asr: 'Asr',
    Maghrib: 'Maghrib',
    Isha: 'Isha',
    Sunrise: null,
    Midnight: null
  };
  return map[name] || null;
}
