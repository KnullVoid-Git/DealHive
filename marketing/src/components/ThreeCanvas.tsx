"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function ThreeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isMobile || prefersReducedMotion) {
      setShouldRender(false);
      return;
    }

    setShouldRender(true);
  }, []);

  useEffect(() => {
    if (!shouldRender || !containerRef.current) return;

    const container = containerRef.current;
    let width = container.clientWidth;
    let height = container.clientHeight;

    // ── Scene ──
    const scene = new THREE.Scene();

    // ── Camera ──
    const camera = new THREE.PerspectiveCamera(36, width / height, 1, 1000);
    camera.position.set(0, -35, 220);
    camera.lookAt(0, 8, 0);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    // ── Lighting ──
    const ambient = new THREE.AmbientLight(0x0a0a1a, 20);
    scene.add(ambient);

    // Key light: overhead for specular edge highlights
    const keyLight = new THREE.DirectionalLight(0xffffff, 8);
    keyLight.position.set(10, 50, 180);
    scene.add(keyLight);

    // Fill light from side for dimension
    const fillLight = new THREE.DirectionalLight(0x6655cc, 4);
    fillLight.position.set(-60, 30, 60);
    scene.add(fillLight);

    // Back-rim light for edge definition (purple tint)
    const rimLight = new THREE.DirectionalLight(0x7c3aed, 5);
    rimLight.position.set(0, -20, -100);
    scene.add(rimLight);

    // ── Honeycomb Group ──
    const honeycombGroup = new THREE.Group();
    honeycombGroup.rotation.x = -0.42;
    honeycombGroup.rotation.y = 0.05;
    honeycombGroup.rotation.z = -0.03;
    scene.add(honeycombGroup);

    // ── Constants ──
    const R = 20;
    const GAP = 10;
    const DEPTH = 5;            // Thin, sleek profile (not chunky)
    const D = R * 1.732 + GAP;
    const POP_HEIGHT = 14;      // Rise distance above ground

    // ── Hexagonal Shape ──
    const hexShape = new THREE.Shape();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = R * Math.cos(angle);
      const y = R * Math.sin(angle);
      if (i === 0) hexShape.moveTo(x, y);
      else hexShape.lineTo(x, y);
    }
    hexShape.closePath();

    // ── Extruded Geometry (thin + large bevel = smooth pebble/lens silhouette) ──
    const cellGeo = new THREE.ExtrudeGeometry(hexShape, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelSegments: 16,        // Very smooth curved edges
      steps: 1,
      bevelSize: 3.5,           // Large bevel relative to depth = pillow/lens shape
      bevelThickness: 3.0,      // Thick bevel wraps the thin body into a dome
    });

    // ── Cell Positions ──
    const cellPositions = [
      { x: 0, y: 0 },
      { x: 0, y: D },
      { x: 0, y: -D },
      { x: D * 0.866, y: D * 0.5 },
      { x: -D * 0.866, y: D * 0.5 },
      { x: D * 0.866, y: -D * 0.5 },
      { x: -D * 0.866, y: -D * 0.5 },
    ];

    // ── Ground Plane (glassy reflective black — catches purple reflections) ──
    const groundGeo = new THREE.PlaneGeometry(800, 800);
    const groundMat = new THREE.MeshPhysicalMaterial({
      color: 0x05060a,
      roughness: 0.06,          // Mirror-glossy surface
      metalness: 0.95,          // Highly reflective
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.set(0, 0, 0);
    honeycombGroup.add(ground);

    // ── Build Cells + Underglow Lights ──
    const cellMeshes: THREE.Mesh[] = [];
    const cellLights: THREE.PointLight[] = [];
    const disposables: { geo?: THREE.BufferGeometry; mat?: THREE.Material }[] = [];

    cellPositions.forEach((pos, idx) => {
      // ── Main hexagon cell ──
      // Two-material approach: top face is glossy obsidian, sides get purple emissive on rise
      const topMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a0b10,
        roughness: 0.04,
        metalness: 0.97,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        reflectivity: 1.0,
        flatShading: false,
      });

      const mesh = new THREE.Mesh(cellGeo, topMat);
      // Start ENGRAVED: flush with the ground plane surface
      // Ground is at z=0, cell depth extends below into z-negative
      mesh.position.set(pos.x, pos.y, -DEPTH - 2); // Top face flush/slightly below ground
      honeycombGroup.add(mesh);
      cellMeshes.push(mesh);
      disposables.push({ mat: topMat });

      // ── Intense purple point light underneath each cell well ──
      const lightColor = idx % 2 === 0 ? 0x7c3aed : 0x6c63ff;
      const pLight = new THREE.PointLight(lightColor, 0, 120, 1.6);
      pLight.position.set(pos.x, pos.y, -DEPTH - 4);
      honeycombGroup.add(pLight);
      cellLights.push(pLight);
    });

    // ── Additional crevice lights between cells for prominent glow ──
    const creviceLights: THREE.PointLight[] = [];
    const halfD = D * 0.5;
    const crevicePositions = [
      { x: 0, y: halfD },
      { x: 0, y: -halfD },
      { x: halfD * 0.866, y: halfD * 0.5 },
      { x: -halfD * 0.866, y: halfD * 0.5 },
      { x: halfD * 0.866, y: -halfD * 0.5 },
      { x: -halfD * 0.866, y: -halfD * 0.5 },
      // Extra lights at cell edges for wider glow spread
      { x: D * 0.433, y: D * 0.75 },
      { x: -D * 0.433, y: D * 0.75 },
      { x: D * 0.433, y: -D * 0.75 },
      { x: -D * 0.433, y: -D * 0.75 },
    ];

    crevicePositions.forEach((pos, idx) => {
      const color = idx % 3 === 0 ? 0x8b5cf6 : idx % 3 === 1 ? 0x7c3aed : 0x6c63ff;
      const cLight = new THREE.PointLight(color, 0, 60, 1.5);
      cLight.position.set(pos.x, pos.y, 2); // Slightly above ground to glow through gaps
      honeycombGroup.add(cLight);
      creviceLights.push(cLight);
    });

    // ── Subtle stardust particles ──
    const particleGeo = new THREE.BufferGeometry();
    const pCount = 45;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 500;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 400;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 120 - 40;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x6c63ff,
      size: 1.0,
      transparent: true,
      opacity: 0.08,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ══════════════════════════════════════════
    // ══  ANIMATION  ══
    // ══════════════════════════════════════════

    let animationFrameId: number;
    const startTime = Date.now();

    // Easing
    const easeOutBack = (t: number): number => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
    const easeInOutCubic = (t: number): number =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Timing
    const INTRO_DELAY = 500;
    const STAGGER = 130;
    const RISE_DURATION = 1100;
    const ANIM_ORDER = [0, 1, 3, 5, 2, 4, 6]; // Center first, then spiral

    const cellState = cellMeshes.map(() => ({
      progress: 0,
      complete: false,
    }));

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = Date.now() - startTime;
      const time = Date.now() * 0.001;

      let allComplete = true;
      let maxGlowProgress = 0;

      // ── INTRO: Staggered rise from ground ──
      ANIM_ORDER.forEach((cellIdx, orderIdx) => {
        const state = cellState[cellIdx];
        const cellStart = INTRO_DELAY + orderIdx * STAGGER;
        const timeSince = elapsed - cellStart;

        if (timeSince <= 0) {
          allComplete = false;
          return;
        }

        if (!state.complete) {
          allComplete = false;
          const raw = Math.min(timeSince / RISE_DURATION, 1);
          state.progress = raw;

          const eased = easeOutBack(raw);

          // Rise from engraved (-DEPTH-2) to elevated above ground
          const startZ = -DEPTH - 2;
          const endZ = POP_HEIGHT;
          cellMeshes[cellIdx].position.z = startZ + (endZ - startZ) * eased;

          // Glow progress for lights
          const glowT = easeOutCubic(raw);
          if (glowT > maxGlowProgress) maxGlowProgress = glowT;

          // Cell light surges underneath
          cellLights[cellIdx].intensity = glowT * 1200;

          // Cell material gets slightly lighter as it rises (catches more light)
          const mat = cellMeshes[cellIdx].material as THREE.MeshPhysicalMaterial;
          mat.color.setRGB(
            0.04 + glowT * 0.03,
            0.043 + glowT * 0.03,
            0.063 + glowT * 0.05
          );

          if (raw >= 1) state.complete = true;
        }
      });

      // ── Crevice lights surge with global intro progress ──
      const globalT = Math.min(Math.max((elapsed - INTRO_DELAY) / (RISE_DURATION + ANIM_ORDER.length * STAGGER), 0), 1);
      const creviceGlow = easeInOutCubic(globalT);

      creviceLights.forEach((light, i) => {
        if (allComplete) {
          // Post-intro: pulse
          light.intensity = 500 + Math.sin(time * 1.6 + i * 0.8) * 150;
        } else {
          // During intro: surge with a bright peak
          const peak = 1 + Math.sin(creviceGlow * Math.PI) * 0.6;
          light.intensity = creviceGlow * 700 * peak;
        }
      });

      // ── POST-INTRO: Settled state with subtle breathing ──
      if (allComplete) {
        cellMeshes.forEach((mesh, idx) => {
          // Very subtle organic breathing (no float — they stay put)
          const breathe = Math.sin(time * 0.8 + idx * 0.6) * 0.3;
          const settledZ = POP_HEIGHT;
          mesh.position.z = settledZ + breathe;
        });

        // Cell lights gentle pulse
        cellLights.forEach((light, i) => {
          light.intensity = 900 + Math.sin(time * 1.3 + i * 0.9) * 250;
        });
      }

      // ── Layout positioning ──
      const isDesktop = window.innerWidth > 1024;
      const xOffset = isDesktop ? 42 : 0;
      const yOffset = isDesktop ? 6 : 2;
      honeycombGroup.position.x += (xOffset - honeycombGroup.position.x) * 0.06;
      honeycombGroup.position.y += (yOffset - honeycombGroup.position.y) * 0.06;

      particles.rotation.y += 0.00006;

      renderer.render(scene, camera);
    };

    animate();

    // ── Resize ──
    const handleResize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      cellGeo.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      disposables.forEach((d) => {
        if (d.geo) d.geo.dispose();
        if (d.mat) d.mat.dispose();
      });
    };
  }, [shouldRender]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${
        shouldRender ? "opacity-100" : "opacity-0"
      }`}
      style={{
        backgroundImage: !shouldRender
          ? "radial-gradient(circle at 50% 50%, rgba(108, 99, 255, 0.05) 0%, transparent 80%)"
          : undefined,
      }}
    />
  );
}
