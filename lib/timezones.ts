export interface TZOption {
  city: string;
  country: string;
  tz: string;
  region: string;
}

export const TIMEZONES: TZOption[] = [

  // ── USA · COSTA OESTE ──────────────────────────────────────
  { city: "Los Ángeles",    country: "California",     tz: "America/Los_Angeles", region: "USA · Costa Oeste" },
  { city: "San Francisco",  country: "California",     tz: "America/Los_Angeles", region: "USA · Costa Oeste" },
  { city: "San Diego",      country: "California",     tz: "America/Los_Angeles", region: "USA · Costa Oeste" },
  { city: "Sacramento",     country: "California",     tz: "America/Los_Angeles", region: "USA · Costa Oeste" },
  { city: "Seattle",        country: "Washington",     tz: "America/Los_Angeles", region: "USA · Costa Oeste" },
  { city: "Portland",       country: "Oregon",         tz: "America/Los_Angeles", region: "USA · Costa Oeste" },
  { city: "Las Vegas",      country: "Nevada",         tz: "America/Los_Angeles", region: "USA · Costa Oeste" },

  // ── USA · MONTAÑA ──────────────────────────────────────────
  { city: "Phoenix",        country: "Arizona",        tz: "America/Phoenix",     region: "USA · Montaña" },
  { city: "Tucson",         country: "Arizona",        tz: "America/Phoenix",     region: "USA · Montaña" },
  { city: "Denver",         country: "Colorado",       tz: "America/Denver",      region: "USA · Montaña" },
  { city: "Salt Lake City", country: "Utah",           tz: "America/Denver",      region: "USA · Montaña" },
  { city: "Albuquerque",    country: "Nuevo México",   tz: "America/Denver",      region: "USA · Montaña" },
  { city: "Boise",          country: "Idaho",          tz: "America/Boise",       region: "USA · Montaña" },
  { city: "Billings",       country: "Montana",        tz: "America/Denver",      region: "USA · Montaña" },

  // ── USA · CENTRO ───────────────────────────────────────────
  { city: "Chicago",        country: "Illinois",       tz: "America/Chicago",     region: "USA · Centro" },
  { city: "Houston",        country: "Texas",          tz: "America/Chicago",     region: "USA · Centro" },
  { city: "Dallas",         country: "Texas",          tz: "America/Chicago",     region: "USA · Centro" },
  { city: "San Antonio",    country: "Texas",          tz: "America/Chicago",     region: "USA · Centro" },
  { city: "Austin",         country: "Texas",          tz: "America/Chicago",     region: "USA · Centro" },
  { city: "El Paso",        country: "Texas",          tz: "America/Chicago",     region: "USA · Centro" },
  { city: "Minneapolis",    country: "Minnesota",      tz: "America/Chicago",     region: "USA · Centro" },
  { city: "Kansas City",    country: "Missouri",       tz: "America/Chicago",     region: "USA · Centro" },
  { city: "St. Louis",      country: "Missouri",       tz: "America/Chicago",     region: "USA · Centro" },
  { city: "New Orleans",    country: "Louisiana",      tz: "America/Chicago",     region: "USA · Centro" },
  { city: "Oklahoma City",  country: "Oklahoma",       tz: "America/Chicago",     region: "USA · Centro" },
  { city: "Memphis",        country: "Tennessee",      tz: "America/Chicago",     region: "USA · Centro" },
  { city: "Milwaukee",      country: "Wisconsin",      tz: "America/Chicago",     region: "USA · Centro" },
  { city: "Omaha",          country: "Nebraska",       tz: "America/Chicago",     region: "USA · Centro" },

  // ── USA · ESTE ─────────────────────────────────────────────
  { city: "Nueva York",     country: "Nueva York",     tz: "America/New_York",    region: "USA · Este" },
  { city: "Miami",          country: "Florida",        tz: "America/New_York",    region: "USA · Este" },
  { city: "Orlando",        country: "Florida",        tz: "America/New_York",    region: "USA · Este" },
  { city: "Tampa",          country: "Florida",        tz: "America/New_York",    region: "USA · Este" },
  { city: "Jacksonville",   country: "Florida",        tz: "America/New_York",    region: "USA · Este" },
  { city: "Washington D.C.", country: "D.C.",          tz: "America/New_York",    region: "USA · Este" },
  { city: "Atlanta",        country: "Georgia",        tz: "America/New_York",    region: "USA · Este" },
  { city: "Boston",         country: "Massachusetts",  tz: "America/New_York",    region: "USA · Este" },
  { city: "Philadelphia",   country: "Pennsylvania",   tz: "America/New_York",    region: "USA · Este" },
  { city: "Charlotte",      country: "Carolina del N.", tz: "America/New_York",   region: "USA · Este" },
  { city: "Raleigh",        country: "Carolina del N.", tz: "America/New_York",   region: "USA · Este" },
  { city: "Baltimore",      country: "Maryland",       tz: "America/New_York",    region: "USA · Este" },
  { city: "Detroit",        country: "Michigan",       tz: "America/Detroit",     region: "USA · Este" },
  { city: "Columbus",       country: "Ohio",           tz: "America/New_York",    region: "USA · Este" },
  { city: "Cleveland",      country: "Ohio",           tz: "America/New_York",    region: "USA · Este" },
  { city: "Pittsburgh",     country: "Pennsylvania",   tz: "America/New_York",    region: "USA · Este" },
  { city: "Indianapolis",   country: "Indiana",        tz: "America/Indiana/Indianapolis", region: "USA · Este" },
  { city: "Nashville",      country: "Tennessee",      tz: "America/Chicago",     region: "USA · Este" },
  { city: "Louisville",     country: "Kentucky",       tz: "America/Kentucky/Louisville", region: "USA · Este" },
  { city: "Richmond",       country: "Virginia",       tz: "America/New_York",    region: "USA · Este" },
  { city: "Hartford",       country: "Connecticut",    tz: "America/New_York",    region: "USA · Este" },

  // ── USA · ALASKA & HAWÁI ───────────────────────────────────
  { city: "Anchorage",      country: "Alaska",         tz: "America/Anchorage",   region: "USA · Alaska & Hawái" },
  { city: "Fairbanks",      country: "Alaska",         tz: "America/Anchorage",   region: "USA · Alaska & Hawái" },
  { city: "Honolulu",       country: "Hawái",          tz: "Pacific/Honolulu",    region: "USA · Alaska & Hawái" },

  // ── MÉXICO ─────────────────────────────────────────────────
  { city: "Ciudad de México", country: "México",       tz: "America/Mexico_City", region: "México" },
  { city: "Guadalajara",    country: "Jalisco",        tz: "America/Mexico_City", region: "México" },
  { city: "Monterrey",      country: "Nuevo León",     tz: "America/Monterrey",   region: "México" },
  { city: "Puebla",         country: "Puebla",         tz: "America/Mexico_City", region: "México" },
  { city: "Tijuana",        country: "Baja California", tz: "America/Tijuana",    region: "México" },
  { city: "León",           country: "Guanajuato",     tz: "America/Mexico_City", region: "México" },
  { city: "Cancún",         country: "Quintana Roo",   tz: "America/Cancun",      region: "México" },
  { city: "Mérida",         country: "Yucatán",        tz: "America/Merida",      region: "México" },
  { city: "Juárez",         country: "Chihuahua",      tz: "America/Ojinaga",     region: "México" },
  { city: "Chihuahua",      country: "Chihuahua",      tz: "America/Chihuahua",   region: "México" },
  { city: "Hermosillo",     country: "Sonora",         tz: "America/Hermosillo",  region: "México" },
  { city: "San Luis Potosí", country: "SLP",           tz: "America/Mexico_City", region: "México" },
  { city: "Querétaro",      country: "Querétaro",      tz: "America/Mexico_City", region: "México" },
  { city: "Acapulco",       country: "Guerrero",       tz: "America/Mexico_City", region: "México" },
  { city: "Mazatlán",       country: "Sinaloa",        tz: "America/Mazatlan",    region: "México" },
  { city: "Oaxaca",         country: "Oaxaca",         tz: "America/Mexico_City", region: "México" },
  { city: "Veracruz",       country: "Veracruz",       tz: "America/Mexico_City", region: "México" },
  { city: "Los Cabos",      country: "BCS",            tz: "America/Mazatlan",    region: "México" },
  { city: "La Paz",         country: "BCS",            tz: "America/Mazatlan",    region: "México" },
  { city: "Ensenada",       country: "Baja California", tz: "America/Tijuana",   region: "México" },

  // ── CENTROAMÉRICA ──────────────────────────────────────────
  { city: "Ciudad de Guatemala", country: "Guatemala", tz: "America/Guatemala",   region: "Centroamérica" },
  { city: "San Salvador",   country: "El Salvador",    tz: "America/El_Salvador", region: "Centroamérica" },
  { city: "Tegucigalpa",    country: "Honduras",       tz: "America/Tegucigalpa", region: "Centroamérica" },
  { city: "Managua",        country: "Nicaragua",      tz: "America/Managua",     region: "Centroamérica" },
  { city: "San José",       country: "Costa Rica",     tz: "America/Costa_Rica",  region: "Centroamérica" },
  { city: "Ciudad de Panamá", country: "Panamá",       tz: "America/Panama",      region: "Centroamérica" },
  { city: "Belmopán",       country: "Belice",         tz: "America/Belize",      region: "Centroamérica" },

  // ── CARIBE ─────────────────────────────────────────────────
  { city: "La Habana",      country: "Cuba",           tz: "America/Havana",      region: "Caribe" },
  { city: "Santo Domingo",  country: "Rep. Dominicana", tz: "America/Santo_Domingo", region: "Caribe" },
  { city: "San Juan",       country: "Puerto Rico",    tz: "America/Puerto_Rico", region: "Caribe" },
  { city: "Puerto Príncipe", country: "Haití",         tz: "America/Port-au-Prince", region: "Caribe" },
  { city: "Kingston",       country: "Jamaica",        tz: "America/Jamaica",     region: "Caribe" },
  { city: "Nassau",         country: "Bahamas",        tz: "America/Nassau",      region: "Caribe" },
  { city: "Bridgetown",     country: "Barbados",       tz: "America/Barbados",    region: "Caribe" },
  { city: "Puerto España",  country: "Trinidad y Tobago", tz: "America/Port_of_Spain", region: "Caribe" },
  { city: "Willemstad",     country: "Curazao",        tz: "America/Curacao",     region: "Caribe" },
  { city: "Cancún",         country: "Quintana Roo",   tz: "America/Cancun",      region: "Caribe" },

  // ── SUDAMÉRICA NORTE ───────────────────────────────────────
  { city: "Bogotá",         country: "Colombia",       tz: "America/Bogota",      region: "Sudamérica · Norte" },
  { city: "Medellín",       country: "Colombia",       tz: "America/Bogota",      region: "Sudamérica · Norte" },
  { city: "Cali",           country: "Colombia",       tz: "America/Bogota",      region: "Sudamérica · Norte" },
  { city: "Barranquilla",   country: "Colombia",       tz: "America/Bogota",      region: "Sudamérica · Norte" },
  { city: "Caracas",        country: "Venezuela",      tz: "America/Caracas",     region: "Sudamérica · Norte" },
  { city: "Maracaibo",      country: "Venezuela",      tz: "America/Caracas",     region: "Sudamérica · Norte" },
  { city: "Quito",          country: "Ecuador",        tz: "America/Guayaquil",   region: "Sudamérica · Norte" },
  { city: "Guayaquil",      country: "Ecuador",        tz: "America/Guayaquil",   region: "Sudamérica · Norte" },
  { city: "Georgetown",     country: "Guyana",         tz: "America/Guyana",      region: "Sudamérica · Norte" },
  { city: "Paramaribo",     country: "Surinam",        tz: "America/Paramaribo",  region: "Sudamérica · Norte" },
  { city: "Cayena",         country: "Guayana Francesa", tz: "America/Cayenne",  region: "Sudamérica · Norte" },

  // ── SUDAMÉRICA CENTRO ──────────────────────────────────────
  { city: "Lima",           country: "Perú",           tz: "America/Lima",        region: "Sudamérica · Centro" },
  { city: "Cusco",          country: "Perú",           tz: "America/Lima",        region: "Sudamérica · Centro" },
  { city: "La Paz",         country: "Bolivia",        tz: "America/La_Paz",      region: "Sudamérica · Centro" },
  { city: "Sucre",          country: "Bolivia",        tz: "America/La_Paz",      region: "Sudamérica · Centro" },
  { city: "Asunción",       country: "Paraguay",       tz: "America/Asuncion",    region: "Sudamérica · Centro" },

  // ── SUDAMÉRICA SUR ─────────────────────────────────────────
  { city: "Santiago",       country: "Chile",          tz: "America/Santiago",    region: "Sudamérica · Sur" },
  { city: "Valparaíso",     country: "Chile",          tz: "America/Santiago",    region: "Sudamérica · Sur" },
  { city: "Buenos Aires",   country: "Argentina",      tz: "America/Argentina/Buenos_Aires", region: "Sudamérica · Sur" },
  { city: "Córdoba",        country: "Argentina",      tz: "America/Argentina/Cordoba", region: "Sudamérica · Sur" },
  { city: "Rosario",        country: "Argentina",      tz: "America/Argentina/Buenos_Aires", region: "Sudamérica · Sur" },
  { city: "Mendoza",        country: "Argentina",      tz: "America/Argentina/Mendoza", region: "Sudamérica · Sur" },
  { city: "Montevideo",     country: "Uruguay",        tz: "America/Montevideo",  region: "Sudamérica · Sur" },

  // ── BRASIL ─────────────────────────────────────────────────
  { city: "São Paulo",      country: "Brasil",         tz: "America/Sao_Paulo",   region: "Brasil" },
  { city: "Río de Janeiro", country: "Brasil",         tz: "America/Sao_Paulo",   region: "Brasil" },
  { city: "Brasilia",       country: "Brasil",         tz: "America/Sao_Paulo",   region: "Brasil" },
  { city: "Salvador",       country: "Brasil",         tz: "America/Bahia",       region: "Brasil" },
  { city: "Fortaleza",      country: "Brasil",         tz: "America/Fortaleza",   region: "Brasil" },
  { city: "Recife",         country: "Brasil",         tz: "America/Recife",      region: "Brasil" },
  { city: "Manaos",         country: "Brasil",         tz: "America/Manaus",      region: "Brasil" },
  { city: "Belém",          country: "Brasil",         tz: "America/Belem",       region: "Brasil" },
  { city: "Porto Alegre",   country: "Brasil",         tz: "America/Sao_Paulo",   region: "Brasil" },
  { city: "Curitiba",       country: "Brasil",         tz: "America/Sao_Paulo",   region: "Brasil" },

  // ── EUROPA ─────────────────────────────────────────────────
  { city: "Londres",        country: "Reino Unido",    tz: "Europe/London",       region: "Europa" },
  { city: "Madrid",         country: "España",         tz: "Europe/Madrid",       region: "Europa" },
  { city: "Barcelona",      country: "España",         tz: "Europe/Madrid",       region: "Europa" },
  { city: "Lisboa",         country: "Portugal",       tz: "Europe/Lisbon",       region: "Europa" },
  { city: "París",          country: "Francia",        tz: "Europe/Paris",        region: "Europa" },
  { city: "Berlín",         country: "Alemania",       tz: "Europe/Berlin",       region: "Europa" },
  { city: "Ámsterdam",      country: "Países Bajos",   tz: "Europe/Amsterdam",    region: "Europa" },
  { city: "Roma",           country: "Italia",         tz: "Europe/Rome",         region: "Europa" },
  { city: "Zúrich",         country: "Suiza",          tz: "Europe/Zurich",       region: "Europa" },
  { city: "Moscú",          country: "Rusia",          tz: "Europe/Moscow",       region: "Europa" },

  // ── ASIA & RESTO ───────────────────────────────────────────
  { city: "Dubái",          country: "EAU",            tz: "Asia/Dubai",          region: "Asia & Resto" },
  { city: "Tokio",          country: "Japón",          tz: "Asia/Tokyo",          region: "Asia & Resto" },
  { city: "Singapur",       country: "Singapur",       tz: "Asia/Singapore",      region: "Asia & Resto" },
  { city: "Sídney",         country: "Australia",      tz: "Australia/Sydney",    region: "Asia & Resto" },
];

export function getRegions(): string[] {
  return [...new Set(TIMEZONES.map((t) => t.region))];
}

export function getCurrentTimeInTZ(tz: string): string {
  try {
    return new Date().toLocaleTimeString("es-MX", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "--:--";
  }
}
