import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedNode,
  addSelectedNodes,
  removeSelectedNodes,
} from "../store/nodeStore";
import Simulator from "./Simulator";
import ControlPanel from "./ControlPanel";
import CloseIcon from "@mui/icons-material/Close";
import { io } from "socket.io-client";
import NetworkGraph from "../components/NetworkGraph";
import { IconButton, Snackbar } from "@mui/material";
import GraphScreen from "./GraphScreen";

const interpolateColor = (value) => {
  const r = Math.round(255 * (1 - value));
  const g = 0;
  const b = Math.round(255 * value);
  return `rgb(${r},${g},${b})`;
};

const socket = io("http://127.0.0.1:8000", { autoConnect: false });

function ThreeDimGraphScreen() {
  const dispatch = useDispatch();
  const selectedNode = useSelector((state) => state.selectedNode);

  const [open, setOpen] = useState(false);
  const [tempSelNodes, setTempSelNodes] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [nodes, setNodes] = useState([]); // backend-driven nodes
  const [edges, setEdges] = useState([]); // backend-driven edges
  const [nodeColors, setNodeColors] = useState({});
  const [flashes, setFlashes] = useState({}); // optional, for brightness/pulsing
  const latestValuesRef = React.useRef({ value: [], flash: [] });
  const pendingUpdateRef = React.useRef(null);

  useEffect(() => {
    dispatch(addSelectedNodes(tempSelNodes));
  }, [tempSelNodes, dispatch]);

  useEffect(() => {
    socket.on("connect", () => console.log("✅ Connected to backend"));
    socket.on("disconnect", () => console.log("❌ Disconnected"));

    const latestValuesRef = { value: [], flash: [] };
    let pendingUpdateRef = null;

    socket.on("node_update", (data) => {
      // store latest values
      latestValuesRef.value = data.value || [];
      latestValuesRef.flash = data.flash || [];

      // throttle updates to 1 second
      if (!pendingUpdateRef) {
        pendingUpdateRef = setTimeout(() => {
          const { value, flash } = latestValuesRef;

          // ⚡ update colors only (no positions)
          setNodeColors(() => {
            const minVal = Math.min(...value);
            const maxVal = Math.max(...value);
            const newColors = {};
            value.forEach((v, idx) => {
              newColors[idx] = interpolateColor(v, minVal, maxVal);
            });
            return newColors;
          });

          pendingUpdateRef = null;
        }, 1000);
      }
    });

    return () => {
      socket.off("node_update");
    };
  }, []);

  // ⚡ Fetch initial graph structure once
  useEffect(() => {
    fetch("http://127.0.0.1:8000/graph")
      .then((res) => res.json())
      .then((data) => {
        setNodes(data.nodes || []);
        setEdges(data.edges || []);
        console.log(data);
      })
      .catch((err) => console.error("Failed to fetch graph:", err));
  }, []);

  // ⚡ Start/Stop simulation
  const toggleSimulation = () => {
    if (isRunning) {
      fetch("http://127.0.0.1:8000/stop_simulation", { method: "POST" });
      socket.disconnect();
    } else {
      fetch("http://127.0.0.1:8000/start_simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Simulation started:", data.message);
          socket.connect();
        })
        .catch((err) => console.error("Failed to start simulation:", err));
    }
    setIsRunning(!isRunning);
  };

  const handleFrequencyChange = (nodeId, frequency) => {
    fetch("http://127.0.0.1:8000/set_frequencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId, frequency }),
    });
  };

  const handleNodeClick = (event) => {
    const nodeId = event.id;
    dispatch(setSelectedNode({ selectedNode: nodeId }));

    setTempSelNodes((prev) => {
      if (prev.includes(nodeId)) return prev.filter((id) => id !== nodeId);
      setOpen(true);
      return [...prev, nodeId];
    });
  };

  const handleNodeDelete = (nodeId) => {
    setTempSelNodes((prev) => prev.filter((id) => id !== nodeId));
    dispatch(removeSelectedNodes([nodeId]));
  };

  const handleNodeColor = (node) => nodeColors[node.id] || "gray";

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpen(false);
  };

  const action = (
    <IconButton
      size="small"
      aria-label="close"
      color="inherit"
      onClick={handleClose}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "80vw",
        padding: "0 10vw",
      }}
    >
      <NetworkGraph
        nodes={nodes}
        edges={edges}
        handleNodeClick={handleNodeClick}
        handleNodeColor={handleNodeColor}
      />
      <Simulator
        toggleInterval={toggleSimulation}
        handleFrequencyChange={handleFrequencyChange}
      />

      <div
        style={{
          width: "80vw",
          display: "grid",
          gridTemplateColumns: "repeat(3, 25vw)",
          gap: "1rem",
        }}
      >
        {selectedNode?.selectedNodes?.map((nodeId, i) => (
          <ControlPanel
            key={`ctrl-${i}`}
            handleNodeDelete={handleNodeDelete}
            nodeId={nodeId}
          />
        ))}
      </div>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        message={
          selectedNode.selectedNodes.length > 0
            ? `Node ${selectedNode.selectedNodes.join(", ")} selected`
            : "No nodes selected"
        }
        action={action}
      />
    </div>
  );
}

export default ThreeDimGraphScreen;
