/* eslint-disable max-len */
import { CreditCard, Play, Search, Trophy } from 'lucide-react'

const steps = [
   {
      icon: Search,
      title: 'Найди игру',
      description: 'Выбери дату, формат и место. Смотри доступные матчи на карте или в списке.',
      color: 'primary',
   },
   {
      icon: CreditCard,
      title: 'Забронируй место',
      description: 'Оплати участие безопасно через платформу. Деньги защищены системой гаранта.',
      color: 'accent',
   },
   {
      icon: Play,
      title: 'Играй',
      description: 'Приходи на поле и наслаждайся игрой с проверенными игроками.',
      color: 'primary',
   },
   {
      icon: Trophy,
      title: 'Развивайся',
      description: 'Получай рейтинг, достижения и открывай новые возможности.',
      color: 'accent',
   },
]

const HowItWorks = () => {
   return (
      <section id="how" className="py-24 bg-background relative overflow-hidden">
         {/* Background pattern */}
         <div className="absolute inset-0 opacity-5">
            <div
               className="absolute inset-0"
               style={{
                  // eslint-disable-next-line quotes
                  backgroundImage:
                     // eslint-disable-next-line prettier/prettier
                     'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2322c55e\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
               }}
            />
         </div>

         <div className="container relative">
            <div className="text-center mb-16">
               <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Как это работает
               </span>
               <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
                  4 ПРОСТЫХ <span className="text-gradient-primary">ШАГА</span>
               </h2>
               <p className="text-muted-foreground text-lg max-w-2xl mx-auto">От поиска до игры — всего несколько минут</p>
            </div>

            {/* Steps */}
            <div className="relative max-w-4xl mx-auto">
               {/* Connection Line */}
               <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary -translate-y-1/2 z-0" />

               <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                  {steps.map((step, index) => (
                     <div key={index} className="flex flex-col items-center text-center group">
                        {/* Step Number */}
                        <div className="font-display text-7xl text-muted/20 mb-4 group-hover:text-primary/30 transition-colors">
                           0{index + 1}
                        </div>

                        {/* Icon Circle */}
                        <div
                           className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 ${
                              step.color === 'primary'
                                 ? 'bg-primary/20 group-hover:bg-primary/30'
                                 : 'bg-accent/20 group-hover:bg-accent/30'
                           }`}
                        >
                           <step.icon
                              className={`h-10 w-10 ${step.color === 'primary' ? 'text-primary' : 'text-accent'}`}
                           />
                        </div>

                        {/* Content */}
                        <h3 className="font-display text-xl text-foreground mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </section>
   )
}

export default HowItWorks
