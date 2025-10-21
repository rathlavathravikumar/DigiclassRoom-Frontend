import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Users, 
  FileText, 
  ClipboardList, 
  Video,
  Search,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User
} from "lucide-react";

interface StudentCourse {
  _id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  semester: string;
  teacher_id: {
    _id: string;
    name: string;
    email: string;
  };
  // Student-specific data
  enrollmentDate: string;
  attendance: number;
  completedAssignments: number;
  totalAssignments: number;
  upcomingDeadlines: number;
  lastActivity: string;
  grade?: string;
}

export default function StudentCoursesList() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  
  console.log("StudentCoursesList - Current user:", user);

  // Fetch student's enrolled courses
  const { data: coursesResponse, isLoading, error } = useQuery({
    queryKey: ["student-courses", user?._id || user?.id],
    queryFn: async () => {
      console.log("Fetching courses for student:", user?._id || user?.id);
      const result = await api.getStudentCourses(user?._id || user?.id);
      console.log("Student courses API response:", result);
      return result;
    },
    enabled: !!(user?._id || user?.id),
    retry: 3,
    retryDelay: 1000,
  });

  const courses = coursesResponse?.data || [];

  // Filter courses by search term
  const filteredCourses = courses.filter((course: StudentCourse) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.teacher_id.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCourseClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-red-600">Failed to load courses. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            My Courses
          </h1>
          <p className="text-muted-foreground">
            View your enrolled courses, assignments, and progress
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredCourses.length} Course{filteredCourses.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredCourses.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm 
                    ? "Try adjusting your search terms to find courses."
                    : "You are not enrolled in any courses yet."
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredCourses.map((course: StudentCourse) => (
            <Card 
              key={course._id} 
              className="hover:shadow-lg transition-all duration-200 cursor-pointer group"
              onClick={() => handleCourseClick(course._id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {course.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {course.code}
                      </Badge>
                      <span>{course.department}</span>
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course._id);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Teacher Info */}
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <User className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium">{course.teacher_id.name}</p>
                    <p className="text-xs text-muted-foreground">Instructor</p>
                  </div>
                </div>

                {/* Progress Overview */}
                <div className="space-y-3">
                  {/* Assignment Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Assignment Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {course.completedAssignments || 0}/{course.totalAssignments || 0}
                      </span>
                    </div>
                    <Progress 
                      value={course.totalAssignments ? (course.completedAssignments / course.totalAssignments) * 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  {/* Attendance */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Attendance</span>
                      <span className="text-sm text-muted-foreground">
                        {course.attendance || 0}%
                      </span>
                    </div>
                    <Progress 
                      value={course.attendance || 0} 
                      className="h-2"
                      // Color based on attendance
                    />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <ClipboardList className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Pending</p>
                      <p className="text-sm font-semibold">{course.upcomingDeadlines || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-green-600 font-medium">Completed</p>
                      <p className="text-sm font-semibold">{course.completedAssignments || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    {course.upcomingDeadlines > 0 ? (
                      <div className="flex items-center gap-1 text-orange-600">
                        <AlertCircle className="h-3 w-3" />
                        <span className="text-xs">Deadlines pending</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="h-3 w-3" />
                        <span className="text-xs">Up to date</span>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseClick(course._id);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>

                {/* Grade Display */}
                {course.grade && (
                  <div className="text-center p-2 bg-primary/10 rounded-lg">
                    <p className="text-xs text-muted-foreground">Current Grade</p>
                    <p className="text-lg font-bold text-primary">{course.grade}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Dashboard */}
      {filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Courses</p>
                  <p className="text-2xl font-bold text-blue-600">{filteredCourses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Pending Tasks</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {filteredCourses.reduce((sum, course) => sum + (course.upcomingDeadlines || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filteredCourses.reduce((sum, course) => sum + (course.completedAssignments || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Avg Attendance</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(filteredCourses.reduce((sum, course) => sum + (course.attendance || 0), 0) / filteredCourses.length) || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
