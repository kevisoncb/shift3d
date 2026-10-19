/**
 * Componente 3D Principal: `CarViewer3D` (React Three Fiber + Three.js) - Shift3D.
 *
 * Redesign Visual: Estilo Showroom de Concessionária Moderna (Clean Studio Lighting).
 * - Piso e ambiente em tom branco/gelo de estúdio fotográfico (`#F8FAFC`), sombras de contato
 *   suaves e acabamento automotivo metálico refinado nas peças.
 * - Etiquetas flutuantes (pills) minimalistas em fundo branco com tipografia escura e
 *   indicador azul corporativo quando selecionadas.
 * - Mantém 100% da lógica de Raycasting (`mesh_hood_01`, `mesh_engine_01`, `mesh_spark_plug`,
 *   `mesh_wheels`) e a interpolação suave das coordenadas XYZ no Modo Raio-X (Visão Explodida).
 */

"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows, Grid } from "@react-three/drei";
import * as THREE from "three";

export interface CustomMeshDefinition {
  mesh_name: string;
  name: string;
  explosion_vector: [number, number, number];
}

interface CarViewer3DProps {
  selectedMesh: string | null;
  isExploded: boolean;
  onSelectMesh: (meshName: string) => void;
  customMeshes?: CustomMeshDefinition[];
}

interface InteractivePartMeshProps {
  meshName: string;
  label: string;
  basePosition: [number, number, number];
  explosionOffset: [number, number, number];
  isExploded: boolean;
  isSelected: boolean;
  onSelect: (meshName: string) => void;
  children: React.ReactNode;
}

/**
 * Grupo interativo para cada peça clicável do veículo com animação vetorial suave (lerp).
 */
function InteractivePartGroup({
  meshName,
  label,
  basePosition,
  explosionOffset,
  isExploded,
  isSelected,
  onSelect,
  children,
}: InteractivePartMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const targetX = basePosition[0] + (isExploded ? explosionOffset[0] : 0);
    const targetY = basePosition[1] + (isExploded ? explosionOffset[1] : 0);
    const targetZ = basePosition[2] + (isExploded ? explosionOffset[2] : 0);

    const smoothing = Math.min(1, delta * 6.5);
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, smoothing);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, smoothing);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, smoothing);
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(meshName);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  return (
    <group
      ref={groupRef}
      name={meshName}
      position={basePosition}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {children}

      {/* Etiqueta Minimalista Corporativa Flutuante */}
      {(hovered || isSelected || isExploded) && (
        <Html distanceFactor={8} position={[0, 0.45, 0]} center zIndexRange={[10, 0]}>
          <button
            type="button"
            onClick={() => onSelect(meshName)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold tracking-tight transition-all shadow-sm ${
              isSelected
                ? "border-blue-600 bg-blue-600 text-white shadow-md scale-105"
                : hovered
                ? "border-blue-400 bg-white text-blue-700 shadow-md scale-105"
                : "border-slate-200/90 bg-white/95 text-slate-700 hover:border-slate-300"
            }`}
          >
            {label}
          </button>
        </Html>
      )}
    </group>
  );
}

/**
 * Cena 3D da BMW X1 em acabamento metálico de Showroom Claro.
 */
function BmwX1StudioScene({
  selectedMesh,
  isExploded,
  onSelectMesh,
  customMeshes = [],
}: CarViewer3DProps) {
  const getMaterialProps = (
    meshName: string,
    defaultColor: string,
    isExteriorCover = false
  ) => {
    const isSelected = selectedMesh === meshName;
    return {
      color: isSelected ? "#2563EB" : defaultColor,
      emissive: isSelected ? "#1D4ED8" : "#000000",
      emissiveIntensity: isSelected ? 0.25 : 0.0,
      metalness: 0.55,
      roughness: 0.28,
      transparent: isExploded && isExteriorCover,
      opacity: isExploded && isExteriorCover ? 0.45 : 1.0,
    };
  };

  return (
    <group position={[0, 0.55, 0]}>
      {/* Chassi de Referência Limpo em Prata Acetinado */}
      <group>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.95, 0.22, 4.35]} />
          <meshStandardMaterial
            color="#E2E8F0"
            metalness={0.35}
            roughness={0.45}
            transparent
            opacity={isExploded ? 0.35 : 0.9}
          />
        </mesh>

        <mesh position={[0, 0.85, -0.35]}>
          <boxGeometry args={[1.75, 0.82, 2.35]} />
          <meshStandardMaterial
            color="#CBD5E1"
            metalness={0.4}
            roughness={0.2}
            transparent
            opacity={isExploded ? 0.18 : 0.35}
            wireframe={isExploded}
          />
        </mesh>

        {/* Grade Duplo Rim Frontal */}
        <mesh position={[-0.28, 0.48, 2.19]}>
          <boxGeometry args={[0.42, 0.28, 0.05]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.28, 0.48, 2.19]}>
          <boxGeometry args={[0.42, 0.28, 0.05]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* 1. CAPÔ DIANTEIRO (mesh_hood_01) */}
      <InteractivePartGroup
        meshName="mesh_hood_01"
        label="Capô Dianteiro"
        basePosition={[0, 0.68, 1.38]}
        explosionOffset={[0, 1.55, 0.45]}
        isExploded={isExploded}
        isSelected={selectedMesh === "mesh_hood_01"}
        onSelect={onSelectMesh}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.82, 0.12, 1.48]} />
          <meshStandardMaterial {...getMaterialProps("mesh_hood_01", "#94A3B8", true)} />
        </mesh>
      </InteractivePartGroup>

      {/* 2. MOTOR 2.0 TWINPOWER TURBO (mesh_engine_01) */}
      <InteractivePartGroup
        meshName="mesh_engine_01"
        label="Motor 2.0 Turbo"
        basePosition={[0, 0.42, 1.35]}
        explosionOffset={[0, 0.35, 0]}
        isExploded={isExploded}
        isSelected={selectedMesh === "mesh_engine_01"}
        onSelect={onSelectMesh}
      >
        <mesh castShadow>
          <boxGeometry args={[0.92, 0.46, 0.78]} />
          <meshStandardMaterial {...getMaterialProps("mesh_engine_01", "#475569")} />
        </mesh>
        <mesh position={[0, 0.26, 0]}>
          <boxGeometry args={[0.78, 0.08, 0.65]} />
          <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.25} />
        </mesh>
      </InteractivePartGroup>

      {/* 3. JOGO DE VELAS LASER IRIDIUM (mesh_spark_plug) */}
      <InteractivePartGroup
        meshName="mesh_spark_plug"
        label="Velas de Ignição"
        basePosition={[0, 0.58, 1.35]}
        explosionOffset={[0, 1.05, -0.15]}
        isExploded={isExploded}
        isSelected={selectedMesh === "mesh_spark_plug"}
        onSelect={onSelectMesh}
      >
        {[-0.27, -0.09, 0.09, 0.27].map((xOffset, idx) => (
          <group key={idx} position={[xOffset, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.045, 0.045, 0.28, 16]} />
              <meshStandardMaterial
                color={selectedMesh === "mesh_spark_plug" ? "#2563EB" : "#FFFFFF"}
                metalness={0.2}
                roughness={0.15}
              />
            </mesh>
            <mesh position={[0, -0.16, 0]}>
              <cylinderGeometry args={[0.032, 0.025, 0.14, 16]} />
              <meshStandardMaterial color="#D97706" metalness={0.85} roughness={0.2} />
            </mesh>
          </group>
        ))}
      </InteractivePartGroup>

      {/* 4. CONJUNTO DE RODAS & SENSORES (mesh_wheels) */}
      <InteractivePartGroup
        meshName="mesh_wheels"
        label="Rodas Aro 19 & Sensores"
        basePosition={[0, 0.05, 0]}
        explosionOffset={[0, -0.15, 0]}
        isExploded={isExploded}
        isSelected={selectedMesh === "mesh_wheels"}
        onSelect={onSelectMesh}
      >
        {[
          { pos: [-1.05, 0, 1.35] as [number, number, number], expX: -0.65 },
          { pos: [1.05, 0, 1.35] as [number, number, number], expX: 0.65 },
          { pos: [-1.05, 0, -1.35] as [number, number, number], expX: -0.65 },
          { pos: [1.05, 0, -1.35] as [number, number, number], expX: 0.65 },
        ].map((wheel, idx) => (
          <group
            key={idx}
            position={[
              wheel.pos[0] + (isExploded ? wheel.expX : 0),
              wheel.pos[1],
              wheel.pos[2],
            ]}
          >
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.28, 28]} />
              <meshStandardMaterial {...getMaterialProps("mesh_wheels", "#1E293B")} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.27, 0.27, 0.3, 16]} />
              <meshStandardMaterial
                color={selectedMesh === "mesh_wheels" ? "#3B82F6" : "#E2E8F0"}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          </group>
        ))}
      </InteractivePartGroup>

      {/* 5. PEÇAS EXTRAS CADASTRADAS VIA BACKOFFICE (/admin) */}
      {customMeshes.map((custom, index) => (
        <InteractivePartGroup
          key={custom.mesh_name}
          meshName={custom.mesh_name}
          label={custom.name}
          basePosition={[0, 0.55 + index * 0.25, -1.45]}
          explosionOffset={custom.explosion_vector || [0, 1.1, -0.8]}
          isExploded={isExploded}
          isSelected={selectedMesh === custom.mesh_name}
          onSelect={onSelectMesh}
        >
          <mesh castShadow>
            <octahedronGeometry args={[0.28, 1]} />
            <meshStandardMaterial
              color={selectedMesh === custom.mesh_name ? "#2563EB" : "#0D9488"}
              metalness={0.5}
              roughness={0.25}
            />
          </mesh>
        </InteractivePartGroup>
      ))}
    </group>
  );
}

/**
 * Componente Principal Exportado `CarViewer3D` com Iluminação Clara de Showroom.
 */
export function CarViewer3D(props: CarViewer3DProps) {
  return (
    <div className="relative h-full w-full select-none overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white via-slate-50 to-slate-100/80 shadow-sm">
      <Canvas
        shadows
        camera={{ position: [3.6, 2.4, 4.2], fov: 40 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#F8FAFC"]} />
        <fog attach="fog" args={["#F8FAFC", 10, 24]} />

        {/* Iluminação de Estúdio Limpa e Equilibrada */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 10, 6]} intensity={1.4} castShadow />
        <directionalLight position={[-6, 6, -4]} intensity={0.7} color="#E0F2FE" />

        {/* Modelo 3D Procedural Interativo */}
        <BmwX1StudioScene {...props} />

        {/* Grade de Engenharia Sutil em Cinza Claro */}
        <Grid
          position={[0, -0.02, 0]}
          args={[18, 18]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#E2E8F0"
          sectionSize={2.5}
          sectionThickness={1}
          sectionColor="#CBD5E1"
          fadeDistance={14}
          fadeStrength={1}
        />

        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.35}
          scale={10}
          blur={2.4}
          far={4}
        />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={2.2}
          maxDistance={9.5}
          maxPolarAngle={Math.PI / 2 - 0.04}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />
      </Canvas>
    </div>
  );
}
