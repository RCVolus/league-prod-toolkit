import { LPTEvent } from '../../types'

export class Registration {
  type: string
  namespace: string
  handle: (event: LPTEvent) => void

  constructor(
    namespace: string,
    type: string,
    handler: (event: LPTEvent) => void
  ) {
    this.namespace = namespace
    this.type = type
    this.handle = handler
  }
}
