import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { http } from "@/lib/http";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, Building2, Edit2, Save, X, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    clgName: "",
    clg_id: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        clgName: user.clgName || "",
        clg_id: user.clg_id || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = "";
      let payload: any = {
        name: formData.name,
        email: formData.email,
      };

      // Determine endpoint and payload based on role
      if (user?.role === "admin") {
        endpoint = "/api/v1/admin/profile";
        payload.clgName = formData.clgName;
      } else if (user?.role === "teacher") {
        endpoint = "/api/v1/teacher/profile";
        payload.clg_id = formData.clg_id;
      } else if (user?.role === "student") {
        endpoint = "/api/v1/student/profile";
        payload.clg_id = formData.clg_id;
      }

      const response = await http.patch(endpoint, payload);
      
      if (response.data) {
        const updatedUser = response.data.data.user;
        // Update user in auth context
        updateUser(updatedUser);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error.response?.data?.message || "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        clgName: user.clgName || "",
        clg_id: user.clg_id || "",
      });
    }
    setIsEditing(false);
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case "admin":
        return "bg-warning text-warning-foreground";
      case "teacher":
        return "bg-success text-success-foreground";
      case "student":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your account information
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${getRoleBadgeColor()}`}>
                    {user.role?.toUpperCase()}
                  </span>
                </CardDescription>
              </div>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleCancel} variant="outline" disabled={loading}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              ) : (
                <div className="px-3 py-2 border rounded-md bg-muted/50">
                  {user.name}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              {isEditing ? (
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              ) : (
                <div className="px-3 py-2 border rounded-md bg-muted/50">
                  {user.email}
                </div>
              )}
            </div>

            {/* Admin-specific fields */}
            {user.role === "admin" && (
              <div className="space-y-2">
                <Label htmlFor="clgName" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  College/Institution Name
                </Label>
                {isEditing ? (
                  <Input
                    id="clgName"
                    name="clgName"
                    value={formData.clgName}
                    onChange={handleInputChange}
                    placeholder="Enter college/institution name"
                    required
                  />
                ) : (
                  <div className="px-3 py-2 border rounded-md bg-muted/50">
                    {user.clgName}
                  </div>
                )}
              </div>
            )}

            {/* Teacher/Student-specific fields */}
            {(user.role === "teacher" || user.role === "student") && (
              <div className="space-y-2">
                <Label htmlFor="clg_id" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  College ID
                </Label>
                {isEditing ? (
                  <Input
                    id="clg_id"
                    name="clg_id"
                    value={formData.clg_id}
                    onChange={handleInputChange}
                    placeholder="Enter your college ID"
                  />
                ) : (
                  <div className="px-3 py-2 border rounded-md bg-muted/50">
                    {user.clg_id || "Not set"}
                  </div>
                )}
              </div>
            )}

            {/* Additional Info Section */}
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Account Type</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-medium font-mono text-xs">{user._id}</p>
                </div>
                {user.createdAt && (
                  <div>
                    <p className="text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {user.updatedAt && (
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
