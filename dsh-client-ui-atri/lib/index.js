// Node half of the ATRI theme client plugin.
// Owns the host-side settings namespace (`atri-ui`) the browser half reads and
// writes for its UI preferences (background glass blur + special accent color).

import z from '@deepseek-ai/schemastery'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'

const NS = settingsNamespace('atri-ui')

// `blur` is the background frost (backdrop) blur radius in px; `accent` is the
// special theme color applied to file-path mentions and workspace folder icons;
// `accent2` is the second special color applied to links, trajectory selection,
// and the "Deep diving" thinking status.
const Schema = z.object({
  blur: z.number().min(0).max(40).default(0),
  accent: z.string().default('#d2c24e'),
  accent2: z.string().default('#7daf4a'),
  inputOpacity: z.number().min(0).max(100).default(100),
  shine: z.boolean().default(true),
  titleColor: z.string().default('#d2c24e'),
  sendColor: z.string().default('#4176e6'),
})

export function apply(ctx) {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(NS, Schema)
  })
}
