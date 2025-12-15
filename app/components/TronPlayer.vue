<template>
  <TresMesh ref="rider" :material="riderMaterial">
    <TresPlaneGeometry :args="[0.3, 0.2]" />
  </TresMesh>
  <TresGroup ref="trailGroup" />
</template>

<script lang="ts" setup>
import * as THREE from 'three/webgpu'
import { smoothstep, uv, vec3, vec4 } from 'three/tsl'

const { onBeforeRender } = useLoop()

const rider = shallowRef<THREE.Mesh | null>(null)
const trailGroup = shallowRef<THREE.Group | null>(null)

// Trail settings
const trailWidth = 0.03
const maxTrailSegments = 200

// Direction enum
type Direction = 'up' | 'down' | 'left' | 'right'

// Rider state (plain values, updated via Three.js directly)
let posX = 0
let posY = 0
let posZ = 0.01
let direction: Direction = 'up'

// Movement speed
const speed = 0.8

// Direction to rotation mapping
const directionRotation: Record<Direction, number> = {
  right: 0,
  left: Math.PI,
  up: Math.PI / 2,
  down: -Math.PI / 2,
}

// Direction to velocity mapping
const directionVelocity: Record<Direction, { x: number; y: number }> = {
  right: { x: 1, y: 0 },
  left: { x: -1, y: 0 },
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
}

// Rider material (cyan glow effect with TSL)
const riderUV = uv()
const riderColorNode = vec4(0, 1, 1, 1)

const riderMaterial = new THREE.MeshBasicNodeMaterial()
riderMaterial.colorNode = riderColorNode.xyz
riderMaterial.opacityNode = riderColorNode.w
riderMaterial.transparent = true
riderMaterial.side = THREE.DoubleSide
riderMaterial.depthWrite = false

// Trail material (cyan glow)
const trailColorNode = vec4(0.0, 1.0, 1.0, 1.0)

const trailMaterial = new THREE.MeshBasicNodeMaterial()
trailMaterial.colorNode = trailColorNode.xyz
trailMaterial.opacityNode = trailColorNode.w
trailMaterial.transparent = true
trailMaterial.side = THREE.DoubleSide
trailMaterial.depthWrite = false

// Shared trail mesh - we'll update the geometry vertices to stretch from start to rider position
// PlaneGeometry creates 4 vertices in this order:
// 0: top-left, 1: top-right, 2: bottom-left, 3: bottom-right
// For a plane of size (width, height), positions are at (-w/2, h/2), (w/2, h/2), (-w/2, -h/2), (w/2, -h/2)
function createTrailGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry()
  // 4 vertices for a quad: 2 at trail start, 2 at trail end (rider position)
  const positions = new Float32Array([
    -trailWidth / 2, 0, 0, // 0: left at start
    trailWidth / 2, 0, 0, // 1: right at start
    -trailWidth / 2, 0, 0, // 2: left at end (rider)
    trailWidth / 2, 0, 0, // 3: right at end (rider)
  ])
  const uvs = new Float32Array([
    0, 0, // 0
    1, 0, // 1
    0, 1, // 2
    1, 1, // 3
  ])
  const indices = [0, 2, 1, 1, 2, 3] // two triangles
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  return geo
}

const trailGeometry = createTrailGeometry()
const trailMesh = new THREE.Mesh(trailGeometry, trailMaterial)

// Offset from rider center to back (half the rider's length)
const riderBackOffset = 0.015

// Track trail segment start position
let trailStartX = 0
let trailStartY = 0

// Get the position at the back of the rider
function getRiderBackPosition(): { x: number; y: number } {
  const dir = directionVelocity[direction]
  return {
    x: posX - dir.x * riderBackOffset,
    y: posY - dir.y * riderBackOffset,
  }
}

function updateTrailSegment() {
  if (!trailGroup.value) return

  const positions = trailGeometry.attributes.position!.array as Float32Array

  // Get position at the back of the rider
  const back = getRiderBackPosition()

  // Calculate the length of the trail segment from start to rider's back
  const dx = back.x - trailStartX
  const dy = back.y - trailStartY
  const length = Math.sqrt(dx * dx + dy * dy)

  // Update end vertices (indices 2 and 3) to stretch toward rider's back
  // The trail mesh is positioned at trailStart and rotated to face direction
  // So we just need to set the Y coordinate of the end vertices to the length
  positions[7] = length // vertex 2 Y
  positions[10] = length // vertex 3 Y

  trailGeometry.attributes.position!.needsUpdate = true
}

function finishTrailSegment() {
  if (!rider.value || !trailGroup.value) return

  // Clone the current trail geometry with its stretched state
  const clonedGeometry = trailGeometry.clone()
  const trailSegment = new THREE.Mesh(clonedGeometry, trailMaterial)

  // Copy position and rotation from the active trail mesh
  trailSegment.position.copy(trailMesh.position)
  trailSegment.rotation.copy(trailMesh.rotation)

  // Add the finished segment to the group
  trailGroup.value.add(trailSegment)

  // Get the back position for starting the new segment
  const back = getRiderBackPosition()

  // Limit trail segments
  while (trailGroup.value.children.length > maxTrailSegments) {
    const oldest = trailGroup.value.children[0]
    if (oldest && oldest !== trailMesh) {
      trailGroup.value.remove(oldest)
      if (oldest instanceof THREE.Mesh) {
        oldest.geometry.dispose()
      }
    }
  }

  // Reset the active trail mesh for the new segment
  // Start from the back of the rider so trails connect seamlessly at corners
  trailStartX = back.x
  trailStartY = back.y

  // Position the trail mesh at new start (rider's back)
  trailMesh.position.set(back.x, back.y, posZ)

  // Rotate to face the new direction
  trailMesh.rotation.z = directionRotation[direction] - Math.PI / 2

  // Reset geometry vertices to start fresh
  const positions = trailGeometry.attributes.position!.array as Float32Array
  positions[7] = 0 // vertex 2 Y
  positions[10] = 0 // vertex 3 Y
  trailGeometry.attributes.position!.needsUpdate = true
}

function updateRotation(newDir: Direction) {
  if (!rider.value) return
  if (direction === newDir) return
  if (direction === 'up' && newDir === 'down') return
  if (direction === 'down' && newDir === 'up') return
  if (direction === 'left' && newDir === 'right') return
  if (direction === 'right' && newDir === 'left') return

  // const currentRotation = directionRotation[direction]
  const targetRotation = directionRotation[newDir]

  rider.value.rotation.z = targetRotation
  direction = newDir

  finishTrailSegment()
}

onMounted(() => {
  if (!rider.value || !trailGroup.value) return
  rider.value.rotation.z = directionRotation[direction]
  rider.value.position.set(posX, posY, posZ)

  // Initialize trail start position from rider's back
  const back = getRiderBackPosition()
  trailStartX = back.x
  trailStartY = back.y

  // Position and rotate the trail mesh to match rider's back position
  trailMesh.position.set(back.x, back.y, posZ)
  trailMesh.rotation.z = directionRotation[direction] - Math.PI / 2

  // Add the active trail mesh to the group
  trailGroup.value.add(trailMesh)

  window.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    trailGeometry.dispose()
  })
})

function handleKeydown(e: KeyboardEvent) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault()
    e.stopPropagation()
  }

  switch (e.key) {
    case 'ArrowUp':
      updateRotation('up')
      break
    case 'ArrowDown':
      updateRotation('down')
      break
    case 'ArrowLeft':
      updateRotation('left')
      break
    case 'ArrowRight':
      updateRotation('right')
      break
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

onBeforeRender(({ delta }) => {
  if (!rider.value || !trailGroup.value) return

  const dir = directionVelocity[direction]
  const newX = posX + speed * delta * dir.x
  const newY = posY + speed * delta * dir.y

  posX = newX
  posY = newY

  // Update mesh position and rotation directly
  rider.value.position.set(posX, posY, posZ)
  updateTrailSegment()
})
</script>
