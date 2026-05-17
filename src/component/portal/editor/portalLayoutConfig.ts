export type PortalLinkTarget = '_self' | '_blank'
export type PortalHeaderLayout = 'left' | 'centered'

export type PortalHeaderButtonConfig = {
  label: string
  url: string
  target: PortalLinkTarget
  cssClass: string
}

export type PortalHeaderConfig = {
  layout: PortalHeaderLayout
  showLogo: boolean
  showTitle: boolean
  showDescription: boolean
  logoLinkUrl: string
  logoLinkTarget: PortalLinkTarget
  buttons: PortalHeaderButtonConfig[]
}

export type PortalFooterLinkConfig = {
  label: string
  url: string
  target: PortalLinkTarget
}

export type PortalFooterConfig = {
  showLogo: boolean
  logoLinkUrl: string
  logoLinkTarget: PortalLinkTarget
  text: string
  links: PortalFooterLinkConfig[]
}

const linkTargets: PortalLinkTarget[] = ['_self', '_blank']
const headerLayouts: PortalHeaderLayout[] = ['left', 'centered']

export const portalLinkTargets = linkTargets
export const portalHeaderLayouts = headerLayouts

export function isPortalLinkTarget(value: unknown): value is PortalLinkTarget {
  return value === '_self' || value === '_blank'
}

export function isPortalHeaderLayout(value: unknown): value is PortalHeaderLayout {
  return value === 'left' || value === 'centered'
}

export function readRecord(source: Record<string, unknown> | null | undefined, key: string) {
  const value = source?.[key]
  return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null
}

export function readString(source: Record<string, unknown> | null | undefined, key: string, fallback = '') {
  const value = source?.[key]
  return typeof value === 'string' ? value : fallback
}

export function readBoolean(source: Record<string, unknown> | null | undefined, key: string, fallback = false) {
  const value = source?.[key]
  return typeof value === 'boolean' ? value : fallback
}

export function readTarget(source: Record<string, unknown> | null | undefined, key: string, fallback: PortalLinkTarget = '_self') {
  const value = source?.[key]
  return isPortalLinkTarget(value) ? value : fallback
}

export function readHeaderLayout(source: Record<string, unknown> | null | undefined, key: string, fallback: PortalHeaderLayout = 'left') {
  const value = source?.[key]
  return isPortalHeaderLayout(value) ? value : fallback
}

export function createEmptyHeaderButton(): PortalHeaderButtonConfig {
  return {
    label: '',
    url: '',
    target: '_self',
    cssClass: 'uranus-portal__button1',
  }
}

export function createHeaderConfig(source: Record<string, unknown> | null | undefined): PortalHeaderConfig {
  const buttons = Array.isArray(source?.buttons)
      ? source.buttons
          .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object' && !Array.isArray(entry))
          .map(entry => ({
            label: readString(entry, 'label'),
            url: readString(entry, 'url'),
            target: readTarget(entry, 'target'),
            cssClass: readString(entry, 'cssClass', readString(entry, 'css_class', 'uranus-portal__button1')),
          }))
      : []

  return {
    layout: readHeaderLayout(source, 'layout'),
    showLogo: readBoolean(source, 'showLogo', readBoolean(source, 'show_logo', true)),
    showTitle: readBoolean(source, 'showTitle', readBoolean(source, 'show_title', true)),
    showDescription: readBoolean(source, 'showDescription', readBoolean(source, 'show_description', true)),
    logoLinkUrl: readString(source, 'logoLinkUrl', readString(source, 'logo_link_url')),
    logoLinkTarget: readTarget(source, 'logoLinkTarget', readTarget(source, 'logo_link_target')),
    buttons,
  }
}

export function buildHeaderPayload(value: PortalHeaderConfig) {
  return {
    layout: value.layout,
    showLogo: value.showLogo,
    showTitle: value.showTitle,
    showDescription: value.showDescription,
    logoLinkUrl: value.logoLinkUrl,
    logoLinkTarget: value.logoLinkTarget,
    buttons: value.buttons.map(button => ({
      label: button.label,
      url: button.url,
      target: button.target,
      cssClass: button.cssClass,
    })),
  }
}

export function createEmptyFooterLink(): PortalFooterLinkConfig {
  return {
    label: '',
    url: '',
    target: '_self',
  }
}

export function createFooterConfig(source: Record<string, unknown> | null | undefined): PortalFooterConfig {
  const links = Array.isArray(source?.links)
      ? source.links
          .filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === 'object' && !Array.isArray(entry))
          .map(entry => ({
            label: readString(entry, 'label'),
            url: readString(entry, 'url'),
            target: readTarget(entry, 'target'),
          }))
      : []

  return {
    showLogo: readBoolean(source, 'showLogo', readBoolean(source, 'show_logo', false)),
    logoLinkUrl: readString(source, 'logoLinkUrl', readString(source, 'logo_link_url')),
    logoLinkTarget: readTarget(source, 'logoLinkTarget', readTarget(source, 'logo_link_target')),
    text: readString(source, 'text'),
    links,
  }
}

export function buildFooterPayload(value: PortalFooterConfig) {
  return {
    showLogo: value.showLogo,
    logoLinkUrl: value.logoLinkUrl,
    logoLinkTarget: value.logoLinkTarget,
    text: value.text,
    links: value.links.map(link => ({
      label: link.label,
      url: link.url,
      target: link.target,
    })),
  }
}
