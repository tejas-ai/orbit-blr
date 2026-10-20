"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface TechNode {
  id: string;
  name: string;
  category: string;
  area: string;
  position: THREE.Vector3;
  color: string;
  eventCount: number;
}

interface OrbitGlobe3DProps {
  onSelectCategory?: (category: string) => void;
}

export default function OrbitGlobe3D({ onSelectCategory }: OrbitGlobe3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<TechNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement("canvas");
      if (!window.WebGLRenderingContext || (!testCanvas.getContext("webgl") && !testCanvas.getContext("experimental-webgl"))) {
        setIsSupported(false);
        return;
      }
    } catch {
      setIsSupported(false);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene, Camera, Renderer
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    container.appendChild(renderer.domElement);

    // Master Group for mouse parallax & rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 1. Central Wireframe Sphere (Radar / Globe)
    const sphereRadius = 7.5;
    const sphereGeo = new THREE.IcosahedronGeometry(sphereRadius, 3);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x4a1a82, // Deep Purple Wireframe
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    globeGroup.add(sphereMesh);

    // Inner glowing core
    const coreGeo = new THREE.SphereGeometry(sphereRadius * 0.75, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x09090b,
      transparent: true,
      opacity: 0.95,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // 2. Orbital Rings with Vice City sunset neon
    const createRing = (radius: number, tiltX: number, tiltY: number, color: number, opacity: number) => {
      const ringGeo = new THREE.RingGeometry(radius - 0.05, radius + 0.05, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = tiltX;
      ring.rotation.y = tiltY;
      globeGroup.add(ring);
      return ring;
    };

    const ring1 = createRing(sphereRadius * 1.35, Math.PI / 3, Math.PI / 6, 0xff2d8d, 0.45); // Hot Pink
    const ring2 = createRing(sphereRadius * 1.55, -Math.PI / 4, Math.PI / 4, 0x00e5ff, 0.4);  // Electric Cyan
    const ring3 = createRing(sphereRadius * 1.2, Math.PI / 2, 0, 0xff6a3d, 0.35);             // Sunset Orange

    // 3. Floating Tech Event Nodes
    const techNodesData: TechNode[] = [
      {
        id: "ai-node",
        name: "AI & ML Nexus",
        category: "AI & ML",
        area: "Koramangala / HSR",
        position: new THREE.Vector3(4.8, 3.2, 5.0),
        color: "#FF2D8D",
        eventCount: 3,
      },
      {
        id: "cloud-node",
        name: "Cloud Native Orbit",
        category: "Cloud",
        area: "Malleshwaram / Whitefield",
        position: new THREE.Vector3(-5.2, 2.5, 4.2),
        color: "#00E5FF",
        eventCount: 2,
      },
      {
        id: "dev-node",
        name: "Developer & FOSS Hub",
        category: "Developer",
        area: "Bellandur / Koramangala",
        position: new THREE.Vector3(2.2, -4.5, 5.5),
        color: "#C084FC",
        eventCount: 3,
      },
      {
        id: "cyber-node",
        name: "Cybersecurity Shield",
        category: "Cybersecurity",
        area: "Whitefield Tech Hub",
        position: new THREE.Vector3(-4.5, -3.8, 4.0),
        color: "#FF2D8D",
        eventCount: 1,
      },
      {
        id: "robotics-node",
        name: "Robotics & Hardware Lab",
        category: "Robotics",
        area: "IISc Malleshwaram",
        position: new THREE.Vector3(0.5, 6.5, 2.8),
        color: "#FFB347",
        eventCount: 1,
      },
      {
        id: "startup-node",
        name: "Founders & Mixer Grid",
        category: "Networking",
        area: "Indiranagar / Central BLR",
        position: new THREE.Vector3(6.0, -1.5, 3.5),
        color: "#FF6A3D",
        eventCount: 1,
      },
    ];

    const raycastMeshes: THREE.Mesh[] = [];
    const nodeMeshes: { mesh: THREE.Mesh; nodeData: TechNode; ring: THREE.Mesh }[] = [];

    techNodesData.forEach((node) => {
      // Glow circle around node
      const outerRingGeo = new THREE.RingGeometry(0.5, 0.65, 32);
      const outerRingMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const nodeRing = new THREE.Mesh(outerRingGeo, outerRingMat);
      nodeRing.position.copy(node.position);
      nodeRing.lookAt(0, 0, 0);
      globeGroup.add(nodeRing);

      // Sphere Node
      const nodeGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(node.color),
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(node.position);
      nodeMesh.userData = { nodeData: node };
      globeGroup.add(nodeMesh);

      // Invisible larger hit mesh for smooth hover/clicks
      const hitGeo = new THREE.SphereGeometry(1.2, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.copy(node.position);
      hitMesh.userData = { nodeData: node };
      globeGroup.add(hitMesh);
      raycastMeshes.push(hitMesh);

      nodeMeshes.push({ mesh: nodeMesh, nodeData: node, ring: nodeRing });

      // Connecting beam from center to node
      const points = [new THREE.Vector3(0, 0, 0), node.position];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(node.color),
        transparent: true,
        opacity: 0.25,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      globeGroup.add(line);
    });

    // 4. Ambient Orbiting Particle Cloud
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const baseColor1 = new THREE.Color(0xcafd79);
    const baseColor2 = new THREE.Color(0x67e8f9);
    const baseColor3 = new THREE.Color(0xa5b4fc);

    for (let i = 0; i < particleCount; i++) {
      const radius = sphereRadius * (0.9 + Math.random() * 0.9);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const pick = Math.random();
      const col = pick < 0.4 ? baseColor1 : pick < 0.75 ? baseColor2 : baseColor3;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particles);

    // Mouse Interaction & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    const targetRotation = new THREE.Vector2(0, 0);
    const currentRotation = new THREE.Vector2(0, 0);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      mouse.x = (clientX / rect.width) * 2 - 1;
      mouse.y = -(clientY / rect.height) * 2 + 1;

      targetRotation.y = (mouse.x * Math.PI) / 8;
      targetRotation.x = (mouse.y * Math.PI) / 12;

      setTooltipPos({ x: clientX, y: clientY });
    };

    const handleMouseLeave = () => {
      mouse.x = -999;
      mouse.y = -999;
      targetRotation.set(0, 0);
      setHoveredNode(null);
    };

    const handleClick = () => {
      if (mouse.x === -999) return;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(raycastMeshes);

      if (intersects.length > 0) {
        const hitData = intersects[0].object.userData.nodeData as TechNode;
        if (hitData && onSelectCategory) {
          onSelectCategory(hitData.category);
        }
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("click", handleClick);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Idle Rotation
      if (!prefersReducedMotion) {
        globeGroup.rotation.y += delta * 0.15;
        ring1.rotation.z += delta * 0.1;
        ring2.rotation.z -= delta * 0.08;
        ring3.rotation.z += delta * 0.05;
        particles.rotation.y += delta * 0.04;
      }

      // Smooth mouse parallax
      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.05;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.05;
      globeGroup.position.x = currentRotation.y * 3;
      globeGroup.position.y = currentRotation.x * 2;

      // Pulse node rings
      nodeMeshes.forEach(({ ring }, idx) => {
        const pulse = 1 + Math.sin(time * 3 + idx * 1.5) * 0.15;
        ring.scale.set(pulse, pulse, pulse);
      });

      // Raycast check
      if (mouse.x !== -999) {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(raycastMeshes);

        if (intersects.length > 0) {
          const found = intersects[0].object.userData.nodeData as TechNode;
          setHoveredNode(found);
          container.style.cursor = "pointer";
        } else {
          setHoveredNode(null);
          container.style.cursor = "default";
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("click", handleClick);

      // Clean disposal
      sphereGeo.dispose();
      sphereMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectCategory]);

  return (
    <div className="relative w-full h-[420px] md:h-[540px] flex items-center justify-center overflow-hidden">
      {/* Subtle radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,45,141,0.12)_0%,rgba(0,229,255,0.06)_40%,transparent_70%)] pointer-events-none" />

      {/* Three.js Container */}
      <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Node Tooltip */}
      {hoveredNode && tooltipPos && (
        <div
          className="absolute z-30 pointer-events-none transition-all duration-100 ease-out -translate-x-1/2 -translate-y-16"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="bg-orbit-card/95 backdrop-blur-md border border-orbit-signal/40 rounded-xl px-3.5 py-2 shadow-glow text-left min-w-[190px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-orbit-signal font-semibold">
                Bengaluru Node
              </span>
              <span className="text-[10px] bg-orbit-signal/20 text-orbit-signal px-1.5 py-0.5 rounded font-mono">
                {hoveredNode.eventCount} Free
              </span>
            </div>
            <div className="text-sm font-display font-bold text-orbit-text mt-0.5">
              {hoveredNode.name}
            </div>
            <div className="text-xs text-orbit-muted flex items-center gap-1 mt-0.5">
              <span>📍 {hoveredNode.area}</span>
            </div>
            <div className="text-[10px] text-orbit-highlight font-mono mt-1">
              Click to explore category →
            </div>
          </div>
        </div>
      )}

      {/* Fallback if WebGL is unavailable */}
      {!isSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-orbit-signal animate-spin-slow flex items-center justify-center mb-4">
            <span className="text-2xl">🌐</span>
          </div>
          <p className="text-orbit-signal font-mono text-xs uppercase tracking-widest">
            Orbit BLR 3D Radar
          </p>
          <p className="text-orbit-muted text-sm mt-1 max-w-xs">
            Bengaluru Free In-Person Tech Node Network Active
          </p>
        </div>
      )}

      {/* Interaction prompt badge */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-orbit-muted/70 pointer-events-none">
        <span className="hidden sm:inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-orbit-signal animate-pulse" />
          Interactive 3D Radar • Drag to tilt • Click nodes to filter
        </span>
        <span className="sm:hidden text-center w-full">Interactive 3D Bengaluru Radar</span>
      </div>
    </div>
  );
}
