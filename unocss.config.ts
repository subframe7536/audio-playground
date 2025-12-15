import type { UserConfig } from '@unocss/core'
import { presetWind } from '@unocss/preset-wind3'
import { presetIcons } from '@unocss/preset-icons'
import variantGroup from '@unocss/transformer-variant-group'

const config: UserConfig = {
  presets: [presetWind(), presetIcons({ scale: 1.2 })],
  transformers: [variantGroup()],
}

export default config
