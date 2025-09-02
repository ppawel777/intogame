export type GameVotesType = {
   created_at?: string
   game_id: number
   id: number
   user_id: number
}

export type GameType = {
   id: number
   place_name: string
   place_address: string
   game_date: string
   game_time: [string, string]
   players_limit: number
   players_total: number
   game_price: number
   votes_count: number
   is_active: boolean
}

export type GameFormValuesType = {
   place_id: number
   game_date: string
   game_time: [string, string]
   game_price: number
   players_limit: number
}

export type UserFromGame = {
   id: number
   user_name: string
   avatar_url: string | null
   rating?: number
   games_played?: number
   description?: string
}
