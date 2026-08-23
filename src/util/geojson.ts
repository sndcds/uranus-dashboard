export function extractGeoJsonCoordinates(raw: unknown): [number, number] | null {
  if (!raw || typeof raw !== 'object') return null

  const candidate = raw as Record<string, any>
  const coordinates = candidate.geometry?.coordinates
    ?? candidate.point?.coordinates
    ?? candidate.coordinates
    ?? candidate.geometry?.point?.coordinates

  if (!Array.isArray(coordinates) || coordinates.length < 2) return null

  const lng = Number(coordinates[0])
  const lat = Number(coordinates[1])

  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null

  return [lng, lat]
}
