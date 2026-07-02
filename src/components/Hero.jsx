// src/components/Hero.jsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js';
import { useResume } from '../hooks/useResume';
import '../styles/Hero.css';

const Hero = () => {
  const canvasWrapRef = useRef();
  const { resume } = useResume();

  useEffect(() => {
    const wrap = canvasWrapRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, wrap.clientWidth / wrap.clientHeight, 0.1, 100);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    wrap.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x404040, 2.2);
    scene.add(ambient);
    const point = new THREE.PointLight(0xc6ff3d, 60);
    point.position.set(4, 4, 4);
    scene.add(point);
    const point2 = new THREE.PointLight(0xff4fa3, 30);
    point2.position.set(-4, -2, 3);
    scene.add(point2);

    const geometry = new THREE.IcosahedronGeometry(1, 24);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1d212c,
      roughness: 0.35,
      metalness: 0.55,
      wireframe: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const wireMaterial = new THREE.MeshBasicMaterial({ color: 0xc6ff3d, wireframe: true, transparent: true, opacity: 0.15 });
    const wireMesh = new THREE.Mesh(geometry.clone(), wireMaterial);
    wireMesh.scale.setScalar(1.02);
    scene.add(wireMesh);

    const noise = new ImprovedNoise();
    const basePositions = geometry.attributes.position.array.slice();
    const wireBase = wireMesh.geometry.attributes.position.array.slice();
    let time = 0;
    let frameId;
    let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (!reduced) time += 0.003;

      const pos = geometry.attributes.position.array;
      const wpos = wireMesh.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        const x = basePositions[i], y = basePositions[i + 1], z = basePositions[i + 2];
        const n = noise.noise(x * 1.5 + time, y * 1.5, z * 1.5 + time);
        const scale = 1 + n * 0.15;
        pos[i] = x * scale;
        pos[i + 1] = y * scale;
        pos[i + 2] = z * scale;
        wpos[i] = wireBase[i] * scale;
        wpos[i + 1] = wireBase[i + 1] * scale;
        wpos[i + 2] = wireBase[i + 2] * scale;
      }
      geometry.attributes.position.needsUpdate = true;
      wireMesh.geometry.attributes.position.needsUpdate = true;
      mesh.rotation.y += 0.0016;
      wireMesh.rotation.y += 0.0016;
      mesh.rotation.x = Math.sin(time * 0.3) * 0.1;
      wireMesh.rotation.x = mesh.rotation.x;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = wrap.clientWidth / wrap.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(wrap.clientWidth, wrap.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      wrap.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      wireMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section className="hero">
      <div className="hero-scanlines" aria-hidden="true" />
      <div className="hero-sphere" ref={canvasWrapRef} aria-hidden="true" />
      <div className="hero-content">
        <span className="eyebrow">Indie game dev / builder</span>
        <h1>Tanay Naik</h1>
        <p className="hero-sub">
          I ship small web games fast — arcade mechanics, tight feedback loops,
          built and out the door in a day or two. Currently running validation
          experiments and building the tools behind them.
        </p>
        <div className="hero-actions">
          <a href="#projects" className="btn-primary">See the work</a>
          {resume?.base64 && (
            <a
              href={`data:application/pdf;base64,${resume.base64}`}
              className="btn-ghost"
              download={resume.fileName || 'Tanay-Naik-Resume.pdf'}
            >
              Resume
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
