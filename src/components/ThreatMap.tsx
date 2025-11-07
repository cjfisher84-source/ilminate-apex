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

      // Threat severity color scale: Green → Yellow → Orange → Red
      const getThreatColor = (count: number) => {
        if (count === 0) return '#e5e7eb' // Gray for no threats
        if (count < 100) return '#10b981' // Green - Low
        if (count < 500) return '#eab308' // Yellow - Medium
        if (count < 1000) return '#f97316' // Orange - High
        return '#ef4444' // Red - Critical (Russia, etc.)
      }

      // Build SVG
      const svg = d3.select(svgRef.current!)
      svg.selectAll('*').remove() // clear on rerender

      // Responsive dimensions - MUCH LARGER map
      const width = Math.max(400, w || 1200)
      const height = Math.max(700, h || 800) // Increased from 600

      svg.attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'img')
      
      // White background (as requested)
      svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#ffffff')

      // Mercator projection - exclude Arctic by adjusting center and zoom
      const projection = d3.geoMercator()
        .center([0, 20]) // Center further south to exclude Arctic
        .scale(width / 6.5) // Adjusted scale
        .translate([width / 2, height / 2])
        .clipAngle(90) // Clip the projection to visible hemisphere
      
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
      
      // Add drop shadow filter for high-threat countries
      const filter = defs.append('filter')
        .attr('id', 'threat-glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%')
      
      filter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 2)
        .attr('result', 'blur')
      
      filter.append('feOffset')
        .attr('in', 'blur')
        .attr('dx', 0)
        .attr('dy', 1)
        .attr('result', 'offsetBlur')
      
      const feMerge = filter.append('feMerge')
      feMerge.append('feMergeNode').attr('in', 'offsetBlur')
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

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
          // Color by threat severity
          return meta ? getThreatColor(meta.count) : '#e5e7eb' // Gray for no threats
        })
        .attr('stroke', '#333')
        .attr('stroke-width', (d) => {
          const iso = getISO3(d)
          const meta = iso ? threatMap[iso] : undefined
          return meta ? 1.5 : 0.5
        })
        .attr('opacity', 1)
        .attr('filter', (d) => {
          const iso = getISO3(d)
          const meta = iso ? threatMap[iso] : undefined
          // Only apply glow to high-threat countries (>500 threats)
          return meta && meta.count >= 500 ? 'url(#threat-glow)' : 'none'
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
              .attr('stroke', '#000')
              .attr('opacity', 0.8)
              .style('filter', 'brightness(1.2) drop-shadow(0 0 8px rgba(0, 0, 0, 0.5))')
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
                `<div style="font-weight:700; font-size:15px; margin-bottom:8px; color:#000; border-bottom: 2px solid ${getThreatColor(count)}; padding-bottom: 6px;">${name}</div>
                 <div style="margin-bottom:6px; font-size:14px; color:#333;"><span style="font-weight:600;">Threats:</span> <span style="color:${getThreatColor(count)}; font-weight:700; font-size:16px;">${count.toLocaleString()}</span></div>
                 <div style="margin-bottom:6px; color:#333;"><span style="font-weight:600;">Severity:</span> <span style="color:${severityColors[severity] || '#333'}; font-weight:700;">${severity}</span></div>
                 <div style="font-size:11px; color:#666; margin-top:8px; padding-top:6px; border-top:1px solid #ddd;">Last seen: ${last}</div>`
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
            .attr('stroke-width', meta ? 1.5 : 0.5)
            .attr('stroke', '#333')
            .attr('opacity', 1)
            .attr('filter', meta && meta.count >= 500 ? 'url(#threat-glow)' : 'none')
            .style('filter', 'none')
          tooltip.style('display', 'none')
        })

      // Add country name labels on threat countries
      g.selectAll('text.country-label')
        .data(features.filter(d => {
          const iso = getISO3(d)
          return iso && threatMap[iso] // Only countries with threats
        }))
        .join('text')
        .attr('class', 'country-label')
        .attr('transform', (d) => {
          const centroid = path.centroid(d as any)
          return `translate(${centroid[0]}, ${centroid[1]})`
        })
        .attr('text-anchor', 'middle')
        .attr('dy', '.35em')
        .attr('font-size', (d) => {
          const iso = getISO3(d)
          const meta = iso ? threatMap[iso] : undefined
          // Larger text for higher threat countries
          return meta && meta.count >= 500 ? 14 : 11
        })
        .attr('font-weight', 700)
        .attr('fill', '#000')
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .attr('paint-order', 'stroke')
        .style('pointer-events', 'none')
        .text((d) => {
          const name = d.properties?.name as string
          const iso = getISO3(d)
          const meta = iso ? threatMap[iso] : undefined
          // Show country name
          return name || 'Unknown'
        })

      // Enhanced Legend with discrete threat levels
      const legendX = 20
      const legendY = height - 100

      const legend = svg.append('g').attr('transform', `translate(${legendX},${legendY})`)

      // Add background for better contrast
      legend
        .append('rect')
        .attr('x', -10)
        .attr('y', -40)
        .attr('width', 200)
        .attr('height', 115)
        .attr('fill', 'rgba(255, 255, 255, 0.95)')
        .attr('rx', 8)
        .attr('stroke', '#333')
        .attr('stroke-width', 2)

      // Title
      legend
        .append('text')
        .attr('x', 0)
        .attr('y', -22)
        .attr('font-size', 14)
        .attr('font-weight', 700)
        .attr('fill', '#000')
        .text('Threat Severity')

      // Discrete color legend items
      const legendItems = [
        { label: 'Critical (>1000)', color: '#ef4444' },
        { label: 'High (500-1000)', color: '#f97316' },
        { label: 'Medium (100-500)', color: '#eab308' },
        { label: 'Low (<100)', color: '#10b981' },
        { label: 'No Threats', color: '#e5e7eb' }
      ]

      legendItems.forEach((item, i) => {
        const y = i * 18

        // Color box
        legend
          .append('rect')
          .attr('x', 0)
          .attr('y', y)
          .attr('width', 16)
          .attr('height', 16)
          .attr('fill', item.color)
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('rx', 2)

        // Label
        legend
          .append('text')
          .attr('x', 22)
          .attr('y', y + 12)
          .attr('font-size', 11)
          .attr('font-weight', 500)
          .attr('fill', '#333')
          .text(item.label)
      })
        
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
          height: '800px', // Increased from 600px
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
          background: '#ffffff', // White background
          border: '3px solid #d1d5db',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
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
            background: 'rgba(255, 255, 255, 0.98)',
            color: '#000',
            padding: '12px 14px',
            borderRadius: 8,
            fontSize: 13,
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            border: '2px solid #333',
            maxWidth: '280px'
          }}
        />
      </div>
    </div>
  )
}

