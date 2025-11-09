'use client'

import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'

// Mock threat data structure
interface ThreatData {
  count: number
  severity: number
}

// Mock data: more threats from a country = more heat
const MOCK_DATA: Record<string, ThreatData> = {
  USA: { count: 742, severity: 4 },
  CAN: { count: 128, severity: 3 },
  MEX: { count: 221, severity: 2 },
  BRA: { count: 305, severity: 3 },
  ARG: { count: 97, severity: 2 },
  GBR: { count: 402, severity: 4 },
  IRL: { count: 156, severity: 3 },
  FRA: { count: 289, severity: 3 },
  DEU: { count: 334, severity: 4 },
  ESP: { count: 210, severity: 2 },
  ITA: { count: 244, severity: 3 },
  NLD: { count: 133, severity: 2 },
  BEL: { count: 120, severity: 2 },
  NOR: { count: 64, severity: 2 },
  SWE: { count: 88, severity: 2 },
  FIN: { count: 70, severity: 2 },
  POL: { count: 165, severity: 3 },
  CZE: { count: 81, severity: 2 },
  ROU: { count: 73, severity: 2 },
  PRT: { count: 91, severity: 2 },
  CHE: { count: 52, severity: 3 },
  AUT: { count: 58, severity: 2 },
  AUS: { count: 144, severity: 3 },
  NZL: { count: 46, severity: 2 },
  ZAF: { count: 177, severity: 3 },
  NGA: { count: 201, severity: 3 },
  EGY: { count: 149, severity: 3 },
  MAR: { count: 95, severity: 2 },
  TUN: { count: 67, severity: 2 },
  SAU: { count: 198, severity: 3 },
  ARE: { count: 118, severity: 3 },
  IND: { count: 415, severity: 4 },
  PAK: { count: 208, severity: 3 },
  CHN: { count: 520, severity: 5 },
  HKG: { count: 131, severity: 3 },
  JPN: { count: 190, severity: 3 },
  KOR: { count: 221, severity: 4 },
  VNM: { count: 140, severity: 3 },
  THA: { count: 126, severity: 2 },
  SGP: { count: 112, severity: 3 },
  IDN: { count: 160, severity: 3 },
  RUS: { count: 489, severity: 5 },
  UKR: { count: 237, severity: 4 },
  TUR: { count: 174, severity: 3 },
}

// Optionally seed light random noise for countries not listed above
const RANDOMIZE_MISSING = true

// Minimal ISO numeric -> ISO3 mapping for common countries
const numericToISO3: Record<number, string> = {
  840: 'USA', 124: 'CAN', 484: 'MEX', 76: 'BRA', 32: 'ARG',
  826: 'GBR', 372: 'IRL', 250: 'FRA', 276: 'DEU', 724: 'ESP', 380: 'ITA',
  528: 'NLD', 56: 'BEL', 578: 'NOR', 752: 'SWE', 246: 'FIN', 616: 'POL', 203: 'CZE',
  642: 'ROU', 620: 'PRT', 756: 'CHE', 40: 'AUT', 36: 'AUS', 554: 'NZL',
  710: 'ZAF', 566: 'NGA', 818: 'EGY', 504: 'MAR', 788: 'TUN', 682: 'SAU', 784: 'ARE',
  356: 'IND', 586: 'PAK', 156: 'CHN', 344: 'HKG', 392: 'JPN', 410: 'KOR', 704: 'VNM', 
  764: 'THA', 702: 'SGP', 360: 'IDN', 643: 'RUS', 804: 'UKR', 792: 'TUR'
}

interface CountryFeature {
  feature: GeoJSON.Feature
  id: number
  code: string | null
  name: string
}

export default function ThreatHeatmap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [showLabels, setShowLabels] = useState(false)
  const [showBorders, setShowBorders] = useState(true)
  const [dimensions, setDimensions] = useState({ w: 1200, h: 560 })

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width
        const height = Math.max(420, Math.min(720, Math.round(width * 0.52)))
        setDimensions({ w: width, h: height })
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return

    const { w, h } = dimensions
    let isCancelled = false

    async function initMap() {
      try {
        // Load world boundaries (TopoJSON)
        const world = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
          .then(r => r.json()) as Topology

        if (isCancelled) return

        const features = topojson.feature(world, world.objects.countries as GeometryCollection).features

        // Convert TopoJSON features to usable array with ISO3 and names
        const countries: CountryFeature[] = features.map(f => {
          const id = Number(f.id)
          const code = numericToISO3[id] || null
          const name = (f.properties as any)?.name || (f.properties as any)?.NAME || (f.properties as any)?.admin || 'Unknown'
          return { feature: f, id, code, name }
        })

        // Add random data to countries without entries (if enabled)
        if (RANDOMIZE_MISSING) {
          for (const c of countries) {
            const code = c.code
            if (!code) continue
            if (!MOCK_DATA[code]) {
              const count = Math.floor(Math.random() * 60)
              const severity = Math.floor(Math.random() * 3) + 1
              if (count > 0) MOCK_DATA[code] = { count, severity }
            }
          }
        }

        // Build score map (score = count × severity)
        const scoreByISO3 = new Map<string, { count: number; severity: number; score: number }>()
        let maxScore = 1
        for (const [code, v] of Object.entries(MOCK_DATA)) {
          const score = (v.count || 0) * (v.severity || 1)
          scoreByISO3.set(code, { ...v, score })
          if (score > maxScore) maxScore = score
        }

        // Clear and setup SVG
        const svg = d3.select(svgRef.current!)
        svg.selectAll('*').remove()
        svg.attr('width', w).attr('height', h)

        // Projection & path
        const projection = d3.geoNaturalEarth1()
          .fitExtent([[12, 12], [w - 12, h - 12]], { type: 'FeatureCollection', features: features as any })

        const path = d3.geoPath(projection)

        // Color scale (yellow→red). More red = higher risk.
        const color = d3.scaleSequential()
          .domain([0, maxScore])
          .interpolator(d3.interpolateYlOrRd)

        // Tooltip
        const tip = d3.select(tooltipRef.current!)

        function showTip(html: string, x: number, y: number) {
          tip.html(html)
            .style('left', (x + 14) + 'px')
            .style('top', (y + 14) + 'px')
            .style('opacity', '1')
        }

        function hideTip() {
          tip.style('opacity', '0')
        }

        // Groups for layering
        const gCountries = svg.append('g').attr('class', 'countries')
        const gBorders = svg.append('g').attr('class', 'borders')
        const gLabels = svg.append('g').attr('class', 'labels')

        // Draw countries
        const countryPaths = gCountries.selectAll('path.country')
          .data(countries)
          .enter()
          .append('path')
          .attr('class', 'country')
          .attr('d', (d: CountryFeature) => path(d.feature as any) || '')
          .attr('fill', (d: CountryFeature) => {
            const data = d.code ? scoreByISO3.get(d.code) : undefined
            return data ? color(data.score) : '#172341'
          })
          .attr('stroke', 'rgba(255,255,255,.08)')
          .attr('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .on('mousemove', function (event, d: CountryFeature) {
            const data = d.code ? scoreByISO3.get(d.code) : undefined
            const dataObj = data || { count: 0, severity: 0, score: 0 }
            const html = `
              <div style="font-weight:600;margin-bottom:4px;">${d.name}</div>
              <div>Count: <b>${dataObj.count || 0}</b></div>
              <div>Severity: <b>${dataObj.severity || 0}</b></div>
              <div>Combined Score: <b>${dataObj.score || 0}</b></div>
            `
            showTip(html, event.clientX, event.clientY)
          })
          .on('mouseleave', hideTip)

        // Draw borders
        const borderPath = topojson.mesh(world, world.objects.countries as GeometryCollection, (a, b) => a !== b)
        gBorders.append('path')
          .attr('d', path(borderPath as any) || '')
          .attr('fill', 'none')
          .attr('stroke', 'rgba(255,255,255,.18)')
          .attr('stroke-width', 0.6)

        // Labels (toggle)
        const labelsData = countries.filter(c => c.code && scoreByISO3.get(c.code))
        gLabels.selectAll('text')
          .data(labelsData)
          .enter()
          .append('text')
          .attr('x', (d: CountryFeature) => {
            const centroid = d3.geoCentroid(d.feature)
            return projection(centroid)?.[0] || 0
          })
          .attr('y', (d: CountryFeature) => {
            const centroid = d3.geoCentroid(d.feature)
            return projection(centroid)?.[1] || 0
          })
          .attr('text-anchor', 'middle')
          .attr('dy', '0.35em')
          .text((d: CountryFeature) => d.name)
          .style('font', '10px Inter,system-ui,sans-serif')
          .style('fill', '#e8f1ff')
          .style('paint-order', 'stroke')
          .style('stroke', 'rgba(9,14,30,.8)')
          .style('stroke-width', '2px')
          .style('opacity', '0.85')
          .style('pointer-events', 'none')

        // Update visibility based on state
        gBorders.style('display', showBorders ? '' : 'none')
        gLabels.style('display', showLabels ? '' : 'none')

        // Build gradient legend
        buildLegend(color, maxScore)

      } catch (error) {
        console.error('Error rendering threat heatmap:', error)
      }
    }

    initMap()

    return () => {
      isCancelled = true
    }
  }, [dimensions, showLabels, showBorders])

  function buildLegend(scale: d3.ScaleSequential<string, never>, maxScore: number) {
    const legendEl = document.getElementById('threat-legend')
    if (!legendEl) return

    const n = 256
    const canvas = document.createElement('canvas')
    canvas.width = n
    canvas.height = 20
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.borderRadius = '4px'
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    for (let i = 0; i < n; i++) {
      ctx.fillStyle = scale((maxScore * i) / (n - 1))
      ctx.fillRect(i, 0, 1, canvas.height)
    }
    
    legendEl.innerHTML = ''
    legendEl.appendChild(canvas)
  }

  return (
    <section 
      style={{
        padding: '48px 0',
        background: '#0b1020',
        width: '100%'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', color: '#e8f1ff', marginBottom: '16px' }}>
          <h2 style={{ margin: '0 0 8px', fontFamily: 'Inter,system-ui,sans-serif', fontSize: '32px', fontWeight: 700 }}>
            Global Threat Heatmap
          </h2>
          <p style={{ opacity: 0.8, margin: 0, fontSize: '14px' }}>
            More red = higher combined risk (volume × severity)
          </p>
        </div>

        {/* Controls */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#c9d6ff', 
          marginBottom: '8px',
          flexWrap: 'wrap'
        }}>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              id="toggle-labels" 
              type="checkbox" 
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />
            <span>Show country labels</span>
          </label>
          <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              id="toggle-borders" 
              type="checkbox" 
              checked={showBorders}
              onChange={(e) => setShowBorders(e.target.checked)}
            />
            <span>Show borders</span>
          </label>
        </div>

        {/* Legend */}
        <div 
          id="threat-legend" 
          style={{ 
            height: '20px', 
            maxWidth: '720px', 
            margin: '0 auto 10px', 
            borderRadius: '4px', 
            overflow: 'hidden' 
          }}
        />
        <div style={{ 
          maxWidth: '720px', 
          margin: '0 auto 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          color: '#c9d6ff', 
          fontSize: '12px' 
        }}>
          <span>Low</span>
          <span>High</span>
        </div>

        {/* Map container */}
        <div 
          ref={containerRef}
          id="threat-map" 
          style={{ 
            width: '100%', 
            height: '560px', 
            background: '#0b1020', 
            border: '1px solid rgba(255,255,255,.08)', 
            borderRadius: '12px',
            position: 'relative'
          }}
        >
          <svg 
            ref={svgRef} 
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 10,
            background: 'rgba(9,14,30,.92)',
            border: '1px solid rgba(255,255,255,.15)',
            borderRadius: '8px',
            padding: '8px 10px',
            color: '#e8f1ff',
            font: '12px/1.4 Inter,system-ui,sans-serif',
            boxShadow: '0 6px 18px rgba(0,0,0,.35)',
            opacity: 0,
            transition: 'opacity 120ms'
          }}
        />

        {/* Note */}
        <p style={{ 
          textAlign: 'center', 
          color: '#8fa7ff', 
          opacity: 0.8, 
          marginTop: '10px', 
          fontSize: '12px' 
        }}>
          Mock data shown. Hook your pipeline to replace <code style={{ 
            background: 'rgba(255,255,255,.1)', 
            padding: '2px 6px', 
            borderRadius: '3px' 
          }}>MOCK_DATA</code>.
        </p>
      </div>
    </section>
  )
}

