"use client"

import React, { useMemo, useRef, useEffect, useState } from "react"
import * as d3 from "d3"
import { feature } from "topojson-client"
// @ts-ignore
import worldData from "world-atlas/countries-110m.json"

type ThreatCount = { iso3: string; count: number }
type ThreatIndex = Record<string, number>

type Props = {
  counts: ThreatCount[]
  onCountryClick?: (iso3: string, name: string) => void
  width?: number
  height?: number
}

const MapChoropleth: React.FC<Props> = ({
  counts,
  onCountryClick,
  width = 1200,
  height = 800,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [hover, setHover] = useState<{ name: string; count: number } | null>(null)
  const [mouse, setMouse] = useState<[number, number] | null>(null)

  const geojson = useMemo(() => {
    const fc = feature(worldData as any, (worldData as any).objects.countries)
    return fc as GeoJSON.FeatureCollection<GeoJSON.Geometry, any>
  }, [])

  const index = useMemo<ThreatIndex>(() => {
    const map: ThreatIndex = {}
    for (const c of counts) map[c.iso3] = c.count
    return map
  }, [counts])

  const maxVal = useMemo(() => d3.max(counts, (d) => d.count) ?? 0, [counts])
  const color = useMemo(
    () => d3.scaleQuantize<string>().domain([0, maxVal || 1]).range(d3.schemeReds[9]),
    [maxVal]
  )

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const projection = d3.geoNaturalEarth1()
      .fitSize([width, height - 40], geojson) // Leave space at bottom
      .center([0, 15]) // Center slightly south to avoid Arctic

    const path = d3.geoPath(projection)

    // White background
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#ffffff")

    const g = svg.append("g").attr("class", "map-root")
    const gCountries = g.append("g").attr("class", "countries")
    const gLabels = g.append("g").attr("class", "labels")

    gCountries
      .selectAll("path")
      .data(geojson.features)
      .join("path")
      .attr("d", path as any)
      .attr("fill", (d: any) => {
        const iso3 = d.id ? String(d.id) : d.properties?.iso_a3 || d.properties?.iso3
        const val = index[iso3] || 0
        return val > 0 ? color(val) : "#e5e7eb"
      })
      .attr("stroke", "#333")
      .attr("stroke-width", 0.5)
      .style("cursor", (d: any) => {
        const iso3 = d.id ? String(d.id) : d.properties?.iso_a3 || d.properties?.iso3
        return index[iso3] > 0 ? "pointer" : "default"
      })
      .on("mouseenter", (event: MouseEvent, d: any) => {
        const iso3 = d.id ? String(d.id) : d.properties?.iso_a3 || d.properties?.iso3
        const val = index[iso3] || 0
        if (val > 0) {
          d3.select(event.currentTarget as any)
            .attr("stroke", "#000")
            .attr("stroke-width", 2)
          setHover({ name: d.properties?.name ?? iso3 ?? "Unknown", count: val })
        }
      })
      .on("mousemove", (event: MouseEvent) => setMouse(d3.pointer(event)))
      .on("mouseleave", (event: MouseEvent) => {
        d3.select(event.currentTarget as any)
          .attr("stroke", "#333")
          .attr("stroke-width", 0.5)
        setHover(null)
        setMouse(null)
      })
      .on("click", (_event: MouseEvent, d: any) => {
        const iso3 = d.id ? String(d.id) : d.properties?.iso_a3 || d.properties?.iso3
        const name = d.properties?.name ?? iso3 ?? "Unknown"
        if (index[iso3] > 0 && onCountryClick) {
          onCountryClick(iso3, name)
        }
      })

    // Labels - only show for countries with threats and large enough area
    gLabels
      .selectAll("text")
      .data(geojson.features)
      .join("text")
      .attr("class", "country-label")
      .attr("transform", (d: any) => {
        const centroid = (path as any).centroid(d)
        return `translate(${centroid[0]},${centroid[1]})`
      })
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("fontSize", (d: any) => {
        const iso3 = d.id ? String(d.id) : d.properties?.iso_a3 || d.properties?.iso3
        const val = index[iso3] || 0
        // Larger font for higher threats
        return val >= 500 ? "14px" : "11px"
      })
      .style("fontWeight", 700)
      .style("fill", "#fff")
      .style("stroke", "#000")
      .style("strokeWidth", 3)
      .style("paintOrder", "stroke")
      .style("pointerEvents", "none")
      .text((d: any) => {
        const iso3 = d.id ? String(d.id) : d.properties?.iso_a3 || d.properties?.iso3
        const val = index[iso3] || 0
        const b = (path as any).bounds(d)
        const area = (b[1][0] - b[0][0]) * (b[1][1] - b[0][1])
        // Only show labels for countries with threats and sufficient area
        if (val > 0 && area > 800) return d.properties?.name ?? ""
        return ""
      })

    // Zoom functionality
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => g.attr("transform", event.transform as any))

    svg.call(zoom as any)
  }, [geojson, index, width, height, color, onCountryClick])

  return (
    <div style={{ position: "relative", width, height, backgroundColor: "#ffffff", borderRadius: 8, border: "2px solid #d1d5db", overflow: "hidden" }}>
      <svg ref={svgRef} width={width} height={height} role="img" aria-label="Threat heat map" />
      {hover && mouse && (
        <div
          style={{
            position: "absolute",
            left: mouse[0] + 12,
            top: mouse[1] + 12,
            background: "rgba(255, 255, 255, 0.98)",
            color: "#000",
            padding: "8px 12px",
            borderRadius: 6,
            fontSize: 13,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            border: "2px solid #333",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            fontWeight: 600
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>{hover.name}</div>
          <div>Threats: <span style={{ color: "#ef4444", fontWeight: 700 }}>{hover.count.toLocaleString()}</span></div>
        </div>
      )}
    </div>
  )
}

export default MapChoropleth

