/**
 * Task catalogue, modelled on the service tracks listed on padosipro.com.
 * Ids are stable slugs so a user's selection survives re-seeding.
 */
interface SeedCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  tasks: { id: string; name: string; description: string }[];
}

export const CATALOGUE: SeedCategory[] = [
  {
    id: 'home-services',
    name: 'Home Services',
    description: 'Repairs, cleaning and upkeep, handled by vetted pros.',
    icon: 'home',
    tasks: [
      { id: 'ac-repair', name: 'AC Repair & Service', description: 'Servicing, gas top-up and repairs for split and window ACs.' },
      { id: 'plumber', name: 'Plumber', description: 'Leaks, blockages, taps and bathroom fittings fixed.' },
      { id: 'electrician', name: 'Electrician', description: 'Wiring, switches, fans and light fittings.' },
      { id: 'deep-cleaning', name: 'Deep Cleaning', description: 'Full-home or single-room deep clean, including kitchen and bathrooms.' },
      { id: 'pest-control', name: 'Pest Control', description: 'Cockroach, termite and mosquito treatment for your home.' },
    ],
  },
  {
    id: 'errands-daily',
    name: 'Errands & Daily Tasks',
    description: 'The everyday to-dos that eat into your week.',
    icon: 'shopping-bag',
    tasks: [
      { id: 'grocery-run', name: 'Grocery Run', description: 'Weekly groceries and household supplies picked up and delivered.' },
      { id: 'pharmacy-pickup', name: 'Pharmacy Pickup', description: 'Prescription medicines collected and delivered on time.' },
      { id: 'courier-dispatch', name: 'Courier & Parcels', description: 'Parcels packed, booked and dispatched for you.' },
      { id: 'laundry', name: 'Laundry & Dry Cleaning', description: 'Pickup, wash, iron and drop-back of clothes.' },
      { id: 'bill-payments', name: 'Bill Payments', description: 'Electricity, water, gas and society bills paid before due dates.' },
    ],
  },
  {
    id: 'health-medical',
    name: 'Health & Medical',
    description: 'Appointments, tests and care at home.',
    icon: 'heart',
    tasks: [
      { id: 'doctor-visit', name: 'Doctor Appointment', description: 'Appointment booked and a companion for the visit if needed.' },
      { id: 'lab-tests', name: 'Lab Tests at Home', description: 'Sample collection at home and reports shared with you.' },
      { id: 'physiotherapy', name: 'Physiotherapy', description: 'Certified physiotherapist sessions at home.' },
      { id: 'medicine-refills', name: 'Medicine Refills', description: 'Monthly medicines tracked and refilled before they run out.' },
      { id: 'yoga-coach', name: 'Yoga Coach', description: 'Personal yoga sessions at home or in your society.' },
    ],
  },
  {
    id: 'senior-care',
    name: 'Senior Care',
    description: 'Looking after parents, even when you are far away.',
    icon: 'users',
    tasks: [
      { id: 'elderly-checkins', name: 'Daily Check-ins', description: 'Regular visits or calls with photo updates to you.' },
      { id: 'elderly-caretaker', name: 'Caretaker', description: 'Trained, background-verified caretaker for day or night.' },
      { id: 'hospital-companion', name: 'Hospital Companion', description: 'Someone to accompany parents for visits and admissions.' },
      { id: 'senior-bank-work', name: 'Bank & Pension Work', description: 'Bank visits, life certificates and pension paperwork.' },
      { id: 'emergency-support', name: 'Emergency Support', description: 'On-ground help within minutes when something goes wrong.' },
    ],
  },
  {
    id: 'travel-tourism',
    name: 'Travel & Tourism',
    description: 'Trips planned and handled end to end.',
    icon: 'map',
    tasks: [
      { id: 'airport-drop', name: 'Airport Pickup & Drop', description: 'Reliable cab or driver for airport runs, any hour.' },
      { id: 'hotel-booking', name: 'Hotel Booking', description: 'Shortlisting and booking stays that match your budget.' },
      { id: 'passport-visa', name: 'Passport & Visa', description: 'Forms, appointments and document checks for passport and visa.' },
      { id: 'holiday-planning', name: 'Holiday Planning', description: 'Itinerary, tickets and bookings for family trips.' },
      { id: 'car-rental', name: 'Car Rental', description: 'Self-drive or chauffeured cars for the day or the week.' },
    ],
  },
  {
    id: 'events-management',
    name: 'Events & Management',
    description: 'Celebrations without the coordination calls.',
    icon: 'gift',
    tasks: [
      { id: 'birthday-party', name: 'Birthday Party', description: 'Venue, cake, décor and entertainment arranged.' },
      { id: 'catering', name: 'Catering', description: 'Menu tasting and catering for small or large gatherings.' },
      { id: 'decoration', name: 'Decoration', description: 'Floral and theme décor for home functions and festivals.' },
      { id: 'event-photography', name: 'Event Photography', description: 'Photographers and videographers for your occasion.' },
      { id: 'wedding-prep', name: 'Wedding Coordination', description: 'Mehendi to vidaai: vendors, guests and logistics.' },
    ],
  },
  {
    id: 'digital-tech',
    name: 'Digital & Tech Help',
    description: 'Devices, apps and home tech sorted.',
    icon: 'monitor',
    tasks: [
      { id: 'laptop-repair', name: 'Laptop & Phone Repair', description: 'Diagnosis, repair and data backup for your devices.' },
      { id: 'wifi-setup', name: 'Wi-Fi & Network Setup', description: 'Router setup, dead-zone fixes and new connections.' },
      { id: 'smart-home', name: 'Smart Home Setup', description: 'Cameras, smart plugs and voice assistants installed.' },
      { id: 'digital-docs', name: 'Online Forms & Documents', description: 'Aadhaar, PAN and other online applications filled in.' },
      { id: 'tech-lessons', name: 'Tech Help for Parents', description: 'Patient help with phones, UPI and video calls.' },
    ],
  },
  {
    id: 'relocation',
    name: 'Relocation Services',
    description: 'Moving house, minus the stress.',
    icon: 'truck',
    tasks: [
      { id: 'packers-movers', name: 'Packers & Movers', description: 'Quotes compared, packing and moving supervised.' },
      { id: 'house-hunting', name: 'House Hunting', description: 'Shortlisting and visiting rental or purchase options.' },
      { id: 'vehicle-rc-transfer', name: 'Vehicle RC Transfer', description: 'RTO paperwork for moving or transferring your vehicle.' },
      { id: 'utility-setup', name: 'Utility Connections', description: 'Electricity, gas, internet and water connections set up.' },
      { id: 'move-in-cleaning', name: 'Move-in Cleaning', description: 'The new place cleaned and ready before you arrive.' },
    ],
  },
];
