'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { GeoThreat } from '@/lib/mock'

const UNCW_TEAL = '#007070'

// Simple responsive wrapper using ResizeObserver
function useResize(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })

  useEffect(() => {
    if (!ref.current) return

    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const cr = e.contentRect
        setSize({ w: cr.width, h: cr.height })
      }
    })

    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref])

  return size
}

// Public GeoJSON with country polygons and ISO codes
// Using Natural Earth data via datahub.io
const WORLD_GEOJSON_URL = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson'

type WorldFeature = GeoJSON.Feature<
  GeoJSON.Geometry,
  { name?: string; ISO_A3?: string; iso_a3?: string; cca3?: string; id?: string }
>

interface ThreatMapProps {
  threats: GeoThreat[]
}

export default function ThreatMap({ threats }: ThreatMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const { w, h } = useResize(wrapRef)

  useEffect(() => {
    let isCancelled = false

    async function draw() {
      try {
        console.log('ThreatMap: Starting draw with', threats.length, 'threats')
        
        // Convert GeoThreat[] to ISO3 map
        const threatMap: Record<string, { count: number; last_seen: string; severity: string }> = {}
        threats.forEach((t) => {
          threatMap[t.countryCode] = {
            count: t.threatCount,
            last_seen: t.lastSeen,
            severity: t.severity
          }
        })
        
        console.log('ThreatMap: Threat map created with', Object.keys(threatMap).length, 'countries')

        // Fetch world GeoJSON
        console.log('ThreatMap: Fetching GeoJSON from', WORLD_GEOJSON_URL)
        const response = await fetch(WORLD_GEOJSON_URL)
        if (!response.ok) {
          throw new Error(`Failed to fetch GeoJSON: ${response.statusText}`)
        }
        const world = await response.json()
        if (isCancelled) return

        const features: WorldFeature[] = world.features || []
        console.log('ThreatMap: Loaded', features.length, 'country features')

      // Compute color scale domain from data
      const counts = threats.map((d) => d.threatCount || 0)
      const maxCount = counts.length ? d3.max(counts)! : 1

      // Enhanced heatmap scale: Yellow → Orange → Red for clear threat visualization
      const color = d3
        .scaleSequential(d3.interpolateYlOrRd)
        .domain([0, maxCount * 0.85]) // Compress domain to make colors more vibrant

      // Build SVG
      const svg = d3.select(svgRef.current!)
      svg.selectAll('*').remove() // clear on rerender

      // Responsive dimensions - increased for better visibility
      const width = Math.max(320, w || 960)
      const height = Math.max(500, h || 600)

      svg.attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'img')
      
      // Add ocean/background
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#0a0e1a') // Deep ocean blue-black

      // Mercator projection with much better zoom
      const projection = d3.geoMercator()
        .fitExtent([[10, 10], [width - 10, height - 90]], world)
      
      // Zoom in 35% for much larger, more visible countries
      const currentScale = projection.scale()
      projection.scale(currentScale * 1.35)
      
      const path = d3.geoPath(projection)

      // Tooltip helpers
      const tooltip = d3.select(tooltipRef.current!)

      function getISO3(f: WorldFeature) {
        return (
          f.properties?.ISO_A3 ||
          f.properties?.iso_a3 ||
          f.properties?.cca3 ||
          (typeof f.id === 'string' ? f.id : undefined) ||
          undefined
        )
      }

      // Add radial gradient patterns for heatmap effect on countries
      const defs = svg.append('defs')
      
      // Add drop shadow filter for threat countries
      const filter = defs.append('filter')
        .attr('id', 'threat-glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%')
      
      filter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 3)
        .attr('result', 'blur')
      
      filter.append('feOffset')
        .attr('in', 'blur')
        .attr('dx', 0)
        .attr('dy', 2)
        .attr('result', 'offsetBlur')
      
      const feMerge = filter.append('feMerge')
      feMerge.append('feMergeNode').attr('in', 'offsetBlur')
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
      
      // Create gradient patterns for different threat levels
      Object.keys(threatMap).forEach((countryCode) => {
        const threat = threatMap[countryCode]
        const baseColor = color(threat.count) as string
        
        const gradient = defs.append('radialGradient')
          .attr('id', `heat-${countryCode}`)
          .attr('cx', '50%')
          .attr('cy', '50%')
          .attr('r', '65%')
        
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', baseColor)
          .attr('stop-opacity', 1)
        
        gradient.append('stop')
          .attr('offset', '70%')
          .attr('stop-color', baseColor)
          .attr('stop-opacity', 0.85)
          
        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', baseColor)
          .attr('stop-opacity', 0.6)
      })

      // Countries layer
      const g = svg.append('g')

      g.selectAll('path.country')
        .data(features)
        .join('path')
        .attr('class', 'country')
        .attr('d', path as any)
        .attr('fill', (d) => {
          const iso = getISO3(d)
          const meta = iso ? threatMap[iso] : undefined
          // Use gradient pattern for threat countries, solid for others
          return meta ? `url(#heat-${iso})` : '#353a4a'
        })
        .attr('stroke', (d) => {
          const iso = getISO3(d)
          const meta = iso ? threatMap[iso] : undefined
          return meta ? '#000' : '#4a4f5e'
        })
        .attr('stroke-width', (d) => {
          const iso = getISO3(d)
          const meta = iso ? threatMap[iso] : undefined
          return meta ? 0.8 : 0.4
        })
        .attr('opacity', 1)
        .attr('filter', (d) => {
          const iso = getISO3(d)
          const meta = iso ? threatMap[iso] : undefined
          return meta ? 'url(#threat-glow)' : 'none'
        })
        .style('cursor', (d) => {
          const iso = getISO3(d)
          return iso && threatMap[iso] ? 'pointer' : 'default'
        })
        .style('transition', 'all 0.2s ease')
        .on('mousemove', function (event, d) {
          const iso = getISO3(d)
          const meta = iso ? threatMap[iso] : undefined
          const name = (d.properties?.name as string) || iso || 'Unknown'
          const count = meta?.count ?? 0
          const last = meta?.last_seen
            ? new Date(meta.last_seen).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : 'No data'
          const severity = meta?.severity || ''

          if (meta) {
            // Dramatic highlight on hover
            d3.select(this)
              .attr('stroke-width', 3)
              .attr('stroke', UNCW_TEAL)
              .attr('opacity', 1)
              .style('filter', 'brightness(1.3) drop-shadow(0 0 8px rgba(0, 168, 168, 0.8))')
              .raise() // Bring to front

            const severityColors: Record<string, string> = {
              Critical: '#ef4444',
              High: '#f97316',
              Medium: '#FFD700',
              Low: '#10b981'
            }

            tooltip
              .style('display', 'block')
              .style('left', `${event.pageX + 12}px`)
              .style('top', `${event.pageY + 12}px`)
              .html(
                `<div style="font-weight:700; font-size:15px; margin-bottom:6px; color:#fff; border-bottom: 2px solid ${UNCW_TEAL}; padding-bottom: 4px;">${name}</div>
                 <div style="margin-bottom:4px; font-size:14px;"><span style="font-weight:600;">Threats:</span> <span style="color:${UNCW_TEAL}; font-weight:700; font-size:16px;">${count.toLocaleString()}</span></div>
                 <div style="margin-bottom:4px;"><span style="font-weight:600;">Severity:</span> <span style="color:${severityColors[severity] || '#fff'}; font-weight:700;">${severity}</span></div>
                 <div style="font-size:11px; color:#aaa; margin-top:6px; padding-top:4px; border-top:1px solid #444;">Last seen: ${last}</div>`
              )
          } else {
            // Slight highlight for countries without threat data
            d3.select(this)
              .attr('stroke-width', 1.2)
              .attr('stroke', '#666')
              .attr('opacity', 0.7)
          }
        })
        .on('mouseout', function (event, d) {
          const iso = getISO3(d)
          const meta = iso ? threatMap[iso] : undefined
          
          d3.select(this)
            .attr('stroke-width', meta ? 0.8 : 0.4)
            .attr('stroke', meta ? '#000' : '#4a4f5e')
            .attr('opacity', 1)
            .attr('filter', meta ? 'url(#threat-glow)' : 'none')
            .style('filter', 'none')
          tooltip.style('display', 'none')
        })

      // Enhanced Legend with better visibility
      const legendWidth = 240
      const legendHeight = 16
      const legendX = 20
      const legendY = height - 60

      const legend = svg.append('g').attr('transform', `translate(${legendX},${legendY})`)

      // Add background for better contrast
      legend
        .append('rect')
        .attr('x', -10)
        .attr('y', -30)
        .attr('width', legendWidth + 20)
        .attr('height', 65)
        .attr('fill', 'rgba(0,0,0,0.75)')
        .attr('rx', 8)
        .attr('stroke', UNCW_TEAL)
        .attr('stroke-width', 2)

      // Gradient ramp (reuse existing defs)
      const gradId = 'threat-ramp'
      const gradient = defs
        .append('linearGradient')
        .attr('id', gradId)
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%')

      const stops = d3.range(0, 1.001, 0.05)
      stops.forEach((t) => {
        gradient
          .append('stop')
          .attr('offset', `${t * 100}%`)
          .attr('stop-color', color(t * maxCount * 0.85) as string)
      })

      legend
        .append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', `url(#${gradId})`)
        .attr('rx', 4)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)

      const scale = d3
        .scaleLinear()
        .domain([0, maxCount])
        .range([0, legendWidth])

      const axis = d3.axisBottom(scale).ticks(5).tickSize(6).tickFormat(d3.format('~s'))

      legend
        .append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(axis as any)
        .call((g: any) => {
          g.select('.domain').remove()
          g.selectAll('text').attr('fill', '#fff').attr('font-size', 11).attr('font-weight', 600)
          g.selectAll('line').attr('stroke', '#fff').attr('stroke-width', 1.5)
        })

      legend
        .append('text')
        .attr('x', 0)
        .attr('y', -12)
        .attr('font-size', 13)
        .attr('font-weight', 700)
        .attr('fill', UNCW_TEAL)
        .text('🌡️ THREAT HEATMAP')
        
      legend
        .append('text')
        .attr('x', 0)
        .attr('y', -28)
        .attr('font-size', 11)
        .attr('font-weight', 500)
        .attr('fill', '#ccc')
        .text('Hover over countries for details')
        
        console.log('ThreatMap: Map rendered successfully!')
      } catch (error) {
        console.error('ThreatMap: Error rendering map:', error)
      }
    }

    draw()

    return () => {
      isCancelled = true
    }
  }, [w, h, threats])

  return (
    <div style={{ width: '100%' }}>
      <div
        ref={wrapRef}
        style={{
          width: '100%',
          height: '600px',
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #0a0e1a 0%, #1a1f2e 100%)',
          border: `3px solid ${UNCW_TEAL}`,
          boxShadow: `0 8px 32px rgba(0, 112, 112, 0.3), inset 0 0 60px rgba(0, 112, 112, 0.1)`
        }}
        aria-label="Global threat origins map"
      >
        <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
        <div
          ref={tooltipRef}
          style={{
            display: 'none',
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 1000,
            background: 'rgba(0,0,0,0.92)',
            color: '#fff',
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: 13,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            border: `1px solid ${UNCW_TEAL}`,
            maxWidth: '280px'
          }}
        />
      </div>
    </div>
  )
}

