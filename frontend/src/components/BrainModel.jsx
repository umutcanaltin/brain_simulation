import React, { Suspense,lazy } from "react";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Brain from "../../public/Brain"

function BrainModel() {
  return (
    <>
      <Canvas>
        <ambientLight></ambientLight>
        <OrbitControls></OrbitControls>
        <Suspense fallback={null}>
          <Brain></Brain>
        </Suspense>
      </Canvas>
    </>
  );
}

export default BrainModel;
