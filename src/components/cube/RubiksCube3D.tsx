// 3D Rubik's Cube Component using React Three Fiber

import { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Mesh, BoxGeometry } from 'three';
import * as THREE from 'three';
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
  
  console.log('Rendering CubeFace:', { position, color, faceColor: FACE_COLORS[color] });
  
  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <boxGeometry args={[0.95, 0.95, 0.05]} />
      <meshStandardMaterial 
        color={FACE_COLORS[color]} 
        transparent={false}
        metalness={0.1}
        roughness={0.2}
      />
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.95, 0.95, 0.05)]} />
        <lineBasicMaterial color="#000000" linewidth={2} />
      </lineSegments>
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

  console.log('RubiksCube3D rendering:', { cubeState: state, faceCount: generateFaces().length });

  return (
    <div className="w-full h-full">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center bg-background border border-border rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading 3D Cube...</p>
          </div>
        </div>
      }>
        <Canvas
          camera={{ position: [4, 4, 4], fov: 50 }}
          onCreated={({ gl, camera }) => {
            console.log('Canvas created:', { gl, camera });
            gl.setClearColor('#0a0a0a');
            camera.lookAt(0, 0, 0);
          }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <directionalLight position={[-10, -10, -5]} intensity={0.4} />
          <pointLight position={[0, 0, 10]} intensity={0.3} />
          
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
            minDistance={2}
            maxDistance={15}
            autoRotate={isAnimating}
            autoRotateSpeed={1}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}