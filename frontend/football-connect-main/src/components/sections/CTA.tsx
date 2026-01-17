import { Button } from "@/components/ui/button";
import { ArrowRight, Smartphone, Mail } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main CTA */}
          <div className="bg-gradient-card rounded-3xl p-8 md:p-16 border border-primary/20 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-3xl" />
            
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
                ГОТОВ <span className="text-gradient-primary">ИГРАТЬ?</span>
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
                Присоединяйся к тысячам игроков уже сегодня. 
                Регистрация занимает меньше минуты.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button variant="hero" size="xl">
                  Зарегистрироваться
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="heroOutline" size="xl">
                  <Smartphone className="mr-2 h-5 w-5" />
                  Скачать приложение
                </Button>
              </div>
              
              {/* App Store badges placeholder */}
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="h-12 px-6 rounded-lg bg-muted/50 flex items-center gap-2 text-muted-foreground">
                  <div className="w-8 h-8 rounded bg-muted" />
                  <div className="text-left">
                    <div className="text-xs">Скоро в</div>
                    <div className="text-sm font-semibold text-foreground">App Store</div>
                  </div>
                </div>
                <div className="h-12 px-6 rounded-lg bg-muted/50 flex items-center gap-2 text-muted-foreground">
                  <div className="w-8 h-8 rounded bg-muted" />
                  <div className="text-left">
                    <div className="text-xs">Скоро в</div>
                    <div className="text-sm font-semibold text-foreground">Google Play</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Secondary CTA - Newsletter */}
          <div className="mt-12 p-8 rounded-2xl bg-muted/20 border border-border/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h3 className="font-display text-2xl text-foreground mb-1">Будь в курсе</h3>
                <p className="text-muted-foreground">Подпишись на новости и получи бонус при первой игре</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input 
                    type="email" 
                    placeholder="Твой email"
                    className="w-full h-12 pl-12 pr-4 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <Button variant="default" size="lg">
                  Подписаться
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
