declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_APP_BASE_PATH: string;
}

interface ImportMetaEnv {
  readonly VITE_DRAIN_THRESHOLD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
