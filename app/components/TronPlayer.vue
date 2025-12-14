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
const trailWidth = 0.15
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

// Grid bounds
const gridBound = 2.5

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
const riderGlow = smoothstep(0.5, 0.0, riderUV.sub(0.5).length())
const riderColorNode = vec4(vec3(0.0, 1.0, 1.0).mul(riderGlow.add(0.5)), riderGlow.mul(0.8).add(0.2))

const riderMaterial = new THREE.MeshBasicNodeMaterial()
riderMaterial.colorNode = riderColorNode.xyz
riderMaterial.opacityNode = riderColorNode.w
riderMaterial.transparent = true
riderMaterial.side = THREE.DoubleSide
riderMaterial.depthWrite = false

// Trail material (cyan glow)
const trailUV = uv()
const trailGlow = smoothstep(0.5, 0.0, trailUV.y.sub(0.5).abs())
const trailColorNode = vec4(0.0, 1.0, 1.0, trailGlow.mul(0.7))

const trailMaterial = new THREE.MeshBasicNodeMaterial()
trailMaterial.colorNode = trailColorNode.xyz
trailMaterial.opacityNode = trailColorNode.w
trailMaterial.transparent = true
trailMaterial.side = THREE.DoubleSide
trailMaterial.depthWrite = false

// Shared trail geometry
const trailGeometry = new THREE.PlaneGeometry(trailWidth, trailWidth)

function updateTrailSegment() {
  if (!trailGroup.value) return

  const currentPos = new THREE.Vector3(posX, posY, posZ)

  trailGeometry.attributes.position?.array
}

function finishTrailSegment() {

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

  const trailStart = new THREE.Mesh(trailGeometry, trailMaterial)
  trailStart.rotation.copy(rider.value.rotation)

  trailGroup.value.add(trailStart)
  trailGroup.value.position.copy(rider.value.position)

  window.addEventListener('keydown', handleKeydown)

  onUnmounted(() => {
    trailStart.geometry.dispose()
    trailStart.material.dispose()
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
  console.log(trailGeometry.attributes.position)

  const dir = directionVelocity[direction]
  const newX = posX + speed * delta * dir.x
  const newY = posY + speed * delta * dir.y

  // Reverse direction at bounds
  if (newX > gridBound) direction = 'left'
  else if (newX < -gridBound) direction = 'right'
  else if (newY > gridBound) direction = 'up'
  else if (newY < -gridBound) direction = 'down'

  posX = newX
  posY = newY

  // Update mesh position and rotation directly
  rider.value.position.set(posX, posY, posZ)

  updateTrailSegment()
})
</script>
