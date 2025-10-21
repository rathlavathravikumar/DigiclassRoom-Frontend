import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Search,
  Filter,
  BarChart3,
  Award,
  Target,
  ClipboardList,
  TestTube
} from "lucide-react";
import { api } from "@/lib/api";

interface CourseProgressProps {
  courseId: string;
}

const CourseProgress = ({ courseId }: CourseProgressProps) => {
  const [progressData, setProgressData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<'name' | 'performance'>('performance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseProgress = async () => {
      try {
        setLoading(true);
        console.log('Fetching course progress for courseId:', courseId);
        const response = await api.getCourseProgress(courseId);
        console.log('Course progress response:', response);
        setProgressData((response as any)?.data);
      } catch (error) {
        console.error('Failed to fetch course progress:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseProgress();
    }
  }, [courseId]);

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

  if (!progressData) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No progress data available for this course</p>
      </div>
    );
  }

  const { course, students, courseStatistics, assignments, tests } = progressData;

  // Filter and sort students
  const filteredStudents = students
    .filter((student: any) => 
      student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student.clg_id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a: any, b: any) => {
      const aValue = sortBy === 'name' ? a.student.name : a.statistics.overallPercentage;
      const bValue = sortBy === 'name' ? b.student.name : b.statistics.overallPercentage;
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

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
          <h1 className="text-3xl font-bold text-foreground">Student Progress</h1>
          <p className="text-muted-foreground mt-2">
            {course.name} ({course.code})
          </p>
        </div>
      </div>

      {/* Course Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Students</p>
                <p className="text-3xl font-bold text-foreground">{courseStatistics.totalStudents}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Enrolled in course</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Average Performance</p>
                <p className="text-3xl font-bold text-foreground">{courseStatistics.averagePerformance}%</p>
              </div>
              <div className="p-3 bg-success/10 rounded-xl">
                <Target className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={courseStatistics.averagePerformance} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Highest Score</p>
                <p className="text-3xl font-bold text-foreground">{courseStatistics.highestPerformance}%</p>
              </div>
              <div className="p-3 bg-warning/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Best performance</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Assignments & Tests</p>
                <p className="text-3xl font-bold text-foreground">
                  {courseStatistics.totalAssignments + courseStatistics.totalTests}
                </p>
              </div>
              <div className="p-3 bg-accent/10 rounded-xl">
                <Award className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">
                {courseStatistics.totalAssignments} assignments, {courseStatistics.totalTests} tests
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('name')}
              >
                Name
              </Button>
              <Button
                variant={sortBy === 'performance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('performance')}
              >
                Performance
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Progress Table */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Student Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredStudents.map((studentData: any) => (
              <div 
                key={studentData.student.id} 
                className="p-4 border rounded-xl hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedStudent(
                  selectedStudent === studentData.student.id ? null : studentData.student.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {studentData.student.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{studentData.student.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {studentData.student.clg_id} • {studentData.student.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {studentData.statistics.overallPercentage}%
                      </div>
                      <div className={`text-sm px-2 py-1 rounded-full border ${getPerformanceColor(studentData.statistics.overallPercentage)}`}>
                        {getPerformanceLabel(studentData.statistics.overallPercentage)}
                      </div>
                    </div>
                    <div className="w-24">
                      <Progress value={studentData.statistics.overallPercentage} className="h-3" />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedStudent === studentData.student.id && (
                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Assignments */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-primary" />
                          Assignments ({studentData.assignments.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                          {studentData.assignments.map((assignment: any) => (
                            <div key={assignment.assignmentId} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{assignment.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Max: {assignment.maxScore} points
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge variant={assignment.submitted ? "default" : "secondary"} className="text-xs">
                                    {assignment.submitted ? `${assignment.obtainedScore}/${assignment.maxScore}` : 'Not Submitted'}
                                  </Badge>
                                  {assignment.submitted && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {assignment.percentage}%
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tests */}
                      <div>
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <TestTube className="h-4 w-4 text-success" />
                          Tests ({studentData.tests.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                          {studentData.tests.map((test: any) => (
                            <div key={test.testId} className="p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{test.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Max: {test.maxScore} points
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge variant={test.completed ? "default" : "secondary"} className="text-xs">
                                    {test.completed ? `${test.obtainedScore}/${test.maxScore}` : 'Not Completed'}
                                  </Badge>
                                  {test.completed && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {test.percentage}%
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Student Statistics */}
                    <div className="mt-4 p-4 bg-background border rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-lg font-bold text-foreground">
                            {studentData.statistics.completedItems}/{studentData.statistics.totalItems}
                          </div>
                          <div className="text-xs text-muted-foreground">Completed Items</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-foreground">
                            {studentData.statistics.totalObtainedScore}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Score</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-foreground">
                            {studentData.statistics.averageScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">Average Score</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-foreground">
                            {studentData.statistics.overallPercentage}%
                          </div>
                          <div className="text-xs text-muted-foreground">Overall Performance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No students found matching your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseProgress;
