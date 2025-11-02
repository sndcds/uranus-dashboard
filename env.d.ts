/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL: string
	// Imprint configuration
	readonly VITE_IMPRINT_ORGANIZATION_NAME: string
	readonly VITE_IMPRINT_STREET: string
	readonly VITE_IMPRINT_POSTAL_CODE: string
	readonly VITE_IMPRINT_CITY: string
	readonly VITE_IMPRINT_COUNTRY: string
	readonly VITE_IMPRINT_PHONE: string
	readonly VITE_IMPRINT_EMAIL: string
	readonly VITE_IMPRINT_WEBSITE: string
	readonly VITE_IMPRINT_REPRESENTED_BY: string
	readonly VITE_IMPRINT_REGISTER_COURT: string
	readonly VITE_IMPRINT_REGISTER_NUMBER: string
	readonly VITE_IMPRINT_VAT_ID: string
	readonly VITE_IMPRINT_CONTENT_RESPONSIBLE_NAME: string
	readonly VITE_IMPRINT_CONTENT_RESPONSIBLE_ADDRESS: string
	readonly VITE_IMPRINT_CONTENT_RESPONSIBLE_POSTAL_CODE: string
	readonly VITE_IMPRINT_CONTENT_RESPONSIBLE_CITY: string
	// Privacy policy configuration
	readonly VITE_PRIVACY_HOSTING_PROVIDER: string
	readonly VITE_PRIVACY_HOSTING_PROVIDER_ADDRESS: string
	readonly VITE_PRIVACY_HOSTING_PROVIDER_COUNTRY: string
	readonly VITE_PRIVACY_DPO_NAME: string
	readonly VITE_PRIVACY_DPO_EMAIL: string
	readonly VITE_PRIVACY_LAST_UPDATED: string
	// Terms of use configuration
	readonly VITE_TERMS_LAST_UPDATED: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
	export default component
}
