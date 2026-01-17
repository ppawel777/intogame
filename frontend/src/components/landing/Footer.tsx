/* eslint-disable max-len */
import { Instagram, Mail, MapPin, Phone, Send, Youtube } from 'lucide-react'

const Footer = () => {
   const currentYear = new Date().getFullYear()

   const links = {
      players: [
         { label: 'Найти игру', href: '#' },
         { label: 'Как это работает', href: '#how' },
         { label: 'Рейтинговая система', href: '#' },
         { label: 'FAQ игроков', href: '#faq' },
      ],
      organizers: [
         { label: 'Создать игру', href: '#' },
         { label: 'Стать организатором', href: '#organizers' },
         { label: 'Подключить поле', href: '#' },
         { label: 'FAQ организаторов', href: '#faq' },
      ],
      company: [
         { label: 'О нас', href: '#' },
         { label: 'Блог', href: '#' },
         { label: 'Контакты', href: '#' },
         { label: 'Вакансии', href: '#' },
      ],
      legal: [
         { label: 'Пользовательское соглашение', href: '#' },
         { label: 'Политика конфиденциальности', href: '#' },
         { label: 'Оферта', href: '#' },
      ],
   }

   const socials = [
      { icon: Instagram, href: '#', label: 'Instagram' },
      { icon: Youtube, href: '#', label: 'YouTube' },
      { icon: Send, href: '#', label: 'Telegram' },
   ]

   return (
      <footer className="bg-secondary/50 border-t border-border/50">
         <div className="container py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
               {/* Brand */}
               <div className="lg:col-span-2">
                  <div className="font-display text-3xl text-foreground mb-4">
                     INTO<span className="text-primary">GAME</span>
                  </div>
                  <p className="text-muted-foreground mb-6 max-w-xs">
                     Платформа для любителей футбола. Находи игры, организуй матчи, развивайся вместе с нами.
                  </p>

                  {/* Socials */}
                  <div className="flex gap-3">
                     {socials.map((social, index) => (
                        <a
                           key={index}
                           href={social.href}
                           aria-label={social.label}
                           className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all"
                        >
                           <social.icon className="h-5 w-5" />
                        </a>
                     ))}
                  </div>
               </div>

               {/* Links */}
               <div>
                  <h4 className="font-display text-lg text-foreground mb-4">Игрокам</h4>
                  <ul className="space-y-3">
                     {links.players.map((link, index) => (
                        <li key={index}>
                           <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                              {link.label}
                           </a>
                        </li>
                     ))}
                  </ul>
               </div>

               <div>
                  <h4 className="font-display text-lg text-foreground mb-4">Организаторам</h4>
                  <ul className="space-y-3">
                     {links.organizers.map((link, index) => (
                        <li key={index}>
                           <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                              {link.label}
                           </a>
                        </li>
                     ))}
                  </ul>
               </div>

               <div>
                  <h4 className="font-display text-lg text-foreground mb-4">Компания</h4>
                  <ul className="space-y-3">
                     {links.company.map((link, index) => (
                        <li key={index}>
                           <a href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                              {link.label}
                           </a>
                        </li>
                     ))}
                  </ul>
               </div>

               {/* Contact */}
               <div>
                  <h4 className="font-display text-lg text-foreground mb-4">Контакты</h4>
                  <ul className="space-y-3">
                     <li className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" />
                        <span>info@intogame.ru</span>
                     </li>
                     <li className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4 text-primary" />
                        <span>+7 (800) 123-45-67</span>
                     </li>
                     <li className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>Москва, Россия</span>
                     </li>
                  </ul>
               </div>
            </div>

            {/* Bottom */}
            <div className="mt-12 pt-8 border-t border-border/50">
               <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-muted-foreground">© {currentYear} Intogame. Все права защищены.</div>
                  <div className="flex flex-wrap gap-4 text-sm">
                     {links.legal.map((link, index) => (
                        <a
                           key={index}
                           href={link.href}
                           className="text-muted-foreground hover:text-primary transition-colors"
                        >
                           {link.label}
                        </a>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </footer>
   )
}

export default Footer
