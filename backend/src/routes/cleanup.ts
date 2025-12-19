import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase'

const router = Router()

/**
 * POST /api/cleanup/game-chats
 * Очистка старых сообщений чата для завершенных/отмененных игр
 */
router.post('/game-chats', async (req, res) => {
   try {
      // Вызываем функцию очистки в БД
      const { data, error } = await supabaseAdmin.rpc('cleanup_old_game_chats')

      if (error) {
         console.error('[Cleanup] Error:', error)
         return res.status(500).json({ error: error.message })
      }

      const deletedGames = data || []
      const totalDeleted = deletedGames.reduce((sum: number, item: any) => sum + (item.deleted_count || 0), 0)

      console.log(`[Cleanup] Deleted ${totalDeleted} messages from ${deletedGames.length} games`)

      res.json({
         success: true,
         deletedGames: deletedGames.length,
         totalMessages: totalDeleted,
         games: deletedGames,
      })
   } catch (error: any) {
      console.error('[Cleanup] Unexpected error:', error)
      res.status(500).json({ error: 'Internal server error' })
   }
})

export default router

