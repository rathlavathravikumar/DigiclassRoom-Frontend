import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Lock, Eye, EyeOff, CheckCircle, Shield } from "lucide-react";

// API Base URL configuration
const API_BASE_URL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || 'http://localhost:3001';

const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
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
        description: "New password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both new passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast({
        title: "Same Password",
        description: "New password must be different from your current password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Password Changed Successfully",
          description: "Your password has been updated. You'll be logged out for security.",
        });
        
        // Clear form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        // Logout user after 3 seconds for security
        setTimeout(() => {
          logout();
        }, 3000);
      } else {
        toast({
          title: "Change Failed",
          description: data.message || "Failed to change password. Please try again.",
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

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Password Changed Successfully</CardTitle>
          <CardDescription>
            Your password has been updated successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <Shield className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                For security reasons, you'll be logged out shortly. Please log in again with your new password.
              </p>
            </div>
            
            <Button 
              onClick={resetForm}
              variant="outline"
              className="w-full"
            >
              Change Password Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Change Password</CardTitle>
        <CardDescription>
          Update your account password for better security.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-11 pr-10"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
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
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters long and different from current password.
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

          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Security Note:</strong> After changing your password, you'll be logged out automatically for security reasons.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;
