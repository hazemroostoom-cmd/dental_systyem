"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Center } from "@react-three/drei";
import { Suspense, useState, useRef } from "react";
import { Maximize2, RotateCcw, Ruler, MessageSquare, Layers, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

interface DentalViewerProps {
  onAddAnnotation?: (pos: [number, number, number]) => void;
  annotations?: { id: string; position: [number, number, number]; resolved?: boolean }[];
  fileUrl?: string;
  onAnnotationClick?: (id: string) => void;
  selectedAnnotationId?: string;
}

const PlaceholderModel = ({ wireframe }: { wireframe: boolean }) => {
  return (
    <mesh>
      <torusKnotGeometry args={[1, 0.4, 128, 32]} />
      <meshStandardMaterial 
        color="#e2e8f0" 
        roughness={0.3} 
        metalness={0.2} 
        wireframe={wireframe}
      />
    </mesh>
  );
};

const AnnotationMarker = ({ position, id, resolved, isSelected, onClick }: { position: [number, number, number]; id: string; resolved?: boolean; isSelected?: boolean; onClick?: () => void }) => {
  const [hovered, setHovered] = useState(false);
  const color = resolved ? "#10b981" : "#8b5cf6";
  const scale = isSelected ? 1.5 : (hovered ? 1.2 : 1);

  return (
    <mesh 
      position={position} 
      scale={scale}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { setHovered(false); document.body.style.cursor = 'default'; }}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
    >
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isSelected ? 0.8 : 0.4} />
    </mesh>
  );
};

export const DentalViewer = ({ onAddAnnotation, annotations = [], fileUrl, onAnnotationClick, selectedAnnotationId }: DentalViewerProps) => {
  const [wireframe, setWireframe] = useState(false);
  const [annotateMode, setAnnotateMode] = useState(false);
  const controlsRef = useRef<any>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handlePointerDown = (e: any) => {
    if (annotateMode && e.intersections.length > 0 && onAddAnnotation) {
      const point = e.intersections[0].point;
      onAddAnnotation([point.x, point.y, point.z]);
      setAnnotateMode(false); // turn off after placing
    }
  };

  if (!fileUrl) {
    return (
      <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400">
        <Layers className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">No 3D model uploaded</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden group">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center h-full text-white/60">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium">Loading 3D Model...</p>
        </div>
      }>
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }} onPointerDown={handlePointerDown}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={2048} castShadow />
          
          <Stage environment="city" intensity={0.6}>
            <Center>
              <PlaceholderModel wireframe={wireframe} />
              {annotations.map((ann) => (
                <AnnotationMarker 
                  key={ann.id} 
                  position={ann.position} 
                  id={ann.id} 
                  resolved={ann.resolved}
                  isSelected={selectedAnnotationId === ann.id}
                  onClick={() => onAnnotationClick?.(ann.id)}
                />
              ))}
            </Center>
          </Stage>

          <OrbitControls 
            ref={controlsRef} 
            makeDefault 
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 1.75} 
            enablePan={!annotateMode}
            enableRotate={!annotateMode}
          />
        </Canvas>
      </Suspense>

      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content="Toggle Wireframe" position="right">
          <Button 
            variant="secondary" 
            size="sm" 
            className={cn("backdrop-blur-md", wireframe ? "bg-primary-600 border-primary-500 text-white hover:bg-primary-700" : "bg-white/10 border-white/20 text-white hover:bg-white/20")}
            onClick={() => setWireframe(!wireframe)}
          >
            <Layers className="w-4 h-4" />
          </Button>
        </Tooltip>
        <Tooltip content="Reset Camera" position="right">
          <Button 
            variant="secondary" 
            size="sm" 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md"
            onClick={resetCamera}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </Tooltip>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/80 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-2xl">
        <Tooltip content="Rotate">
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip content="Measure">
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <Ruler className="w-4 h-4" />
          </button>
        </Tooltip>
        <Tooltip content="Annotate">
          <button
            onClick={() => setAnnotateMode(!annotateMode)}
            className={cn(
              "p-2 rounded-lg transition-colors text-white/80 hover:text-white flex items-center gap-2",
              annotateMode && "bg-primary-600 text-white hover:bg-primary-600"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            {annotateMode && <span className="text-xs font-medium pr-1">Click model</span>}
          </button>
        </Tooltip>
        <Tooltip content="Fullscreen">
          <button
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/80 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      <div className="absolute top-4 right-4 bg-gray-900/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Model View</p>
        <p className="text-xs text-white font-medium">{fileUrl.split('/').pop() || 'upper_scan_v2.obj'}</p>
      </div>
    </div>
  );
};

