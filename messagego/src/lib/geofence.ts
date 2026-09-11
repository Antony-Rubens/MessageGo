import { calculateDistance } from "./distance";

export function isWithinRadius(
  currentLat: number,
  currentLng: number,
  targetLat: number,
  targetLng: number,
  radiusKm: number
) {
  return (
    calculateDistance(
      currentLat,
      currentLng,
      targetLat,
      targetLng
    ) <= radiusKm
  );
}