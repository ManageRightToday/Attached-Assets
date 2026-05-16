import { Router } from "express";
import { SearchManagersQueryParams } from "@workspace/api-zod";

const router = Router();

const GOOGLE_API_KEY = process.env["GOOGLE_PLACES_API_KEY"] ?? "";

// ============================================================
// RANKING ALGORITHM WEIGHTS
// ============================================================
const WEIGHTS = {
  googleRating: 0.35,
  bbbScore: 0.3,
  feeTransparency: 0.2,
  experience: 0.15,
};

// ============================================================
// TYPES
// ============================================================
interface RawManager {
  id: string;
  name: string;
  address: string;
  city: string;
  googleRating: number;
  googleReviewCount: number;
  bbbComplaints: number;
  bbbRating: string;
  feePercent: number | null;
  feeTransparent: boolean;
  yearsInBusiness: number;
  specialties: string[];
  responseTime: string;
}

// ============================================================
// DEMO DATA — used when no API key is present
// ============================================================
const DEMO_MANAGERS: RawManager[] = [
  {
    id: "pm-001",
    name: "Pinnacle Property Group",
    address: "4820 N Central Ave",
    city: "Phoenix, AZ",
    googleRating: 4.8,
    googleReviewCount: 312,
    bbbComplaints: 0,
    bbbRating: "A+",
    feePercent: 8,
    feeTransparent: true,
    yearsInBusiness: 14,
    specialties: ["Single Family", "Multi-Family"],
    responseTime: "< 2 hours",
  },
  {
    id: "pm-002",
    name: "Southwest Premier Properties",
    address: "1450 S Rural Rd",
    city: "Tempe, AZ",
    googleRating: 4.9,
    googleReviewCount: 445,
    bbbComplaints: 0,
    bbbRating: "A+",
    feePercent: 8.5,
    feeTransparent: true,
    yearsInBusiness: 18,
    specialties: ["Single Family", "Multi-Family", "Commercial"],
    responseTime: "< 1 hour",
  },
  {
    id: "pm-003",
    name: "Desert Sun Realty Management",
    address: "7201 E Camelback Rd",
    city: "Scottsdale, AZ",
    googleRating: 4.6,
    googleReviewCount: 189,
    bbbComplaints: 1,
    bbbRating: "A",
    feePercent: 9,
    feeTransparent: true,
    yearsInBusiness: 9,
    specialties: ["Single Family", "Luxury"],
    responseTime: "< 4 hours",
  },
  {
    id: "pm-004",
    name: "Valley Wide Property Solutions",
    address: "2100 W Camelback Rd",
    city: "Phoenix, AZ",
    googleRating: 4.4,
    googleReviewCount: 98,
    bbbComplaints: 0,
    bbbRating: "A",
    feePercent: 9.5,
    feeTransparent: true,
    yearsInBusiness: 7,
    specialties: ["Single Family", "Multi-Family"],
    responseTime: "< 8 hours",
  },
  {
    id: "pm-005",
    name: "Metro Homes Management",
    address: "3310 W Indian School Rd",
    city: "Phoenix, AZ",
    googleRating: 4.1,
    googleReviewCount: 67,
    bbbComplaints: 3,
    bbbRating: "B+",
    feePercent: 10,
    feeTransparent: false,
    yearsInBusiness: 5,
    specialties: ["Multi-Family"],
    responseTime: "< 24 hours",
  },
  {
    id: "pm-006",
    name: "Sunbelt Realty Partners",
    address: "9200 E Shea Blvd",
    city: "Scottsdale, AZ",
    googleRating: 4.7,
    googleReviewCount: 223,
    bbbComplaints: 0,
    bbbRating: "A+",
    feePercent: 8,
    feeTransparent: true,
    yearsInBusiness: 12,
    specialties: ["Luxury", "Single Family"],
    responseTime: "< 3 hours",
  },
  {
    id: "pm-007",
    name: "Arizona Premier Management",
    address: "5100 N 19th Ave",
    city: "Phoenix, AZ",
    googleRating: 3.9,
    googleReviewCount: 41,
    bbbComplaints: 5,
    bbbRating: "B",
    feePercent: null,
    feeTransparent: false,
    yearsInBusiness: 3,
    specialties: ["Multi-Family"],
    responseTime: "< 48 hours",
  },
];

// ============================================================
// GOOGLE PLACES API
// ============================================================
interface GeoResult {
  lat: number;
  lng: number;
  city: string;
}

async function geocodeZip(zip: string): Promise<GeoResult | null> {
  // Use Places Text Search to resolve ZIP → lat/lng without Geocoding API
  const url =
    `https://maps.googleapis.com/maps/api/place/textsearch/json` +
    `?query=${encodeURIComponent(zip + " USA")}` +
    `&key=${GOOGLE_API_KEY}`;

  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results: Array<{
      geometry: { location: { lat: number; lng: number } };
      formatted_address: string;
      name: string;
    }>;
  };

  if (data.status !== "OK" || !data.results.length) return null;

  const result = data.results[0];
  const { lat, lng } = result.geometry.location;

  // Extract city, state from formatted address (e.g. "New York, NY 10001, USA")
  const parts = result.formatted_address.split(",").map((s) => s.trim());
  const city = parts.slice(0, 2).join(", ").replace(/\s+\d{5}.*$/, "").trim();

  return { lat, lng, city };
}

interface PlacesResult {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  business_status?: string;
}

async function searchPlaces(
  lat: number,
  lng: number,
  radiusMeters: number,
): Promise<PlacesResult[]> {
  const url =
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
    `?location=${lat},${lng}` +
    `&radius=${radiusMeters}` +
    `&keyword=property+management+company` +
    `&key=${GOOGLE_API_KEY}`;

  const res = await fetch(url);
  const data = (await res.json()) as { status: string; results: PlacesResult[] };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") return [];

  return (data.results ?? []).filter(
    (p) => !p.business_status || p.business_status === "OPERATIONAL",
  );
}

function placesToManagers(places: PlacesResult[], city: string): RawManager[] {
  return places.map((p, i) => ({
    id: p.place_id,
    name: p.name,
    address: p.vicinity,
    city,
    googleRating: p.rating ?? 3.0,
    googleReviewCount: p.user_ratings_total ?? 0,
    bbbComplaints: 0,
    bbbRating: "N/A",
    feePercent: null,
    feeTransparent: false,
    yearsInBusiness: 5,
    specialties: [],
    responseTime: "Unknown",
  }));
}

// ============================================================
// SCORING ENGINE
// ============================================================
function scoreManager(m: RawManager): number {
  const reviewBonus = Math.min(m.googleReviewCount / 500, 1) * 10;
  const googleScore = ((m.googleRating - 1) / 4) * 90 + reviewBonus;

  const bbbBase: Record<string, number> = {
    "A+": 100,
    A: 88,
    "B+": 74,
    B: 60,
    C: 40,
    "N/A": 55,
  };
  const bbbScore = Math.max(0, (bbbBase[m.bbbRating] ?? 50) - m.bbbComplaints * 15);

  const feeScore = m.feeTransparent
    ? 100 - Math.max(0, ((m.feePercent ?? 10) - 8) * 5)
    : 40;

  const expScore = Math.min((Math.log(m.yearsInBusiness + 1) / Math.log(21)) * 100, 100);

  const total =
    googleScore * WEIGHTS.googleRating +
    bbbScore * WEIGHTS.bbbScore +
    feeScore * WEIGHTS.feeTransparency +
    expScore * WEIGHTS.experience;

  return Math.round(total);
}

// ============================================================
// ROUTES
// ============================================================
router.get("/search", async (req, res) => {
  const parsed = SearchManagersQueryParams.safeParse({
    zip: req.query["zip"],
    radius: req.query["radius"] ? Number(req.query["radius"]) : undefined,
  });

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ZIP code. Please enter a valid 5-digit ZIP." });
    return;
  }

  const { zip, radius = 10 } = parsed.data;

  let rawManagers: RawManager[];
  let isDemo = false;

  if (GOOGLE_API_KEY) {
    try {
      const geo = await geocodeZip(zip);
      if (!geo) {
        res.status(400).json({ error: "Could not locate that ZIP code. Please check and try again." });
        return;
      }

      const radiusMeters = (radius ?? 10) * 1609;
      const places = await searchPlaces(geo.lat, geo.lng, radiusMeters);
      rawManagers = placesToManagers(places, geo.city);
    } catch (err) {
      req.log.error({ err }, "Google Places API error, falling back to demo data");
      rawManagers = DEMO_MANAGERS;
      isDemo = true;
    }
  } else {
    rawManagers = DEMO_MANAGERS;
    isDemo = true;
  }

  if (!rawManagers.length) {
    res.json({
      total: 0,
      zip,
      radius,
      freeManagers: [],
      lockedCount: 0,
      isDemo,
    });
    return;
  }

  const ranked = rawManagers
    .map((m) => ({ ...m, score: scoreManager(m) }))
    .sort((a, b) => b.score - a.score)
    .map((m, i) => ({ ...m, rank: i + 1 }));

  const FREE_COUNT = 2;
  const freeManagers = ranked.slice(FREE_COUNT).map((m) => ({ ...m, locked: false }));
  const lockedManagers = ranked.slice(0, FREE_COUNT).map((m) => ({ ...m, locked: true }));

  res.json({
    total: ranked.length,
    zip,
    radius,
    freeManagers: [...lockedManagers, ...freeManagers],
    lockedCount: lockedManagers.length,
    isDemo,
  });
});

router.get("/managers/:id", (req, res) => {
  const manager = DEMO_MANAGERS.find((m) => m.id === req.params["id"]);

  if (!manager) {
    res.status(404).json({ error: "Manager not found" });
    return;
  }

  const score = scoreManager(manager);
  const ranked = DEMO_MANAGERS.map((m) => ({ ...m, score: scoreManager(m) })).sort(
    (a, b) => b.score - a.score,
  );
  const rank = ranked.findIndex((m) => m.id === manager.id) + 1;

  res.json({ ...manager, score, rank, locked: false });
});

router.get("/stats", (_req, res) => {
  const scores = DEMO_MANAGERS.map(scoreManager);
  const avgTrustScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const managersWithAPlus = DEMO_MANAGERS.filter((m) => m.bbbRating === "A+").length;

  res.json({
    totalManagers: 2847,
    citiesCovered: 312,
    avgTrustScore,
    managersWithAPlus: Math.round((managersWithAPlus / DEMO_MANAGERS.length) * 2847),
  });
});

export default router;
