import { calculateDistance } from "./distance";

export function getPigeonPosition(
  originLat: number,
  originLng: number,
  destinationLat: number,
  destinationLng: number,
  progress: number
) {
  const clamped = Math.max(
    0,
    Math.min(1, progress)
  );

  return {
    lat:
      originLat +
      (destinationLat - originLat) *
        clamped,

    lng:
      originLng +
      (destinationLng - originLng) *
        clamped,
  };
}

export function getPigeonProgress(
  originLat: number,
  originLng: number,
  destinationLat: number,
  destinationLng: number,
  elapsedSeconds: number,
  speedKmH = 60
) {
  const distance = calculateDistance(
    originLat,
    originLng,
    destinationLat,
    destinationLng
  );

  if (distance <= 0) return 1;

  const totalSeconds =
    (distance / speedKmH) * 3600;

  return Math.min(
    1,
    elapsedSeconds / totalSeconds
  );
}