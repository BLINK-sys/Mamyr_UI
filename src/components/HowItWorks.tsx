import { Smartphone, ChefHat, Truck } from "lucide-react";

const steps = [
  {
    icon: Smartphone,
    title: "Выберите блюда",
    desc: "Откройте меню и выберите любимые блюда",
  },
  {
    icon: ChefHat,
    title: "Мы готовим",
    desc: "Наши повара приготовят из свежих продуктов",
  },
  {
    icon: Truck,
    title: "Доставляем",
    desc: "Привезём горячий обед к вашей двери",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-6 bg-card" id="about">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary font-body">Просто</span>
          <h2 className="text-4xl md:text-5xl font-display text-foreground mt-3">
            Как это работает
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center relative">
                <step.icon className="h-8 w-8 text-primary" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center font-body">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-display text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm font-body max-w-xs mx-auto">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
