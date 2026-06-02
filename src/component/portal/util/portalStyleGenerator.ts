/*
    src/component/portal/util/portalStyleGenerator.ts
*/

export type PortalStyleSection = Record<string, string | number | null | undefined>

export interface PortalStyle {
    'custom-css'?: string
    portal?: PortalStyleSection
    content?: PortalStyleSection
    header?: {
        title?: PortalStyleSection
        description?: PortalStyleSection
    }
    'event-grid'?: PortalStyleSection
    'event-card'?: PortalStyleSection & { hover?: PortalStyleSection }
    'event-card-image'?: PortalStyleSection & { hover?: PortalStyleSection }
    'event-card-info'?: PortalStyleSection
    'event-card-tags'?: PortalStyleSection
    'event-card-type-chips'?: PortalStyleSection
    grid?: PortalStyleSection
    card?: PortalStyleSection
}

export function createPortalStructuredCss(style: PortalStyle, portalUuid: string): string {
    const rootSelector =
        `.uranus-portal-events[data-portal-uuid="${escapeCssString(portalUuid)}"]`

    const parts = [
        createRule(rootSelector, [
            cssDeclaration('background', readStyleValue(style.portal, 'background')),
            cssDeclaration('padding', readStyleValue(style.portal, 'padding')),
            cssDeclaration('color', readStyleValue(style.portal, 'color')),
            cssDeclaration('font-family', readStyleValue(style.portal, 'font-family')),
        ]),

        createRule(
            `${rootSelector} .uranus-portal-events__type-scroller,
       ${rootSelector} .uranus-portal-events__grid,
       ${rootSelector} .uranus-portal-events__state,
       ${rootSelector} .uranus-portal-events__load-more-trigger`,
            [
                cssDeclaration('max-width', readStyleValue(style.content, 'max-width')),
                cssDeclaration('align-self', normalizeContentAlign(readStyleValue(style.content, 'align'))),
            ]
        ),

        createRule(`${rootSelector} .uranus-portal-header h1`, [
            cssDeclaration('color', readStyleValue(style.header?.title, 'color')),
            cssDeclaration('font-size', readStyleValue(style.header?.title, 'font-size')),
            cssDeclaration('font-weight', readStyleValue(style.header?.title, 'font-weight')),
            cssDeclaration('line-height', readStyleValue(style.header?.title, 'line-height')),
        ]),

        createRule(`${rootSelector} .uranus-portal-header p`, [
            cssDeclaration('color', readStyleValue(style.header?.description, 'color')),
            cssDeclaration('font-size', readStyleValue(style.header?.description, 'font-size')),
            cssDeclaration('line-height', readStyleValue(style.header?.description, 'line-height')),
        ]),

        createRule(`${rootSelector} .uranus-portal-events__grid`, [
            cssDeclaration('gap', readStyleValue(style['event-grid'] ?? style.grid, 'gap')),
            cssDeclaration(
                'grid-template-columns',
                createGridTemplate(readStyleValue(style['event-grid'] ?? style.grid, 'min-card-width'))
            ),
        ]),

        createRule(`${rootSelector} .uranus-portal-event-card`, [
            cssDeclaration('background', readStyleValue(style['event-card'] ?? style.card, 'background')),
            cssDeclaration('padding', readStyleValue(style['event-card'] ?? style.card, 'padding')),
            cssDeclaration('gap', readStyleValue(style['event-card'] ?? style.card, 'gap')),
            cssDeclaration('border', readStyleValue(style['event-card'] ?? style.card, 'border')),
            cssDeclaration(
                'border-radius',
                readStyleValue(style['event-card'] ?? style.card, 'radius') ??
                readStyleValue(style['event-card'] ?? style.card, 'border-radius')
            ),
            cssDeclaration('box-shadow', readStyleValue(style['event-card'] ?? style.card, 'shadow')),
            cssDeclaration('transition', readStyleValue(style['event-card'] ?? style.card, 'transition')),
        ]),

        createRule(`${rootSelector} .uranus-portal-event-card__image-frame`, [
            cssDeclaration('background', readStyleValue(style['event-card-image'], 'background')),
            cssDeclaration('aspect-ratio', readStyleValue(style['event-card-image'], 'aspect-ratio')),
            cssDeclaration('border-radius', readStyleValue(style['event-card-image'], 'border-radius')),
        ]),

        createRule(`${rootSelector} .uranus-portal-event-card__image`, [
            cssDeclaration('object-fit', readStyleValue(style['event-card-image'], 'object-fit')),
            cssDeclaration('filter', readStyleValue(style['event-card-image'], 'filter')),
            cssDeclaration('transition', createImageTransition(readStyleValue(style['event-card-image'], 'transition'))),
        ]),

        createRule(`${rootSelector} .uranus-portal-event-card:hover .uranus-portal-event-card__image`, [
            cssDeclaration('filter', readStyleValue(style['event-card-image']?.hover, 'filter')),
            cssDeclaration('transform', createScaleTransform(readStyleValue(style['event-card-image']?.hover, 'scale'))),
        ]),

        createRule(`${rootSelector} .uranus-portal-event-card__body`, [
            cssDeclaration('padding', readStyleValue(style['event-card-info'], 'padding')),
            cssDeclaration('background', readStyleValue(style['event-card-info'], 'background')),
            cssDeclaration('border', readStyleValue(style['event-card-info'], 'border')),
            cssDeclaration('border-radius', readStyleValue(style['event-card-info'], 'border-radius')),
            cssDeclaration('color', readStyleValue(style['event-card-info'], 'color')),
        ]),

        createRule(`${rootSelector} .uranus-portal-event-card h2`, [
            cssDeclaration('font-family', readStyleValue(style['event-card-info'], 'title-font-family')),
            cssDeclaration('font-size', readStyleValue(style['event-card-info'], 'title-font-size')),
            cssDeclaration('font-weight', readStyleValue(style['event-card-info'], 'title-font-weight')),
        ]),

        createRule(`${rootSelector} .uranus-portal-event-card__meta`, [
            cssDeclaration('font-family', readStyleValue(style['event-card-info'], 'meta-font-family')),
            cssDeclaration('font-size', readStyleValue(style['event-card-info'], 'meta-font-size')),
            cssDeclaration('font-weight', readStyleValue(style['event-card-info'], 'meta-font-weight')),
            cssDeclaration('line-height', readStyleValue(style['event-card-info'], 'meta-line-height')),
            cssDeclaration('gap', readStyleValue(style['event-card-info'], 'meta-gap')),
        ]),
    ]

    return parts.filter(Boolean).join('\n')
}

/* ---------------- helpers ---------------- */

function readStyleValue(section: PortalStyleSection | null | undefined, key: string) {
    const value = section?.[key]

    if (value == null || value === '') return null
    if (typeof value === 'number') return Number.isFinite(value) ? String(value) : null
    if (typeof value !== 'string') return null

    const trimmed = value.trim()
    if (!trimmed || /[{};]/.test(trimmed)) return null

    return trimmed
}

function createRule(selector: string, declarations: Array<string | null>) {
    const body = declarations.filter(Boolean)
    if (!body.length) return ''

    return `${selector} {\n${body.map(d => `  ${d}`).join('\n')}\n}`
}

function cssDeclaration(property: string, value: string | null | undefined) {
    return value ? `${property}: ${value};` : null
}

function createGridTemplate(minCardWidth: string | null) {
    return minCardWidth
        ? `repeat(auto-fill, minmax(${minCardWidth}, 1fr))`
        : null
}

function createScaleTransform(scale: string | null) {
    return scale ? `scale(${scale})` : null
}

function createImageTransition(transition: string | null) {
    return transition ? `transform ${transition}, filter ${transition}` : null
}

function normalizeContentAlign(value: string | null) {
    if (!value) return null

    switch (value) {
        case 'left':
        case 'start':
            return 'flex-start'
        case 'center':
            return 'center'
        case 'right':
        case 'end':
            return 'flex-end'
        case 'stretch':
            return 'stretch'
        default:
            return value
    }
}

function escapeCssString(value: string) {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\a ')
}