"use client";

import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  Bounds,
  Center,
  Html,
} from "@react-three/drei";
import * as THREE from "three";

type Props = {
  /** e.g. "/models/the_ring_1_carat.glb" (must live under /public) */
  path: string;
};

/** Loads the GLB and applies safe material tweaks. */
function Model({ path }: { path: string }) {
  const gltf = useGLTF(path);

  // ✅ SAFE material adjustment (no shader crashes)
  gltf.scene.traverse((obj) => {
    // only meshes have materials
    // @ts-ignore
    if (!obj.isMesh) return;
    const mat: any = (obj as any).material;

    // If the GLB already uses a Physical material, it's safe to set transmission/ior
    if (mat?.isMeshPhysicalMaterial) {
      const lower = (obj.name || "").toLowerCase();
      const isDiamond = lower.includes("diamond") || mat.ior !== undefined;

      if (isDiamond) {
        mat.transmission = 0.95;       // allow light through (diamond look)
        mat.ior = 2.4;                 // index of refraction for diamond
        mat.thickness = mat.thickness ?? 1.0;
        mat.roughness = 0.02;
        mat.metalness = 0.0;
        mat.envMapIntensity = 1.25;
      } else {
        // gentle polish
        mat.roughness = mat.roughness ?? 0.2;
        mat.metalness = mat.metalness ?? 0.85;
      }
      mat.needsUpdate = true;
      return; // don't fall through
    }

    // If it's a Standard material, DO NOT set transmission/ior/thickness
    if (mat?.isMeshStandardMaterial) {
      if (mat.metalness == null) mat.metalness = 0.85;
      if (mat.roughness == null) mat.roughness = 0.2;
      mat.needsUpdate = true;
    }
  });

  // Center moves the model to origin; Bounds will then frame it perfectly.
  return (
    <Center>
      <primitive object={gltf.scene} />
    </Center>
  );
}

// (Optional) Preload a frequent path to avoid a first-frame pop
// useGLTF.preload("/models/the_ring_1_carat.glb");

export default function ModelViewer({ path }: Props) {
  return (
    <Canvas
      style={{ width: "100%", height: 520 }}             // ensure visible height
      dpr={[1, 2]}
      camera={{ fov: 45, position: [0, 0.35, 2.2] }}
    >
      {/* Soft lights + reflections suited for jewelry */}
      <hemisphereLight intensity={0.6} />
      <directionalLight position={[2, 3, 2]} intensity={1.2} />
      <directionalLight position={[-2, -1, -2]} intensity={0.6} />

      <Suspense
        fallback={
          <Html
            center
            style={{
              fontFamily: "system-ui",
              background: "#fff8",
              padding: "6px 10px",
              borderRadius: 8,
            }}
          >
            Loading 3D model…
          </Html>
        }
      >
        {/* Bounds observes size and frames the model in view automatically */}
        <Bounds fit clip observe margin={1.2}>
          <Model path={path} />
          <OrbitControls makeDefault enableDamping autoRotate autoRotateSpeed={0.6} />
        </Bounds>

        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
