import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  ClipboardList, 
  TestTube, 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  BarChart3
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface StudentProgressProps {
  studentId?: string;
}

const StudentProgress = ({ studentId }: StudentProgressProps) => {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const targetStudentId = studentId || user?._id;

  useEffect(() => {
    const fetchProgress = async () => {
      if (!targetStudentId) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching progress for student:', targetStudentId);
        const response = await api.getStudentProgress(targetStudentId);
        console.log('Progress response:', response);
        setProgressData((response as any)?.data);
      } catch (error) {
        console.error('Failed to fetch student progress:', error);
        setError(error instanceof Error ? error.message : 'Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [targetStudentId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-destructive opacity-50" />
        <p className="text-destructive mb-4">Error loading progress data</p>
        <p className="text-muted-foreground text-sm">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No progress data available</p>
        <p className="text-muted-foreground text-sm mt-2">
          You may not be enrolled in any courses yet, or there may be no assignments/tests to track.
        </p>
      </div>
    );
  }

  const { student, courses, overallStatistics } = progressData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {studentId ? `${student.name}'s Progress` : 'My Progress'}
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your academic performance across all courses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            {student.clg_id}
          </Badge>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Overall Average</p>
                <p className="text-3xl font-bold text-foreground">{overallStatistics.averagePercentage}%</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={overallStatistics.averagePercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-foreground">{overallStatistics.totalCourses}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-xl">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Active enrollments</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Completed Items</p>
                <p className="text-3xl font-bold text-foreground">
                  {overallStatistics.totalCompletedItems}/{overallStatistics.totalItems}
                </p>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl">
                <Award className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4">
              <Progress 
                value={(overallStatistics.totalCompletedItems / overallStatistics.totalItems) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Performance</p>
                <p className="text-lg font-bold text-foreground">
                  {overallStatistics.averagePercentage >= 90 ? 'Excellent' :
                   overallStatistics.averagePercentage >= 75 ? 'Good' :
                   overallStatistics.averagePercentage >= 60 ? 'Average' : 'Needs Improvement'}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Based on overall average</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">Course Progress</h2>
          <div className="flex gap-2">
            <Button 
              variant={selectedCourse === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCourse(null)}
            >
              All Courses
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((courseData: any) => (
            <Card key={courseData.course.id} className="dashboard-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{courseData.course.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {courseData.course.code}
                    </p>
                  </div>
                  <Badge 
                    variant={courseData.statistics.coursePercentage >= 75 ? "default" : "secondary"}
                    className="text-sm"
                  >
                    {courseData.statistics.coursePercentage}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Course Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{courseData.statistics.completedItems}/{courseData.statistics.totalItems} items</span>
                  </div>
                  <Progress value={courseData.statistics.coursePercentage} className="h-3" />
                </div>

                {/* Assignments and Tests Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <ClipboardList className="h-5 w-5 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium">{courseData.assignments.length} Assignments</div>
                    <div className="text-xs text-muted-foreground">
                      {courseData.assignments.filter((a: any) => a.submitted).length} completed
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <TestTube className="h-5 w-5 mx-auto mb-2 text-success" />
                    <div className="text-sm font-medium">{courseData.tests.length} Tests</div>
                    <div className="text-xs text-muted-foreground">
                      {courseData.tests.filter((t: any) => t.completed).length} completed
                    </div>
                  </div>
                </div>

                {/* Recent Items */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Recent Items</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                    {[...courseData.assignments, ...courseData.tests]
                      .sort((a, b) => new Date(b.submittedAt || b.completedAt || 0).getTime() - new Date(a.submittedAt || a.completedAt || 0).getTime())
                      .slice(0, 3)
                      .map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-background rounded border">
                          <div className="flex items-center gap-2">
                            {item.type === 'assignment' ? 
                              <ClipboardList className="h-4 w-4 text-primary" /> : 
                              <TestTube className="h-4 w-4 text-success" />
                            }
                            <span className="text-sm font-medium truncate">{item.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={item.percentage >= 75 ? "default" : "secondary"} className="text-xs">
                              {item.percentage}%
                            </Badge>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* View Details Button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedCourse(courseData.course.id)}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Detailed Progress
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detailed Course View */}
      {selectedCourse && (
        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detailed Progress</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedCourse(null)}>
                Back to Overview
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {courses
              .filter((c: any) => c.course.id === selectedCourse)
              .map((courseData: any) => (
                <div key={courseData.course.id} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Assignments */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        Assignments ({courseData.assignments.length})
                      </h3>
                      <div className="space-y-3">
                        {courseData.assignments.map((assignment: any) => (
                          <div key={assignment.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium">{assignment.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={assignment.submitted ? "default" : "secondary"}>
                                {assignment.submitted ? `${assignment.percentage}%` : 'Not Submitted'}
                              </Badge>
                            </div>
                            {assignment.submitted && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Score: {assignment.obtainedScore}/{assignment.maxScore}</span>
                                  <span>{assignment.percentage}%</span>
                                </div>
                                <Progress value={assignment.percentage} className="h-2" />
                                {assignment.remarks && (
                                  <p className="text-sm text-muted-foreground italic">{assignment.remarks}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tests */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TestTube className="h-5 w-5 text-success" />
                        Tests ({courseData.tests.length})
                      </h3>
                      <div className="space-y-3">
                        {courseData.tests.map((test: any) => (
                          <div key={test.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-medium">{test.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                  Scheduled: {new Date(test.scheduledAt).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={test.completed ? "default" : "secondary"}>
                                {test.completed ? `${test.percentage}%` : 'Not Completed'}
                              </Badge>
                            </div>
                            {test.completed && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Score: {test.obtainedScore}/{test.maxScore}</span>
                                  <span>{test.percentage}%</span>
                                </div>
                                <Progress value={test.percentage} className="h-2" />
                                {test.remarks && (
                                  <p className="text-sm text-muted-foreground italic">{test.remarks}</p>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentProgress;
