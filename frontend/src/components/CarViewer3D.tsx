/**
 * Componente 3D Principal: `CarViewer3D` (React Three Fiber + Three.js) - Shift3D.
 *
 * Interatividade de Alto Padrão Estilo Configurador Automotivo:
 * 1. Taxonomia Base Universal de Peças Fixas:
 *    - `mesh_hood_01` (Capô dianteiro aerodinâmico)
 *    - `mesh_front_bumper` (Para-choque dianteiro M Sport & Sensores PDC)
 *    - `mesh_headlights` (Conjunto de Faróis Full LED Adaptativos)
 *    - `mesh_doors` (Conjunto de Portas Laterais Esquerda/Direita)
 *    - `mesh_wheels` (Conjunto das 4 Rodas Esportivas Aro 19" & Sensores ABS/TPMS)
 *    - `mesh_engine_01` (Bloco do Motor 2.0 TwinPower Turbo B48)
 *    - `mesh_spark_plug` (Jogo de Velas Laser Iridium com equivalência Fiat)
 *    - Suporte extensível a malhas dinâmicas (`customMeshes`) cadastradas no `/admin`.
 * 2. Estados Visuais e Raycasting Fluido:
 *    - Hover (`onPointerOver`): Altera suavemente a cor/emissão da peça sob o cursor (brilho azul claro `#38BDF8`)
 *      para indicar interatividade instantaneamente.
 *    - Seleção & Elevação (`selectedMesh === meshName`): Desloca suavemente a peça selecionada para cima /
 *      para fora do eixo do carro (`selectionVector`) com interpolação linear (`THREE.MathUtils.lerp`).
 *    - Foco Translúcido nas Demais Peças: Quando uma peça está selecionada, todas as outras peças do
 *      veículo reduzem sua opacidade (`opacity: 0.32`), focando 100% da atenção na peça inspecionada.
 *    - Sincronização Instantânea: Ao clicar em outra peça, a anterior retorna suavemente à sua coordenada
 *      original e a nova peça se eleva, atualizando o Drawer lateral em tempo real.
 */

"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows, Grid } from "@react-three/drei";
import * as THREE from "three";

export const BASE_UNIVERSAL_MESHES = [
  "mesh_hood_01",
  "mesh_front_bumper",
  "mesh_headlights",
  "mesh_doors",
  "mesh_wheels",
  "mesh_engine_01",
  "mesh_spark_plug",
] as const;

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
  selectionOffset: [number, number, number];
  isExploded: boolean;
  selectedMesh: string | null;
  hoveredMesh: string | null;
  onHoverChange: (meshName: string | null) => void;
  onSelect: (meshName: string) => void;
  children: React.ReactNode;
}

/**
 * Grupo 3D modular que aplica interpolação suave (`lerp`) combinando:
 * - Posição Base (`basePosition`)
 * - Vetor de Explosão Raio-X (`explosionOffset` quando `isExploded === true`)
 * - Vetor de Elevação Individual de Clique (`selectionOffset` quando `selectedMesh === meshName`)
 */
function InteractivePartGroup({
  meshName,
  label,
  basePosition,
  explosionOffset,
  selectionOffset,
  isExploded,
  selectedMesh,
  hoveredMesh,
  onHoverChange,
  onSelect,
  children,
}: InteractivePartMeshProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isSelected = selectedMesh === meshName;
  const isHovered = hoveredMesh === meshName;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Soma o deslocamento do Modo Raio-X + Elevação suave de seleção individual + leve pulso de hover
    const hoverLiftY = isHovered && !isSelected ? 0.05 : 0;

    const targetX =
      basePosition[0] +
      (isExploded ? explosionOffset[0] : 0) +
      (isSelected ? selectionOffset[0] : 0);
    const targetY =
      basePosition[1] +
      (isExploded ? explosionOffset[1] : 0) +
      (isSelected ? selectionOffset[1] : 0) +
      hoverLiftY;
    const targetZ =
      basePosition[2] +
      (isExploded ? explosionOffset[2] : 0) +
      (isSelected ? selectionOffset[2] : 0);

    const smoothing = Math.min(1, delta * 7.5);
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      targetX,
      smoothing
    );
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      smoothing
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      targetZ,
      smoothing
    );
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(meshName);
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHoverChange(meshName);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (hoveredMesh === meshName) {
      onHoverChange(null);
    }
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

      {/* Etiqueta Flutuante Limpa estilo Configurador Automotivo */}
      {(isHovered || isSelected || isExploded) && (
        <Html distanceFactor={8} position={[0, 0.45, 0]} center zIndexRange={[10, 0]}>
          <button
            type="button"
            onClick={() => onSelect(meshName)}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-semibold tracking-tight transition-all shadow-sm ${
              isSelected
                ? "border-blue-600 bg-blue-600 text-white shadow-md scale-105"
                : isHovered
                ? "border-sky-400 bg-white text-blue-600 shadow-md scale-105"
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
 * Cena do Configurador 3D com a Taxonomia Base Universal de Peças Fixas + Malhas Dinâmicas.
 */
function BmwX1ConfiguratorScene({
  selectedMesh,
  isExploded,
  onSelectMesh,
  customMeshes = [],
}: CarViewer3DProps) {
  const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);
  const hasAnySelection = Boolean(selectedMesh);

  /**
   * Calcula dinamicamente o material de cada peça considerando:
   * 1. Estado de Seleção (`selectedMesh === meshName`): Destaque azul corporativo `#2563EB` e opacidade 100%.
   * 2. Estado de Hover (`hoveredMesh === meshName`): Brilho azul claro `#38BDF8` e emissão suave.
   * 3. Estado Translúcido de Foco (`hasAnySelection && !isSelected`): Reduz opacidade para `0.30`
   *    para destacar exclusivamente a peça clicada pelo usuário!
   */
  const getInteractiveMaterial = (
    meshName: string,
    defaultColor: string,
    isExteriorCover = false
  ) => {
    const isSelected = selectedMesh === meshName;
    const isHovered = hoveredMesh === meshName;
    const shouldDimOtherParts = hasAnySelection && !isSelected && !isHovered;

    let color = defaultColor;
    let emissive = "#000000";
    let emissiveIntensity = 0;

    if (isSelected) {
      color = "#2563EB";
      emissive = "#1D4ED8";
      emissiveIntensity = 0.35;
    } else if (isHovered) {
      color = "#38BDF8";
      emissive = "#0284C7";
      emissiveIntensity = 0.25;
    }

    const transparent = shouldDimOtherParts || (isExploded && isExteriorCover);
    const opacity = shouldDimOtherParts
      ? 0.28
      : isExploded && isExteriorCover
      ? 0.45
      : 1.0;

    return {
      color,
      emissive,
      emissiveIntensity,
      metalness: 0.55,
      roughness: 0.26,
      transparent,
      opacity,
    };
  };

  return (
    <group position={[0, 0.55, 0]}>
      {/* Estrutura Base / Monobloco de Referência (Fica translúcida quando há peça selecionada) */}
      <group>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[1.9, 0.2, 4.1]} />
          <meshStandardMaterial
            color="#E2E8F0"
            metalness={0.35}
            roughness={0.45}
            transparent
            opacity={hasAnySelection || isExploded ? 0.22 : 0.85}
          />
        </mesh>
        <mesh position={[0, 0.88, -0.35]}>
          <boxGeometry args={[1.72, 0.78, 2.25]} />
          <meshStandardMaterial
            color="#CBD5E1"
            metalness={0.4}
            roughness={0.2}
            transparent
            opacity={hasAnySelection || isExploded ? 0.14 : 0.32}
            wireframe={isExploded}
          />
        </mesh>
      </group>

      {/* =====================================================================
          1. CAPÔ DIANTEIRO (mesh_hood_01)
         ===================================================================== */}
      <InteractivePartGroup
        meshName="mesh_hood_01"
        label="Capô Dianteiro"
        basePosition={[0, 0.68, 1.32]}
        explosionOffset={[0, 1.45, 0.25]}
        selectionOffset={[0, 0.55, 0.15]}
        isExploded={isExploded}
        selectedMesh={selectedMesh}
        hoveredMesh={hoveredMesh}
        onHoverChange={setHoveredMesh}
        onSelect={onSelectMesh}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.78, 0.11, 1.42]} />
          <meshStandardMaterial {...getInteractiveMaterial("mesh_hood_01", "#94A3B8", true)} />
        </mesh>
      </InteractivePartGroup>

      {/* =====================================================================
          2. PARA-CHOQUE DIANTEIRO M SPORT (mesh_front_bumper)
         ===================================================================== */}
      <InteractivePartGroup
        meshName="mesh_front_bumper"
        label="Para-choque Dianteiro"
        basePosition={[0, 0.34, 2.12]}
        explosionOffset={[0, 0.05, 1.15]}
        selectionOffset={[0, 0.18, 0.55]}
        isExploded={isExploded}
        selectedMesh={selectedMesh}
        hoveredMesh={hoveredMesh}
        onHoverChange={setHoveredMesh}
        onSelect={onSelectMesh}
      >
        <mesh castShadow>
          <boxGeometry args={[1.88, 0.38, 0.26]} />
          <meshStandardMaterial {...getInteractiveMaterial("mesh_front_bumper", "#64748B")} />
        </mesh>
        {/* Grade Duplo Rim Frontal Integrada */}
        <mesh position={[-0.28, 0.08, 0.14]}>
          <boxGeometry args={[0.38, 0.2, 0.04]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.28, 0.08, 0.14]}>
          <boxGeometry args={[0.38, 0.2, 0.04]} />
          <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.2} />
        </mesh>
      </InteractivePartGroup>

      {/* =====================================================================
          3. CONJUNTO DE FARÓIS FULL LED (mesh_headlights)
         ===================================================================== */}
      <InteractivePartGroup
        meshName="mesh_headlights"
        label="Faróis Full LED"
        basePosition={[0, 0.58, 2.05]}
        explosionOffset={[0, 0.35, 0.95]}
        selectionOffset={[0, 0.32, 0.45]}
        isExploded={isExploded}
        selectedMesh={selectedMesh}
        hoveredMesh={hoveredMesh}
        onHoverChange={setHoveredMesh}
        onSelect={onSelectMesh}
      >
        {/* Farol Esquerdo */}
        <mesh position={[-0.68, 0, 0]} castShadow>
          <boxGeometry args={[0.36, 0.16, 0.24]} />
          <meshStandardMaterial {...getInteractiveMaterial("mesh_headlights", "#E0F2FE")} />
        </mesh>
        {/* Farol Direito */}
        <mesh position={[0.68, 0, 0]} castShadow>
          <boxGeometry args={[0.36, 0.16, 0.24]} />
          <meshStandardMaterial {...getInteractiveMaterial("mesh_headlights", "#E0F2FE")} />
        </mesh>
      </InteractivePartGroup>

      {/* =====================================================================
          4. CONJUNTO DE PORTAS LATERAIS (mesh_doors)
         ===================================================================== */}
      <InteractivePartGroup
        meshName="mesh_doors"
        label="Portas Laterais"
        basePosition={[0, 0.52, -0.2]}
        explosionOffset={[0, 0.2, 0]}
        selectionOffset={[0, 0.38, 0]}
        isExploded={isExploded}
        selectedMesh={selectedMesh}
        hoveredMesh={hoveredMesh}
        onHoverChange={setHoveredMesh}
        onSelect={onSelectMesh}
      >
        {/* Porta Lateral Esquerda */}
        <mesh
          position={[
            -0.92 - (isExploded ? 0.55 : selectedMesh === "mesh_doors" ? 0.32 : 0),
            0,
            0,
          ]}
          castShadow
        >
          <boxGeometry args={[0.09, 0.58, 1.65]} />
          <meshStandardMaterial {...getInteractiveMaterial("mesh_doors", "#94A3B8", true)} />
        </mesh>
        {/* Porta Lateral Direita */}
        <mesh
          position={[
            0.92 + (isExploded ? 0.55 : selectedMesh === "mesh_doors" ? 0.32 : 0),
            0,
            0,
          ]}
          castShadow
        >
          <boxGeometry args={[0.09, 0.58, 1.65]} />
          <meshStandardMaterial {...getInteractiveMaterial("mesh_doors", "#94A3B8", true)} />
        </mesh>
      </InteractivePartGroup>

      {/* =====================================================================
          5. CONJUNTO DE RODAS & SENSORES (mesh_wheels)
         ===================================================================== */}
      <InteractivePartGroup
        meshName="mesh_wheels"
        label="Rodas Aro 19 & Sensores"
        basePosition={[0, 0.05, 0]}
        explosionOffset={[0, -0.1, 0]}
        selectionOffset={[0, 0.28, 0]}
        isExploded={isExploded}
        selectedMesh={selectedMesh}
        hoveredMesh={hoveredMesh}
        onHoverChange={setHoveredMesh}
        onSelect={onSelectMesh}
      >
        {[
          { pos: [-1.05, 0, 1.35] as [number, number, number], expX: -0.6 },
          { pos: [1.05, 0, 1.35] as [number, number, number], expX: 0.6 },
          { pos: [-1.05, 0, -1.35] as [number, number, number], expX: -0.6 },
          { pos: [1.05, 0, -1.35] as [number, number, number], expX: 0.6 },
        ].map((wheel, idx) => (
          <group
            key={idx}
            position={[
              wheel.pos[0] +
                (isExploded ? wheel.expX : selectedMesh === "mesh_wheels" ? wheel.expX * 0.45 : 0),
              wheel.pos[1],
              wheel.pos[2],
            ]}
          >
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.28, 28]} />
              <meshStandardMaterial {...getInteractiveMaterial("mesh_wheels", "#1E293B")} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.27, 0.27, 0.3, 16]} />
              <meshStandardMaterial
                color={
                  selectedMesh === "mesh_wheels"
                    ? "#2563EB"
                    : hoveredMesh === "mesh_wheels"
                    ? "#38BDF8"
                    : "#E2E8F0"
                }
                metalness={0.8}
                roughness={0.2}
                transparent={hasAnySelection && selectedMesh !== "mesh_wheels"}
                opacity={hasAnySelection && selectedMesh !== "mesh_wheels" ? 0.3 : 1}
              />
            </mesh>
          </group>
        ))}
      </InteractivePartGroup>

      {/* =====================================================================
          6. MOTOR 2.0 TWINPOWER TURBO (mesh_engine_01)
         ===================================================================== */}
      <InteractivePartGroup
        meshName="mesh_engine_01"
        label="Motor 2.0 Turbo"
        basePosition={[0, 0.42, 1.32]}
        explosionOffset={[0, 0.35, 0]}
        selectionOffset={[0, 0.48, 0]}
        isExploded={isExploded}
        selectedMesh={selectedMesh}
        hoveredMesh={hoveredMesh}
        onHoverChange={setHoveredMesh}
        onSelect={onSelectMesh}
      >
        <mesh castShadow>
          <boxGeometry args={[0.92, 0.46, 0.78]} />
          <meshStandardMaterial {...getInteractiveMaterial("mesh_engine_01", "#475569")} />
        </mesh>
      </InteractivePartGroup>

      {/* =====================================================================
          7. JOGO DE VELAS LASER IRIDIUM (mesh_spark_plug)
         ===================================================================== */}
      <InteractivePartGroup
        meshName="mesh_spark_plug"
        label="Velas de Ignição"
        basePosition={[0, 0.58, 1.32]}
        explosionOffset={[0, 1.05, -0.15]}
        selectionOffset={[0, 0.65, 0]}
        isExploded={isExploded}
        selectedMesh={selectedMesh}
        hoveredMesh={hoveredMesh}
        onHoverChange={setHoveredMesh}
        onSelect={onSelectMesh}
      >
        {[-0.27, -0.09, 0.09, 0.27].map((xOffset, idx) => (
          <group key={idx} position={[xOffset, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.045, 0.045, 0.28, 16]} />
              <meshStandardMaterial {...getInteractiveMaterial("mesh_spark_plug", "#FFFFFF")} />
            </mesh>
            <mesh position={[0, -0.16, 0]}>
              <cylinderGeometry args={[0.032, 0.025, 0.14, 16]} />
              <meshStandardMaterial
                color="#D97706"
                metalness={0.85}
                roughness={0.2}
                transparent={hasAnySelection && selectedMesh !== "mesh_spark_plug"}
                opacity={hasAnySelection && selectedMesh !== "mesh_spark_plug" ? 0.3 : 1}
              />
            </mesh>
          </group>
        ))}
      </InteractivePartGroup>

      {/* =====================================================================
          8. EXTENSIBILIDADE: PEÇAS PERSONALIZADAS DINÂMICAS DO ADMIN (/admin)
         ===================================================================== */}
      {customMeshes.map((custom, index) => (
        <InteractivePartGroup
          key={custom.mesh_name}
          meshName={custom.mesh_name}
          label={custom.name}
          basePosition={[0, 0.55 + index * 0.22, -1.35]}
          explosionOffset={custom.explosion_vector || [0, 1.1, -0.6]}
          selectionOffset={[0, 0.45, -0.25]}
          isExploded={isExploded}
          selectedMesh={selectedMesh}
          hoveredMesh={hoveredMesh}
          onHoverChange={setHoveredMesh}
          onSelect={onSelectMesh}
        >
          <mesh castShadow>
            <octahedronGeometry args={[0.26, 1]} />
            <meshStandardMaterial {...getInteractiveMaterial(custom.mesh_name, "#0D9488")} />
          </mesh>
        </InteractivePartGroup>
      ))}
    </group>
  );
}

/**
 * Componente Principal Exportado `CarViewer3D`.
 */
export function CarViewer3D(props: CarViewer3DProps) {
  return (
    <div className="relative h-full w-full select-none overflow-hidden rounded-2xl bg-gradient-to-b from-white via-slate-50 to-slate-100/80">
      <Canvas
        shadows
        camera={{ position: [3.8, 2.5, 4.4], fov: 40 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#F8FAFC"]} />
        <fog attach="fog" args={["#F8FAFC", 10, 24]} />

        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 10, 6]} intensity={1.4} castShadow />
        <directionalLight position={[-6, 6, -4]} intensity={0.7} color="#E0F2FE" />

        <BmwX1ConfiguratorScene {...props} />

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
