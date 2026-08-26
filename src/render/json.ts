import type { ActivityModel } from '../types.js'

export const renderJson = (model: ActivityModel): string => `${JSON.stringify(model, null, 2)}\n`
