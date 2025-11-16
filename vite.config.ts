import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    const apiTarget = env.VITE_API_URL

    return {
        plugins: [vue()],
        define: {
            __VUE_I18N_FULL_INSTALL__: true,
            __VUE_I18N_LEGACY_API__: true,       // 👈 wichtig für $t / Legacy
            __INTLIFY_JIT_COMPILATION__: true,   // 👈 JIT-Compiler einschalten (Prod)
            __INTLIFY_DROP_MESSAGE_COMPILER__: false,
            __INTLIFY_PROD_DEVTOOLS__: false,
        },
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
