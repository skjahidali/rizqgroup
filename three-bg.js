/**
 * RIZQ ONE — 3D Animated Background
 * Uses Three.js loaded from CDN via importmap (see index.html).
 *
 * Creates 2,400 floating particles with a custom GLSL shader,
 * two rotating wireframe geometric shapes, and mouse/touch parallax.
 */

import * as THREE from 'three';

const canvas = document.getElementById('bg-canvas');
if (!canvas) throw new Error('Canvas #bg-canvas not found');
const isMobile = window.innerWidth < 640;
const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);

// --- Scene ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0d12, 0.035);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 18);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(pixelRatio);
renderer.setClearColor(0x0a0d12, 0);

// --- Particles ---
const COUNT = isMobile ? 900 : 2400;
const positions = new Float32Array(COUNT * 3);
const colors = new Float32Array(COUNT * 3);
const sizes = new Float32Array(COUNT);
const speeds = new Float32Array(COUNT);

const emerald = new THREE.Color(0x34d399);
const amber = new THREE.Color(0xfbbf24);
const teal = new THREE.Color(0x2dd4bf);

for (let i = 0; i < COUNT; i++) {
  const i3 = i * 3;
  const radius = Math.random() * 40 + 8;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
  positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  positions[i3 + 2] = radius * Math.cos(phi);

  const t = Math.random();
  let color;
  if (t < 0.45) {
    color = emerald.clone().lerp(teal, Math.random());
  } else if (t < 0.75) {
    color = teal.clone().lerp(emerald, Math.random());
  } else {
    color = amber.clone().lerp(emerald, Math.random() * 0.5);
  }
  colors[i3] = color.r;
  colors[i3 + 1] = color.g;
  colors[i3 + 2] = color.b;

  sizes[i] = Math.random() * 2.5 + 0.5;
  speeds[i] = Math.random() * 0.3 + 0.05;
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

const particleMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio },
  },
  vertexShader: `
    attribute vec3 aColor;
    attribute float aSize;
    attribute float aSpeed;
    uniform float uTime;
    uniform float uPixelRatio;
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vColor = aColor;
      vec3 pos = position;
      pos.y += sin(uTime * aSpeed + pos.x * 0.3) * 1.5;
      pos.x += cos(uTime * aSpeed * 0.7 + pos.z * 0.2) * 1.0;
      pos.z += sin(uTime * aSpeed * 0.5 + pos.y * 0.15) * 0.8;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      gl_PointSize = aSize * uPixelRatio * (30.0 / -mvPosition.z);

      float dist = length(mvPosition.xyz);
      vAlpha = smoothstep(45.0, 12.0, dist);
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      if (d > 0.5) discard;
      float glow = 1.0 - smoothstep(0.0, 0.5, d);
      glow = pow(glow, 1.5);
      gl_FragColor = vec4(vColor * glow, glow * vAlpha * 0.85);
    }
  `,
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
});

const points = new THREE.Points(geometry, particleMaterial);
points.frustumCulled = false;
scene.add(points);

// --- Wireframes ---
function createWireframe(geo, color, opacity, z) {
  const edges = new THREE.EdgesGeometry(geo);
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, linewidth: 1 });
  const mesh = new THREE.LineSegments(edges, mat);
  mesh.position.set(0, 0, z);
  scene.add(mesh);
  return mesh;
}

const wireframe = createWireframe(new THREE.IcosahedronGeometry(isMobile ? 4.5 : 6, 1), 0x34d399, 0.12, -5);
const outerWireframe = createWireframe(new THREE.OctahedronGeometry(isMobile ? 7 : 10, 0), 0xfbbf24, 0.06, -8);

// --- Mouse / touch parallax ---
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (e.touches.length === 0) return;
  mouse.x = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
  mouse.y = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// --- Resize ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
}, { passive: true });

// --- Animation loop ---
const clock = new THREE.Clock();
let running = true;

function animate() {
  if (!running) return;
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  particleMaterial.uniforms.uTime.value = elapsed;

  mouse.tx += (mouse.x - mouse.tx) * 0.04;
  mouse.ty += (mouse.y - mouse.ty) * 0.04;

  camera.position.x = mouse.tx * 3;
  camera.position.y = -mouse.ty * 3;
  camera.lookAt(0, 0, 0);

  wireframe.rotation.x = elapsed * 0.15;
  wireframe.rotation.y = elapsed * 0.1;
  outerWireframe.rotation.x = -elapsed * 0.08;
  outerWireframe.rotation.y = -elapsed * 0.06;
  outerWireframe.rotation.z = elapsed * 0.04;

  points.rotation.y = elapsed * 0.02;

  renderer.render(scene, camera);
}

animate();

// --- Pause when tab hidden ---
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    running = false;
  } else if (!running) {
    running = true;
    clock.getDelta();
    animate();
  }
});
