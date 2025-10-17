import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import LandingFooter from "@/components/landing/LandingFooter";

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <Hero />
        <Features />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Home;
