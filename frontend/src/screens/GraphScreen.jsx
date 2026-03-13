import React, { useEffect, useMemo, useRef, useState } from "react";
import Graph from "react-graph-vis";
import { io } from "socket.io-client";

// Socket: do NOT auto-connect; we control it
const socket = io("http://127.0.0.1:8000", { autoConnect: false });

// Red→Blue interpolation by value in [0,1]
const colorFromValue = (t) => {
  // t in [0,1]: 0 -> red, 1 -> blue
  const r = Math.round(255 * (1 - t));
  const g = 0;
  const b = Math.round(255 * t);
  return `rgb(${r},${g},${b})`;
};

export default function GraphScreen() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // live visual state arrived from backend
  const valueRef = useRef([]); // for color mapping [0..1]
  const flashRef = useRef([]); // for pulsing [0..1]

  // Vis-network wants nodes/edges arrays
  const graph = useMemo(() => {
    const decorated = nodes.map((n, idx) => {
      const val = valueRef.current[idx] ?? 0;
      const flash = flashRef.current[idx] ?? 0;

      // flash controls size (pulse), value controls color
      const baseSize = 20;
      const size = baseSize + 10 * flash;

      return {
        id: n.id,
        label: `Node ${n.id}`,
        color: {
          background: colorFromValue(val),
          border: "#222",
          highlight: { background: colorFromValue(val), border: "#000" },
        },
        font: { color: "#111", size: 14 },
        shape: "dot",
        size,
      };
    });

    const visEdges = edges.map(([u, v], i) => ({
      id: "e" + i,
      from: u,
      to: v,
      arrows: "to",
      width: 2,
      color: "#999",
      physics: false,
      smooth: false,
    }));

    return { nodes: decorated, edges: visEdges };
  }, [nodes, edges]); // recompute visuals when topology changes

  const options = {
    layout: { hierarchical: false },
    physics: { enabled: false },
    interaction: {
      zoomView: false,
      dragView: false,
      dragNodes: false,
    },
    height: "700px",
    width: "1000px",
  };

  // Load graph topology from backend
  useEffect(() => {
    (async () => {
      const res = await fetch("http://127.0.0.1:8000/graph");
      const data = await res.json();
      // Expect { n, nodes: [{id}], edges: [[u,v], ...] }
      setNodes(data.nodes);
      setEdges(data.edges);
      valueRef.current = Array(data.n).fill(0);
      flashRef.current = Array(data.n).fill(0);
    })();
  }, []);

  // Socket listeners (but we connect only when running)
  useEffect(() => {
    const onUpdate = (payload) => {
      // payload: { phase:[], flash:[], value:[] }
      // Store latest arrays in refs so color/size reflect live data
      if (Array.isArray(payload.value)) valueRef.current = payload.value;
      if (Array.isArray(payload.flash)) flashRef.current = payload.flash;

      // Trigger a re-render by touching nodes array (cheap trick)
      setNodes((prev) => [...prev]);
    };

    socket.on("connect", () => console.log("Socket connected"));
    socket.on("disconnect", () => console.log("Socket disconnected"));
    socket.on("node_update", onUpdate);

    return () => {
      socket.off("node_update", onUpdate);
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const start = async () => {
    // you can POST /graph and /params here first if you want to change topology/params
    await fetch("http://127.0.0.1:8000/start_simulation", { method: "POST" });
    socket.connect();
    setIsRunning(true);
  };

  const stop = async () => {
    await fetch("http://127.0.0.1:8000/stop_simulation", { method: "POST" });
    socket.disconnect();
    setIsRunning(false);
  };

  return (
    <div style={{ display: "flex", gap: 24 }}>
      <div>
        {/* <Graph graph={graph} options={options} /> */}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={isRunning ? stop : start}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          {isRunning ? "Stop Simulation" : "Start Simulation"}
        </button>

        {/* Example: change topology dynamically */}
        <button
          onClick={async () => {
            // Example ring graph with N nodes
            const N = 16;
            const edges = [];
            for (let i = 0; i < N; i++) edges.push([i, (i + 1) % N]);
            await fetch("http://127.0.0.1:8000/graph", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ n: N, edges, directed: false }),
            });
            // reload topology
            const res = await fetch("http://127.0.0.1:8000/graph");
            const data = await res.json();
            setNodes(data.nodes);
            setEdges(data.edges);
            console.log(edges);
            
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Load Ring Topology
        </button>

        {/* Example: tune params */}
        <button
          onClick={async () => {
            const N = nodes.length || 16;
            const omega = Array.from({ length: N }, (_, i) => 1.0 + i / N);
            await fetch("http://127.0.0.1:8000/params", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ K: 2.0, dt: 0.01, omega }),
            });
          }}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Set Params (K, dt, ω)
        </button>
      </div>
    </div>
  );
}