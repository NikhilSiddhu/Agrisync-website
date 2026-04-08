"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointMaterial } from "@react-three/drei";
import { useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

function Terrain() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(28, 28, 32, 32);
    geo.rotateX(-Math.PI / 2);
    const positions = geo.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      const wave = Math.sin(x * 0.45) * 0.08 + Math.cos(z * 0.35) * 0.08;
      const micro = Math.sin((x + z) * 0.9) * 0.04;
      positions.setY(i, wave + micro);
    }
    positions.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow position={[0, -0.55, 0]}>
      <meshStandardMaterial
        color="#101010"
        wireframe
        emissive="#0b0b0b"
        metalness={0.35}
        roughness={0.75}
      />
    </mesh>
  );
}

function SensorNode() {
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const pulse = (Math.sin(clock.getElapsedTime() * 2.4) + 1) / 2;
    lightRef.current.intensity = 0.8 + pulse * 1.7;
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh castShadow position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.22, 0.32, 0.6, 20]} />
        <meshStandardMaterial color="#2f2f2f" metalness={0.92} roughness={0.25} />
      </mesh>
      <mesh castShadow position={[0, 0.78, 0]}>
        <sphereGeometry args={[0.24, 18, 18]} />
        <meshStandardMaterial color="#0f1f12" emissive="#00ff41" emissiveIntensity={0.34} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 0.78, 0]} color="#00FF41" distance={5.8} decay={2} />
    </group>
  );
}

function CropDataParticles() {
  const particleCount = 380;

  const { positions, colors } = useMemo(() => {
    const p = new Float32Array(particleCount * 3);
    const c = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i += 1) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 24;
      const z = (Math.random() - 0.5) * 24;
      const y = Math.sin(x * 0.28) * 0.05 + Math.cos(z * 0.24) * 0.05 + (Math.random() - 0.5) * 0.12;

      p[i3] = x;
      p[i3 + 1] = y;
      p[i3 + 2] = z;

      const distance = Math.sqrt(x * x + z * z);
      const healthy = Math.max(0, 1 - distance / 8);
      c[i3] = healthy > 0.32 ? 0 : 1;
      c[i3 + 1] = healthy > 0.32 ? 1 : 0.33;
      c[i3 + 2] = healthy > 0.32 ? 0.25 : 0;
    }

    return { positions: p, colors: c };
  }, [particleCount]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const flicker = 0.72 + Math.sin(clock.getElapsedTime() * 2) * 0.22;
    const material = pointsRef.current.material as THREE.PointsMaterial;
    material.opacity = flicker;
  });

  return (
    <points ref={pointsRef} position={[0, 0, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
      </bufferGeometry>
      <PointMaterial vertexColors transparent size={0.07} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function CameraRig() {
  const { camera, size } = useThree();
  const { scrollYProgress } = useScroll();
  const progressSpring = useSpring(scrollYProgress, {
    damping: 24,
    stiffness: 130,
    mass: 0.3,
  });
  const progressRef = useRef(0);

  useMotionValueEvent(progressSpring, "change", (latest) => {
    progressRef.current = latest;
  });

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = size.width < 768 ? 68 : 54;
    cam.updateProjectionMatrix();
  }, [camera, size.width]);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const t = progressRef.current;
    const target = new THREE.Vector3(0, 0.55, 0);

    cam.position.x = THREE.MathUtils.lerp(0.6, 0.1, t);
    cam.position.y = THREE.MathUtils.lerp(6.4, 2.2, t);
    cam.position.z = THREE.MathUtils.lerp(17.5, 4.3, t);
    cam.lookAt(target);
  });

  return null;
}

export function SceneBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0.6, 6.4, 17.5], fov: 54 }}>
        <color attach="background" args={["#0A0A0A"]} />
        <ambientLight intensity={0.22} />
        <directionalLight
          castShadow
          position={[6, 8, 5]}
          intensity={1.15}
          color="#b0b0b0"
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Terrain />
        <SensorNode />
        <CropDataParticles />
        <CameraRig />
      </Canvas>
    </div>
  );
}
