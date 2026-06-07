/*
    src/domain/event/eventTicketFlags.model.ts
 */

export type EventTicketFlags =
    | 'presale_fee_applies'
    | 'vip'
    | 'sold_out'

export type EventTicketFlagArray = EventTicketFlags[]