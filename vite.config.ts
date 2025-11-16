import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import { resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const apiTarget = env.VITE_API_URL

    return {
        plugins: [
            vue(),
            VueI18nPlugin({
                include: [resolve(__dirname, './src/locales/**')],
                runtimeOnly: false,
            }),
        ],
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
            },
        },
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: `@use "@/styles/_mixins.scss" as *;`,
                },
            },
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
        build: {
            chunkSizeWarningLimit: 1200,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('vue') || id.includes('pinia')) {
                                return 'vendor-vue'
                            }

                            if (id.includes('@intlify')) {
                                return 'vendor-i18n'
                            }

                            if (id.includes('maplibre')) {
                                return 'vendor-maplibre'
                            }

                            return 'vendor'
                        }
                    },
                },
            },
        },
    }
})
