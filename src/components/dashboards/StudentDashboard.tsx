import { useEffect, useState } from "react";
import RoleBasedHeader from "@/components/layout/RoleBasedHeader";
import Sidebar from "@/components/layout/Sidebar";
import StatsCards from "@/components/dashboard/StatsCards";
import CourseCard from "@/components/courses/CourseCard";
import DiscussionCard from "@/components/discussions/DiscussionCard";
import AssignmentCard from "@/components/assignments/AssignmentCard";
import NoticeBoard from "@/components/notices/NoticeBoard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, MessageCirclePlus } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import UpcomingMeetings from "@/components/meetings/UpcomingMeetings";
import StudentCoursesList from "@/components/courses/StudentCoursesList";

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseDetailTab, setCourseDetailTab] = useState<"overview" | "resources" | "discussions">("overview");
  const [testActive, setTestActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [testResult, setTestResult] = useState<null | { score: number; total: number }> (null);

  const [courses, setCourses] = useState<any[]>([]);
  const [tests, setTests] = useState<any[]>([]);
  const [attemptedTestIds, setAttemptedTestIds] = useState<Set<string>>(new Set());
  const [currentTest, setCurrentTest] = useState<any | null>(null);
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<any | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignUploadFile, setAssignUploadFile] = useState<File | null>(null);
  const [assignText, setAssignText] = useState("");
  const [assignLink, setAssignLink] = useState("");
  const [selectedTestForSubmit, setSelectedTestForSubmit] = useState<any | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testUploadFile, setTestUploadFile] = useState<File | null>(null);
  const [testText, setTestText] = useState("");
  const [testLink, setTestLink] = useState("");
  useEffect(() => {
    (async () => {
      try {
        const res = await api.getCourses();
        const items = (res as any)?.data || [];
        const mapped = items.map((c: any, idx: number) => {
          const teacherObj = c.teacher_id || c.teacher;
          const teacherName = typeof teacherObj === 'object' && teacherObj
            ? (teacherObj.name || teacherObj.email || 'TBD')
            : (c.teacher_name || c.teacher || 'TBD');
          return {
          id: c._id || c.id || String(idx + 1),
          name: c.name || "Course",
          teacher: teacherName,
          progress: 0,
          nextClass: "",
          pendingAssignments: 0,
          unreadMessages: 0,
          resources: 0,
          color: "bg-gradient-to-r from-blue-500 to-blue-600",
        }});
        setCourses(mapped);
      } catch (e) {
        setCourses([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getTests();
        const list = (res as any)?.data || [];
        setTests(list);
      } catch (e) {
        setTests([]);
      }
      try {
        if (user?._id) {
          const marksRes = await api.listMarks({ type: 'test', student_id: user._id });
          const items = (marksRes as any)?.data || [];
          const ids = new Set(items.map((m: any) => (m.ref_id?._id || m.ref_id || m.id)));
          setAttemptedTestIds(ids as any);
        }
      } catch (e) {
        setAttemptedTestIds(new Set());
      }
    })();
  }, [user?._id]);

  const letters = ['A','B','C','D'];

  useEffect(() => {
    if (!testActive || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [testActive, timeLeft]);

  useEffect(() => {
    if (testActive && timeLeft === 0) {
      // auto-submit current backend test when timer ends
      submitTest();
    }
  }, [timeLeft, testActive]);

  const startBackendTest = async (testId: string) => {
    try {
      const res = await api.getTest(testId);
      const t = (res as any)?.data || null;
      if (!t) return;
      setCurrentTest(t);
      setSelectedAnswers({});
      setTestResult(null);
      const dur = Number(t.duration_minutes || 60);
      setTimeLeft(Math.max(1, dur) * 60);
      setTestActive(true);
    } catch (e) {}
  };

  const submitTest = async () => {
    if (!currentTest?._id) { setTestActive(false); return; }
    try {
      const answers = (currentTest.questions || []).map((q: any, idx: number) => {
        const sel = selectedAnswers[String(idx)] ?? -1;
        return typeof sel === 'number' ? letters[sel] : sel;
      });
      const res = await api.submitTest(currentTest._id || currentTest.id, answers);
      const data = (res as any)?.data || {};
      setTestResult({ score: data.score ?? 0, total: data.max_score ?? (currentTest.total_marks || 100) });
      setTestActive(false);
      // refresh attempted set
      if (user?._id) {
        const marksRes = await api.listMarks({ type: 'test', student_id: user._id });
        const items = (marksRes as any)?.data || [];
        const ids = new Set(items.map((m: any) => (m.ref_id?._id || m.ref_id || m.id)));
        setAttemptedTestIds(ids as any);
      }
    } catch (e) {
      setTestActive(false);
    }
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

  // Timetable for students (fetched from backend)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const periods = ["9:00", "10:00", "11:00", "1:00", "2:00"];
  const [ttData, setTtData] = useState<Record<string, Record<string, string>>>({});
  useEffect(() => {
    const loadStudentTt = async () => {
      try {
        const res = await api.getStudentTimetable();
        const data = (res as any)?.data || (res as any) || {};
        if (data && typeof data === 'object') setTtData(data as any);
      } catch (_) {
        setTtData({});
      }
    };
    if (activeSection === 'timetable') loadStudentTt();
  }, [activeSection]);

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
    const found = assignments.find(a => a.id === assignmentId);
    setSelectedAssignmentForSubmit(found || null);
    setAssignDialogOpen(!!found);
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
            
            <div className="grid lg:grid-cols-3 gap-8">
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
                <UpcomingMeetings 
                  userRole="student"
                  limit={5}
                  showCreateButton={false}
                  onViewAll={() => setActiveSection("meetings")}
                />
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
        return <StudentCoursesList />;
        
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
            <Dialog open={assignDialogOpen} onOpenChange={(o) => { setAssignDialogOpen(o); if (!o) { setSelectedAssignmentForSubmit(null); setAssignUploadFile(null); setAssignLink(""); setAssignText(""); } }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Assignment</DialogTitle>
                  <DialogDescription>{selectedAssignmentForSubmit?.title}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Upload File</label>
                      <input type="file" onChange={(e) => setAssignUploadFile(e.target.files?.[0] || null)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Submission Link (optional)</label>
                      <input className="w-full border rounded px-2 py-1" placeholder="https://..." value={assignLink} onChange={(e) => setAssignLink(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Notes (optional)</label>
                    <textarea className="w-full border rounded px-2 py-1" rows={3} value={assignText} onChange={(e) => setAssignText(e.target.value)} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
                    <Button className="btn-primary" onClick={async () => {
                      try {
                        if (!selectedAssignmentForSubmit) return;
                        if (!assignUploadFile && !assignLink && !assignText) { alert('Please attach a file or add link/notes'); return; }
                        if (assignUploadFile) {
                          await api.uploadAndSubmit({ file: assignUploadFile, type: 'assignment', ref_id: selectedAssignmentForSubmit.id, text: assignText || undefined, link: assignLink || undefined });
                        } else {
                          await api.submitWork({ type: 'assignment', ref_id: selectedAssignmentForSubmit.id, text: assignText || undefined, link: assignLink || undefined });
                        }
                        alert('Assignment submitted');
                        setAssignDialogOpen(false);
                      } catch (e) { alert('Failed to submit'); }
                    }}>Submit</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Overall Attendance</span>
                    <span className="text-2xl font-bold">{overall}%</span>
                  </div>
                  <div className="relative h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Attended", value: totals.attended },
                            { name: "Absent", value: Math.max(0, totals.conducted - totals.attended) },
                          ]}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={70}
                          outerRadius={90}
                          startAngle={90}
                          endAngle={-270}
                          stroke="transparent"
                        >
                          <Cell key="attended" fill="#22c55e" />
                          <Cell key="absent" fill="#e5e7eb" />
                        </Pie>
                        <Tooltip formatter={(value: any, name: any) => [value as number, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{overall}%</div>
                        <div className="text-xs text-muted-foreground">{totals.attended}/{totals.conducted} classes</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            <div className="p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Attendance by Course</h2>
                <span className="text-xs text-muted-foreground">Donut visualization</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {attendanceByCourse.map((a) => {
                  const course = courses.find(c => c.id === a.courseId);
                  const name = (course?.name || `Course ${a.courseId}`).split(" ")[0];
                  const attended = a.attended;
                  const total = a.conducted;
                  const absent = Math.max(0, total - attended);
                  const pct = total ? Math.round((attended / total) * 100) : 0;
                  return (
                    <div key={a.courseId} className="relative h-48 rounded-md border">
                      <div className="absolute top-2 left-2 text-sm font-medium">{name}</div>
                      <div className="absolute inset-0 pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Attended", value: attended },
                                { name: "Absent", value: absent },
                              ]}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={55}
                              outerRadius={70}
                              startAngle={90}
                              endAngle={-270}
                              stroke="transparent"
                            >
                              <Cell key="attended" fill="#6366F1" />
                              <Cell key="absent" fill="#e5e7eb" />
                            </Pie>
                            <Tooltip formatter={(value: any, name: any) => [value as number, name]} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{pct}%</div>
                            <div className="text-xs text-muted-foreground">{attended}/{total}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
                            {ttData?.[d]?.[p] || "--"}
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
                <span className="text-sm text-muted-foreground">Select a test below to begin</span>
              )}
            </div>
            <div className="space-y-3">
              <div className="font-semibold">Available Tests</div>
              <div className="grid md:grid-cols-2 gap-3">
                {(tests || []).filter((t: any) => !attemptedTestIds.has(t._id || t.id)).map((t: any) => {
                  const totalQ = (t.questions?.length) ?? 0;
                  const dur = t.duration_minutes ?? 60;
                  const deadline = t.scheduled_at ? new Date(new Date(t.scheduled_at).getTime() + (dur * 60000)) : null;
                  return (
                    <div key={t._id || t.id} className="p-4 rounded border space-y-2">
                      <div className="font-medium">{t.title}</div>
                      {t.description && <div className="text-sm text-muted-foreground">{t.description}</div>}
                      <div className="text-xs text-muted-foreground">Duration: {dur} min • Questions: {totalQ} • Total Marks: {t.total_marks ?? 100}</div>
                      <div className="text-xs text-muted-foreground">Starts: {t.scheduled_at ? new Date(t.scheduled_at).toLocaleString() : '-'}</div>
                      <div className="text-xs text-muted-foreground">Deadline: {deadline ? deadline.toLocaleString() : '-'}</div>
                      <div className="flex justify-end">
                        <Button size="sm" className="btn-primary" onClick={() => startBackendTest(t._id || t.id)}>Start Test</Button>
                      </div>
                    </div>
                  );
                })}
                {((tests || []).filter((t: any) => !attemptedTestIds.has(t._id || t.id)).length === 0) && (
                  <div className="text-sm text-muted-foreground">No available tests.</div>
                )}
              </div>
            </div>
            {testActive && (
              <div className="p-4 rounded-lg border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Time Left</span>
                  <span className="text-xl font-semibold">{Math.floor(timeLeft/60).toString().padStart(2,'0')}:{(timeLeft%60).toString().padStart(2,'0')}</span>
                </div>
                <div className="space-y-4">
                  {(currentTest?.questions || []).map((q: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-md border">
                      <div className="font-medium mb-2">{idx+1}. {q.question}</div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {(q.options || []).map((opt: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => setSelectedAnswers(s => ({ ...s, [String(idx)]: i }))}
                            className={`text-left px-3 py-2 rounded-md border ${selectedAnswers[String(idx)]===i ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                          >
                            {letters[i]}. {opt}
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
            {testResult && (
              <div className="p-4 rounded-lg border flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Result</div>
                  <div className="text-2xl font-bold">{testResult.score} / {testResult.total}</div>
                </div>
                <Button variant="outline" onClick={() => { setTestResult(null); }}>Close</Button>
              </div>
            )}
            <Dialog open={testDialogOpen} onOpenChange={(o) => { setTestDialogOpen(o); if (!o) { setSelectedTestForSubmit(null); setTestUploadFile(null); setTestLink(""); setTestText(""); } }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Test</DialogTitle>
                  <DialogDescription>{selectedTestForSubmit?.title}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-2">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1">Upload File</label>
                      <input type="file" onChange={(e) => setTestUploadFile(e.target.files?.[0] || null)} />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Submission Link (optional)</label>
                      <input className="w-full border rounded px-2 py-1" placeholder="https://..." value={testLink} onChange={(e) => setTestLink(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Notes (optional)</label>
                    <textarea className="w-full border rounded px-2 py-1" rows={3} value={testText} onChange={(e) => setTestText(e.target.value)} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setTestDialogOpen(false)}>Cancel</Button>
                    <Button className="btn-primary" onClick={async () => {
                      try {
                        if (!selectedTestForSubmit) return;
                        if (!testUploadFile && !testLink && !testText) { alert('Please attach a file or add link/notes'); return; }
                        if (testUploadFile) {
                          await api.uploadAndSubmit({ file: testUploadFile, type: 'test', ref_id: selectedTestForSubmit.id, text: testText || undefined, link: testLink || undefined });
                        } else {
                          await api.submitWork({ type: 'test', ref_id: selectedTestForSubmit.id, text: testText || undefined, link: testLink || undefined });
                        }
                        alert('Test submitted');
                        setTestDialogOpen(false);
                      } catch (e) { alert('Failed to submit test'); }
                    }}>Submit</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
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