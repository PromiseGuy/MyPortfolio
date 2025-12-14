import type { TresRendererSetupContext } from '@tresjs/core'
import type { WebGPURendererParameters } from 'three/src/renderers/webgpu/WebGPURenderer.js'
import { WebGPURenderer } from 'three/webgpu'

export function useRenderer() {

  function createRenderer(ctx: TresRendererSetupContext, RendererParams?: WebGPURendererParameters) {
  const renderer = new WebGPURenderer({
    canvas: toValue(ctx.canvas),
    ...RendererParams,
  })
  
    return renderer
  }

  return { createRenderer }
}