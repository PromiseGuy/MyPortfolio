<template>
  <div class="index-page w-full h-full color-text">
    <div class="index-bg fixed top-0 left-0 w-full h-full pointer-events-none z-1">
      <div class="canvas-container w-full h-full">
        <Renderer :renderer-params="heroRendererParams">
          <TresPerspectiveCamera :position="[0, 0, 5]" :look-at="[0, 0, 0]" />
          <TronGrid />
          <TronPlayer />
        </Renderer>
      </div>
    </div>

    <section class="hero-section flex flex-row items-center w-full h-screen relative z-2">
      <HeroText />
    </section>

    <section class="projects-section w-full h-screen relative z-2">
      <Projects />
    </section>
  </div>
</template>

<script lang="ts" setup>
import type { WebGPURendererParameters } from 'three/src/renderers/webgpu/WebGPURenderer.js';

const heroRendererParams: WebGPURendererParameters = {
  antialias: true,
  alpha: true,
}
</script>

<style scoped lang="scss"></style>