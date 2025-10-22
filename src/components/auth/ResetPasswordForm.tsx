import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// API Base URL configuration
const API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'http://localhost:3001';

const ResetPasswordForm = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const role = searchParams.get("role");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !role) {
        setIsVerifying(false);
        setIsValidToken(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/v1/auth/verify-token?token=${token}&role=${role}`
        );

        if (response.ok) {
          setIsValidToken(true);
        } else {
          setIsValidToken(false);
        }
      } catch (error) {
        setIsValidToken(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          token, 
          newPassword, 
          role 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated successfully.",
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        toast({
          title: "Reset Failed",
          description: data.message || "Failed to reset password. Please try again.",
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

  if (isVerifying) {
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
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Verifying reset token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
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
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Password reset links expire after 1 hour for security reasons.
              </p>
              
              <div className="flex flex-col gap-3">
                <Link to="/forgot-password">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Request New Reset Link
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button variant="outline" className="w-full">
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

  if (isSuccess) {
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
            <CardTitle className="text-2xl">Password Reset Complete</CardTitle>
            <CardDescription>
              Your password has been successfully updated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                You can now log in with your new password. You'll be redirected to the login page shortly.
              </p>
              
              <Link to="/login">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Go to Login
                </Button>
              </Link>
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
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>

            <div className="text-center">
              <Link 
                to="/login" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordForm;
