'use client'
import { useEffect, useRef, useState } from 'react'
import { Box, Typography, Chip } from '@mui/material'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Using Mapbox's public token for demo purposes
// For production, get your own token at https://mapbox.com
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'

const UNCW_TEAL = '#007070'

interface ThreatData {
  country: string
  countryCode: string
  threatCount: number
  severity: 'Critical' | 'High' | 'Medium'
  threatTypes: string[]
  domain: string
  description: string
}

interface MapboxThreatMapProps {
  threatData: ThreatData[]
}

export function MapboxThreatMap({ threatData }: MapboxThreatMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize Mapbox
    mapboxgl.accessToken = MAPBOX_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11', // Professional light style
      center: [20, 20], // Center on world view
      zoom: 1.5,
      projection: 'naturalEarth' // Better for world maps
    })

    map.current.on('load', () => {
      setMapLoaded(true)
      
      if (!map.current) return

      // Add countries source
      map.current.addSource('countries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1'
      })

      // Create threat data lookup
      const threatLookup: Record<string, ThreatData> = {}
      threatData.forEach(threat => {
        threatLookup[threat.countryCode] = threat
      })

      // Add countries layer with threat-based coloring
      map.current.addLayer({
        id: 'countries-fill',
        type: 'fill',
        source: 'countries',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': [
            'case',
            ['has', ['get', 'iso_3166_1_alpha_3'], threatLookup],
            [
              'case',
              ['==', ['get', 'threatCount'], threatLookup[['get', 'iso_3166_1_alpha_3']]?.threatCount],
              [
                'case',
                ['==', ['get', 'severity'], 'Critical'],
                '#ef4444',
                ['==', ['get', 'severity'], 'High'],
                '#f97316',
                ['==', ['get', 'severity'], 'Medium'],
                '#FFD700',
                '#f8f9fa'
              ],
              '#f8f9fa'
            ],
            '#f8f9fa'
          ],
          'fill-opacity': 0.8
        }
      })

      // Add country borders
      map.current.addLayer({
        id: 'countries-border',
        type: 'line',
        source: 'countries',
        'source-layer': 'country_boundaries',
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.5
        }
      })

      // Add hover effects
      map.current.on('mouseenter', 'countries-fill', (e) => {
        if (!map.current) return
        
        map.current.getCanvas().style.cursor = 'pointer'
        
        const countryCode = e.features?.[0]?.properties?.iso_3166_1_alpha_3
        const threat = threatLookup[countryCode]
        
        if (threat) {
          setHoveredCountry(countryCode)
          
          // Highlight the country
          map.current.setPaintProperty('countries-fill', 'fill-opacity', [
            'case',
            ['==', ['get', 'iso_3166_1_alpha_3'], countryCode],
            1,
            0.3
          ])
        }
      })

      map.current.on('mouseleave', 'countries-fill', () => {
        if (!map.current) return
        
        map.current.getCanvas().style.cursor = ''
        setHoveredCountry(null)
        
        // Reset opacity
        map.current.setPaintProperty('countries-fill', 'fill-opacity', 0.8)
      })

      // Add click handler for country details
      map.current.on('click', 'countries-fill', (e) => {
        const countryCode = e.features?.[0]?.properties?.iso_3166_1_alpha_3
        const threat = threatLookup[countryCode]
        
        if (threat) {
          // Create popup
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`
              <div style="padding: 12px; min-width: 250px;">
                <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 700;">
                  ${threat.country}
                </h3>
                <div style="margin-bottom: 8px;">
                  <span style="background: ${getSeverityColor(threat.severity)}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                    ${threat.severity}
                  </span>
                </div>
                <div style="font-size: 24px; font-weight: 700; color: #ef4444; margin-bottom: 8px;">
                  ${threat.threatCount.toLocaleString()} threats
                </div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">
                  <strong>Types:</strong> ${threat.threatTypes.join(', ')}
                </div>
                <div style="font-size: 14px; color: #666; margin-bottom: 4px;">
                  <strong>Domain:</strong> ${threat.domain}
                </div>
                <div style="font-size: 12px; color: #888; line-height: 1.4;">
                  ${threat.description}
                </div>
              </div>
            `)
            .addTo(map.current)
        }
      })
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [threatData])

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Critical': return '#ef4444'
      case 'High': return '#f97316'
      case 'Medium': return '#FFD700'
      default: return '#f8f9fa'
    }
  }

  const hoveredThreat = hoveredCountry ? threatData.find(t => t.countryCode === hoveredCountry) : null

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '500px' }}>
      {/* Map Container */}
      <div 
        ref={mapContainer} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '12px',
          overflow: 'hidden'
        }} 
      />
      
      {/* Loading Overlay */}
      {!mapLoaded && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(248, 249, 250, 0.9)',
          borderRadius: '12px'
        }}>
          <Typography variant="h6" sx={{ color: UNCW_TEAL, fontWeight: 600 }}>
            Loading Professional World Map...
          </Typography>
        </Box>
      )}
      
      {/* Hover Tooltip */}
      {hoveredThreat && (
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'rgba(26, 26, 26, 0.95)',
          color: 'white',
          p: 2.5,
          borderRadius: 3,
          minWidth: 280,
          maxWidth: 350,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          border: `2px solid ${getSeverityColor(hoveredThreat.severity)}`,
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {hoveredThreat.country}
            </Typography>
            <Chip 
              label={hoveredThreat.severity}
              size="small"
              sx={{ 
                bgcolor: getSeverityColor(hoveredThreat.severity),
                color: 'white',
                fontWeight: 700,
                fontSize: '0.7rem'
              }}
            />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444', mb: 1 }}>
            {hoveredThreat.threatCount.toLocaleString()} threats
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, fontSize: '0.85rem' }}>
            <strong>Types:</strong> {hoveredThreat.threatTypes.join(', ')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1, opacity: 0.9, fontSize: '0.85rem' }}>
            <strong>Domain:</strong> {hoveredThreat.domain}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, lineHeight: 1.4 }}>
            {hoveredThreat.description}
          </Typography>
        </Box>
      )}
      
      {/* Professional Legend */}
      <Box sx={{ 
        position: 'absolute',
        bottom: 20,
        left: 20,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        p: 2,
        borderRadius: 2,
        border: '1px solid #e9ecef',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        minWidth: 200
      }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#333', mb: 1.5 }}>
          Threat Severity Levels
        </Typography>
        
        {/* Color Scale */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#ef4444', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
            Critical
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#f97316', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
            High
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#FFD700', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
            Medium
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 16, height: 16, bgcolor: '#f8f9fa', border: '1px solid #ddd', borderRadius: 0.5 }} />
          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
            No Data
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
