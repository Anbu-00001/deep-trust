/**
 * Content Provenance Analyzer
 * Generates perceptual hashes and matches against an internal provenance index.
 */

export interface PerceptualHashSignature {
  pHash: string;
  dHash: string;
  averageHash: string;
  colorHistogramSignature: number[];
  frameHashes?: string[];
}

export interface ProvenanceMatch {
  sourceMatch: string;
  similarityScore: number;
  matchType: "exact" | "video_frame" | "near_duplicate" | "no_match";
  sourceLabel: string;
  timestamp: string;
}

export interface ProvenanceResult {
  hashSignature: PerceptualHashSignature;
  matches: ProvenanceMatch[];
  bestMatch: ProvenanceMatch | null;
  status: "complete" | "pending" | "no_match";
}

interface ProvenanceIndexEntry {
  id: string;
  pHash: string;
  sourceLabel: string;
  matchType: "video_frame" | "exact" | "near_duplicate";
  timestamp: string;
}

// Lightweight internal reference index (simulated known sources)
const PROVENANCE_INDEX: ProvenanceIndexEntry[] = [
  { id: "yt_2024_001", pHash: "a3c1f8e2b7d04961", sourceLabel: "YouTube video (2024)", matchType: "video_frame", timestamp: "2024-03-15T08:22:00Z" },
  { id: "stock_001", pHash: "f1e2d3c4b5a69788", sourceLabel: "Stock photo library", matchType: "exact", timestamp: "2023-11-20T14:10:00Z" },
  { id: "social_001", pHash: "1a2b3c4d5e6f7081", sourceLabel: "Social media post (2025)", matchType: "near_duplicate", timestamp: "2025-01-08T19:45:00Z" },
  { id: "news_001", pHash: "e7d6c5b4a3928170", sourceLabel: "News broadcast frame", matchType: "video_frame", timestamp: "2024-07-22T06:30:00Z" },
  { id: "dataset_001", pHash: "0f1e2d3c4b5a6978", sourceLabel: "Research dataset sample", matchType: "exact", timestamp: "2023-06-01T00:00:00Z" },
];

/**
 * Generate a simple perceptual hash from a numeric seed.
 * In production this would use actual image pixel data.
 */
function generateSimpleHash(seed: number): string {
  let hash = seed;
  const chars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < 16; i++) {
    hash = ((hash * 1103515245 + 12345) & 0x7fffffff) >>> 0;
    result += chars[hash % 16];
  }
  return result;
}

/**
 * Compute Hamming distance between two hex hash strings.
 */
function hammingDistance(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let distance = 0;
  for (let i = 0; i < len; i++) {
    const va = parseInt(a[i], 16);
    const vb = parseInt(b[i], 16);
    let xor = va ^ vb;
    while (xor) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

/**
 * Compute similarity from Hamming distance.
 */
function hashSimilarity(a: string, b: string): number {
  const maxBits = Math.min(a.length, b.length) * 4;
  if (maxBits === 0) return 0;
  return 1 - hammingDistance(a, b) / maxBits;
}

/**
 * Run provenance analysis against an analysis result.
 * Consumes existing trust score and modality data as seed for hash generation.
 */
export function analyzeProvenance(
  trustScore: number,
  mediaType: "image" | "video" | "audio",
  frameCount: number
): ProvenanceResult {
  // Generate perceptual hashes using trust score as seed (deterministic per analysis)
  const seed = Math.round(trustScore * 1000) + frameCount;
  const pHash = generateSimpleHash(seed);
  const dHash = generateSimpleHash(seed + 7);
  const averageHash = generateSimpleHash(seed + 13);

  // Generate color histogram signature
  const colorHistogramSignature: number[] = [];
  for (let i = 0; i < 8; i++) {
    colorHistogramSignature.push(((seed * (i + 1) * 31) % 256) / 255);
  }

  // Frame hashes for video
  const frameHashes: string[] = [];
  if (mediaType === "video") {
    for (let i = 0; i < Math.min(frameCount, 8); i++) {
      frameHashes.push(generateSimpleHash(seed + i * 17));
    }
  }

  const hashSignature: PerceptualHashSignature = {
    pHash,
    dHash,
    averageHash,
    colorHistogramSignature,
    frameHashes: frameHashes.length > 0 ? frameHashes : undefined,
  };

  // Match against provenance index
  const matches: ProvenanceMatch[] = PROVENANCE_INDEX.map((entry) => {
    const similarity = hashSimilarity(pHash, entry.pHash);
    return {
      sourceMatch: entry.id,
      similarityScore: Math.round(similarity * 100) / 100,
      matchType: similarity >= 0.9 ? "exact" : similarity >= 0.75 ? entry.matchType : "no_match",
      sourceLabel: entry.sourceLabel,
      timestamp: entry.timestamp,
    };
  })
    .filter((m) => m.similarityScore >= 0.3)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 3);

  const bestMatch = matches.length > 0 && matches[0].similarityScore >= 0.75 ? matches[0] : null;

  return {
    hashSignature,
    matches,
    bestMatch,
    status: "complete",
  };
}
