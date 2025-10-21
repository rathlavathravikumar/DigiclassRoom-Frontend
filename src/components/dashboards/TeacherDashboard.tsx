import { useEffect, useState } from "react";
import RoleBasedHeader from "@/components/layout/RoleBasedHeader";
import TeacherSidebar from "@/components/layout/TeacherSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Upload, 
  Users, 
  BookOpen, 
  ClipboardList, 
  TestTube,
  CheckSquare,
  Calendar,
  FileText,
  TrendingUp,
  Video
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { adminApi } from "@/lib/adminApi";
import UpcomingMeetings from "@/components/meetings/UpcomingMeetings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import MeetingForm from "@/components/meetings/MeetingForm";
import TeacherCoursesList from "@/components/courses/TeacherCoursesList";
import CourseDetailPage from "@/components/courses/CourseDetailPage";



const TeacherDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correct: "A", marks: 1 },
  ]);

  // Data for Notices / Assignments / Tests
  const { user } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [assignmentDetail, setAssignmentDetail] = useState<any | null>(null);
  const [marksEdits, setMarksEdits] = useState<Record<string, number>>({});
  const [tests, setTests] = useState<any[]>([]);
  const [assignmentMarks, setAssignmentMarks] = useState<any[]>([]);
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<any[]>([]);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [testMarks, setTestMarks] = useState<any[]>([]);
  // Courses for form selects (rename to avoid collision with mock 'courses')
  const [teacherCourses, setTeacherCourses] = useState<any[]>([]);
  // Create Assignment form state
  const [newAssignment, setNewAssignment] = useState<{ course_id: string; title: string; description: string; due_date: string }>({ course_id: "", title: "", description: "", due_date: "" });
  // Create Test form state
  const [newTest, setNewTest] = useState<{ course_id: string; title: string; description: string; scheduled_at: string; duration?: string }>({ course_id: "", title: "", description: "", scheduled_at: "", duration: "" });
  // Meeting dialog state
  const [isCreateMeetingDialogOpen, setIsCreateMeetingDialogOpen] = useState(false);

  useEffect(() => {
    if (activeSection === 'notices') {
      (async () => {
        try {
          const res = await api.listPublicNotices({ target: 'teachers' });
          const all = await api.listPublicNotices({ target: 'all' });
          const data = (res as any)?.data || (res as any) || [];
          const dataAll = (all as any)?.data || (all as any) || [];
          setNotices([...(data || []), ...(dataAll || [])]);
        } catch (_) { setNotices([]); }
      })();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'assignment' && user?._id) {
      (async () => {
        try {
          const res = await api.getAssignments({ teacher_id: user._id });
          const list = (res as any)?.data || (res as any) || [];
          setAssignments(list);
        } catch (_) { setAssignments([]); }
      })();
    }
  }, [activeSection, user?._id]);

  // Load courses for selects when landing on assignment/test sections (load all to widen availability)
  useEffect(() => {
    if (activeSection === 'assignment' || activeSection === 'test' || activeSection === 'courses' || activeSection === 'dashboard' || activeSection === 'course-plan') {
      (async () => {
        try {
          const res = await api.getCourses();
          const list = (res as any)?.data || (res as any) || [];
          setTeacherCourses(list);
        } catch (_) { setTeacherCourses([]); }
      })();
    }
  }, [activeSection]);

  useEffect(() => {
    if (selectedAssignmentId) {
      (async () => {
        try {
          // fetch assignment meta
          const res = await api.getAssignment(selectedAssignmentId);
          const detail = (res as any)?.data || (res as any) || null;
          setAssignmentDetail(detail);
          // fetch marks for this assignment to derive student list
          const marksRes = await api.getMarksByItem('assignment', selectedAssignmentId);
          const items = (marksRes as any)?.data || (marksRes as any) || [];
          setAssignmentMarks(items);
          // fetch submissions for this assignment
          const subsRes = await api.getSubmissionsByItem('assignment', selectedAssignmentId);
          const subs = (subsRes as any)?.data || (subsRes as any) || [];
          setAssignmentSubmissions(subs);
          const m: Record<string, number> = {};
          (items || []).forEach((it: any) => {
            const sid = it.student_id?._id || it.student_id?.id || it.student_id;
            if (typeof it?.score === 'number') m[sid] = it.score;
          });
          setMarksEdits(m);
        } catch (_) {
          setAssignmentDetail(null);
          setAssignmentMarks([]);
          setAssignmentSubmissions([]);
        }
      })();
    } else {
      setAssignmentDetail(null);
      setAssignmentMarks([]);
      setAssignmentSubmissions([]);
      setMarksEdits({});
    }
  }, [selectedAssignmentId]);

  useEffect(() => {
    if (activeSection === 'test') {
      (async () => {
        try {
          const res = await api.getTests();
          const list = (res as any)?.data || (res as any) || [];
          setTests(list);
        } catch (_) { setTests([]); }
      })();
    }
  }, [activeSection]);

  useEffect(() => {
    if (selectedTestId) {
      (async () => {
        try {
          const marksRes = await api.getMarksByItem('test', selectedTestId);
          const items = (marksRes as any)?.data || (marksRes as any) || [];
          setTestMarks(items);
        } catch (_) { setTestMarks([]); }
      })();
    } else {
      setTestMarks([]);
    }
  }, [selectedTestId]);

  // ✅ Handlers for create-test
  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correct: "A", marks: 1 }]);
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectChange = (index, value) => {
    const updated = [...questions];
    updated[index].correct = value;
    setQuestions(updated);
  };

  const handleMarksChange = (index, value) => {
    const updated = [...questions];
    updated[index].marks = Number(value) || 0;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  // Calculate total marks from all questions
  const totalMarks = questions.reduce((sum, q) => sum + (q.marks || 0), 0);

  const teacherStats = [
    {
      title: "Active Courses",
      value: "3",
      change: "This semester",
      icon: BookOpen,
      color: "success"
    },
    {
      title: "Total Students",
      value: "240",
      change: "Across all courses",
      icon: Users,
      color: "primary"
    },
    {
      title: "Pending Submissions",
      value: "28",
      change: "Need grading",
      icon: ClipboardList,
      color: "warning"
    },
    {
      title: "Tests Created",
      value: "12",
      change: "This month",
      icon: TestTube,
      color: "success"
    }
  ];

  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [attendance, setAttendance] = useState<Record<string, string>>({
    "1": "Present",
    "2": "Absent",
    "3": "Present",
  });

  const students = [
    { id: "1", name: "Ravi Kumar", roll: "21CSE001" },
    { id: "2", name: "Priya Sharma", roll: "21CSE002" },
    { id: "3", name: "Arjun Reddy", roll: "21CSE003" },
  ];

  const handleAttendanceChange = (id: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
  };

  const handleSaveAttendance = () => {
    console.log("Attendance saved for:", selectedDate, attendance);
    alert(`Attendance saved for ${selectedDate}`);
  };

  const discussions = [
    {
      id: "1",
      title: "Confusion about Binary Search Trees implementation",
      content: "I'm having trouble understanding the insertion logic in BST. Can someone explain the recursive approach?",
      course: "DSA",
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
      author: "Sarah Chen",
      timeAgo: "4 hours ago",
      replies: 15,
      likes: 20,
      isResolved: true,
      tag: "Database"
    }
  ];
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [allDiscussions, setAllDiscussions] = useState<any[]>(discussions as any[]);

  const handleSelectDiscussion = (id: string) => {
    setSelectedDiscussion((prev) => (prev === id ? null : id)); // toggle open/close
  };

  const handleReplySubmit = (discussionId: string) => {
    if (!replyText.trim()) return alert("Please enter a reply before submitting.");

    const updated = allDiscussions.map((d: any) =>
      d.id === discussionId
        ? {
            ...d,
            repliesList: [
              ...(d.repliesList || []),
              { author: "Teacher", content: replyText, timeAgo: "Just now" },
            ],
          }
        : d
    );

    setAllDiscussions(updated);
    setReplyText("");
    alert("Reply posted successfully!");
  };
  
  // Resource state
const [resources, setResources] = useState<
  { id: string; title: string; type: string; url: string; date: string }[]
>([]);

// Upload form states
const [showUploadForm, setShowUploadForm] = useState(false);
const [uploadTitle, setUploadTitle] = useState("");
const [uploadFile, setUploadFile] = useState<File | null>(null);
const [courseResourceTitle, setCourseResourceTitle] = useState("");
const [courseResourceDescription, setCourseResourceDescription] = useState("");
const [courseResourceFile, setCourseResourceFile] = useState<File | null>(null);
const [selectedCourseForUpload, setSelectedCourseForUpload] = useState<string>("");

// Handle upload submit
const handleUploadSubmit = () => {
  if (!uploadFile || !uploadTitle.trim()) {
    alert("Please enter a title and choose a file!");
    return;
  }

  const fileType = uploadFile.name.endsWith(".mp4")
    ? "video"
    : uploadFile.name.endsWith(".pdf")
    ? "pdf"
    : "document";

  const newResource = {
    id: Date.now().toString(),
    title: uploadTitle,
    type: fileType,
    url: URL.createObjectURL(uploadFile),
    date: new Date().toLocaleDateString(),
  };

  setResources((prev) => [newResource, ...prev]);
  setUploadFile(null);
  setUploadTitle("");
  setShowUploadForm(false);
  alert("Resource uploaded successfully!");
};

// Handle course resource upload
const handleCourseResourceUpload = async () => {
  if (!courseResourceFile || !courseResourceTitle.trim()) {
    alert("Please enter a title and choose a file!");
    return;
  }

  if (!selectedCourseForUpload) {
    alert("Please select a course!");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("file", courseResourceFile);
    formData.append("title", courseResourceTitle);
    formData.append("description", courseResourceDescription);

    await api.uploadCourseResource(selectedCourseForUpload, formData);
    
    setCourseResourceFile(null);
    setCourseResourceTitle("");
    setCourseResourceDescription("");
    setSelectedCourseForUpload("");
    alert("Resource uploaded successfully!");
  } catch (err: any) {
    alert(`Upload failed: ${err.message || "Unknown error"}`);
  }
};

  const renderContent = () => {
    switch (activeSection) {
      case "resources" :
        return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Course Resources</h1>
        {!showUploadForm ? (
          <Button
            className="btn-primary"
            onClick={() => setShowUploadForm(true)}
          >
            Upload Resource
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => setShowUploadForm(false)}
          >
            ← Back to Resources
          </Button>
        )}
      </div>

      {/* Upload Form */}
      {showUploadForm ? (
        <div className="max-w-xl border rounded-lg p-6 bg-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Upload New Resource</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="Enter resource title (e.g. DSA Lecture Notes)"
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Select File</label>
              <input
                type="file"
                accept=".pdf,.mp4,.docx,.pptx,.txt"
                onChange={(e) => setUploadFile(e.target.files[0])}
              />
            </div>

            <Button
              className="btn-primary w-full"
              onClick={handleUploadSubmit}
            >
              Upload Resource
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {resources.length === 0 ? (
            <p className="text-muted-foreground text-center col-span-full">No resources uploaded yet. Click "Upload Resource" to add new files.</p>
          ) : (
            resources.map((res) => (
              <div
                key={res.id}
                className="border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-lg truncate">
                    {res.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {res.type.toUpperCase()} • {res.date}
                  </p>
                </div>

                <div className="mt-3">
                  {res.type === "video" ? (
                    <video
                      src={res.url}
                      controls
                      className="rounded-md w-full mt-2"
                    />
                  ) : (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 text-sm hover:underline"
                    >
                      View / Download Resource
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );

      case "discussions" : 
         return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Student Discussions</h1>
        <p className="text-muted-foreground">
          View and reply to student queries below.
        </p>
      </div>

      <div className="space-y-4">
        {allDiscussions.map((discussion) => (
          <div
            key={discussion.id}
            className="border rounded-lg p-4 shadow-sm bg-card hover:shadow-md transition"
          >
            <div
              onClick={() => handleSelectDiscussion(discussion.id)}
              className="cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">{discussion.title}</h2>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    discussion.isResolved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {discussion.tag}
                </span>
              </div>
              <p className="text-muted-foreground mt-1">{discussion.content}</p>
              <p className="text-xs text-gray-500 mt-2">
                {discussion.author} • {discussion.timeAgo} • {discussion.replies} replies
              </p>
            </div>

            {/* Expanded discussion with replies */}
            {selectedDiscussion === discussion.id && (
              <div className="mt-4 border-t pt-4 space-y-3">
                <div className="space-y-2">
                  {((discussion as any).repliesList || []).map((r: any, index: number) => (
                    <div
                      key={index}
                      className="bg-muted/40 p-2 rounded-md text-sm text-gray-800"
                    >
                      <p className="font-medium">{r.author}</p>
                      <p>{r.content}</p>
                      <p className="text-xs text-gray-500">{r.timeAgo}</p>
                    </div>
                  ))}
                  {(!((discussion as any).repliesList) ||
                    (discussion as any).repliesList.length === 0) && (
                    <p className="text-sm text-gray-500 italic">
                      No replies yet.
                    </p>
                  )}
                </div>

                {/* Reply input */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 border rounded-md px-3 py-2 text-sm"
                  />
                  <Button
                    size="sm"
                    className="btn-primary"
                    onClick={() => handleReplySubmit(discussion.id)}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

      case "course-plan":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Course Plan</h1>
              <p className="text-muted-foreground">View the plan uploaded by Admin</p>
            </div>
            <div className="space-y-4">
              {teacherCourses.length > 0 ? (
                teacherCourses.map((c: any) => (
                  <Card key={c._id || c.id}>
                    <CardHeader>
                      <CardTitle>{c.name || c.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(c.syllabus || []).length > 0 ? (
                          (c.syllabus || []).map((week: any, index: number) => (
                            <div key={index} className="p-3 rounded-md border">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{week.topic || `Week ${index + 1}`}</div>
                                <div className="text-xs text-muted-foreground">{week.assessment || '--'}</div>
                              </div>
                              <div className="text-sm text-muted-foreground">Resources: {week.resources || '--'}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No plan available.</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground">No courses available yet.</p>
              )}
            </div>
          </div>
        );

      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
              <p className="text-muted-foreground">Manage your courses and students</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {teacherStats.map((stat, index) => {
                const Icon = stat.icon;
                
                return (
                  <div key={index} className="card-academic p-6 hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {stat.value}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        stat.color === 'success' ? 'bg-success-light' :
                        stat.color === 'warning' ? 'bg-warning-light' :
                        stat.color === 'primary' ? 'bg-primary/10' : 'bg-muted'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          stat.color === 'success' ? 'text-success' :
                          stat.color === 'warning' ? 'text-warning' :
                          stat.color === 'primary' ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-sm text-muted-foreground">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-6">My Courses</h2>
                <div className="space-y-4">
                  {teacherCourses.length > 0 ? (
                    teacherCourses.map((course: any) => (
                      <div key={course._id || course.id} className="card-academic p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {course.name || course.title}
                            </h3>
                            <div className="flex space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center"><Users className="h-4 w-4 mr-1" />{course.students_count || course.studentCount || 0} students</span>
                              <span className="flex items-center"><TestTube className="h-4 w-4 mr-1" />{course.tests_count || 0} tests</span>
                              <span className="flex items-center"><FileText className="h-4 w-4 mr-1" />{course.resourceCount || 0} resources</span>
                            </div>
                          </div>
                          <Badge className="status-due">
                            {course.pendingSubmissions || 0} pending
                          </Badge> 
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {course.schedule || 'No schedule'}
                          </span>
                          <Button 
                            size="sm" 
                            className="btn-success"
                            onClick={() => {
                              setSelectedCourseId(course._id || course.id);
                              setActiveSection('courses');
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No courses available yet.</p>
                  )}
                </div>
              </div>

              <div>
                <UpcomingMeetings 
                  userRole="teacher"
                  limit={5}
                  showCreateButton={true}
                  onCreateMeeting={() => setIsCreateMeetingDialogOpen(true)}
                  onViewAll={() => setActiveSection("meetings")}
                />
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="h-24 flex-col btn-success"
                    onClick={() => setActiveSection("upload")}
                  >
                    <Upload className="h-6 w-6 mb-2" />
                    Upload Resource
                  </Button>
                  <Button 
                    className="h-24 flex-col btn-primary"
                    onClick={() => setActiveSection("assignment")}
                  >
                    <ClipboardList className="h-6 w-6 mb-2" />
                    Assignment
                  </Button>
                  <Button 
                    className="h-24 flex-col btn-success"
                    onClick={() => setActiveSection("test")}
                  >
                    <TestTube className="h-6 w-6 mb-2" />
                    Test
                  </Button>
                  <Button 
                    className="h-24 flex-col btn-primary"
                    onClick={() => setActiveSection("meetings")}
                  >
                    <Video className="h-6 w-6 mb-2" />
                    Meetings
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

case "attendance" :
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Attendance</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-muted text-left">
            <tr>
              <th className="px-4 py-2 border-b">Roll No</th>
              <th className="px-4 py-2 border-b">Student Name</th>
              <th className="px-4 py-2 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-muted/40">
                <td className="px-4 py-2 border-b">{student.roll}</td>
                <td className="px-4 py-2 border-b">{student.name}</td>
                <td className="px-4 py-2 border-b">
                  <select
                    value={attendance[student.id] || "Absent"}
                    onChange={(e) =>
                      handleAttendanceChange(student.id, e.target.value)
                    }
                    className="border rounded-md px-2 py-1 text-sm"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button onClick={handleSaveAttendance} className="btn-primary">
        Save Attendance
      </Button>
    </div>
  );
case "upload":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Upload Resources</h1>
            <Card>
              <CardHeader>
                <CardTitle>Add Learning Material</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <select 
                      className="w-full p-2 border rounded-lg"
                      value={selectedCourseForUpload}
                      onChange={(e) => setSelectedCourseForUpload(e.target.value)}
                    >
                      <option value="">Select a course...</option>
                      {teacherCourses.length > 0 ? (
                        teacherCourses.map((course: any) => (
                          <option key={course._id || course.id} value={course._id || course.id}>
                            {course.name || course.title}
                          </option>
                        ))
                      ) : (
                        <option disabled>No courses available</option>
                      )}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="Enter resource title"
                    value={courseResourceTitle}
                    onChange={(e) => setCourseResourceTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the resource"
                    value={courseResourceDescription}
                    onChange={(e) => setCourseResourceDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="file">Upload File</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    onChange={(e) => setCourseResourceFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button className="btn-success" onClick={handleCourseResourceUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resource
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "notices":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Notices</h1>
            <Card>
              <CardHeader>
                <CardTitle>Admin Notices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(notices || []).map((n: any) => (
                  <div key={n._id || (n.title + n.createdAt)} className="p-4 border rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{n.title}</div>
                        <div className="text-xs text-muted-foreground">{(n.priority || '').toUpperCase()} • {n.target}</div>
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        <div>Created: {n.createdAt ? new Date(n.createdAt).toLocaleString() : '-'}</div>
                        <div>Updated: {n.updatedAt ? new Date(n.updatedAt).toLocaleString() : '-'}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">{n.content}</div>
                  </div>
                ))}
                {(notices || []).length === 0 && (
                  <div className="text-sm text-muted-foreground">No notices.</div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "assignment":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Assignments</h1>
            <Card>
              <CardHeader>
                <CardTitle>My Assignments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(assignments || []).map((a: any) => (
                  <div key={a._id || a.id} className="p-3 border rounded-md flex items-center justify-between">
                    <div>
                      <div className="font-medium">{a.title || a.name || 'Assignment'}</div>
                      <div className="text-xs text-muted-foreground">Total Marks: {a.total_marks ?? a.total ?? '--'}</div>
                    </div>
                    <Button size="sm" onClick={() => setSelectedAssignmentId(a._id || a.id)}>View Submissions</Button>
                  </div>
                ))}
                {(assignments || []).length === 0 && (
                  <div className="text-sm text-muted-foreground">No assignments found.</div>
                )}
              </CardContent>
            </Card>
            {assignmentDetail && (
              <Card>
                <CardHeader>
                  <CardTitle>Submissions: {assignmentDetail?.title || assignmentDetail?.name || 'Assignment'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(assignmentSubmissions || []).map((s: any) => {
                    const sid = s.student_id?._id || s.student_id?.id || s.student_id;
                    const scoreVal = marksEdits[sid] ?? '';
                    return (
                      <div key={s._id || sid} className="p-3 border rounded-md flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{s.student_id?.name || 'Student'}</div>
                          {s?.file_url && (
                            <a className="text-xs text-blue-600 hover:underline" href={s.file_url} target="_blank" rel="noreferrer">View submission</a>
                          )}
                          {s?.link && (
                            <a className="block text-xs text-blue-600 hover:underline" href={s.link} target="_blank" rel="noreferrer">External link</a>
                          )}
                          {s?.text && (
                            <div className="text-xs text-muted-foreground truncate">{s.text}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-24"
                            value={scoreVal}
                            onChange={(e) => setMarksEdits({ ...marksEdits, [sid]: Number(e.target.value) })}
                            placeholder="Marks"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                const maxScore = (assignmentDetail?.totalMarks as number) || 100;
                                const scoreValNum = Number(marksEdits[sid]);
                                if (!Number.isFinite(scoreValNum)) { alert('Enter a valid score'); return; }
                                await api.upsertMarks({
                                  type: 'assignment',
                                  ref_id: selectedAssignmentId!,
                                  student_id: sid,
                                  score: scoreValNum,
                                  max_score: maxScore,
                                  remarks: '',
                                  course_id: assignmentDetail?.course_id || undefined,
                                });
                                alert('Marks saved');
                              } catch (e) { alert('Failed to save marks'); }
                            }}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {(assignmentSubmissions || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">No submissions yet.</div>
                  )}
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>New Assignment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <select
                      className="w-full p-2 border rounded-lg"
                      value={newAssignment.course_id}
                      onChange={(e) => setNewAssignment({ ...newAssignment, course_id: e.target.value })}
                    >
                      <option value="">Select course</option>
                      {teacherCourses.map((c: any) => (
                        <option key={c._id || c.id} value={c._id || c.id}>{c.name || c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="marks">Total Marks</Label>
                    <Input id="marks" type="number" placeholder="100" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">Assignment Title</Label>
                  <Input id="title" placeholder="Enter assignment title" value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Assignment instructions and requirements" value={newAssignment.description} onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" value={newAssignment.due_date} onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="submissionType">Submission Type</Label>
                    <select className="w-full p-2 border rounded-lg">
                      <option>File Upload</option>
                      <option>Text Submission</option>
                      <option>Link Submission</option>
                    </select>
                  </div>
                </div>
                <Button className="btn-primary" onClick={async () => {
                  if (!newAssignment.title || !newAssignment.due_date || !newAssignment.course_id) { alert('Please fill course, title and due date'); return; }
                  try {
                    await api.createAssignment({
                      title: newAssignment.title,
                      description: newAssignment.description,
                      due_date: newAssignment.due_date,
                      course_id: newAssignment.course_id,
                    });
                    setNewAssignment({ course_id: '', title: '', description: '', due_date: '' });
                    // refresh list
                    if (user?._id) {
                      const res = await api.getAssignments({ teacher_id: user._id });
                      const list = (res as any)?.data || (res as any) || [];
                      setAssignments(list);
                    }
                    alert('Assignment created');
                  } catch (e) {
                    alert('Failed to create assignment');
                  }
                }}>
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              </CardContent>
            </Card>
          </div>
        );

    case "test":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Tests</h1>
            <Card>
              <CardHeader>
                <CardTitle>My Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(tests || []).map((t: any) => (
                  <div key={t._id || t.id} className="p-3 border rounded-md flex items-center justify-between">
                    <div>
                      <div className="font-medium">{t.title || t.name || 'Test'}</div>
                      <div className="text-xs text-muted-foreground">
                        Duration: {t.duration_minutes ?? '--'} min • Total Marks: {t.total_marks ?? 0}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => setSelectedTestId(t._id || t.id)}>View Scores</Button>
                  </div>
                ))}
                {(tests || []).length === 0 && (
                  <div className="text-sm text-muted-foreground">No tests found.</div>
                )}
              </CardContent>
            </Card>
            {selectedTestId && (
              <Card>
                <CardHeader>
                  <CardTitle>Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(testMarks || []).map((it: any) => (
                    <div key={it._id} className="p-3 border rounded-md flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{it.student_id?.name || 'Student'}</div>
                        <div className="text-xs text-muted-foreground">{it.student_id?.email || ''}</div>
                        {it.remarks && <div className="text-xs text-muted-foreground">{it.remarks}</div>}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{it.score ?? 0} / {it.max_score ?? 0}</div>
                        <div className="text-xs text-muted-foreground">
                          {it.max_score > 0 ? Math.round((it.score / it.max_score) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                  {(testMarks || []).length === 0 && (
                    <div className="text-sm text-muted-foreground">No scores found.</div>
                  )}
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>New Test / Quiz</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Test Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Course</Label>
                    <select className="w-full p-2 border rounded-lg" value={newTest.course_id} onChange={(e) => setNewTest({ ...newTest, course_id: e.target.value })}>
                      <option value="">Select course</option>
                      {teacherCourses.map((c: any) => (
                        <option key={c._id || c.id} value={c._id || c.id}>{c.name || c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Input type="number" placeholder="60" value={newTest.duration} onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label>Schedule (date & time)</Label>
                  <Input type="datetime-local" value={newTest.scheduled_at} onChange={(e) => setNewTest({ ...newTest, scheduled_at: e.target.value })} />
                </div>

                <div>
                  <Label>Test Title</Label>
                  <Input placeholder="Enter test title" value={newTest.title} onChange={(e) => setNewTest({ ...newTest, title: e.target.value })} />
                </div>

                <div>
                  <Label>Instructions</Label>
                  <Textarea placeholder="Test instructions for students" value={newTest.description} onChange={(e) => setNewTest({ ...newTest, description: e.target.value })} />
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  <Label className="text-lg font-semibold">Questions</Label>
                  {questions.map((q, index) => (
                    <div key={index} className="border p-4 rounded-lg bg-muted/30 space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Question {index + 1}</h3>
                        {questions.length > 1 && (
                          <Button variant="destructive" size="sm" onClick={() => removeQuestion(index)}>
                            Remove
                          </Button>
                        )}
                      </div>

                      <Input
                        placeholder={`Enter question ${index + 1}`}
                        value={q.question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                      />

                      <div className="grid grid-cols-2 gap-2">
                        {["A", "B", "C", "D"].map((label, optIndex) => (
                          <Input
                            key={optIndex}
                            placeholder={`Option ${label}`}
                            value={q.options[optIndex]}
                            onChange={(e) => handleOptionChange(index, optIndex, e.target.value)}
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Correct Answer</Label>
                          <select
                            className="w-full p-2 border rounded-lg"
                            value={q.correct}
                            onChange={(e) => handleCorrectChange(index, e.target.value)}
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                        <div>
                          <Label>Marks</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="1"
                            value={q.marks || 1}
                            onChange={(e) => handleMarksChange(index, e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />Add Question
                  </Button>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Marks:</span>
                      <span className="text-2xl font-bold text-primary">{totalMarks}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="btn-success"
                  onClick={async () => {
                    try {
                      if (!newTest.course_id || !newTest.title || !newTest.scheduled_at) {
                        alert('Please select a course, enter a title, and set schedule');
                        return;
                      }
                      const iso = new Date(newTest.scheduled_at).toISOString();
                      await api.createTest({
                        title: newTest.title,
                        description: newTest.description || '',
                        scheduled_at: iso,
                        course_id: newTest.course_id,
                        // pass duration and questions so student can take the test
                        // @ts-ignore - backend accepts extra fields
                        duration_minutes: Number(newTest.duration) || 60,
                        // use existing questions state (expects question, options[4], correct, marks)
                        // @ts-ignore - backend accepts this array
                        questions: questions.map((q: any) => ({ 
                          question: q.question, 
                          options: q.options, 
                          correct: q.correct, 
                          marks: q.marks || 1 
                        })),
                      } as any);
                      // refresh tests list
                      const res = await api.getTests();
                      const list = (res as any)?.data || (res as any) || [];
                      setTests(list);
                      // reset form
                      setNewTest({ course_id: '', title: '', description: '', scheduled_at: '', duration: '' });
                      setQuestions([{ question: "", options: ["", "", "", ""], correct: "A", marks: 1 }]);
                      alert('Test created');
                    } catch (e) {
                      alert('Failed to create test');
                    }
                  }}
                >
                  <TestTube className="h-4 w-4 mr-2" />Create Test
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "courses":
        if (selectedCourseId) {
          return (
            <div>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCourseId(null)}
                className="mb-4"
              >
                ← Back to Courses
              </Button>
              <CourseDetailPage courseId={selectedCourseId} />
            </div>
          );
        }
        return <TeacherCoursesList onCourseSelect={setSelectedCourseId} />;

      case "meetings":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Meetings</h1>
              <Button onClick={() => setIsCreateMeetingDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </div>
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Meetings Feature</h3>
              <p className="text-muted-foreground mb-4">
                Schedule and manage online meetings for your courses.
              </p>
              <Button onClick={() => setIsCreateMeetingDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Your First Meeting
              </Button>
            </div>
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
        <TeacherSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>

      {/* Meeting Creation Dialog */}
      <Dialog open={isCreateMeetingDialogOpen} onOpenChange={setIsCreateMeetingDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Meeting</DialogTitle>
            <DialogDescription>
              Create a new online meeting for your course. Students will be able to join when the meeting starts.
            </DialogDescription>
          </DialogHeader>
          <MeetingForm 
            onSuccess={() => setIsCreateMeetingDialogOpen(false)}
            onCancel={() => setIsCreateMeetingDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;