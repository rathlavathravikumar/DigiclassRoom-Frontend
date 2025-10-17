import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

const LandingNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, toggleTheme] = useTheme();

  return (
    <nav className="w-full border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
      <div className="container mx-auto h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-hero px-2 py-1 rounded-md">
            <span className="text-primary-foreground font-bold">DC</span>
          </div>
          <Link to="/" className="font-heading font-bold text-lg text-foreground">
            Digital Classroom
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => toggleTheme()}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {!user ? (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>Login</Button>
              <Button className="btn-primary" onClick={() => navigate("/signup")}>Sign up</Button>
            </>
          ) : (
            <>
              <Button className="btn-primary" onClick={() => navigate("/app")}>Dashboard</Button>
              <Button variant="outline" onClick={logout}>Logout</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
