import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Brain from "../../public/Brain";
import NetworkGraph from "./NetworkGraph";

const MyMesh = ({ handleNodeClick }) => {
  const modelRef = useRef();
  const graphRef = useRef();

  useFrame(() => {
    if (graphRef.current) {
      modelRef.current.position.copy(graphRef.current.position);
    }
  });
  return (
    <mesh>
      <ambientLight />
      <pointLight position={[0, 10, 10]} />
      <OrbitControls />
      <group  ref={modelRef}>
        <Brain />
      </group>
      <group  ref={graphRef}>
        <NetworkGraph handleNodeClick={handleNodeClick} />
      </group>
    </mesh>
  );
};

const SceneComponent = ({ handleNodeClick }) => {
  return (
    <>
    <Canvas         
    >
      <MyMesh handleNodeClick={handleNodeClick}></MyMesh>
    </Canvas>
    </>
   
  );
};

export default SceneComponent;
