import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Brain, Zap, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate, Link } from "react-router-dom";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(email, password, role);
    if (!success) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to DigiClassroom.",
      });
      navigate("/app");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-card/95 backdrop-blur-lg relative">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-gradient-to-br from-primary via-purple-600 to-primary p-4 rounded-3xl shadow-xl">
              <Brain className="h-10 w-10 text-white" strokeWidth={2} />
              <Zap className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" strokeWidth={3} />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading font-bold text-foreground mb-2">Welcome Back</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Sign in to continue your learning journey
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base font-semibold text-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base border-2 border-border/50 focus:border-primary rounded-xl transition-all duration-200"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base font-semibold text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base border-2 border-border/50 focus:border-primary rounded-xl pr-12 transition-all duration-200"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="role" className="text-base font-semibold text-foreground">Select Role</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger className="h-12 text-base border-2 border-border/50 focus:border-primary rounded-xl">
                  <SelectValue placeholder="Choose your role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2">
                  <SelectItem value="admin" className="text-base py-3">Administrator</SelectItem>
                  <SelectItem value="teacher" className="text-base py-3">Teacher</SelectItem>
                  <SelectItem value="student" className="text-base py-3">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign In to DigiClassroom
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-colors"
              >
                Forgot password?
              </Link>
              <Link 
                to="/signup" 
                className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                Create account
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
