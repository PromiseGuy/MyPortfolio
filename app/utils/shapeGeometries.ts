import * as THREE from 'three';

/**
 * Generate high-resolution sphere with Fibonacci distribution
 */
export function generateFibonacciSphere(count: number, radius: number = 1): THREE.Vector4[] {
  const points: THREE.Vector4[] = [];
  const phi = Math.PI * (Math.sqrt(5) - 1); // golden angle
  
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y from 1 to -1
    const circleRadius = Math.sqrt(1 - y * y);
    const theta = phi * i;
    
    const x = Math.cos(theta) * circleRadius * radius;
    const z = Math.sin(theta) * circleRadius * radius;
    
    points.push(new THREE.Vector4(x, y * radius, z, 0));
    console.log(`new THREE.Vector4(${x.toFixed(3)}, ${(y * radius).toFixed(3)}, ${z.toFixed(3)}, 0),`);
  }
  
  return points;
}

/**
 * Generate cube with face subdivisions for more detail
 */
export function generateCube(subdivisions: number = 3, size: number = 1): THREE.Vector4[] {
  const points: THREE.Vector4[] = [];
  const step = (2 * size) / subdivisions;
  
  // Generate points on each face
  const faces = [
    { dims: ['x', 'y'], fixed: 'z', value: size },   // front
    { dims: ['x', 'y'], fixed: 'z', value: -size },  // back
    { dims: ['x', 'z'], fixed: 'y', value: size },   // top
    { dims: ['x', 'z'], fixed: 'y', value: -size },  // bottom
    { dims: ['y', 'z'], fixed: 'x', value: size },   // right
    { dims: ['y', 'z'], fixed: 'x', value: -size },  // left
  ];
  
  faces.forEach(face => {
    for (let i = 0; i <= subdivisions; i++) {
      for (let j = 0; j <= subdivisions; j++) {
        const coord1 = -size + i * step;
        const coord2 = -size + j * step;
        
        const coords: Record<string, number> = { x: 0, y: 0, z: 0 };
        coords[face.dims[0]!] = coord1;
        coords[face.dims[1]!] = coord2;
        coords[face.fixed] = face.value;
        
        points.push(new THREE.Vector4(coords.x, coords.y, coords.z, 0));
      }
    }
  });
  
  return points;
}

/**
 * Generate torus with circular cross-section
 */
export function generateTorus(
  majorSegments: number = 16,
  minorSegments: number = 8,
  majorRadius: number = 0.7,
  minorRadius: number = 0.3
): THREE.Vector4[] {
  const points: THREE.Vector4[] = [];
  
  for (let i = 0; i < majorSegments; i++) {
    const theta = (2 * Math.PI * i) / majorSegments;
    
    for (let j = 0; j < minorSegments; j++) {
      const phi = (2 * Math.PI * j) / minorSegments;
      
      const x = (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta);
      const y = minorRadius * Math.sin(phi);
      const z = (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta);
      
      points.push(new THREE.Vector4(x, y, z, 0));
    }
  }
  
  return points;
}

/**
 * Generate pyramid/double tetrahedron
 */
export function generatePyramid(subdivisions: number = 2): THREE.Vector4[] {
  const points: THREE.Vector4[] = [];
  
  // Base tetrahedron vertices
  const vertices = [
    new THREE.Vector4(0, 1, 0, 0),
    new THREE.Vector4(0.943, -0.333, 0, 0),
    new THREE.Vector4(-0.471, -0.333, 0.816, 0),
    new THREE.Vector4(-0.471, -0.333, -0.816, 0),
  ];
  
  // Add main vertices
  points.push(...vertices);
  
  // Add edge subdivisions
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      for (let k = 1; k < subdivisions; k++) {
        const t = k / subdivisions;
        const point = new THREE.Vector4().lerpVectors(vertices[i]!, vertices[j]!, t);
        points.push(point);
      }
    }
  }
  
  return points;
}

// Shape type enum
export type ShapeType = 'sphere' | 'cube' | 'torus' | 'pyramid';

// Generate shape based on type
export function generateShape(type: ShapeType, detail: number = 64): THREE.Vector4[] {
  switch (type) {
    case 'sphere':
      return generateFibonacciSphere(detail);
    case 'cube':
      return generateCube(Math.floor(Math.sqrt(detail / 6)));
    case 'torus':
      return generateTorus(Math.floor(Math.sqrt(detail)), Math.floor(Math.sqrt(detail) / 2));
    case 'pyramid':
      return generatePyramid(Math.floor(Math.sqrt(detail)));
  }
}
