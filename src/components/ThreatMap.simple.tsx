'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import { GeoThreat } from '@/lib/mock'

interface ThreatMapProps {
  threats: GeoThreat[]
}

export default function ThreatMap({ threats }: ThreatMapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || threats.length === 0) return

    const width = 1200
    const height = 700

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')

    // White background
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#ffffff')

    // Create threat map by country code
    const threatMap = new Map(
      threats.map(t => [t.countryCode, { count: t.threatCount, country: t.country, severity: t.severity }])
    )

    // Projection (centered to avoid Arctic)
    const projection = d3.geoNaturalEarth1()
      .scale(200)
      .translate([width / 2, height / 2])

    const path = d3.geoPath().projection(projection)

    // Load world topology
    d3.json<Topology>('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((topology) => {
        if (!topology) return

        const countries = feature(
          topology,
          topology.objects.countries as GeometryCollection
        )

        // Function to get threat color
        const getThreatColor = (count: number) => {
          if (count >= 1000) return '#ef4444' // Red - Critical
          if (count >= 500) return '#f97316'  // Orange - High
          if (count >= 100) return '#eab308'  // Yellow - Medium
          if (count > 0) return '#10b981'     // Green - Low
          return '#e5e7eb'                     // Gray - No threats
        }

        // Create country ID to threat mapping
        const countryIdToThreat = new Map()
        threatMap.forEach((data, code) => {
          // Map ISO codes to numeric IDs
          const idMap: Record<string, string> = {
            'RUS': '643',  // Russia
            'CHN': '156',  // China
            'NGA': '566',  // Nigeria
            'USA': '840',  // United States
            'BRA': '76',   // Brazil
            'IND': '356',  // India
            'PRK': '408',  // North Korea
            'IRN': '364'   // Iran
          }
          const numericId = idMap[code]
          if (numericId) {
            countryIdToThreat.set(numericId, data)
          }
        })

        console.log('Threat map entries:', Array.from(countryIdToThreat.entries()))

        // Draw countries
        svg.append('g')
          .selectAll('path')
          .data(countries.features)
          .join('path')
          .attr('d', path as any)
          .attr('fill', (d: any) => {
            const countryId = String(d.id)
            const threat = countryIdToThreat.get(countryId)
            
            if (threat) {
              const color = getThreatColor(threat.count)
              console.log(`Country ${countryId}: ${threat.count} threats -> ${color}`)
              return color
            }
            return '#e5e7eb' // Gray for no threats
          })
          .attr('stroke', '#333')
          .attr('stroke-width', 0.5)
          .style('cursor', 'pointer')
          .on('mouseover', function(event, d: any) {
            d3.select(this)
              .attr('stroke-width', 2)
              .attr('stroke', '#000')
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('stroke-width', 0.5)
              .attr('stroke', '#333')
          })

        // Add country labels for threat countries - CENTERED ON COUNTRIES
        const labelData = [
          { name: 'USA', x: 220, y: 280, threats: 85, color: getThreatColor(85) },
          { name: 'BRAZIL', x: 340, y: 490, threats: 120, color: getThreatColor(120) },
          { name: 'NIGERIA', x: 510, y: 380, threats: 250, color: getThreatColor(250) },
          { name: 'RUSSIA', x: 700, y: 230, threats: 1250, color: getThreatColor(1250) },
          { name: 'CHINA', x: 770, y: 310, threats: 650, color: getThreatColor(650) },
          { name: 'INDIA', x: 700, y: 360, threats: 450, color: getThreatColor(450) },
          { name: 'IRAN', x: 640, y: 330, threats: 750, color: getThreatColor(750) },
          { name: 'N. KOREA', x: 820, y: 295, threats: 850, color: getThreatColor(850) }
        ]

        labelData.forEach(label => {
          // Country name
          svg.append('text')
            .attr('x', label.x)
            .attr('y', label.y)
            .attr('text-anchor', 'middle')
            .attr('font-size', label.threats >= 500 ? 15 : 12)
            .attr('font-weight', 700)
            .attr('fill', '#fff')
            .attr('stroke', '#000')
            .attr('stroke-width', 3)
            .attr('paint-order', 'stroke')
            .text(label.name)
            .style('pointer-events', 'none')

          // Threat count
          svg.append('text')
            .attr('x', label.x)
            .attr('y', label.y + 16)
            .attr('text-anchor', 'middle')
            .attr('font-size', 10)
            .attr('font-weight', 700)
            .attr('fill', '#fff')
            .attr('stroke', '#000')
            .attr('stroke-width', 2.5)
            .attr('paint-order', 'stroke')
            .text(`${label.threats} threats`)
            .style('pointer-events', 'none')
        })

        // Add legend
        const legendX = 30
        const legendY = height - 120

        const legendItems = [
          { label: 'Critical (>1000)', color: '#ef4444' },
          { label: 'High (500-1000)', color: '#f97316' },
          { label: 'Medium (100-500)', color: '#eab308' },
          { label: 'Low (<100)', color: '#10b981' },
          { label: 'No Threats', color: '#e5e7eb' }
        ]

        const legendGroup = svg.append('g')
          .attr('transform', `translate(${legendX}, ${legendY})`)

        // Legend background
        legendGroup.append('rect')
          .attr('x', -10)
          .attr('y', -35)
          .attr('width', 200)
          .attr('height', 120)
          .attr('fill', 'rgba(255, 255, 255, 0.95)')
          .attr('stroke', '#333')
          .attr('stroke-width', 2)
          .attr('rx', 8)

        // Legend title
        legendGroup.append('text')
          .attr('x', 0)
          .attr('y', -15)
          .attr('font-size', 14)
          .attr('font-weight', 700)
          .attr('fill', '#000')
          .text('Threat Severity')

        // Legend items
        legendItems.forEach((item, i) => {
          const y = i * 20

          legendGroup.append('rect')
            .attr('x', 0)
            .attr('y', y)
            .attr('width', 16)
            .attr('height', 16)
            .attr('fill', item.color)
            .attr('stroke', '#333')
            .attr('rx', 2)

          legendGroup.append('text')
            .attr('x', 22)
            .attr('y', y + 12)
            .attr('font-size', 11)
            .attr('font-weight', 500)
            .attr('fill', '#333')
            .text(item.label)
        })
      })
      .catch(err => {
        console.error('Error loading world map:', err)
      })

  }, [threats])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '800px', backgroundColor: '#ffffff', borderRadius: 8, border: '2px solid #d1d5db', overflow: 'hidden' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}

