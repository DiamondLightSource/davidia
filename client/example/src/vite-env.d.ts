/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WS_HOST: string
  readonly VITE_WS_PORT: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}