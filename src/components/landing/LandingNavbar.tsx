import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun, Brain, Zap, Sparkles } from "lucide-react";

const LandingNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, toggleTheme] = useTheme();

  return (
    <nav className="w-full border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto h-20 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group transition-all duration-300 hover:scale-105">
          {/* Modern Logo Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-3 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300">
              <div className="relative">
                <Brain className="h-7 w-7 text-white" strokeWidth={2.5} />
                <Zap className="h-3 w-3 text-yellow-300 absolute -top-0.5 -right-0.5 animate-pulse" strokeWidth={3} />
              </div>
            </div>
          </div>
          
          {/* Brand Name and Tagline */}
          <div className="flex flex-col">
            <span className="font-heading font-bold text-xl text-foreground tracking-tight">
              DigiClassroom
            </span>
            <span className="hidden sm:flex text-[10px] text-muted-foreground font-medium tracking-wide items-center gap-1">
              <Sparkles className="h-2.5 w-2.5 text-purple-500" />
              Empowering Online Learning Experiences
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Toggle theme" 
            onClick={() => toggleTheme()}
            className="rounded-full hover:bg-accent"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {!user ? (
            <>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                className="font-medium hover:text-blue-600"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate("/signup")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Sign up
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => navigate("/app")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              >
                Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={logout}
                className="font-medium border-2 hover:bg-accent"
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
