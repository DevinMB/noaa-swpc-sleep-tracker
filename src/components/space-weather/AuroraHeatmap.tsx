"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";

interface AuroraHeatmapProps {
  data: {
    "Observation Time": string;
    "Forecast Time": string;
    coordinates: [number, number, number][];
  } | null;
}

// We'll load world-110m from a CDN since it's a standard dataset
const WORLD_TOPO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export function AuroraHeatmap({ data }: AuroraHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = width * 0.5;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 5.5)
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Background
    svg
      .append("rect")
      .attr("width", width)
      .attr("height", height)
      .attr("fill", "#0a0a1a");

    // Graticule (grid lines)
    const graticule = d3.geoGraticule10();
    svg
      .append("path")
      .datum(graticule)
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgba(124, 58, 237, 0.08)")
      .attr("stroke-width", 0.5);

    // Load world map
    fetch(WORLD_TOPO_URL)
      .then((res) => res.json())
      .then((worldData: Topology) => {
        const countries = feature(
          worldData,
          worldData.objects.countries as Parameters<typeof feature>[1]
        );

        // Draw countries
        svg
          .append("g")
          .selectAll("path")
          .data((countries as GeoJSON.FeatureCollection).features)
          .join("path")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .attr("d", path as any)
          .attr("fill", "#1e1a3f")
          .attr("stroke", "rgba(124, 58, 237, 0.2)")
          .attr("stroke-width", 0.5);

        // Draw aurora data points
        if (data.coordinates && data.coordinates.length > 0) {
          // Downsample to every 5th point for performance
          const step = 5;
          const filtered = data.coordinates.filter(
            (_, i) => i % step === 0 && _[2] > 2
          );

          // Color scale: green -> purple for aurora intensity
          const maxIntensity = d3.max(filtered, (d) => d[2]) || 20;
          const colorScale = d3
            .scaleSequential(d3.interpolateGnBu)
            .domain([0, maxIntensity]);

          svg
            .append("g")
            .selectAll("circle")
            .data(filtered)
            .join("circle")
            .attr("cx", (d) => {
              const coords = projection([d[0], d[1]]);
              return coords ? coords[0] : 0;
            })
            .attr("cy", (d) => {
              const coords = projection([d[0], d[1]]);
              return coords ? coords[1] : 0;
            })
            .attr("r", 2)
            .attr("fill", (d) => colorScale(d[2]))
            .attr("opacity", (d) => Math.min(d[2] / maxIntensity + 0.2, 0.9))
            .style("filter", (d) =>
              d[2] > maxIntensity * 0.6 ? "blur(1px)" : "none"
            );
        }
      })
      .catch((err) => {
        console.error("Failed to load world map:", err);
        svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", height / 2)
          .attr("text-anchor", "middle")
          .attr("fill", "#a78bfa60")
          .text("Failed to load map data");
      });
  }, [data]);

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-cosmic-300/40">
        No aurora data available
      </div>
    );
  }

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full" />
      <div className="mt-2 flex items-center justify-between text-xs text-cosmic-300/50">
        <span>Observation: {data["Observation Time"]}</span>
        <div className="flex items-center gap-2">
          <span>Low</span>
          <div className="h-2 w-24 rounded-full bg-gradient-to-r from-green-900 via-teal-500 to-blue-300" />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}
