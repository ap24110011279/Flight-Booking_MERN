require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Flight = require('../models/Flight');

const airlines = [
  { name: 'IndiGo', code: '6E', aircraft: 'Airbus A320' },
  { name: 'Air India', code: 'AI', aircraft: 'Boeing 787' },
  { name: 'Vistara', code: 'UK', aircraft: 'Airbus A321' },
  { name: 'SpiceJet', code: 'SG', aircraft: 'Boeing 737-800' },
  { name: 'Akasa Air', code: 'QP', aircraft: 'Boeing 737 MAX' },
  { name: 'Emirates', code: 'EK', aircraft: 'Boeing 777' },
  { name: 'Qatar Airways', code: 'QR', aircraft: 'Airbus A350' },
];

// Cities & their approximate coordinates (lat, lon) — used to auto-compute
// duration and price between every pair so flights exist on EVERY route.
const cities = [
  { name: 'Delhi',     lat: 28.61, lon: 77.21, intl: false },
  { name: 'Mumbai',    lat: 19.08, lon: 72.88, intl: false },
  { name: 'Bangalore', lat: 12.97, lon: 77.59, intl: false },
  { name: 'Chennai',   lat: 13.08, lon: 80.27, intl: false },
  { name: 'Hyderabad', lat: 17.38, lon: 78.48, intl: false },
  { name: 'Kolkata',   lat: 22.57, lon: 88.36, intl: false },
  { name: 'Goa',       lat: 15.49, lon: 73.82, intl: false },
  { name: 'Pune',      lat: 18.52, lon: 73.85, intl: false },
  { name: 'Ahmedabad', lat: 23.02, lon: 72.57, intl: false },
  { name: 'Jaipur',    lat: 26.91, lon: 75.78, intl: false },
  { name: 'Lucknow',   lat: 26.84, lon: 80.94, intl: false },
  { name: 'Kochi',     lat: 9.93,  lon: 76.26, intl: false },
  { name: 'Dubai',     lat: 25.25, lon: 55.36, intl: true  },
  { name: 'Singapore', lat: 1.35,  lon: 103.81, intl: true },
  { name: 'London',    lat: 51.50, lon: -0.12, intl: true  },
  { name: 'New York',  lat: 40.71, lon: -74.00, intl: true },
];

function pad(n) { return String(n).padStart(2, '0'); }

// Great-circle distance (km) between two coordinates
function distanceKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

function buildFlights() {
  const flights = [];
  const today = new Date();

  // Generate every directional pair of cities
  const routes = [];
  for (const src of cities) {
    for (const dst of cities) {
      if (src.name === dst.name) continue;
      const km = distanceKm(src, dst);
      // average jet cruise ~ 750 km/h + 30 min taxi/buffer
      const dur = Math.max(60, Math.round((km / 750) * 60) + 30);
      // pricing: ~₹6/km domestic, ~₹9/km if either side is international
      const perKm = src.intl || dst.intl ? 9 : 6;
      const basePrice = Math.max(1800, Math.round(km * perKm));
      routes.push([src.name, dst.name, dur, basePrice]);
    }
  }

  // For each route, create flights for the next 7 days across multiple airlines
  // and several departure times so users always see options.
  const departureSlots = [6, 9, 12, 15, 18, 21]; // hours of day

  for (let day = 0; day < 7; day++) {
    routes.forEach(([src, dst, dur, basePrice], rIdx) => {
      airlines.forEach((al, aIdx) => {
        // Each airline runs 2 flights/day on each route (different slots)
        const slot1 = departureSlots[(aIdx) % departureSlots.length];
        const slot2 = departureSlots[(aIdx + 3) % departureSlots.length];
        [slot1, slot2].forEach((depHour, sIdx) => {
          const dep = new Date(today);
          dep.setDate(today.getDate() + day);
          dep.setHours(depHour, (aIdx * 11 + sIdx * 17) % 60, 0, 0);
          const arr = new Date(dep.getTime() + dur * 60000);
          const price = Math.round(basePrice + aIdx * 250 + day * 100 + sIdx * 180);
          flights.push({
            flightNumber: `${al.code}${100 + (rIdx % 900)}-${day}${pad(depHour)}${sIdx}`,
            airlineName: al.name,
            aircraft: al.aircraft,
            source: src,
            destination: dst,
            departureTime: dep,
            arrivalTime: arr,
            durationMinutes: dur,
            price,
            seatsAvailable: 40 + ((rIdx + aIdx + sIdx) % 25),
          });
        });
      });
    });
  }
  return flights;
}

(async () => {
  try {
    await connectDB();
    await Flight.deleteMany({});
    const docs = buildFlights();
    // Insert in chunks to stay under MongoDB batch size limits
    const chunk = 1000;
    for (let i = 0; i < docs.length; i += chunk) {
      await Flight.insertMany(docs.slice(i, i + chunk));
    }
    const cityCount = cities.length;
    const routeCount = cityCount * (cityCount - 1);
    console.log(`🌱 Seeded ${docs.length} flights · ${routeCount} routes · ${cityCount} cities · 7 days.`);
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
