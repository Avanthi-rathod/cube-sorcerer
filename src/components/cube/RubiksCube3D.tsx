// 3D Rubik's Cube Component using React Three Fiber

import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Mesh } from 'three';
import { RubiksCube } from '@/utils/cubeModel';
import { FaceColor } from '@/types/cube';

interface CubeFaceProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: FaceColor;
  faceIndex: number;
  cellIndex: number;
}

const FACE_COLORS = {
  [FaceColor.WHITE]: '#ffffff',
  [FaceColor.RED]: '#ff4444',
  [FaceColor.GREEN]: '#44ff44',
  [FaceColor.YELLOW]: '#ffff44',
  [FaceColor.ORANGE]: '#ff8844',
  [FaceColor.BLUE]: '#4444ff',
};

function CubeFace({ position, rotation, color, faceIndex, cellIndex }: CubeFaceProps) {
  const meshRef = useRef<Mesh>(null);
  
  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={[0.9, 0.9]} />
      <meshStandardMaterial 
        color={FACE_COLORS[color]} 
        transparent={false}
        metalness={0.1}
        roughness={0.1}
      />
      <meshBasicMaterial 
        color="#000000" 
        wireframe 
        transparent 
        opacity={0.3}
        attach="material-1"
      />
    </mesh>
  );
}

interface RubiksCube3DProps {
  cube: RubiksCube;
  isAnimating?: boolean;
  onCubeClick?: () => void;
}

export function RubiksCube3D({ cube, isAnimating = false, onCubeClick }: RubiksCube3DProps) {
  const groupRef = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const state = cube.getState();
  
  // Generate positions for 3x3x3 cube faces
  const generateFaces = () => {
    const faces: JSX.Element[] = [];
    const spacing = 1.02;
    
    // Front face (Green)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = (j - 1) * spacing;
        const y = (1 - i) * spacing;
        const z = 1.5;
        faces.push(
          <CubeFace
            key={`front-${i}-${j}`}
            position={[x, y, z]}
            rotation={[0, 0, 0]}
            color={state.faces[FaceColor.GREEN][i][j]}
            faceIndex={FaceColor.GREEN}
            cellIndex={i * 3 + j}
          />
        );
      }
    }
    
    // Back face (Blue)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = (1 - j) * spacing;
        const y = (1 - i) * spacing;
        const z = -1.5;
        faces.push(
          <CubeFace
            key={`back-${i}-${j}`}
            position={[x, y, z]}
            rotation={[0, Math.PI, 0]}
            color={state.faces[FaceColor.BLUE][i][j]}
            faceIndex={FaceColor.BLUE}
            cellIndex={i * 3 + j}
          />
        );
      }
    }
    
    // Top face (White)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = (j - 1) * spacing;
        const y = 1.5;
        const z = (1 - i) * spacing;
        faces.push(
          <CubeFace
            key={`top-${i}-${j}`}
            position={[x, y, z]}
            rotation={[-Math.PI / 2, 0, 0]}
            color={state.faces[FaceColor.WHITE][i][j]}
            faceIndex={FaceColor.WHITE}
            cellIndex={i * 3 + j}
          />
        );
      }
    }
    
    // Bottom face (Yellow)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = (j - 1) * spacing;
        const y = -1.5;
        const z = (i - 1) * spacing;
        faces.push(
          <CubeFace
            key={`bottom-${i}-${j}`}
            position={[x, y, z]}
            rotation={[Math.PI / 2, 0, 0]}
            color={state.faces[FaceColor.YELLOW][i][j]}
            faceIndex={FaceColor.YELLOW}
            cellIndex={i * 3 + j}
          />
        );
      }
    }
    
    // Right face (Red)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = 1.5;
        const y = (1 - i) * spacing;
        const z = (1 - j) * spacing;
        faces.push(
          <CubeFace
            key={`right-${i}-${j}`}
            position={[x, y, z]}
            rotation={[0, Math.PI / 2, 0]}
            color={state.faces[FaceColor.RED][i][j]}
            faceIndex={FaceColor.RED}
            cellIndex={i * 3 + j}
          />
        );
      }
    }
    
    // Left face (Orange)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const x = -1.5;
        const y = (1 - i) * spacing;
        const z = (j - 1) * spacing;
        faces.push(
          <CubeFace
            key={`left-${i}-${j}`}
            position={[x, y, z]}
            rotation={[0, -Math.PI / 2, 0]}
            color={state.faces[FaceColor.ORANGE][i][j]}
            faceIndex={FaceColor.ORANGE}
            cellIndex={i * 3 + j}
          />
        );
      }
    }
    
    return faces;
  };

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [5, 5, 5], fov: 60 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a0a0a');
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        <group
          ref={groupRef}
          onClick={onCubeClick}
          onPointerOver={() => setIsHovered(true)}
          onPointerOut={() => setIsHovered(false)}
          scale={isHovered ? 1.05 : 1}
        >
          {generateFaces()}
        </group>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={12}
          autoRotate={isAnimating}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}