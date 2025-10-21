import { useAuth } from "@/contexts/AuthContext";
import MeetingsList from "@/components/meetings/MeetingsList";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function MeetingsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">
              Please log in to view meetings.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <MeetingsList 
        userRole={user.role} 
        userId={user._id || user.id} 
      />
    </div>
  );
}
