export type GameVotesType = {
   created_at?: string
   game_id: number
   id: number
   user_id: number
}

export type GameType = {
   id: number
   game_date: string | null
   game_time: string[] | null
   game_price: number | null
   creator_id: number | null
   players_min: number | null
   players_limit: number | null
   confirmed_players_count: number
   condition_record: string | null
   place_id: number
   is_active: boolean
   game_status: string | null
   place_name: string
   place_address: string
   votes_count: number
   reserved_count: number
   confirmed_count: number
   user_vote_status: 'pending' | 'confirmed' | 'cancelled' | 'failed' | null
   user_payment_id?: string | null
   user_payment_status?: string | null
}

export type GameFormValuesType = {
   place_id: number
   game_date: string
   game_time: [string, string]
   game_price: number
   players_limit: number
   game_status: 'Активна' | 'Завершена' | 'Отменена' | 'Перенесена'
}

export type UserFromGame = {
   id: number
   user_name: string | null
   first_name: string | null
   last_name: string | null
   email: string | null
   user_phone: string | null
   avatar_url: string | null
   rating: number | null
   score: number | null
   game_id: number
   status_payment: 'pending' | 'confirmed' | 'cancelled' | 'failed' | null
   skill_level: 'Не указано' | 'Новичок' | 'Начинающий' | 'Любитель' | 'Опытный любитель' | 'Полупрофи' | 'Профи'
   birth_year: number
   position: 'Нападающий' | 'Защитник' | 'Вратарь' | 'Полузащитник' | 'Центральный' | 'Универсал'
   quantity: number
}
