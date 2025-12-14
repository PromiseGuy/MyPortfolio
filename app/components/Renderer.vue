<template>
  <TresCanvas :renderer="(ctx: TresRendererSetupContext) => renderer.createRenderer(ctx, props.RendererParams)">
    <slot />
  </TresCanvas>
</template>

<script lang="ts" setup>
import type { TresRendererSetupContext } from '@tresjs/core';
import type { WebGPURendererParameters } from 'three/src/renderers/webgpu/WebGPURenderer.js';

const props = defineProps<{
  RendererParams?: WebGPURendererParameters
}>()

const renderer = useRenderer()
</script>

<style></style>