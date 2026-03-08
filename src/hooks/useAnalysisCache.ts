import { useRef, useCallback } from "react";
import type { AnalysisResult } from "@/hooks/useMediaAnalysis";

interface CacheEntry {
  result: AnalysisResult;
  timestamp: number;
  fileHash: string;
}

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Generates a SHA-256 hex hash for a File's contents.
 */
async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const useAnalysisCache = () => {
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());

  const getFileHash = useCallback(async (file: File): Promise<string> => {
    return hashFile(file);
  }, []);

  const getCached = useCallback(
    (fileHash: string): AnalysisResult | null => {
      const entry = cacheRef.current.get(fileHash);
      if (!entry) return null;
      if (Date.now() - entry.timestamp > CACHE_TTL) {
        cacheRef.current.delete(fileHash);
        return null;
      }
      return entry.result;
    },
    []
  );

  const setCached = useCallback(
    (fileHash: string, result: AnalysisResult) => {
      cacheRef.current.set(fileHash, {
        result,
        timestamp: Date.now(),
        fileHash,
      });
    },
    []
  );

  return { getFileHash, getCached, setCached };
};
