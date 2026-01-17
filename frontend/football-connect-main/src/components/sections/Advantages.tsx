import { Shield, CreditCard, Video, Star, Share2, Search, Calendar, Users, Wallet } from "lucide-react";

const advantages = [
  {
    number: "01",
    icon: Search,
    title: "Поиск и бронирование",
    description: "Удобный поиск игр по дате, месту и формату. Моментальная бронь и оплата в один клик.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Организация игр",
    description: "Создавайте собственные матчи с делением стоимости аренды. Приватные или открытые варианты на ваш выбор.",
  },
  {
    number: "03",
    icon: Shield,
    title: "Система гаранта",
    description: "Гарантированная безопасность оплаты. Деньги удерживаются до подтверждения проведения матча с видеоподтверждением.",
  },
  {
    number: "04",
    icon: Star,
    title: "Профиль и рейтинг",
    description: "Отслеживайте статистику и достижения. Уникальная формула рейтинга и место в лидерборде.",
  },
  {
    number: "05",
    icon: Share2,
    title: "Контент и сообщество",
    description: "Делитесь видео и фото лучших моментов. Подписывайтесь на игроков, оставляйте отзывы.",
  },
];

const Advantages = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="container relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Преимущества
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
            ВСЁ ДЛЯ ИГРЫ <span className="text-gradient-primary">В ОДНОМ МЕСТЕ</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Intogame объединяет все инструменты для организации и участия в футбольных матчах
          </p>
        </div>
        
        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {advantages.map((item, index) => (
            <div
              key={index}
              className="group relative bg-gradient-card rounded-2xl p-8 border border-border/50 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 shadow-card"
            >
              {/* Number */}
              <div className="absolute top-6 right-6 font-display text-6xl text-muted/30 group-hover:text-primary/20 transition-colors">
                {item.number}
              </div>
              
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <item.icon className="h-7 w-7 text-primary" />
              </div>
              
              {/* Content */}
              <h3 className="font-display text-2xl text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
              
              {/* Hover accent */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
