export interface UranusOrganizationTeamMemberDTO {
    user_uuid: string
    display_name: string | null
    email: string
    role_id: number | null
    role_name: string
    avatar_url?: string | null
    last_active_at?: string | null
    joined_at?: string | null
}