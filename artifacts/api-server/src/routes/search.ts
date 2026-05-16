import { Router } from "express";
import { SearchManagersQueryParams } from "@workspace/api-zod";

const router = Router();

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
// DEMO DATA
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
router.get("/search", (req, res) => {
  const parsed = SearchManagersQueryParams.safeParse({
    zip: req.query["zip"],
    radius: req.query["radius"] ? Number(req.query["radius"]) : undefined,
  });

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid ZIP code. Please enter a valid 5-digit ZIP." });
    return;
  }

  const { zip, radius = 10 } = parsed.data;

  const ranked = DEMO_MANAGERS.map((m) => ({ ...m, score: scoreManager(m) }))
    .sort((a, b) => b.score - a.score)
    .map((m, i) => ({ ...m, rank: i + 1 }));

  const FREE_COUNT = 2;
  const freeManagers = ranked.slice(FREE_COUNT).map((m) => ({ ...m, locked: false }));
  const lockedManagers = ranked.slice(0, FREE_COUNT).map((m) => ({ ...m, locked: true }));

  res.json({
    total: ranked.length,
    zip,
    radius,
    freeManagers: [...freeManagers, ...lockedManagers],
    lockedCount: lockedManagers.length,
    isDemo: true,
  });
});

router.get("/managers/:id", (req, res) => {
  const manager = DEMO_MANAGERS.find((m) => m.id === req.params["id"]);

  if (!manager) {
    res.status(404).json({ error: "Manager not found" });
    return;
  }

  const score = scoreManager(manager);
  const ranked = DEMO_MANAGERS.map((m) => ({ ...m, score: scoreManager(m) }))
    .sort((a, b) => b.score - a.score);
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
