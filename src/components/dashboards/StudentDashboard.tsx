import { useEffect, useState } from "react";
import RoleBasedHeader from "@/components/layout/RoleBasedHeader";
import Sidebar from "@/components/layout/Sidebar";
import StatsCards from "@/components/dashboard/StatsCards";
import CourseCard from "@/components/courses/CourseCard";
import DiscussionCard from "@/components/discussions/DiscussionCard";
import AssignmentCard from "@/components/assignments/AssignmentCard";
import NoticeBoard from "@/components/notices/NoticeBoard";
import { Button } from "@/components/ui/button";
import { Plus, MessageCirclePlus } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "@/lib/api";

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseDetailTab, setCourseDetailTab] = useState<"overview" | "resources" | "discussions">("overview");
  const [testActive, setTestActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [testResult, setTestResult] = useState<null | { score: number; total: number }> (null);

  const [courses, setCourses] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.getCourses();
        const items = (res as any)?.data || [];
        const mapped = items.map((c: any, idx: number) => ({
          id: c._id || c.id || String(idx + 1),
          name: c.name || "Course",
          teacher: c.teacher_name || c.teacher || "TBD",
          progress: 0,
          nextClass: "",
          pendingAssignments: 0,
          unreadMessages: 0,
          resources: 0,
          color: "bg-gradient-to-r from-blue-500 to-blue-600",
        }));
        setCourses(mapped);
      } catch (e) {
        setCourses([]);
      }
    })();
  }, []);

  const testQuestions = [
    { id: "q1", question: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], answerIndex: 1 },
    { id: "q2", question: "Which SQL clause filters aggregated results?", options: ["WHERE", "HAVING", "GROUP BY", "ORDER BY"], answerIndex: 1 },
    { id: "q3", question: "Which OSI layer handles routing?", options: ["Data Link", "Network", "Transport", "Session"], answerIndex: 1 },
  ];

  useEffect(() => {
    if (!testActive || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [testActive, timeLeft]);

  useEffect(() => {
    if (testActive && timeLeft === 0) {
      const score = testQuestions.reduce((acc, q) => acc + ((selectedAnswers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0);
      setTestResult({ score, total: testQuestions.length });
      setTestActive(false);
    }
  }, [timeLeft, testActive]);

  const startTest = () => {
    setSelectedAnswers({});
    setTestResult(null);
    setTimeLeft(60);
    setTestActive(true);
  };

  const submitTest = () => {
    const score = testQuestions.reduce((acc, q) => acc + ((selectedAnswers[q.id] ?? -1) === q.answerIndex ? 1 : 0), 0);
    setTestResult({ score, total: testQuestions.length });
    setTestActive(false);
  };

  const discussions = [
    {
      id: "1",
      title: "Confusion about Binary Search Trees implementation",
      content: "I'm having trouble understanding the insertion logic in BST. Can someone explain the recursive approach?",
      course: "DSA",
      courseId: "1",
      author: "Alex Kumar",
      timeAgo: "2 hours ago",
      replies: 8,
      likes: 12,
      isResolved: false,
      tag: "Help Needed"
    },
    {
      id: "2",
      title: "SQL JOIN operations - Inner vs Outer joins",
      content: "What's the practical difference between INNER JOIN and LEFT OUTER JOIN? When should we use each?",
      course: "DBMS",
      courseId: "2",
      author: "Sarah Chen",
      timeAgo: "4 hours ago",
      replies: 15,
      likes: 20,
      isResolved: true,
      tag: "Database"
    }
  ];

  // Mock resources per course
  const courseResources: Record<string, { id: string; title: string; type: "pdf" | "video" | "link"; }[]> = {
    "1": [
      { id: "r1", title: "BST Lecture Notes.pdf", type: "pdf" },
      { id: "r2", title: "Sorting Algorithms - Video", type: "video" },
      { id: "r3", title: "DSA Cheatsheet", type: "link" },
    ],
    "2": [
      { id: "r4", title: "SQL Joins Guide.pdf", type: "pdf" },
      { id: "r5", title: "Normalization Tutorial", type: "link" },
    ],
    "3": [
      { id: "r6", title: "OSI vs TCP/IP - Video", type: "video" },
      { id: "r7", title: "Subnetting Workbook.pdf", type: "pdf" },
    ],
  };

  // Mock attendance data per course
  const attendanceByCourse: { courseId: string; conducted: number; attended: number }[] = [
    { courseId: "1", conducted: 32, attended: 28 },
    { courseId: "2", conducted: 30, attended: 24 },
    { courseId: "3", conducted: 26, attended: 22 },
  ];

  // Mock timetable (shared with admin for demo)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const periods = ["9:00", "10:00", "11:00", "1:00", "2:00"];
  const timetable: Record<string, Record<string, string>> = {
    Mon: { "9:00": "DSA", "10:00": "DBMS", "11:00": "CN", "1:00": "--", "2:00": "--" },
    Tue: { "9:00": "DBMS", "10:00": "CN", "11:00": "--", "1:00": "DSA", "2:00": "--" },
    Wed: { "9:00": "CN", "10:00": "--", "11:00": "DSA", "1:00": "--", "2:00": "DBMS" },
    Thu: { "9:00": "--", "10:00": "DSA", "11:00": "DBMS", "1:00": "--", "2:00": "CN" },
    Fri: { "9:00": "DBMS", "10:00": "--", "11:00": "--", "1:00": "CN", "2:00": "DSA" },
  } as any;

  const [assignments, setAssignments] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.getAssignments();
        const items = (res as any)?.data || [];
        const mapped = items.map((a: any, idx: number) => {
          const due = a.due_date || a.dueDate;
          const isOverdue = due ? new Date(due).getTime() < Date.now() : false;
          return {
            id: a._id || a.id || String(idx + 1),
            title: a.title || "Assignment",
            course: a.course_name || a.course || "Course",
            dueDate: due || new Date().toISOString(),
            status: (a.status as any) || "pending",
            grade: a.grade,
            totalMarks: a.totalMarks || 100,
            description: a.description || "",
            submissionType: a.submissionType || "File Upload",
            isOverdue,
          };
        });
        setAssignments(mapped);
      } catch (e) {
        setAssignments([]);
      }
    })();
  }, []);

  const handleCourseClick = (courseId: string) => {
    setSelectedCourseId(courseId);
    setCourseDetailTab("overview");
  };

  const handleDiscussionClick = (discussionId: string) => {
    console.log("Opening discussion:", discussionId);
  };

  const handleAssignmentClick = (assignmentId: string) => {
    console.log("Opening assignment:", assignmentId);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's your academic overview.</p>
            </div>
            
            <StatsCards />
            
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Recent Discussions</h2>
                  <Button size="sm" className="btn-primary">
                    <MessageCirclePlus className="h-4 w-4 mr-2" />
                    Ask Question
                  </Button>
                </div>
                <div className="space-y-4">
                  {discussions.slice(0, 2).map((discussion) => (
                    <DiscussionCard
                      key={discussion.id}
                      discussion={discussion}
                      onDiscussionClick={handleDiscussionClick}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Upcoming Deadlines</h2>
                </div>
                <div className="space-y-4">
                  {assignments.filter(a => a.status === "pending").map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onAssignmentClick={handleAssignmentClick}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
        
      case "courses":
        return (
          <div className="space-y-6">
            {!selectedCourseId ? (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
                  <p className="text-muted-foreground">Semester 1 - E3 Class</p>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onCourseClick={handleCourseClick}
                    />
                  ))}
                </div>
              </>
            ) : (
              (() => {
                const course = courses.find(c => c.id === selectedCourseId)!;
                const courseDiscussions = discussions.filter(d => (d as any).courseId === selectedCourseId);
                const resources = courseResources[selectedCourseId] || [];
                return (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground">{course.name}</h1>
                        <p className="text-muted-foreground">Prof. {course.teacher} • Next: {course.nextClass}</p>
                      </div>
                      <Button variant="outline" onClick={() => setSelectedCourseId(null)}>Back to Courses</Button>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Recent Discussions</h2>
                        {courseDiscussions.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No discussions yet for this course.</p>
                        ) : (
                          courseDiscussions.map((discussion) => (
                            <DiscussionCard
                              key={discussion.id}
                              discussion={discussion as any}
                              onDiscussionClick={() => {}}
                            />
                          ))
                        )}
                      </div>
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Resources</h2>
                        {resources.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No resources added for this course.</p>
                        ) : (
                          <ul className="space-y-2">
                            {resources.map(r => (
                              <li key={r.id} className="flex items-center justify-between p-3 rounded-md border">
                                <span className="text-sm">{r.title}</span>
                                <Button size="sm" variant="outline" onClick={() => alert(`Open resource: ${r.title}`)}>View</Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        );
        
      case "discussions":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Discussions</h1>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Start Discussion
              </Button>
            </div>
            
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <DiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  onDiscussionClick={handleDiscussionClick}
                />
              ))}
            </div>
          </div>
        );
        
      case "assignments":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {assignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onAssignmentClick={handleAssignmentClick}
                />
              ))}
            </div>
          </div>
        );
        
      case "attendance":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
              <p className="text-muted-foreground">Course-wise attendance and overall</p>
            </div>
            {(() => {
              const totals = attendanceByCourse.reduce(
                (acc, a) => ({ conducted: acc.conducted + a.conducted, attended: acc.attended + a.attended }),
                { conducted: 0, attended: 0 }
              );
              const overall = totals.conducted ? Math.round((totals.attended / totals.conducted) * 100) : 0;
              return (
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Attendance</span>
                    <span className="text-2xl font-bold">{overall}%</span>
                  </div>
                </div>
              );
            })()}
            <div className="h-72 p-4 rounded-lg border">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceByCourse.map(a => {
                  const found = courses.find(c => c.id === a.courseId);
                  const courseName = (found?.name || `Course ${a.courseId}`).split(" ")[0];
                  return {
                    name: courseName,
                    percentage: a.conducted ? Math.round((a.attended / a.conducted) * 100) : 0,
                  };
                })}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer text-sm text-muted-foreground">View detailed attendance table</summary>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-accent/50">
                    <tr>
                      <th className="text-left p-3">Course</th>
                      <th className="text-left p-3">Classes Conducted</th>
                      <th className="text-left p-3">Classes Attended</th>
                      <th className="text-left p-3">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceByCourse.map((a) => {
                      const course = courses.find(c => c.id === a.courseId);
                      const pct = a.conducted ? Math.round((a.attended / a.conducted) * 100) : 0;
                      return (
                        <tr key={a.courseId} className="border-t">
                          <td className="p-3">{course?.name || `Course ${a.courseId}`}</td>
                          <td className="p-3">{a.conducted}</td>
                          <td className="p-3">{a.attended}</td>
                          <td className="p-3 font-medium">{pct}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        );

      case "notices":
        return <NoticeBoard />;

      case "timetable":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">My Timetable</h1>
              <p className="text-muted-foreground">As uploaded by Admin</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded-lg">
                <thead className="bg-accent/50">
                  <tr>
                    <th className="p-2 text-left">Day / Time</th>
                    {periods.map((p) => (
                      <th key={p} className="p-2 text-left">{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((d) => (
                    <tr key={d} className="border-t">
                      <td className="p-2 font-medium">{d}</td>
                      {periods.map((p) => (
                        <td key={p} className="p-2">
                          <span className="px-2 py-1 rounded-md border inline-block min-w-[80px] text-center">
                            {(timetable as any)[d]?.[p] || "--"}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "tests":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Tests</h1>
              {!testActive && (
                <Button className="btn-primary" onClick={startTest}>Start 1-min Test</Button>
              )}
            </div>
            {testActive && (
              <div className="p-4 rounded-lg border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Time Left</span>
                  <span className="text-xl font-semibold">{Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}</span>
                </div>
                <div className="space-y-4">
                  {testQuestions.map((q, idx) => (
                    <div key={q.id} className="p-3 rounded-md border">
                      <div className="font-medium mb-2">{idx+1}. {q.question}</div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {q.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedAnswers(s => ({ ...s, [q.id]: i }))}
                            className={`text-left px-3 py-2 rounded-md border ${selectedAnswers[q.id]===i ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button onClick={submitTest}>Submit</Button>
                </div>
              </div>
            )}
            {!testActive && testResult && (
              <div className="p-4 rounded-lg border flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Result</div>
                  <div className="text-2xl font-bold">{testResult.score} / {testResult.total}</div>
                </div>
                <Button variant="outline" onClick={startTest}>Retake</Button>
              </div>
            )}
          </div>
        );
        
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} section coming soon...
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <RoleBasedHeader />
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;