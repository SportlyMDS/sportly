interface NominatimResponse {
  display_name: string
  lat: string
  lon: string
  address?: Record<string, string>
}

export default defineEventHandler(async (event): Promise<NominatimResponse> => {
  const query = getQuery(event)
  const { lat, lon } = query

  if (!lat || !lon) {
    throw createError({
      statusCode: 400,
      message: 'lat and lon parameters are required'
    })
  }

  try {
    const response = await $fetch<NominatimResponse>('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon,
        format: 'json'
      },
      headers: {
        'User-Agent': 'Sportly/1.0 (contact@sportly.fr)'
      }
    })

    return response
  } catch (error: unknown) {
    console.error('Reverse geocoding error:', error)
    const statusCode = error instanceof Error && 'statusCode' in error ? (error as { statusCode: number }).statusCode : 500
    throw createError({
      statusCode,
      message: 'Failed to reverse geocode'
    })
  }
})
