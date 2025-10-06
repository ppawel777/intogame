import { GameType } from '@typesDir/gameTypes'
import { Dayjs } from 'dayjs'

export type GamesModalProps = {
   isOpen: boolean
   onClose: () => void
   games: GameType[]
   date: Dayjs | null
   userId: number | null
}
