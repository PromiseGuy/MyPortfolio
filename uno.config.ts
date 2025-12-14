import { defineConfig, transformerDirectives } from 'unocss'
import type { Theme } from '@outloud/css'
import { presetOutloud } from '@outloud/css'

export default defineConfig<Theme>({
  presets: [
    presetOutloud({}),
  ],
  transformers: [
    transformerDirectives(), // use directives
  ],
  theme: {
    colors: {
      "black-1": "rgb(82, 82, 82)", // darkest gray
      "black-2": "rgb(61, 61, 61)",
      "black-3": "rgb(46, 46, 46)",
      "black-4": "rgb(31, 31, 31)",
      "black-5": "rgb(15, 15, 15)", // near pure black

      "white-1": "rgb(255, 255, 255)", // pure white
      "white-2": "rgb(242, 242, 242)", // very light gray
      "white-3": "rgb(230, 230, 230)", // light gray
      "white-4": "rgb(217, 217, 217)", // soft gray
      "white-5": "rgb(204, 204, 204)", // lightest shadow tone

      "text": "var(--color-white-2)", // main text color
      "text-muted": "var(--color-white-4)", // muted text color

      "bd": "rgb(102, 102, 102)", // border color
      "highlight": "rgb(128, 128, 128)", // highlight color (e.g., for selected items)
      "bd-muted": "rgb(77, 77, 77)", // muted border color
      "highlight-muted": "rgb(102, 102, 102)", // muted highlight color

      "primary": "rgb(22, 219, 101)", // primary accent color (blueish)
      "secondary": "rgb(143, 255, 143)", // secondary accent color (greenish)
      "success": "rgb(90, 191, 90)", // success color (greenish)
      "warning": "rgb(212, 191, 77)", // warning color (yellowish)
      "error": "rgb(191, 90, 90)", // error color (reddish)

      "bg-dark": "var(--color-black-5)", // dark background
      "bg": "var(--color-black-3)", // main background
      "bg-light": "var(--color-black-1)", // light background
    },
  },
})

