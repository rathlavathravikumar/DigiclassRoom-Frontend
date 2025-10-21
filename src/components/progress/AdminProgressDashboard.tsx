import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  BookOpen,
  BarChart3,
  Award,
  Target,
  PieChart,
  Activity
} from "lucide-react";
import { api } from "@/lib/api";

const AdminProgressDashboard = () => {
  const [coursesOverview, setCoursesOverview] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(false);

  useEffect(() => {
    const fetchCoursesOverview = async () => {
      try {
        setLoading(true);
        const response = await api.getAdminCoursesOverview();
        console.log('Admin courses overview response:', response);
        setCoursesOverview((response as any)?.data || []);
      } catch (error) {
        console.error('Failed to fetch courses overview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesOverview();
  }, []);

  useEffect(() => {
    const fetchCourseProgress = async () => {
      if (!selectedCourse) {
        setCourseProgress(null);
        return;
      }

      try {
        setCourseLoading(true);
        console.log('Fetching course progress for:', selectedCourse);
        const response = await api.getAdminCourseProgress(selectedCourse);
        console.log('Course progress response:', response);
        setCourseProgress((response as any)?.data);
      } catch (error) {
        console.error('Failed to fetch course progress:', error);
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourseProgress();
  }, [selectedCourse]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  const overallStats = {
    totalCourses: coursesOverview.length,
    totalStudents: coursesOverview.reduce((sum, course) => sum + course.studentCount, 0),
    averagePerformance: coursesOverview.length > 0 
      ? Math.round(coursesOverview.reduce((sum, course) => sum + course.averagePerformance, 0) / coursesOverview.length)
      : 0,
    totalMarks: coursesOverview.reduce((sum, course) => sum + course.marksCount, 0)
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 60) return 'Average';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Course Progress Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor academic performance across all courses
          </p>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-foreground">{overallStats.totalCourses}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Active courses</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold text-foreground">{overallStats.totalStudents}</p>
              </div>
              <div className="p-3 bg-success/10 rounded-xl">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Across all courses</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Average Performance</p>
                <p className="text-3xl font-bold text-foreground">{overallStats.averagePerformance}%</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl">
                <Target className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={overallStats.averagePerformance} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Assessments</p>
                <p className="text-3xl font-bold text-foreground">{overallStats.totalMarks}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-xl">
                <Award className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Graded items</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Selection */}
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Select Course for Detailed Analysis
              </label>
              <Select value={selectedCourse} onValueChange={(value) => {
                console.log('Course selected:', value);
                setSelectedCourse(value);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course to analyze..." />
                </SelectTrigger>
                <SelectContent>
                  {coursesOverview.length === 0 ? (
                    <SelectItem value="no-courses" disabled>
                      No courses available
                    </SelectItem>
                  ) : (
                    coursesOverview.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code}) - {course.studentCount} students
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedCourse && (
              <Button 
                variant="outline" 
                onClick={() => setSelectedCourse("")}
                className="mt-6"
              >
                Clear Selection
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Courses Overview Grid - Hide when course is selected */}
      {!selectedCourse && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              All Courses Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesOverview.map((course) => (
              <div 
                key={course.id}
                className={`p-4 border rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer ${
                  selectedCourse === course.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedCourse(course.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{course.name}</h3>
                    <p className="text-sm text-muted-foreground">{course.code}</p>
                    {course.teacher && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Teacher: {course.teacher.name}
                      </p>
                    )}
                  </div>
                  <Badge 
                    className={`text-xs ${getPerformanceColor(course.averagePerformance)}`}
                  >
                    {course.averagePerformance}%
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Performance</span>
                    <span>{getPerformanceLabel(course.averagePerformance)}</span>
                  </div>
                  <Progress value={course.averagePerformance} className="h-2" />
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-3">
                    <span>{course.studentCount} students</span>
                    <span>{course.marksCount} assessments</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {/* Detailed Course Analysis */}
      {selectedCourse && (
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Detailed Course Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {courseLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-muted rounded"></div>
                  ))}
                </div>
                <div className="h-64 bg-muted rounded"></div>
              </div>
            ) : courseProgress ? (
              <div className="space-y-6">
                {/* Course Info */}
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <h3 className="text-xl font-semibold">{courseProgress.course.name}</h3>
                    <p className="text-muted-foreground">
                      {courseProgress.course.code} • Teacher: {courseProgress.course.teacher?.name}
                    </p>
                  </div>
                  <Badge className="text-sm">
                    {courseProgress.overallStatistics.averagePerformance}% Average
                  </Badge>
                </div>

                {/* Performance Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {courseProgress.performanceDistribution.excellent}
                      </div>
                      <div className="text-sm text-muted-foreground">Excellent (90%+)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {courseProgress.performanceDistribution.good}
                      </div>
                      <div className="text-sm text-muted-foreground">Good (75-89%)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {courseProgress.performanceDistribution.average}
                      </div>
                      <div className="text-sm text-muted-foreground">Average (60-74%)</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {courseProgress.performanceDistribution.belowAverage}
                      </div>
                      <div className="text-sm text-muted-foreground">Below Average (&lt;60%)</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Course Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-lg font-bold">{courseProgress.overallStatistics.totalStudents}</div>
                          <div className="text-sm text-muted-foreground">Total Students</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <div className="text-lg font-bold">{courseProgress.overallStatistics.highestPerformance}%</div>
                          <div className="text-sm text-muted-foreground">Highest Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-warning/10 rounded-lg">
                          <TrendingDown className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <div className="text-lg font-bold">{courseProgress.overallStatistics.lowestPerformance}%</div>
                          <div className="text-sm text-muted-foreground">Lowest Score</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Student Progress List */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Student Performance Ranking</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {courseProgress.studentProgress.map((student: any, index: number) => (
                      <div key={student.studentId} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                            #{index + 1}
                          </div>
                          <div>
                            <h5 className="font-medium">{student.studentName}</h5>
                            <p className="text-sm text-muted-foreground">
                              ID: {student.studentClgId} • {student.studentEmail}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-lg font-bold">{student.overallPercentage}%</div>
                            <div className="text-sm text-muted-foreground">
                              {student.totalScore}/{student.totalMaxScore} points
                            </div>
                          </div>
                          <div className="w-24">
                            <Progress value={student.overallPercentage} className="h-2" />
                          </div>
                          <Badge className={`text-xs ${getPerformanceColor(student.overallPercentage)}`}>
                            {getPerformanceLabel(student.overallPercentage)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No progress data available for this course</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProgressDashboard;
