/* eslint-disable max-len */
import { CheckCircle, Shield, Zap, Users } from 'lucide-react'

const advantages = [
   {
      icon: Zap,
      title: 'Быстрый поиск',
      description: 'Находи матчи рядом с тобой за секунды. Фильтры по дате, формату и месту.',
      color: 'primary',
   },
   {
      icon: Shield,
      title: 'Безопасная оплата',
      description: 'Деньги защищены системой гаранта. Оплата только после подтверждения участия.',
      color: 'primary',
   },
   {
      icon: Users,
      title: 'Проверенные игроки',
      description: 'Рейтинговая система и отзывы помогают найти надежных партнеров для игры.',
      color: 'accent',
   },
   {
      icon: CheckCircle,
      title: 'Удобное управление',
      description: 'Создавай игры, управляй заявками и общайся с игроками в одном месте.',
      color: 'accent',
   },
]

const Advantages = () => {
   return (
      <section id="advantages" className="py-24 bg-background relative overflow-hidden">
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-5">
            <div
               className="absolute inset-0"
               style={{
                  backgroundImage:
                     'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2322c55e\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
               }}
            />
         </div>

         <div className="container relative">
            <div className="text-center mb-16">
               <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Преимущества
               </span>
               <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
                  ПОЧЕМУ ВЫБИРАЮТ <span className="text-gradient-primary">INTOGAME</span>
               </h2>
               <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Все инструменты для организации и участия в играх в одном приложении
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
               {advantages.map((advantage, index) => (
                  <div
                     key={index}
                     className="bg-gradient-card rounded-2xl p-8 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
                  >
                     <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${
                           advantage.color === 'primary' ? 'bg-primary/20' : 'bg-accent/20'
                        }`}
                     >
                        <advantage.icon
                           className={`h-8 w-8 ${advantage.color === 'primary' ? 'text-primary' : 'text-accent'}`}
                        />
                     </div>
                     <h3 className="font-display text-2xl text-foreground mb-3">{advantage.title}</h3>
                     <p className="text-muted-foreground leading-relaxed">{advantage.description}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>
   )
}

export default Advantages
