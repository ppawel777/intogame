import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import Advantages from "@/components/sections/Advantages";
import Audience from "@/components/sections/Audience";
import HowItWorks from "@/components/sections/HowItWorks";
import Stats from "@/components/sections/Stats";
import CTA from "@/components/sections/CTA";
import Footer from "@/components/sections/Footer";

const Index = () => {
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
  );
};

export default Index;
