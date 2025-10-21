import { defineConfig } from 'vite';

export default defineConfig({
    base: '/Jank/',
    build: {
        outDir: 'dist'
    },
    resolve: {
        extensions: ['.ts', '.js', '.tsx', '.jsx'],
        alias: {
            '@': '/src'
        }
    },
    optimizeDeps: {
        include: ['three']
    },
    esbuild: {
        target: 'es2020'
    }
});
