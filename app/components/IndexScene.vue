<template>
  <TresPerspectiveCamera :position="[-1, 0, 5]" :look-at="[-1, 0, 0]" />
</template>

<script lang="ts" setup>
import * as THREE from 'three/webgpu';
import { color, positionWorld, mix, vec3, sin, cos, time, uniform, positionLocal, add, mul } from 'three/tsl';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const { renderer, scene } = useTres()
const { onBeforeRender } = useLoop()
const { mouseVelocity, mousePos } = useUseMouse()

// Get colors from UnoCSS theme
const primaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
const secondaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--color-text').trim();

// Parse rgb(r, g, b) string to array [r, g, b]
function parseRgb(rgbString: string): [number, number, number] {
  const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];
  }
  return [1, 1, 1]; // fallback to white
}

const [r1, g1, b1] = parseRgb(primaryRgb);
const [r2, g2, b2] = parseRgb(secondaryRgb);

// Gradient colors: primary blue to secondary green
const colorTop = vec3(r1, g1, b1);
const colorBottom = vec3(r2, g2, b2);

// Radial gradient based on distance from center (more sensitive)
const radialDistance = positionWorld.length(); // distance from origin
// Offset by inner cube distance (sqrt(3) ≈ 1.73) so center area is full primary color
const adjustedDistance = radialDistance.sub(1.73).max(0.0); // clamp negative values to 0
const gradientColor = mix(colorTop, colorBottom, adjustedDistance.pow(3.0).div(5.0)); // slower gradient transition

const tubeMaterial = new THREE.MeshBasicNodeMaterial();
tubeMaterial.colorNode = color(gradientColor);

// TSL shader for sphere points with wave movement
const waveAmplitude = uniform(0.02); // Wave displacement strength
const waveFrequency = uniform(2.0); // Wave frequency multiplier
const waveSpeed = uniform(1.5); // Animation speed

const sphereMaterial = new THREE.MeshBasicNodeMaterial();
sphereMaterial.colorNode = color(0xffffff); // white spheres

// Create wave material for sphere points
const sphereWaveMaterial = new THREE.MeshBasicNodeMaterial();
sphereWaveMaterial.colorNode = color(0xffffff);

// Wave displacement using TSL
const timeValue = time;
const localPos = positionLocal;
const worldPos = positionWorld;

// Create wave pattern based on world position and time
// Use world position so each sphere point has unique phase offset
// Use multiple sine waves for more organic movement
const wave1 = sin(add(mul(worldPos.x, waveFrequency), mul(timeValue, waveSpeed)));
const wave2 = sin(add(mul(worldPos.y, waveFrequency.mul(1.3)), mul(timeValue, waveSpeed.mul(0.8))));
const wave3 = sin(add(mul(worldPos.z, waveFrequency.mul(0.9)), mul(timeValue, waveSpeed.mul(1.2))));

// Combine waves for multi-directional movement
const waveX = mul(wave1, waveAmplitude);
const waveY = mul(wave2, waveAmplitude);
const waveZ = mul(wave3, waveAmplitude);

// Apply wave displacement to vertex position (in local space)
const displacedPosition = vec3(
  add(localPos.x, waveX),
  add(localPos.y, waveY),
  add(localPos.z, waveZ)
);

sphereWaveMaterial.positionNode = displacedPosition;

//sphere for each vertex
const tesseractPoints: THREE.Mesh[] = [];
const sphereRadius = 0.03;
const sphereSegments = 8;

// Create tubes for each edge
const tesseractTubes: THREE.Mesh[] = [];
const tubeRadius = 0.01;
const tubeSegments = 3;

const spherePoints: THREE.Mesh[] = [];
const sphereVelocityOffsets: THREE.Vector2[] = [];

tesseractVerts.forEach(() => {
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereSegments, sphereSegments);
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  tesseractPoints.push(sphere);
});
scene.value?.add(...tesseractPoints);

tesseractEdges.forEach(() => {
  const tubeGeometry = new THREE.CylinderGeometry(tubeRadius, tubeRadius, 1, tubeSegments);
  const tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
  tesseractTubes.push(tube);
});
scene.value?.add(...tesseractTubes);

sphereVerts.forEach(() => {
  const sphereGeometry = new THREE.SphereGeometry(sphereRadius, sphereSegments, sphereSegments);
  const sphere = new THREE.Mesh(sphereGeometry, sphereWaveMaterial);
  spherePoints.push(sphere);
  sphereVelocityOffsets.push(new THREE.Vector2(0, 0)); // Initialize velocity offset
});
// scene.value?.add(...spherePoints);

function project4Dto3D(v4: THREE.Vector4, angleXW: number, angleYZ: number, angleXY: number): THREE.Vector3 {
  // Rotate X-W plane
  let x = v4.x * Math.cos(angleXW) - v4.w * Math.sin(angleXW);
  let w = v4.x * Math.sin(angleXW) + v4.w * Math.cos(angleXW);

  // Rotate Y-Z plane
  let y = v4.y * Math.cos(angleYZ) - v4.z * Math.sin(angleYZ);
  let z = v4.y * Math.sin(angleYZ) + v4.z * Math.cos(angleYZ);

  // Rotate X-Y plane (3D rotation for variation)
  let x2 = x * Math.cos(angleXY) - y * Math.sin(angleXY);
  let y2 = x * Math.sin(angleXY) + y * Math.cos(angleXY);

  // Perspective projection 4D -> 3D
  const pf = 1 / (2 - w);
  return new THREE.Vector3(x2 * pf, y2 * pf, z * pf);
}

function tesseractHandler(delta: number) {
  tesseractVerts.forEach((_, idx) => {
    const sphere = tesseractPoints[idx];
    if (!sphere) return;

    const v4 = new THREE.Vector4().lerpVectors(tesseractVerts[idx]!, centerPoint, morphState.progress);
    const projected = project4Dto3D(v4, angle, angle2, angle3);
    sphere.position.copy(projected);
  });

  tesseractEdges.forEach(([i, j], idx) => {
    const tube = tesseractTubes[idx];
    if (!tube) return;

    const v1 = new THREE.Vector4().lerpVectors(tesseractVerts[i!]!, centerPoint, morphState.progress);
    const v2 = new THREE.Vector4().lerpVectors(tesseractVerts[j!]!, centerPoint, morphState.progress);

    const p1 = project4Dto3D(v1, angle, angle2, angle3);
    const p2 = project4Dto3D(v2, angle, angle2, angle3);

    const midpoint = new THREE.Vector3(
      (p1.x + p2.x) / 2,
      (p1.y + p2.y) / 2,
      (p1.z + p2.z) / 2
    );
    tube.position.copy(midpoint);

    const length = p1.distanceTo(p2);
    tube.scale.y = length;

    const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
    const up = new THREE.Vector3(0, 1, 0);

    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(up, direction);
    tube.quaternion.copy(quaternion);
  });
}

function sphereHandler(delta: number) {
  const dampingFactor = .85; // Smooth damping (higher = slower decay, 0-1)

  sphereVerts.forEach((_, idx) => {
    const sphere = spherePoints[idx];
    if (!sphere) return;

    // Interpolate from center to sphere vertex
    const v4 = getMorphedVertex(centerPoint, sphereVerts[idx]!);

    // Extract 3D position directly (ignore w coordinate)
    const position = new THREE.Vector3(v4.x, v4.y, v4.z);

    // Apply scale with interpolation for smooth morphing
    const currentScale = 1 + (sphereScale - 1) * morphState.progress;
    position.multiplyScalar(currentScale);

    // Apply offset with interpolation for smooth morphing
    position.x += sphereOffset.x * morphState.progress;
    position.y += sphereOffset.y * morphState.progress;
    position.z += sphereOffset.z * morphState.progress;

    // Calculate distance from mouse to sphere point (in screen space)
    const sphereScreenPos = new THREE.Vector2(position.x, position.y);
    const distanceToMouse = sphereScreenPos.distanceTo(mousePos);

    // Apply mouse velocity influence based on proximity
    const maxInfluenceDistance = 1.0; // Distance at which influence starts to fade
    const proximityFactor = Math.max(0, 1 - (distanceToMouse / maxInfluenceDistance));
    const velocityInfluence = 2.0 * proximityFactor;

    // Add new velocity influence to existing offset
    const velocityOffset = sphereVelocityOffsets[idx]!;
    velocityOffset.x += mouseVelocity.x * velocityInfluence * morphState.progress;
    velocityOffset.y += mouseVelocity.y * velocityInfluence * morphState.progress;

    // Apply damping to smoothly return to original position
    velocityOffset.multiplyScalar(dampingFactor);

    // Apply the accumulated velocity offset
    position.x += velocityOffset.x;
    position.y += velocityOffset.y;

    sphere.position.copy(position);
  });
}

let angle = 0;
let angle2 = 0;
let angle3 = 0;

// Animation control object for GSAP
const morphState = {
  progress: 0,
  renderHandler: (delta: number) => tesseractHandler(delta),
};

// Center point for collapse
const centerPoint = new THREE.Vector4(0, 0, 0, 0);

// Sphere position offset (applied after morph animation)
const sphereOffset = new THREE.Vector3(1, 0, 0); // Move sphere to the right
const sphereScale = 2.0; // Scale factor for the sphere

// Get morphed vertex with collapse/explode animation
function getMorphedVertex(startVert: THREE.Vector4, endVert: THREE.Vector4): THREE.Vector4 {
  // Collapse: startVert -> center
  const collapsed = new THREE.Vector4().lerpVectors(startVert, centerPoint, morphState.progress);
  // Explode: center -> endVert
  return new THREE.Vector4().lerpVectors(centerPoint, endVert, morphState.progress);
}

// Setup GSAP ScrollTrigger animation
onMounted(() => {
  // Section 1: Tesseract collapse (hero section - first half)
  gsap.timeline({
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'top top',
      end: 'center top',
      scrub: 1,
      onUpdate: (self) => {
        morphState.progress = self.progress;
      },
      onEnterBack: () => {
        morphState.renderHandler = tesseractHandler;
        scene.value?.remove(...spherePoints);
        scene.value?.add(...tesseractPoints);
        scene.value?.add(...tesseractTubes);
      },
      onLeave: () => {
        morphState.progress = 0;
        morphState.renderHandler = sphereHandler;
        scene.value?.remove(...tesseractPoints);
        scene.value?.remove(...tesseractTubes);
        scene.value?.add(...spherePoints);
      }
    }
  });

  // Section 2: Sphere explode (hero section - second half)
  gsap.timeline({
    scrollTrigger: {
      trigger: '.hero-section',
      start: 'center top',
      end: 'bottom top',
      scrub: 1,
      onUpdate: (self) => {
        morphState.progress = self.progress;
      },
    }
  });

  onUnmounted(() => {
    ScrollTrigger.getAll().forEach(st => st.kill());
  });

  renderer.setClearColor(0x000000, 0);
});

onBeforeRender(({ delta }) => {
  angle += 0.3 * delta;
  angle2 += 0.3 * delta;
  angle3 += 0.3 * delta;

  if (angle >= Math.PI * 2) angle -= Math.PI * 2;
  if (angle2 >= Math.PI * 2) angle2 -= Math.PI * 2;
  if (angle3 >= Math.PI * 2) angle3 -= Math.PI * 2;

  morphState.renderHandler(delta);
})
</script>

<style></style>