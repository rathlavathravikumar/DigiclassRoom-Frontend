import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

// API Base URL configuration
const API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'http://localhost:3001';

type UserRole = "admin" | "teacher" | "student";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !role) {
      toast({
        title: "Missing Information",
        description: "Please provide both email and role.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        
        // Handle development mode response with reset URL
        if (data.data?.resetUrl) {
          toast({
            title: "Development Mode",
            description: "Email not configured. Check console for reset URL or use the provided link.",
          });
          console.log("Reset URL for testing:", data.data.resetUrl);
          console.log("Reset Token:", data.data.token);
        } else {
          toast({
            title: "Reset Link Sent",
            description: data.message || "Please check your email for password reset instructions.",
          });
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send reset email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to connect to server. Please check your internet connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80"
          alt="Open laptop and notebook on a desk"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/95" />
        
        <Card className="relative z-10 w-full max-w-md bg-card/95 backdrop-blur-md border border-border/40 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>
              We've sent password reset instructions to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <Mail className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  If an account with <strong>{email}</strong> exists, you'll receive an email with instructions to reset your password.
                </p>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Didn't receive the email? Check your spam folder or try again.</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Different Email
                </Button>
                
                <Link to="/login">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <img
        src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=80"
        alt="Open laptop and notebook on a desk"
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/70 to-background/95" />
      
      <Card className="relative z-10 w-full max-w-md bg-card/95 backdrop-blur-md border border-border/40 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Account Type</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
                disabled={isLoading}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4 inline mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordForm;
