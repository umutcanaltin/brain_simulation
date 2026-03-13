import { Html } from "@react-three/drei";
import React, { useEffect, useRef } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";

const extraRenderers = [new CSS2DRenderer()];

function NetworkGraph({ nodes, edges, handleNodeClick, handleNodeColor }) {
  const fgRef = useRef();
  const graphDataRef = useRef({ nodes: [], links: [] });

  // Initialize positions once
  useEffect(() => {
    if (nodes.length === 0) return;

    const spacing = 50; // space between nodes to prevent overlap
    const radius = 100; // for spherical layout
    const n = nodes.length;

    // fixed positions on a sphere
    graphDataRef.current.nodes = nodes.map((node, i) => {
      const phi = Math.acos(-1 + (2 * i) / n); // latitude
      const theta = Math.sqrt(n * Math.PI) * phi; // longitude
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      return {
        ...node,
        x,
        y,
        z,
        color: "gray",
      };
    });

    // ensure link sources/targets match node IDs exactly
    graphDataRef.current.links = edges.map(([source, target]) => ({
      source: graphDataRef.current.nodes.find((n) => n.id === source),
      target: graphDataRef.current.nodes.find((n) => n.id === target),
    }));

    // fix link distance
    if (fgRef.current) fgRef.current.d3Force("link").distance(40);
  }, [nodes, edges]);

  // Update colors only
  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    nodes.forEach((node, idx) => {
      if (graphDataRef.current.nodes[idx]) {
        graphDataRef.current.nodes[idx].color = handleNodeColor(node);
      }
    });

    fgRef.current?.refresh();
  }, [nodes, handleNodeColor]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <ForceGraph3D
        ref={fgRef}
        enableNodeDrag={false}
        autoPauseRedraw={false}
        backgroundColor="white"
        nodeColor={(node) => node.color || "gray"}
        linkColor={() => "#000000"}
        nodeRelSize={6}
        width={1400}
        height={600}
        graphData={graphDataRef.current}
        onNodeClick={handleNodeClick}
        extraRenderers={extraRenderers}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        nodeThreeObject={(node) => {
          const nodeEl = document.createElement("div");
          nodeEl.textContent = node.id;
          nodeEl.style.color = "white";
          nodeEl.className = "node-label";
          return new CSS2DObject(nodeEl);
        }}
        nodeThreeObjectExtend={true}
      />
   <div
  style={{
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80%",
    maxWidth: "600px",
    height: "16px",
    borderRadius: "8px",
    background: "linear-gradient(to right, #ff0000, #0000ff)",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 4px",
    fontFamily: "Arial, sans-serif",
    fontSize: "12px",
    color: "#fff",
    userSelect: "none",
  }}
>
  <span>Min</span>
  <span style={{ fontWeight: "bold" }}>Mid</span>
  <span>Max</span>
</div>
    </div>
  );
}

export default NetworkGraph;