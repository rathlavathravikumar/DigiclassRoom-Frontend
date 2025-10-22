import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Brain, Zap, Eye, EyeOff, ArrowRight, UserPlus, Building2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Validation helper functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Include at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Include at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Include at least one number");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const getPasswordStrength = (password: string): { strength: string; color: string; percentage: number } => {
  let strength = 0;
  
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return { strength: "Weak", color: "bg-red-500", percentage: 33 };
  if (strength <= 4) return { strength: "Medium", color: "bg-yellow-500", percentage: 66 };
  return { strength: "Strong", color: "bg-green-500", percentage: 100 };
};

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    clgName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { adminSignup, isLoading } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
  };

  const validateField = (field: string, value: string) => {
    const errors: Record<string, string> = {};

    switch (field) {
      case "name":
        if (!value.trim()) {
          errors.name = "Full name is required";
        } else if (value.trim().length < 2) {
          errors.name = "Name must be at least 2 characters";
        }
        break;
      
      case "clgName":
        if (!value.trim()) {
          errors.clgName = "Institution name is required";
        } else if (value.trim().length < 2) {
          errors.clgName = "Institution name must be at least 2 characters";
        }
        break;
      
      case "email":
        if (!value.trim()) {
          errors.email = "Email address is required";
        } else if (!validateEmail(value.trim())) {
          errors.email = "Please enter a valid email address";
        }
        break;
      
      case "password":
        const passwordValidation = validatePassword(value);
        if (!value) {
          errors.password = "Password is required";
        } else if (!passwordValidation.isValid) {
          errors.password = passwordValidation.errors[0];
        }
        
        // Also validate confirm password if it's been touched
        if (touched.confirmPassword && formData.confirmPassword !== value) {
          errors.confirmPassword = "Passwords do not match";
        }
        break;
      
      case "confirmPassword":
        if (!value) {
          errors.confirmPassword = "Please confirm your password";
        } else if (value !== formData.password) {
          errors.confirmPassword = "Passwords do not match";
        }
        break;
    }

    setValidationErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Institution validation
    if (!formData.clgName.trim()) {
      errors.clgName = "Institution name is required";
    } else if (formData.clgName.trim().length < 2) {
      errors.clgName = "Institution name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email address is required";
    } else if (!validateEmail(formData.email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors.join(", ");
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      clgName: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    // Validate all fields
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const ok = await adminSignup({
        name: formData.name.trim(),
        clgName: formData.clgName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      });
      
      if (ok) {
        toast({
          title: "Welcome to DigiClassroom!",
          description: "Your administrator account has been created successfully."
        });
        navigate("/app");
      } else {
        toast({
          title: "Registration Failed",
          description: "This email may already be registered. Please try with a different email.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      toast({
        title: "Registration Failed",
        description: err?.response?.data?.message || err?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 p-6">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-card/95 backdrop-blur-lg relative">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-xl" />
            <div className="relative bg-gradient-to-br from-primary via-purple-600 to-primary p-4 rounded-3xl shadow-xl">
              <UserPlus className="h-10 w-10 text-white" strokeWidth={2} />
              <Zap className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" strokeWidth={3} />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading font-bold text-foreground mb-2">
            Create Administrator Account
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Start your journey with DigiClassroom
          </CardDescription>
          
          <Alert className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
              Only administrators can register directly. Teachers and students will be added by administrators.
            </AlertDescription>
          </Alert>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="name" className="text-base font-semibold text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={() => handleBlur("name")}
                  className={`h-12 text-base border-2 rounded-xl transition-all duration-200 ${
                    validationErrors.name && touched.name
                      ? "border-destructive focus:border-destructive"
                      : "border-border/50 focus:border-primary"
                  }`}
                  aria-invalid={!!validationErrors.name && touched.name}
                  aria-describedby={validationErrors.name ? "name-error" : undefined}
                />
                {validationErrors.name && touched.name && (
                  <p id="name-error" className="text-sm text-destructive flex items-center gap-2 mt-1">
                    <XCircle className="h-4 w-4" />
                    {validationErrors.name}
                  </p>
                )}
              </div>
              
              {/* Institution Name */}
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="clg" className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Institution Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="clg"
                  placeholder="Your college or organization name"
                  value={formData.clgName}
                  onChange={(e) => handleInputChange("clgName", e.target.value)}
                  onBlur={() => handleBlur("clgName")}
                  className={`h-12 text-base border-2 rounded-xl transition-all duration-200 ${
                    validationErrors.clgName && touched.clgName
                      ? "border-destructive focus:border-destructive"
                      : "border-border/50 focus:border-primary"
                  }`}
                  aria-invalid={!!validationErrors.clgName && touched.clgName}
                  aria-describedby={validationErrors.clgName ? "clg-error" : undefined}
                />
                {validationErrors.clgName && touched.clgName && (
                  <p id="clg-error" className="text-sm text-destructive flex items-center gap-2 mt-1">
                    <XCircle className="h-4 w-4" />
                    {validationErrors.clgName}
                  </p>
                )}
              </div>
              
              {/* Email Address */}
              <div className="space-y-3 md:col-span-2">
                <Label htmlFor="email" className="text-base font-semibold text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@institution.edu"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`h-12 text-base border-2 rounded-xl transition-all duration-200 ${
                    validationErrors.email && touched.email
                      ? "border-destructive focus:border-destructive"
                      : "border-border/50 focus:border-primary"
                  }`}
                  aria-invalid={!!validationErrors.email && touched.email}
                  aria-describedby={validationErrors.email ? "email-error" : undefined}
                />
                {validationErrors.email && touched.email && (
                  <p id="email-error" className="text-sm text-destructive flex items-center gap-2 mt-1">
                    <XCircle className="h-4 w-4" />
                    {validationErrors.email}
                  </p>
                )}
              </div>
              
              {/* Password */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-base font-semibold text-foreground">
                  Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={`h-12 text-base border-2 rounded-xl pr-12 transition-all duration-200 ${
                      validationErrors.password && touched.password
                        ? "border-destructive focus:border-destructive"
                        : "border-border/50 focus:border-primary"
                    }`}
                    aria-invalid={!!validationErrors.password && touched.password}
                    aria-describedby={validationErrors.password ? "password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && passwordStrength && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Password strength:</span>
                      <span className={`font-semibold ${
                        passwordStrength.strength === "Strong" ? "text-green-600" :
                        passwordStrength.strength === "Medium" ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {passwordStrength.strength}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {validationErrors.password && touched.password && (
                  <p id="password-error" className="text-sm text-destructive flex items-center gap-2 mt-1">
                    <XCircle className="h-4 w-4" />
                    {validationErrors.password}
                  </p>
                )}
              </div>
              
              {/* Confirm Password */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-base font-semibold text-foreground">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    className={`h-12 text-base border-2 rounded-xl pr-12 transition-all duration-200 ${
                      validationErrors.confirmPassword && touched.confirmPassword
                        ? "border-destructive focus:border-destructive"
                        : formData.confirmPassword && formData.confirmPassword === formData.password
                        ? "border-green-500 focus:border-green-500"
                        : "border-border/50 focus:border-primary"
                    }`}
                    aria-invalid={!!validationErrors.confirmPassword && touched.confirmPassword}
                    aria-describedby={validationErrors.confirmPassword ? "confirm-password-error" : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {formData.confirmPassword && formData.confirmPassword === formData.password && !validationErrors.confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center gap-2 mt-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Passwords match
                  </p>
                )}
                
                {validationErrors.confirmPassword && touched.confirmPassword && (
                  <p id="confirm-password-error" className="text-sm text-destructive flex items-center gap-2 mt-1">
                    <XCircle className="h-4 w-4" />
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                disabled={submitting || isLoading}
              >
                {submitting || isLoading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Creating your account...
                  </>
                ) : (
                  <>
                    Create Administrator Account
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignupForm;
