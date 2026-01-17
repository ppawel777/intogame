import { Users, Calendar, MapPin, Star, TrendingUp, Trophy } from "lucide-react";

const stats = [
  { icon: Users, value: "25 000+", label: "Активных игроков", growth: "+15% в месяц" },
  { icon: Calendar, value: "5 000+", label: "Матчей в месяц", growth: "+22% в месяц" },
  { icon: MapPin, value: "150+", label: "Полей подключено", growth: "+8 новых" },
  { icon: Star, value: "4.8", label: "Средняя оценка", growth: "из 5.0" },
  { icon: TrendingUp, value: "15", label: "Городов России", growth: "+3 скоро" },
  { icon: Trophy, value: "500+", label: "Турниров проведено", growth: "+50 в месяц" },
];

const testimonials = [
  {
    name: "Алексей К.",
    role: "Игрок",
    text: "Раньше собрать команду было настоящей проблемой. Теперь просто открываю приложение и за 5 минут записываюсь на игру. Играю 3-4 раза в неделю!",
    rating: 5,
    date: "декабрь 2024",
  },
  {
    name: "Михаил С.",
    role: "Организатор",
    text: "Организую матчи на двух полях и Intogame решил все проблемы с оплатой. Больше не нужно собирать деньги вручную — всё автоматически.",
    rating: 5,
    date: "ноябрь 2024",
  },
  {
    name: "Дмитрий В.",
    role: "Игрок",
    text: "Отличный сервис! Нашёл постоянную команду, с которой теперь играем каждую неделю. Рейтинговая система мотивирует становиться лучше.",
    rating: 5,
    date: "декабрь 2024",
  },
];

const Stats = () => {
  return (
    <section className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container relative">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Статистика
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            ЦИФРЫ <span className="text-gradient-primary">ГОВОРЯТ САМИ</span>
          </h2>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-gradient-card rounded-2xl p-6 border border-border/50 text-center hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="font-display text-3xl md:text-4xl text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground mb-2">{stat.label}</div>
              <div className="text-xs text-primary">{stat.growth}</div>
            </div>
          ))}
        </div>
        
        {/* Testimonials */}
        <div className="text-center mb-12">
          <h3 className="font-display text-3xl text-foreground">ОТЗЫВЫ ИГРОКОВ</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gradient-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-foreground/90 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>
              
              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
                <div className="text-xs text-muted-foreground">{testimonial.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
