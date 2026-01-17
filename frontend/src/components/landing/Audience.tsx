/* eslint-disable max-len */
import { Button } from '@/components/ui/button'
import { CreditCard, PlusCircle, Search, Settings, Trophy, UserPlus, Users, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ForPlayers = () => {
   const navigate = useNavigate()
   const steps = [
      { icon: UserPlus, title: 'Зарегистрируйся', description: 'Создай профиль за минуту' },
      { icon: Search, title: 'Найди игру', description: 'Выбери время, место и формат' },
      { icon: CreditCard, title: 'Оплати участие', description: 'Безопасная оплата через платформу' },
      { icon: Trophy, title: 'Играй и развивайся', description: 'Набирай рейтинг и достижения' },
   ]

   const handleFindGame = () => {
      navigate('/login')
   }

   return (
      <div className="bg-gradient-card rounded-3xl p-8 md:p-12 border border-border/50">
         <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
               <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-display text-3xl text-foreground">ДЛЯ ИГРОКОВ</h3>
         </div>

         <p className="text-muted-foreground text-lg mb-8">
            Находи матчи рядом с тобой, записывайся и играй с проверенными игроками. Отслеживай свою статистику и становись
            лучше с каждой игрой.
         </p>

         <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
               <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
               >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                     <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                     <div className="font-semibold text-foreground">{step.title}</div>
                     <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                  <div className="ml-auto font-display text-2xl text-muted/50">0{index + 1}</div>
               </div>
            ))}
         </div>

         <Button variant="hero" className="w-full" onClick={handleFindGame}>
            Найти игру рядом
            <Search className="ml-2 h-5 w-5" />
         </Button>
      </div>
   )
}

const ForOrganizers = () => {
   const navigate = useNavigate()
   const steps = [
      { icon: PlusCircle, title: 'Создай игру', description: 'Укажи время, место и стоимость' },
      { icon: Users, title: 'Собери команды', description: 'Игроки сами запишутся на матч' },
      { icon: Settings, title: 'Управляй', description: 'Подтверждай заявки и общайся' },
      { icon: Wallet, title: 'Получи оплату', description: 'Деньги поступят после игры' },
   ]

   const handleCreateGame = () => {
      navigate('/login')
   }

   return (
      <div className="bg-gradient-card rounded-3xl p-8 md:p-12 border border-accent/30">
         <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
               <Settings className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-display text-3xl text-foreground">ДЛЯ ОРГАНИЗАТОРОВ</h3>
         </div>

         <p className="text-muted-foreground text-lg mb-8">
            Создавай матчи, находи игроков и управляй оплатой без лишних хлопот. Все инструменты для организации игр в одном
            месте.
         </p>

         <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
               <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
               >
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                     <step.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                     <div className="font-semibold text-foreground">{step.title}</div>
                     <div className="text-sm text-muted-foreground">{step.description}</div>
                  </div>
                  <div className="ml-auto font-display text-2xl text-muted/50">0{index + 1}</div>
               </div>
            ))}
         </div>

         <Button variant="accent" className="w-full" size="xl" onClick={handleCreateGame}>
            Создать игру
            <PlusCircle className="ml-2 h-5 w-5" />
         </Button>
      </div>
   )
}

const Audience = () => {
   return (
      <section id="players" className="py-24 bg-secondary/30 relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />

         <div className="container relative">
            <div className="text-center mb-16">
               <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Для кого Intogame
               </span>
               <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
                  ВЫБЕРИ <span className="text-gradient-accent">СВОЮ РОЛЬ</span>
               </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <ForPlayers />
               <ForOrganizers />
            </div>
         </div>
      </section>
   )
}

export default Audience
