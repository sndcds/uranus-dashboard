import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const apiTarget = env.VITE_API_URL

    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "@/styles/_mixins.scss" as *;`
                }
            }
        },
        server: {
            proxy: {
                '/api': {
                    target: apiTarget,
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    }
})
