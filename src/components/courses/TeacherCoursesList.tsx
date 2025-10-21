import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Users, 
  FileText, 
  ClipboardList, 
  Video,
  Search,
  Eye,
  Calendar,
  TrendingUp
} from "lucide-react";

interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  department: string;
  semester: string;
  students: any[];
  teacher_id: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  // Statistics (these would come from backend aggregation)
  totalStudents: number;
  totalAssignments: number;
  totalTests: number;
  totalMeetings: number;
  totalResources: number;
}

interface TeacherCoursesListProps {
  onCourseSelect?: (courseId: string) => void;
}

export default function TeacherCoursesList({ onCourseSelect }: TeacherCoursesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  
  console.log("TeacherCoursesList - Current user:", user);

  // Fetch teacher's courses
  const { data: coursesResponse, isLoading, error } = useQuery({
    queryKey: ["teacher-courses", user?._id || user?.id],
    queryFn: async () => {
      console.log("Fetching courses for teacher:", user?._id || user?.id);
      const result = await api.getCourses({ teacher_id: user?._id || user?.id });
      console.log("Courses API response:", result);
      return result;
    },
    enabled: !!(user?._id || user?.id),
    retry: 3,
    retryDelay: 1000,
  });

  const courses = (coursesResponse?.data || []).map((course: any) => ({
    ...course,
    students: course.students || [],
    teacher_id: course.teacher || course.teacher_id,
    department: course.department || "General", // Default department if not provided
    semester: course.semester || "1", // Default semester if not provided
    totalStudents: course.students_count || course.students?.length || 0,
    totalAssignments: course.totalAssignments || 0,
    totalTests: course.totalTests || 0,
    totalMeetings: course.totalMeetings || 0,
    totalResources: course.totalResources || 0,
  }));

  // Filter courses by search term
  const filteredCourses = courses.filter((course: Course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.department && course.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCourseClick = (courseId: string) => {
    if (onCourseSelect) {
      onCourseSelect(courseId);
    }
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
            Manage your courses, students, and course content
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
                    : "You don't have any courses assigned yet."
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredCourses.map((course: Course) => (
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
                {/* Course Description */}
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {course.description || "No description available"}
                </p>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Students</p>
                      <p className="text-sm font-semibold">{course.students?.length || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <FileText className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-green-600 font-medium">Resources</p>
                      <p className="text-sm font-semibold">{course.totalResources || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                    <ClipboardList className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-xs text-orange-600 font-medium">Assignments</p>
                      <p className="text-sm font-semibold">{course.totalAssignments || 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-xs text-red-600 font-medium">Tests</p>
                      <p className="text-sm font-semibold">{course.totalTests || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Semester {course.semester}</span>
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
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {filteredCourses.reduce((sum, course) => sum + (course.students?.length || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {filteredCourses.reduce((sum, course) => sum + (course.totalResources || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Resources</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {filteredCourses.reduce((sum, course) => sum + (course.totalAssignments || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Assignments</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {filteredCourses.reduce((sum, course) => sum + (course.totalTests || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Tests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
