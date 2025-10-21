import { useAuth } from "@/contexts/AuthContext";
import TeacherCoursesList from "@/components/courses/TeacherCoursesList";
import StudentCoursesList from "@/components/courses/StudentCoursesList";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function CoursesPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">
              Please log in to view your courses.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isTeacher = user.role === 'teacher' || user.role === 'admin';

  return (
    <div className="container mx-auto px-4 py-6">
      {isTeacher ? <TeacherCoursesList /> : <StudentCoursesList />}
    </div>
  );
}
