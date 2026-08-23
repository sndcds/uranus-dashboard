import { describe, expect, it } from 'vitest'
import { extractGeoJsonCoordinates } from '@/util/geojson'

describe('extractGeoJsonCoordinates', () => {
  it('supports nested point coordinates from the venue GeoJSON API', () => {
    const feature = {
      type: 'Feature',
      point: {
        type: 'Point',
        coordinates: [9.440526048, 54.804370531],
      },
      properties: {
        uuid: '019e54bf-03c2-79da-9c33-c42282479bac',
        name: 'Piratennest',
      },
    }

    expect(extractGeoJsonCoordinates(feature)).toEqual([9.440526048, 54.804370531])
  })
})
