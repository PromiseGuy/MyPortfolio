<template>
  <TresMesh :material="gridMaterial">
    <TresPlaneGeometry :args="[size * 2, size * 2, 1, 1]" />
  </TresMesh>
</template>

<script lang="ts" setup>
import * as THREE from 'three/webgpu'
import { fract, max, min, smoothstep, uniform, uv, vec3, vec4 } from 'three/tsl'

const { onBeforeRender } = useLoop()

const size = 5
const divisions = 50

// TSL uniforms for animation
// const scrollOffset = uniform(0.0)

// TSL shader for grid pattern
const uvCoord = uv()

// Scale UV to create grid cells and apply scroll animation
const gridScale = uniform(divisions)
const lineWidth = uniform(0.01) // Width of grid lines

// Apply scrolling offset to UV coordinates (in Z direction, which is V in UV space)
// const scrolledV = fract(uvCoord.y.add(scrollOffset))
const scaledU = fract(uvCoord.x.mul(gridScale))
const scaledV = fract(uvCoord.y.mul(gridScale))

// Create grid lines using distance from cell edges
const distU = min(scaledU, scaledU.oneMinus())
const distV = min(scaledV, scaledV.oneMinus())

// Create sharp lines with smoothstep for anti-aliasing
const lineU = smoothstep(lineWidth, lineWidth.mul(0.5), distU)
const lineV = smoothstep(lineWidth, lineWidth.mul(0.5), distV)

// Combine horizontal and vertical lines
const gridPattern = max(lineU, lineV)

// Fade out towards edges for infinite effect
const edgeFadeU = smoothstep(0.0, 0.1, uvCoord.x).mul(smoothstep(1.0, 0.9, uvCoord.x))
const edgeFadeV = smoothstep(0.0, 0.1, uvCoord.y).mul(smoothstep(1.0, 0.9, uvCoord.y))
const edgeFade = edgeFadeU.mul(edgeFadeV)

// Grid color (neon cyan)
const gridColor = vec3(0.0, 1.0, 1.0)
const baseOpacity = uniform(0.3)

// Final color with transparency
const finalAlpha = gridPattern.mul(baseOpacity).mul(edgeFade)
const colorNode = vec4(gridColor, finalAlpha)

const gridMaterial = new THREE.MeshBasicNodeMaterial()
gridMaterial.colorNode = colorNode.xyz
gridMaterial.opacityNode = colorNode.w
gridMaterial.transparent = true
gridMaterial.side = THREE.DoubleSide
</script>