import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Users,
  Award,
  FileCheck,
  Calendar,
  Target,
  User,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface StudentStats {
  student_id: string;
  student_name: string;
  student_email: string;
  testScores: {
    average: number;
    highest: number;
    latest: number;
    totalTests: number;
  };
  assignments: {
    completed: number;
    total: number;
    averageGrade: number;
  };
  attendance: {
    percentage: number;
    present: number;
    total: number;
  };
  overallProgress: number;
}

interface Course {
  _id: string;
  name: string;
  code: string;
  students: any[];
  department: string;
  semester: string;
}

export default function StudentProgressTracker() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [studentStats, setStudentStats] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // Fetch teacher's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.getCourses({ teacher_id: user?._id });
        const courseList = (res as any)?.data || [];
        setCourses(courseList);
        if (courseList.length > 0) {
          setSelectedCourseId(courseList[0]._id);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCourses([]);
      }
    };

    if (user?._id) {
      fetchCourses();
    }
  }, [user?._id]);

  // Fetch student statistics for selected course
  useEffect(() => {
    const fetchStudentStats = async () => {
      if (!selectedCourseId) return;

      setLoading(true);
      try {
        // Fetch course details with students
        const courseRes = await api.getCourse(selectedCourseId);
        const courseData = (courseRes as any)?.data || {};
        const students = courseData.students || [];

        // Fetch all marks, assignments, and attendance for this course
        const [assignmentsRes, testsRes] = await Promise.all([
          api.getAssignments({ course_id: selectedCourseId }),
          api.getTests()
        ]);

        const assignments = (assignmentsRes as any)?.data || [];
        const allTests = (testsRes as any)?.data || [];
        const courseTests = allTests.filter((test: any) => 
          test.course_id === selectedCourseId || test.course_id?._id === selectedCourseId
        );

        // Calculate stats for each student
        const stats: StudentStats[] = await Promise.all(
          students.map(async (student: any) => {
            const studentId = student._id || student.id;

            // Fetch marks for this student
            let testMarks: any[] = [];
            let assignmentMarks: any[] = [];

            try {
              const marksRes = await api.listMarks({ student_id: studentId });
              const allMarks = (marksRes as any)?.data || [];
              
              testMarks = allMarks.filter((mark: any) => mark.type === 'test');
              assignmentMarks = allMarks.filter((mark: any) => mark.type === 'assignment');
            } catch (error) {
              console.error(`Failed to fetch marks for student ${studentId}:`, error);
            }

            // Calculate test statistics
            const relevantTestMarks = testMarks.filter((mark: any) => {
              const testId = mark.test_id?._id || mark.test_id;
              return courseTests.some((test: any) => test._id === testId);
            });

            const testScores = relevantTestMarks.map((mark: any) => {
              const score = mark.score || 0;
              const maxScore = mark.max_score || 100;
              return (score / maxScore) * 100;
            });

            const testAverage = testScores.length > 0 
              ? testScores.reduce((sum, score) => sum + score, 0) / testScores.length 
              : 0;
            const testHighest = testScores.length > 0 ? Math.max(...testScores) : 0;
            const testLatest = testScores.length > 0 ? testScores[testScores.length - 1] : 0;

            // Calculate assignment statistics
            const relevantAssignmentMarks = assignmentMarks.filter((mark: any) => {
              const assignmentId = mark.assignment_id?._id || mark.assignment_id;
              return assignments.some((assignment: any) => assignment._id === assignmentId);
            });

            const assignmentScores = relevantAssignmentMarks.map((mark: any) => {
              const score = mark.score || 0;
              const maxScore = mark.max_score || 100;
              return (score / maxScore) * 100;
            });

            const assignmentAverage = assignmentScores.length > 0
              ? assignmentScores.reduce((sum, score) => sum + score, 0) / assignmentScores.length
              : 0;

            // Calculate attendance (placeholder - you'll need actual attendance API)
            const attendancePercentage = 85; // Placeholder
            const presentDays = 17;
            const totalDays = 20;

            // Calculate overall progress (weighted average)
            const overallProgress = (testAverage * 0.4) + (assignmentAverage * 0.4) + (attendancePercentage * 0.2);

            return {
              student_id: studentId,
              student_name: student.name || "Unknown",
              student_email: student.email || "",
              testScores: {
                average: Math.round(testAverage),
                highest: Math.round(testHighest),
                latest: Math.round(testLatest),
                totalTests: relevantTestMarks.length
              },
              assignments: {
                completed: relevantAssignmentMarks.length,
                total: assignments.length,
                averageGrade: Math.round(assignmentAverage)
              },
              attendance: {
                percentage: attendancePercentage,
                present: presentDays,
                total: totalDays
              },
              overallProgress: Math.round(overallProgress)
            };
          })
        );

        setStudentStats(stats);
      } catch (error) {
        console.error("Failed to fetch student statistics:", error);
        setStudentStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentStats();
  }, [selectedCourseId]);

  const selectedCourse = courses.find(c => c._id === selectedCourseId);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBgColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getPerformanceBadge = (progress: number) => {
    if (progress >= 80) return { text: "Excellent", color: "bg-green-100 text-green-800 border-green-300" };
    if (progress >= 60) return { text: "Good", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
    return { text: "Needs Improvement", color: "bg-red-100 text-red-800 border-red-300" };
  };

  const toggleStudentDetails = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  return (
    <div className="space-y-6">
      {/* Simple Header with Course Selection at Top Right */}
      <div className="flex items-center justify-between gap-4 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Student Progress</h1>
        
        {/* Course Selection Dropdown - Top Right Only */}
        <div className="flex items-center gap-3">
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-[280px] h-10 rounded-lg border-2">
              <SelectValue placeholder="Select course..." />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course._id} value={course._id}>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="font-medium">{course.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="py-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">Loading student progress data...</p>
          </div>
        </div>
      )}

      {/* No Students State */}
      {!loading && studentStats.length === 0 && selectedCourseId && (
        <div className="py-12 text-center">
          <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Students Enrolled</h3>
          <p className="text-muted-foreground">
            This course doesn't have any enrolled students yet.
          </p>
        </div>
      )}

      {/* Summary Statistics Cards */}
      {!loading && studentStats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold">{studentStats.length}</div>
                <div className="text-sm text-muted-foreground">Total Students</div>
                <div className="text-xs text-muted-foreground mt-1">Enrolled in course</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(
                    studentStats.reduce((sum, s) => sum + s.overallProgress, 0) / studentStats.length
                  )}%
                </div>
                <div className="text-sm text-muted-foreground">Average Performance</div>
                <div className="text-xs text-muted-foreground mt-1">Overall progress</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.max(...studentStats.map(s => s.overallProgress))}%
                </div>
                <div className="text-sm text-muted-foreground">Highest Score</div>
                <div className="text-xs text-muted-foreground mt-1">Best performance</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileCheck className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-purple-600">
                  {studentStats.reduce((sum, s) => sum + s.assignments.completed, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Assignments & Tests</div>
                <div className="text-xs text-muted-foreground mt-1">Total completed</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Performance Table */}
      {!loading && studentStats.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {studentStats.map((student) => {
            const badge = getPerformanceBadge(student.overallProgress);
            const isExpanded = expandedStudent === student.student_id;

            return (
              <Card 
                key={student.student_id} 
                className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-3 bg-primary/10 rounded-xl">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl truncate">
                          {student.student_name}
                        </CardTitle>
                        <CardDescription className="truncate">
                          {student.student_email}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={`${badge.color} border`}>
                      {badge.text}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Overall Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Overall Progress
                      </span>
                      <span className={`text-lg font-bold ${getProgressColor(student.overallProgress)}`}>
                        {student.overallProgress}%
                      </span>
                    </div>
                    <Progress 
                      value={student.overallProgress} 
                      className="h-3"
                    />
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                      <div className="text-xs text-muted-foreground mb-1">Test Avg</div>
                      <div className="text-xl font-bold text-blue-600">{student.testScores.average}%</div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
                      <div className="text-xs text-muted-foreground mb-1">Assignments</div>
                      <div className="text-xl font-bold text-purple-600">
                        {student.assignments.completed}/{student.assignments.total}
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
                      <div className="text-xs text-muted-foreground mb-1">Attendance</div>
                      <div className="text-xl font-bold text-green-600">{student.attendance.percentage}%</div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStudentDetails(student.student_id)}
                    className="w-full rounded-xl"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        View Details
                      </>
                    )}
                  </Button>

                  {isExpanded && (
                    <div className="space-y-4 pt-4 border-t">
                      {/* Test Scores Details */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Award className="h-4 w-4 text-blue-600" />
                          Test Performance
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span className="text-muted-foreground">Average:</span>
                            <span className="font-semibold">{student.testScores.average}%</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span className="text-muted-foreground">Highest:</span>
                            <span className="font-semibold">{student.testScores.highest}%</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span className="text-muted-foreground">Latest:</span>
                            <span className="font-semibold">{student.testScores.latest}%</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/50 rounded-lg">
                            <span className="text-muted-foreground">Total Tests:</span>
                            <span className="font-semibold">{student.testScores.totalTests}</span>
                          </div>
                        </div>
                      </div>

                      {/* Assignment Details */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <FileCheck className="h-4 w-4 text-purple-600" />
                          Assignment Progress
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Completion Rate:</span>
                            <span className="font-semibold">
                              {student.assignments.total > 0 
                                ? Math.round((student.assignments.completed / student.assignments.total) * 100)
                                : 0}%
                            </span>
                          </div>
                          <Progress 
                            value={student.assignments.total > 0 
                              ? (student.assignments.completed / student.assignments.total) * 100
                              : 0
                            } 
                            className="h-2"
                          />
                          <div className="flex justify-between text-sm p-2 bg-muted/50 rounded-lg">
                            <span className="text-muted-foreground">Average Grade:</span>
                            <span className="font-semibold">{student.assignments.averageGrade}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Attendance Details */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          Attendance Record
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Present/Total:</span>
                            <span className="font-semibold">
                              {student.attendance.present}/{student.attendance.total} days
                            </span>
                          </div>
                          <Progress 
                            value={student.attendance.percentage} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

    </div>
  );
}
