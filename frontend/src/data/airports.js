const AIRPORTS = [
  // Nigeria
  { iataCode: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria', subType: 'AIRPORT' },
  { iataCode: 'ABV', name: 'Nnamdi Azikiwe International Airport', city: 'Abuja', country: 'Nigeria', subType: 'AIRPORT' },
  { iataCode: 'KAN', name: 'Mallam Aminu Kano International Airport', city: 'Kano', country: 'Nigeria', subType: 'AIRPORT' },
  { iataCode: 'PHC', name: 'Port Harcourt International Airport', city: 'Port Harcourt', country: 'Nigeria', subType: 'AIRPORT' },
  { iataCode: 'ENU', name: 'Akanu Ibiam International Airport', city: 'Enugu', country: 'Nigeria', subType: 'AIRPORT' },
  { iataCode: 'BNI', name: 'Benin Airport', city: 'Benin City', country: 'Nigeria', subType: 'AIRPORT' },
  { iataCode: 'ILR', name: 'Ilorin International Airport', city: 'Ilorin', country: 'Nigeria', subType: 'AIRPORT' },
  { iataCode: 'QOW', name: 'Sam Mbakwe Airport', city: 'Owerri', country: 'Nigeria', subType: 'AIRPORT' },
  { iataCode: 'CBQ', name: 'Margaret Ekpo International Airport', city: 'Calabar', country: 'Nigeria', subType: 'AIRPORT' },
  { iataCode: 'MIU', name: 'Maiduguri International Airport', city: 'Maiduguri', country: 'Nigeria', subType: 'AIRPORT' },
  // UAE
  { iataCode: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', subType: 'AIRPORT' },
  { iataCode: 'AUH', name: 'Abu Dhabi International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', subType: 'AIRPORT' },
  { iataCode: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah', country: 'United Arab Emirates', subType: 'AIRPORT' },
  // Qatar
  { iataCode: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', subType: 'AIRPORT' },
  // UK
  { iataCode: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom', subType: 'AIRPORT' },
  { iataCode: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom', subType: 'AIRPORT' },
  { iataCode: 'STN', name: 'Stansted Airport', city: 'London', country: 'United Kingdom', subType: 'AIRPORT' },
  { iataCode: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom', subType: 'AIRPORT' },
  { iataCode: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom', subType: 'AIRPORT' },
  // USA
  { iataCode: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', subType: 'AIRPORT' },
  { iataCode: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', subType: 'AIRPORT' },
  { iataCode: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', subType: 'AIRPORT' },
  { iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States', subType: 'AIRPORT' },
  { iataCode: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States', subType: 'AIRPORT' },
  { iataCode: 'IAD', name: 'Dulles International Airport', city: 'Washington DC', country: 'United States', subType: 'AIRPORT' },
  // Europe
  { iataCode: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', subType: 'AIRPORT' },
  { iataCode: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands', subType: 'AIRPORT' },
  { iataCode: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', subType: 'AIRPORT' },
  { iataCode: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', subType: 'AIRPORT' },
  { iataCode: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain', subType: 'AIRPORT' },
  { iataCode: 'BCN', name: 'Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain', subType: 'AIRPORT' },
  { iataCode: 'FCO', name: 'Leonardo da Vinci International Airport', city: 'Rome', country: 'Italy', subType: 'AIRPORT' },
  { iataCode: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', subType: 'AIRPORT' },
  { iataCode: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', subType: 'AIRPORT' },
  { iataCode: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', subType: 'AIRPORT' },
  // Middle East
  { iataCode: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', subType: 'AIRPORT' },
  { iataCode: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia', subType: 'AIRPORT' },
  { iataCode: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', subType: 'AIRPORT' },
  { iataCode: 'AMM', name: 'Queen Alia International Airport', city: 'Amman', country: 'Jordan', subType: 'AIRPORT' },
  { iataCode: 'BEY', name: 'Rafic Hariri International Airport', city: 'Beirut', country: 'Lebanon', subType: 'AIRPORT' },
  // Africa
  { iataCode: 'ACC', name: 'Kotoka International Airport', city: 'Accra', country: 'Ghana', subType: 'AIRPORT' },
  { iataCode: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', subType: 'AIRPORT' },
  { iataCode: 'JNB', name: 'O.R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', subType: 'AIRPORT' },
  { iataCode: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', subType: 'AIRPORT' },
  { iataCode: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', subType: 'AIRPORT' },
  { iataCode: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco', subType: 'AIRPORT' },
  { iataCode: 'DKR', name: 'Blaise Diagne International Airport', city: 'Dakar', country: 'Senegal', subType: 'AIRPORT' },
  { iataCode: 'ABJ', name: 'Félix-Houphouët-Boigny International Airport', city: 'Abidjan', country: 'Côte d\'Ivoire', subType: 'AIRPORT' },
  { iataCode: 'DAR', name: 'Julius Nyerere International Airport', city: 'Dar es Salaam', country: 'Tanzania', subType: 'AIRPORT' },
  { iataCode: 'LUN', name: 'Kenneth Kaunda International Airport', city: 'Lusaka', country: 'Zambia', subType: 'AIRPORT' },
  // Asia
  { iataCode: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', subType: 'AIRPORT' },
  { iataCode: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', subType: 'AIRPORT' },
  { iataCode: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India', subType: 'AIRPORT' },
  { iataCode: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India', subType: 'AIRPORT' },
  { iataCode: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', subType: 'AIRPORT' },
  { iataCode: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', subType: 'AIRPORT' },
  { iataCode: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', subType: 'AIRPORT' },
  { iataCode: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', subType: 'AIRPORT' },
  { iataCode: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', subType: 'AIRPORT' },
  // Canada & Australia
  { iataCode: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', subType: 'AIRPORT' },
  { iataCode: 'YUL', name: 'Montréal-Trudeau International Airport', city: 'Montreal', country: 'Canada', subType: 'AIRPORT' },
  { iataCode: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', subType: 'AIRPORT' },
  { iataCode: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', subType: 'AIRPORT' },
];

export const searchLocalAirports = (keyword) => {
  const kw = keyword.toLowerCase().trim();
  if (!kw || kw.length < 2) return [];

  return AIRPORTS.filter(a =>
    a.iataCode.toLowerCase().includes(kw) ||
    a.city.toLowerCase().includes(kw) ||
    a.name.toLowerCase().includes(kw) ||
    a.country.toLowerCase().includes(kw)
  ).slice(0, 8);
};

export default AIRPORTS;