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

        // Draw countries
        svg.append('g')
          .selectAll('path')
          .data(countries.features)
          .join('path')
          .attr('d', path as any)
          .attr('fill', (d: any) => {
            const countryId = d.id
            // Try to match by numeric ID or properties
            let threat = null
            
            // Check against our threat map
            for (const [code, data] of threatMap.entries()) {
              // Simple matching - this will work for major countries
              if (countryId === '643') threat = data // Russia
              else if (countryId === '156') threat = data // China
              else if (countryId === '566') threat = data // Nigeria
              else if (countryId === '840') threat = data // USA
              else if (countryId === '76') threat = data // Brazil
              else if (countryId === '356') threat = data // India
              else if (countryId === '408') threat = data // North Korea
              else if (countryId === '364') threat = data // Iran
            }
            
            return threat ? getThreatColor(threat.count) : '#e5e7eb'
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

        // Add country labels for threat countries
        const labelData = [
          { name: 'RUSSIA', x: 600, y: 180, color: '#ef4444', threats: 1250 },
          { name: 'CHINA', x: 750, y: 250, color: '#f97316', threats: 650 },
          { name: 'USA', x: 250, y: 250, color: '#10b981', threats: 85 },
          { name: 'NIGERIA', x: 500, y: 350, color: '#eab308', threats: 250 },
          { name: 'BRAZIL', x: 350, y: 500, color: '#10b981', threats: 120 }
        ]

        labelData.forEach(label => {
          svg.append('text')
            .attr('x', label.x)
            .attr('y', label.y)
            .attr('text-anchor', 'middle')
            .attr('font-size', 14)
            .attr('font-weight', 700)
            .attr('fill', '#000')
            .attr('stroke', '#fff')
            .attr('stroke-width', 3)
            .attr('paint-order', 'stroke')
            .text(label.name)
            .style('pointer-events', 'none')

          svg.append('text')
            .attr('x', label.x)
            .attr('y', label.y + 16)
            .attr('text-anchor', 'middle')
            .attr('font-size', 11)
            .attr('font-weight', 600)
            .attr('fill', label.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
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

