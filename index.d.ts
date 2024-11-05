import type { LPTEService } from './frontend/frontend-lib'

export { }

declare global {
  interface Window {
    LPTE: LPTEService
    apiKey: string | null
    constants: {
      getApiKey: () => string | null
      getServerURL: () => string
      getModuleURL: () => string
      /**
       *
       * @deprecated will be replaced with getServerURL for better use
       */
      getWebServerPort: () => string
    }
    getActionLink: (namespace: string, type: string, params?: Record<string, string>) => Promise<void>
  }
}
