export const getPricePerPlayer = (game_price?: number | null, players_min?: number | null) => {
   if (!game_price || !players_min || players_min <= 0) return null
   return Math.ceil(game_price / players_min)
}
