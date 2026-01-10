export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'BooksExchange/1.0' // Required by Nominatim
        }
      }
    )

    if (!response.ok) {
    //   throw new Error('Geocoding failed')
    }

    const data = await response.json()
    
    // Return formatted address
    const { address } = data
    if (address) {
      const parts = [
        address.road || address.neighbourhood,
        address.suburb || address.city || address.town || address.village,
        address.state,
        address.country
      ].filter(Boolean)
      
      return parts.join(', ') || data.display_name
    }
    
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch (error) {
    console.error('Geocoding error:', error)
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}
