import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Candidate, CandidatePair } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function getCandidatePairs(candidates: Candidate[]): CandidatePair[] {
  return Array.from(
    new Set(
      candidates.reduce((pairs: CandidatePair[], candidate: Candidate) => {
        // Cari kandidat dengan sequence yang sama
        const matchingCandidate = candidates.find(
          (otherCandidate) =>
            otherCandidate.sequence === candidate.sequence &&
            otherCandidate.id !== candidate.id
        );

        if (matchingCandidate) {
          // Tentukan apakah pasangan chairman dan vice chairman lengkap
          const isPairComplete =
            (candidate.position?.toLowerCase().includes("chairman") &&
              matchingCandidate.position?.toLowerCase().includes("vice")) ||
            (candidate.position?.toLowerCase().includes("vice") &&
              matchingCandidate.position?.toLowerCase().includes("chairman"));

          if (isPairComplete) {
            const chairman = candidate.position
              ?.toLowerCase()
              .includes("chairman")
              ? candidate
              : matchingCandidate;

            const viceChairman = candidate.position
              ?.toLowerCase()
              .includes("vice")
              ? candidate
              : matchingCandidate;

            // Cek apakah pasangan sudah ada sebelumnya
            const existingPairIndex = pairs.findIndex(
              (pair) =>
                pair.chairman.id === chairman.id &&
                pair.viceChairman.id === viceChairman.id
            );

            if (existingPairIndex === -1) {
              pairs.push({
                chairman,
                viceChairman,
              });
            }
          }
        }

        return pairs;
      }, [] as CandidatePair[])
    )
  );
}
