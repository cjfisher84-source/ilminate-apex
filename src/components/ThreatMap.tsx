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
const WORLD_GEOJSON_URL = 'https://unpkg.com/geojson-world@1.0.0/countries.geo.json'

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
      // Convert GeoThreat[] to ISO3 map
      const threatMap: Record<string, { count: number; last_seen: string; severity: string }> = {}
      threats.forEach((t) => {
        threatMap[t.countryCode] = {
          count: t.threatCount,
          last_seen: t.lastSeen,
          severity: t.severity
        }
      })

      // Fetch world GeoJSON
      const world = await fetch(WORLD_GEOJSON_URL).then((r) => r.json())
      if (isCancelled) return

      const features: WorldFeature[] = world.features || []

      // Compute color scale domain from data
      const counts = threats.map((d) => d.threatCount || 0)
      const maxCount = counts.length ? d3.max(counts)! : 1

      // Sequential scale: light teal → dark teal/red for threats
      const color = d3
        .scaleSequential(d3.interpolateYlOrRd)
        .domain([0, Math.max(10, maxCount)])

      // Build SVG
      const svg = d3.select(svgRef.current!)
      svg.selectAll('*').remove() // clear on rerender

      // Responsive dimensions
      const width = Math.max(320, w || 960)
      const height = Math.max(420, h || 500)

      svg.attr('viewBox', `0 0 ${width} ${height}`).attr('role', 'img')

      // Mercator projection (flat world)
      const projection = d3.geoMercator().fitSize([width, height], world)
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
          return meta ? color(meta.count) : '#f1f1f1'
        })
        .attr('stroke', '#8a8a8a')
        .attr('stroke-width', 0.6)
        .attr('opacity', 0.95)
        .style('cursor', (d) => {
          const iso = getISO3(d)
          return iso && threatMap[iso] ? 'pointer' : 'default'
        })
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
            d3.select(this).attr('stroke-width', 1.5).attr('stroke', UNCW_TEAL)

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
                `<div style="font-weight:700; font-size:14px; margin-bottom:4px; color:${UNCW_TEAL}">${name}</div>
                 <div style="margin-bottom:2px;"><span style="font-weight:600;">Threats:</span> ${count}</div>
                 <div style="margin-bottom:2px;"><span style="font-weight:600;">Severity:</span> <span style="color:${severityColors[severity] || '#fff'};">${severity}</span></div>
                 <div style="font-size:11px; color:#ccc;">Last seen: ${last}</div>`
              )
          }
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke-width', 0.6).attr('stroke', '#8a8a8a')
          tooltip.style('display', 'none')
        })

      // Legend
      const legendWidth = 200
      const legendHeight = 12
      const legendX = width - legendWidth - 20
      const legendY = height - 50

      const legend = svg.append('g').attr('transform', `translate(${legendX},${legendY})`)

      // Gradient ramp
      const defs = svg.append('defs')
      const gradId = 'threat-ramp'
      const gradient = defs
        .append('linearGradient')
        .attr('id', gradId)
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%')

      const stops = d3.range(0, 1.001, 0.1)
      stops.forEach((t) => {
        gradient
          .append('stop')
          .attr('offset', `${t * 100}%`)
          .attr('stop-color', color(t * Math.max(10, maxCount)) as string)
      })

      legend
        .append('rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('fill', `url(#${gradId})`)
        .attr('rx', 3)
        .attr('stroke', '#8a8a8a')
        .attr('stroke-width', 1)

      const scale = d3
        .scaleLinear()
        .domain([0, Math.max(10, maxCount)])
        .range([0, legendWidth])

      const axis = d3.axisBottom(scale).ticks(4).tickSize(5).tickFormat(d3.format('~s'))

      legend
        .append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(axis as any)
        .call((g: any) => {
          g.select('.domain').remove()
          g.selectAll('text').attr('fill', '#666').attr('font-size', 11)
          g.selectAll('line').attr('stroke', '#8a8a8a')
        })

      legend
        .append('text')
        .attr('x', 0)
        .attr('y', -8)
        .attr('font-size', 12)
        .attr('font-weight', 600)
        .attr('fill', UNCW_TEAL)
        .text('Threat Volume (darker = more)')
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
          height: '500px',
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(180deg, rgba(248,250,252,1), rgba(241,245,249,1))'
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

