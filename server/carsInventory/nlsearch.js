/**
 * nlsearch.js — Rule-based NLP extractor for natural language car search.
 *
 * Parses queries like:
 *   "red SUV under $30,000 with low mileage"
 *   "blue Toyota sedan 2020 or newer"
 *   "electric car under 50k"
 *
 * Returns structured filters compatible with the Cars MongoDB model.
 */

const COLOR_MAP = {
  red: 'red', blue: 'blue', white: 'white', black: 'black',
  silver: 'silver', gray: 'grey', grey: 'grey', green: 'green',
  yellow: 'yellow', orange: 'orange', brown: 'brown', gold: 'gold',
  purple: 'purple', beige: 'beige',
};

const BODY_TYPE_MAP = {
  suv: 'SUV', sedan: 'Sedan', hatchback: 'Hatchback', truck: 'Truck',
  pickup: 'Truck', minivan: 'Minivan', van: 'Van', convertible: 'Convertible',
  coupe: 'Coupe', wagon: 'Wagon', crossover: 'Crossover',
};

const MAKE_MAP = {
  toyota: 'Toyota', honda: 'Honda', ford: 'Ford', chevy: 'Chevrolet',
  chevrolet: 'Chevrolet', bmw: 'BMW', tesla: 'Tesla', hyundai: 'Hyundai',
  kia: 'Kia', jeep: 'Jeep', nissan: 'Nissan', dodge: 'Dodge',
  ram: 'RAM', gmc: 'GMC', audi: 'Audi', mercedes: 'Mercedes-Benz',
  volvo: 'Volvo', subaru: 'Subaru', mazda: 'Mazda', lexus: 'Lexus',
  acura: 'Acura', infiniti: 'Infiniti', cadillac: 'Cadillac',
  buick: 'Buick', lincoln: 'Lincoln', mitsubishi: 'Mitsubishi',
};

const MILEAGE_KEYWORDS = {
  'low mileage': 50000,
  'low-mileage': 50000,
  'under 50k miles': 50000,
  'under 50,000 miles': 50000,
  'high mileage': 150000,
};

/**
 * Parse a natural language query into structured filter parameters.
 * @param {string} query - Natural language search string
 * @returns {Object} Extracted filters
 */
function parseNLQuery(query) {
  const q = query.toLowerCase().trim();
  const filters = {};

  // ── Color ────────────────────────────────────────────
  for (const [keyword, color] of Object.entries(COLOR_MAP)) {
    if (new RegExp(`\\b${keyword}\\b`).test(q)) {
      filters.color = color;
      break;
    }
  }

  // ── Body type ─────────────────────────────────────────
  for (const [keyword, bodyType] of Object.entries(BODY_TYPE_MAP)) {
    if (new RegExp(`\\b${keyword}\\b`).test(q)) {
      filters.bodyType = bodyType;
      break;
    }
  }

  // ── Make ──────────────────────────────────────────────
  for (const [keyword, make] of Object.entries(MAKE_MAP)) {
    if (new RegExp(`\\b${keyword}\\b`).test(q)) {
      filters.make = make;
      break;
    }
  }

  // ── Max price — "under $30,000" / "under 30k" / "less than 25000" ──
  const pricePatterns = [
    /under\s+\$?([\d,]+)k?\b/i,
    /less\s+than\s+\$?([\d,]+)k?\b/i,
    /below\s+\$?([\d,]+)k?\b/i,
    /max\s+\$?([\d,]+)k?\b/i,
    /budget\s+(?:of\s+)?\$?([\d,]+)k?\b/i,
    /\$?([\d,]+)k?\s+(?:or\s+less|max|maximum)/i,
  ];
  for (const pat of pricePatterns) {
    const match = q.match(pat);
    if (match) {
      let val = parseInt(match[1].replace(/,/g, ''), 10);
      if (/k\b/i.test(match[0])) val *= 1000;
      filters.maxPrice = val;
      break;
    }
  }

  // ── Max mileage — "low mileage" / "under 50k miles" / "50,000 miles" ──
  for (const [phrase, miles] of Object.entries(MILEAGE_KEYWORDS)) {
    if (q.includes(phrase)) {
      filters.maxMileage = miles;
      break;
    }
  }
  if (!filters.maxMileage) {
    const mileageMatch = q.match(/under\s+([\d,]+)\s*(?:k\s*)?miles/i);
    if (mileageMatch) {
      let val = parseInt(mileageMatch[1].replace(/,/g, ''), 10);
      if (/k\s*miles/i.test(mileageMatch[0])) val *= 1000;
      filters.maxMileage = val;
    }
  }

  // ── Year range — "2019 or newer" / "2018 and up" / "2020-2023" ──
  const newerMatch = q.match(/(\d{4})\s+(?:or\s+newer|and\s+up|or\s+above)/i);
  if (newerMatch) filters.minYear = parseInt(newerMatch[1], 10);

  const olderMatch = q.match(/(\d{4})\s+or\s+older/i);
  if (olderMatch) filters.maxYear = parseInt(olderMatch[1], 10);

  const rangeMatch = q.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) {
    filters.minYear = parseInt(rangeMatch[1], 10);
    filters.maxYear = parseInt(rangeMatch[2], 10);
  }

  // ── Fuel type ─────────────────────────────────────────
  if (/\belectric\b|\bev\b|\bbev\b/.test(q)) filters.fuelType = 'Electric';
  else if (/\bhybrid\b|\bphev\b/.test(q)) filters.fuelType = 'Hybrid';
  else if (/\bdiesel\b/.test(q)) filters.fuelType = 'Diesel';
  else if (/\bgas\b|\bgasoline\b|\bpetrol\b/.test(q)) filters.fuelType = 'Gasoline';

  return filters;
}

/**
 * Apply extracted NLP filters to a MongoDB Cars query.
 * @param {Object} filters - From parseNLQuery()
 * @param {mongoose.Model} Cars - Mongoose model
 * @returns {Promise<Array>} Matching cars
 */
async function executeNLSearch(filters, Cars, dealerId) {
  const query = {};

  if (dealerId) query.dealer_id = String(dealerId);
  if (filters.make)     query.make = new RegExp(filters.make, 'i');
  if (filters.bodyType) query.bodyType = new RegExp(filters.bodyType, 'i');
  if (filters.color)    query.color = new RegExp(filters.color, 'i');
  if (filters.fuelType) query.fuelType = new RegExp(filters.fuelType, 'i');
  if (filters.maxPrice)   query.price = { ...query.price, $lte: filters.maxPrice };
  if (filters.maxMileage) query.mileage = { ...query.mileage, $lte: filters.maxMileage };
  if (filters.minYear || filters.maxYear) {
    query.year = {};
    if (filters.minYear) query.year.$gte = filters.minYear;
    if (filters.maxYear) query.year.$lte = filters.maxYear;
  }

  return Cars.find(query).limit(50).lean();
}

module.exports = { parseNLQuery, executeNLSearch };
