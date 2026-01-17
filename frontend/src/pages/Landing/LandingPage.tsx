import Header from '@/components/landing/Header'
import Hero from '@/components/landing/Hero'
import Advantages from '@/components/landing/Advantages'
import Audience from '@/components/landing/Audience'
import HowItWorks from '@/components/landing/HowItWorks'
import Stats from '@/components/landing/Stats'
import CTA from '@/components/landing/CTA'
import Footer from '@/components/landing/Footer'

const LandingPage = () => {
   return (
      <div className="min-h-screen bg-background text-foreground">
         <Header />
         <main>
            <Hero />
            <Advantages />
            <Audience />
            <HowItWorks />
            <Stats />
            <CTA />
         </main>
         <Footer />
      </div>
   )
}

export default LandingPage
