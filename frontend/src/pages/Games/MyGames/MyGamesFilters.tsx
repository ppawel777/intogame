import { Radio } from 'antd'

type MyGamesFilterType = 'Участник' | 'Создатель' | 'Избранное' | null

interface MyGamesFiltersProps {
   value: MyGamesFilterType
   onChange: (value: MyGamesFilterType) => void
   availableFilters: MyGamesFilterType[]
   size?: 'small' | 'middle' | 'large'
}

export const MyGamesFilters = ({ value, onChange, availableFilters, size = 'middle' }: MyGamesFiltersProps) => {
   const isParticipantAvailable = availableFilters.includes('Участник')
   const isCreatorAvailable = availableFilters.includes('Создатель')
   const isFavoriteAvailable = availableFilters.includes('Избранное')

   return (
      <div style={{ marginBottom: '16px' }}>
         <Radio.Group value={value} onChange={(e) => onChange(e.target.value)} size={size}>
            <Radio.Button value="Участник" disabled={!isParticipantAvailable}>
               Участник
            </Radio.Button>
            <Radio.Button value="Создатель" disabled={!isCreatorAvailable}>
               Создатель
            </Radio.Button>
            <Radio.Button value="Избранное" disabled={!isFavoriteAvailable}>
               Избранное
            </Radio.Button>
         </Radio.Group>
      </div>
   )
}
