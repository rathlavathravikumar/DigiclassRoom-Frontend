import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { educationalImages, getResponsiveImageUrls } from "../../lib/images";  
import { ArrowRight, LogIn } from "lucide-react";

const HeroBackground = () => {
  const heroImages = getResponsiveImageUrls(educationalImages.hero.background);
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Main Background Image */}
      <div className="absolute inset-0">
        <picture>
          <source media="(min-width: 1200px)" srcSet={heroImages.hero} />
          <source media="(min-width: 768px)" srcSet={heroImages.desktop} />
          <img
            src={heroImages.tablet}
            alt="Students learning in modern university lecture hall with laptops and digital technology"
            className="h-full w-full object-cover object-center transition-transform duration-1000 hover:scale-110"
            loading="eager"
          />
        </picture>
      </div>

      {/* Enhanced overlay gradient for better text readability */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-black/40 to-purple-900/30" />
      
      {/* Enhanced floating elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
    </div>
  );
};

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
      <HeroBackground />
      
      {/* Main Content */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-6 py-24 lg:py-40">
        <div className="mb-12">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></div>
            <span className="text-sm font-medium text-white">Trusted by 1000+ Students Worldwide</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-heading font-bold text-white mb-8 leading-[0.9] tracking-tight">
            The Future of{" "}
            <span className="bg-gradient-to-r from-blue-200 via-purple-200 to-cyan-200 bg-clip-text text-transparent animate-gradient-shift block mt-2">
              Digital Learning
            </span>
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-blue-100/90 max-w-4xl mx-auto leading-relaxed mb-12 font-light">
            Empower your educational journey with our comprehensive platform designed for 
            <span className="text-blue-200 font-medium"> modern students</span>, 
            <span className="text-blue-200 font-medium"> innovative teachers</span>, and 
            <span className="text-blue-200 font-medium"> forward-thinking institutions</span>.
          </p>
        
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-12">
            {!user ? (
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-blue-50 font-semibold px-10 py-5 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 text-lg group"
                  onClick={() => navigate("/signup")}
                >
                  Start Learning Today
                  <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white/40 text-white hover:bg-white/15 font-semibold px-10 py-5 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105 text-lg group"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                  <LogIn className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ) : (
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 group min-w-[200px]"
                onClick={() => navigate("/app")}
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
          
          {/* Stats Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2">1000+</div>
              <div className="text-blue-200 font-medium">Active Students</div>
              <div className="text-sm text-blue-100/70 mt-1">Learning daily</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2">10+</div>
              <div className="text-blue-200 font-medium">Expert Courses</div>
              <div className="text-sm text-blue-100/70 mt-1">Professionally designed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-200 font-medium">Support</div>
              <div className="text-sm text-blue-100/70 mt-1">Always here to help</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center mb-2">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
          <span className="text-white/60 text-xs font-medium">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
