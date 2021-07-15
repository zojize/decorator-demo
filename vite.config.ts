import { defineConfig } from "vite";
import typescript from "@rollup/plugin-typescript";
import swc from "rollup-plugin-swc";

// import typescript from "rollup-plugin-typescript2";

export default defineConfig({
    plugins: [
        swc({
            jsc: {
                parser: {
                    syntax: "typescript",
                    dynamicImport: true,
                    decorators: true,
                },
                target: "es2021",
                transform: {
                    decoratorMetadata: true,
                },
            },
        }),
    ],
    esbuild: false,
});
