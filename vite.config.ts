import { defineConfig } from 'vite';
import typescript from '@rollup/plugin-typescript';
import swc from 'rollup-plugin-swc';

// import typescript from "rollup-plugin-typescript2";

const swcPlugin = (() => {
  const plugin = swc({
    test: 'ts',
    jsc: {
      parser: {
        syntax: 'typescript',
        dynamicImport: true,
        decorators: true,
      },
      target: 'es2021',
      transform: {
        decoratorMetadata: true,
      },
    },
  });

  const originalTransform = plugin.transform!;

  const transform = function (...args: Parameters<typeof originalTransform>) {
    if (!args[1].endsWith('html')) return originalTransform.apply(this, args);
  };

  return { ...plugin, transform };
})();

export default defineConfig({
  plugins: [swcPlugin],
  // esbuild: false,
  build: {},
});
