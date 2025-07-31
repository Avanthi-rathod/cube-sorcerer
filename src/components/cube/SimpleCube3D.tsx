// Simple 3D Test Cube Component for debugging

import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function TestCube() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#ff4444" />
    </mesh>
  );
}

export function SimpleCube3D() {
  console.log('SimpleCube3D rendering...');
  
  return (
    <div className="w-full h-full border border-primary rounded-lg">
      <Canvas
        camera={{ position: [4, 4, 4], fov: 50 }}
        onCreated={({ gl, camera }) => {
          console.log('Simple Canvas created successfully');
          gl.setClearColor('#222222');
          camera.lookAt(0, 0, 0);
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <TestCube />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={10}
          autoRotate={true}
          autoRotateSpeed={2}
        />
      </Canvas>
    </div>
  );
}