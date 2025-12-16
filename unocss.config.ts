import type { UserConfig } from '@unocss/core'
import { presetWind } from '@unocss/preset-wind3'
import { presetIcons } from '@unocss/preset-icons'
import variantGroup from '@unocss/transformer-variant-group'

const config: UserConfig = {
  presets: [presetWind(), presetIcons({ scale: 1.2 })],
  transformers: [variantGroup()],
  extractors: [
    {
      name: 'extract-icons',
      extract({ extracted }) {
        const arr: string[] = []
        for (const item of extracted) {
          if (item.startsWith('lucide')) {
            extracted.delete(item)
            arr.push(`i-${item}`)
          }
        }
        return arr.length ? arr : undefined
      },
    },
  ],
  preflights: [
    {
      getCSS: () => `
*::-webkit-scrollbar {
  display: none;
}
`,
    },
  ],
}

export default config
