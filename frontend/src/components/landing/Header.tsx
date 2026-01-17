import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Header = () => {
   const [isMenuOpen, setIsMenuOpen] = useState(false)
   const navigate = useNavigate()

   const navLinks = [
      { label: 'Как это работает', href: '#how' },
      { label: 'Преимущества', href: '#advantages' },
      { label: 'Игрокам', href: '#players' },
      { label: 'Организаторам', href: '#organizers' },
      { label: 'FAQ', href: '#faq' },
   ]

   const handleLogin = () => {
      navigate('/login')
   }

   const handleRegister = () => {
      navigate('/register')
   }

   return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
         <div className="container">
            <div className="flex items-center justify-between h-16 md:h-20">
               {/* Logo */}
               <a href="/" className="font-display text-2xl md:text-3xl text-foreground">
                  INTO<span className="text-primary">GAME</span>
               </a>

               {/* Desktop Navigation */}
               <nav className="hidden lg:flex items-center gap-8">
                  {navLinks.map((link, index) => (
                     <a
                        key={index}
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                     >
                        {link.label}
                     </a>
                  ))}
               </nav>

               {/* Desktop CTA */}
               <div className="hidden lg:flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={handleLogin}>
                     Войти
                  </Button>
                  <Button variant="default" size="sm" onClick={handleRegister}>
                     Регистрация
                  </Button>
               </div>

               {/* Mobile Menu Button */}
               <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="lg:hidden p-2 text-foreground"
                  aria-label="Toggle menu"
               >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
               </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
               <div className="lg:hidden py-4 border-t border-border/50">
                  <nav className="flex flex-col gap-4 mb-6">
                     {navLinks.map((link, index) => (
                        <a
                           key={index}
                           href={link.href}
                           className="text-foreground hover:text-primary transition-colors"
                           onClick={() => setIsMenuOpen(false)}
                        >
                           {link.label}
                        </a>
                     ))}
                  </nav>
                  <div className="flex flex-col gap-3">
                     <Button variant="outline" className="w-full" onClick={handleLogin}>
                        Войти
                     </Button>
                     <Button variant="default" className="w-full" onClick={handleRegister}>
                        Регистрация
                     </Button>
                  </div>
               </div>
            )}
         </div>
      </header>
   )
}

export default Header
