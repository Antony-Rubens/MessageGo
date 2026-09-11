export const CARRIER_SPEEDS = {
  human: 20,
  pigeon: 60,
} as const;

export function calculateEtaMinutes(
  distanceKm: number,
  carrier: "human" | "pigeon"
) {
  return (
    (distanceKm / CARRIER_SPEEDS[carrier]) * 60
  );
}