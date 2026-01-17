import { Button } from "@/components/ui/button";
import { Search, Users, MapPin, Calendar, ArrowRight } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-32 right-20 w-48 h-48 bg-accent/10 rounded-full blur-3xl animate-pulse-glow animation-delay-500" />
      
      {/* Content */}
      <div className="container relative z-10 text-center px-4">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Форматы 3×3, 4×4, 5×5, 6×6, 7×7 и мини-футбол
            </span>
          </div>
          
          {/* Main Title */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-6 animate-slide-up">
            ИГРАЙ В ФУТБОЛ,
            <br />
            <span className="text-gradient-primary">КОГДА ТЕБЕ УДОБНО</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up animation-delay-200">
            Находи матчи рядом, бронируй место в один клик и играй с проверенными игроками. 
            Создавай свои игры и управляй оплатой без лишних хлопот.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-300">
            <Button variant="hero" size="xl">
              Найти игру
              <Search className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="heroOutline" size="xl">
              Создать матч
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 animate-fade-in animation-delay-500">
            {[
              { icon: Users, value: "25 000+", label: "Игроков" },
              { icon: Calendar, value: "5 000+", label: "Матчей в месяц" },
              { icon: MapPin, value: "150+", label: "Полей" },
              { icon: Search, value: "15", label: "Городов" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-muted/50 backdrop-blur-sm mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="font-display text-3xl text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/50 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
