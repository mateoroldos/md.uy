import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			srcDir: './src',
			// Use 'production' for builds, 'development' for dev
			mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
			strategies: 'generateSW',
			injectRegister: 'auto',
			filename: undefined,
			scope: '/',
			base: '/',
			manifest: {
				name: 'md.uy',
				short_name: 'md.uy',
				description: 'The peer-to-peer markdown editor',
				theme_color: '#559ede',
				background_color: '#ffffff',
				display: 'standalone',
				scope: '/',
				start_url: '/',
				icons: [
					{
						src: '/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: '/pwa-maskable.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				// Updated glob patterns for static adapter output
				globPatterns: [
					'**/*.{js,css,html,ico,png,svg,webp,woff,woff2}',
					'_app/immutable/**/*.{js,css}'
				],
				// Exclude service worker files from being cached
				globIgnores: ['**/sw.js', '**/workbox-*.js'],
				// Cache strategy for your app
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							}
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'gstatic-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							}
						}
					}
				]
			},
			devOptions: {
				enabled: true,
				suppressWarnings: true,
				type: 'module'
			}
		})
	],
	optimizeDeps: {
		esbuildOptions: {
			// Node.js global to browser globalThis
			define: {
				global: 'globalThis'
			},
			// Enable esbuild polyfill plugins
			plugins: [
				NodeGlobalsPolyfillPlugin({
					buffer: true
				})
			]
		}
	},
	// Tauri-specific configuration
	clearScreen: false,
	server: {
		port: 5173,
		// Tauri expects a fixed port, fail if that port is not available
		// prevent vite from obscuring rust errors
		strictPort: true,
		// if the host Tauri is expecting is set, use it
		host: host || false,
		hmr: host
			? {
					protocol: 'ws',
					host,
					port: 1421
				}
			: undefined,

		watch: {
			// tell vite to ignore watching `src-tauri`
			ignored: ['**/src-tauri/**']
		}
	},
	// Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
	envPrefix: ['VITE_', 'TAURI_ENV_*'],
	build: {
		// Tauri uses Chromium on Windows and WebKit on macOS and Linux
		target: process.env.TAURI_ENV_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
		// don't minify for debug builds
		minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
		// produce sourcemaps for debug builds
		sourcemap: !!process.env.TAURI_ENV_DEBUG
	}
});
