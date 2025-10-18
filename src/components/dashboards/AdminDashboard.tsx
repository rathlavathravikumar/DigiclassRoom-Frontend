import { useEffect, useState } from "react";
import RoleBasedHeader from "@/components/layout/RoleBasedHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Users, 
  BookOpen, 
  Bell, 
  Calendar,
  BarChart3,
  Settings,
  UserPlus,
  Trash2,
  Edit
} from "lucide-react";
import { adminApi } from "@/lib/adminApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdminCourseList from "@/components/courses/AdminCourseList";
import AdminCourseForm from "@/components/courses/AdminCourseForm";
import AdminCourseDetail from "@/components/courses/AdminCourseDetail";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [userFilter, setUserFilter] = useState<"all" | "teacher" | "student">("all");
  const [teachersData, setTeachersData] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [openAddTeacher, setOpenAddTeacher] = useState(false);
  const [openAddStudent, setOpenAddStudent] = useState(false);
  const [formTeacher, setFormTeacher] = useState({ name: "", email: "", password: "", clg_id: "" });
  const [formStudent, setFormStudent] = useState({ name: "", email: "", password: "", clg_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);

  const displayUsers = ((): any[] => {
    if (userFilter === "teacher") return teachersData.map(t => ({ ...t, role: "teacher" }));
    if (userFilter === "student") return studentsData.map(s => ({ ...s, role: "student" }));
    // merge both
    return [
      ...teachersData.map(t => ({ ...t, role: "teacher" })),
      ...studentsData.map(s => ({ ...s, role: "student" })),
    ];
  })();

  const refreshUsers = async () => {
    try {
      if (userFilter === "teacher") {
        const res = await adminApi.listUsers("teacher");
        setTeachersData((res as any)?.data?.users || []);
      } else if (userFilter === "student") {
        const res = await adminApi.listUsers("student");
        setStudentsData((res as any)?.data?.users || []);
      } else {
        const res = await adminApi.listUsers();
        setTeachersData((res as any)?.data?.teachers || []);
        setStudentsData((res as any)?.data?.students || []);
      }
    } catch (e) {
      // noop
    }
  };

  useEffect(() => {
    if (activeSection === "users") {
      refreshUsers();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === "users") {
      refreshUsers();
    }
  }, [userFilter]);

  const adminStats = [
    {
      title: "Total Students",
      value: "1,247",
      change: "+12% this month",
      icon: Users,
      color: "primary"
    },
    {
      title: "Active Teachers",
      value: "67",
      change: "+3 new this week",
      icon: UserPlus,
      color: "success"
    },
    {
      title: "Active Courses",
      value: "45",
      change: "Across all departments",
      icon: BookOpen,
      color: "warning"
    },
    {
      title: "System Notices",
      value: "8",
      change: "Active announcements",
      icon: Bell,
      color: "success"
    }
  ];

  const users = [
    { id: "1", name: "John Doe", email: "john@edu.com", role: "Student", class: "E3-S1", status: "Active" },
    { id: "2", name: "Dr. Sarah Smith", email: "sarah@edu.com", role: "Teacher", department: "CS", status: "Active" },
    { id: "3", name: "Mike Johnson", email: "mike@edu.com", role: "Student", class: "E3-S1", status: "Inactive" },
    { id: "4", name: "Prof. Brown", email: "brown@edu.com", role: "Teacher", department: "IT", status: "Active" }
  ];

  const courses = [
    { id: "1", name: "Data Structures & Algorithms", teacher: "Dr. Smith", students: 45, status: "Active" },
    { id: "2", name: "Database Management", teacher: "Prof. Johnson", students: 50, status: "Active" },
    { id: "3", name: "Computer Networks", teacher: "Dr. Brown", students: 48, status: "Active" }
  ];

  // Mock course plans (by courseId)
  const coursePlans: Record<string, { week: number; topic: string; resources?: string; assessment?: string }[]> = {
    "1": [
      { week: 1, topic: "Algorithm Analysis & Big-O", resources: "Slides, Book Ch.1", assessment: "Quiz" },
      { week: 2, topic: "Stacks & Queues", resources: "Lab sheet", assessment: "Assignment 1" },
    ],
    "2": [
      { week: 1, topic: "Relational Model & Keys", resources: "Slides", assessment: "Quiz" },
      { week: 2, topic: "SQL Basics", resources: "Practice sheet", assessment: "Assignment 1" },
    ],
    "3": [
      { week: 1, topic: "OSI Model", resources: "Slides", assessment: "Quiz" },
      { week: 2, topic: "Transport Layer", resources: "Book Ch.3", assessment: "Assignment 1" },
    ],
  };

  // Mock timetable data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const periods = ["9:00", "10:00", "11:00", "1:00", "2:00"];
  const timetable: Record<string, Record<string, string>> = {
    Mon: { "9:00": "DSA", "10:00": "DBMS", "11:00": "CN", "1:00": "--", "2:00": "--" },
    Tue: { "9:00": "DBMS", "10:00": "CN", "11:00": "--", "1:00": "DSA", "2:00": "--" },
    Wed: { "9:00": "CN", "10:00": "--", "11:00": "DSA", "1:00": "--", "2:00": "DBMS" },
    Thu: { "9:00": "--", "10:00": "DSA", "11:00": "DBMS", "1:00": "--", "2:00": "CN" },
    Fri: { "9:00": "DBMS", "10:00": "--", "11:00": "--", "1:00": "CN", "2:00": "DSA" },
  } as any;

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">System overview and management</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {adminStats.map((stat, index) => {
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

            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Recent User Activity</h2>
                  <Button size="sm" onClick={() => setActiveSection("users")}>
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {users.slice(0, 4).map((user) => (
                    <div key={user.id} className="card-academic p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={user.role === 'Student' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}>
                          {user.role}
                        </Badge>
                        <Badge className={user.status === 'Active' ? 'status-present' : 'bg-muted text-muted-foreground'}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    className="h-20 flex-col"
                    onClick={() => setActiveSection("create-course")}
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    Create Course
                  </Button>
                  <Button 
                    className="h-20 flex-col"
                    onClick={() => setActiveSection("users")}
                  >
                    <UserPlus className="h-6 w-6 mb-2" />
                    Add User
                  </Button>
                  <Button 
                    className="h-20 flex-col"
                    onClick={() => setActiveSection("notices")}
                  >
                    <Bell className="h-6 w-6 mb-2" />
                    Post Notice
                  </Button>
                  <Button 
                    className="h-20 flex-col"
                    onClick={() => setActiveSection("timetable")}
                  >
                    <Calendar className="h-6 w-6 mb-2" />
                    Manage Schedule
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case "courses":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
              <Button className="btn-primary" onClick={() => { setEditingCourse(null); setActiveSection("create-course"); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>
            <AdminCourseList
              onView={(id) => { setSelectedCourseId(id); setActiveSection("course-detail"); }}
              onEdit={(course) => { setEditingCourse(course); setActiveSection("edit-course"); }}
              onCreate={() => { setEditingCourse(null); setActiveSection("create-course"); }}
            />
          </div>
        );

      case "timetable":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Timetable Management</h1>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Configure Slots
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Timetable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
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
                            <td key={p} className="p-1">
                              <div className="flex items-center justify-between p-2 rounded-md border">
                                <span>{(timetable as any)[d]?.[p] || "--"}</span>
                                <Button size="sm" variant="outline">Edit</Button>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">User Management</h1>
              <div className="flex items-center gap-2">
                <Dialog open={openAddTeacher} onOpenChange={setOpenAddTeacher}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" /> Add Instructor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Instructor</DialogTitle>
                      <DialogDescription>Enter instructor details below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label htmlFor="tname">Name</Label>
                        <Input id="tname" value={formTeacher.name} onChange={(e) => setFormTeacher({ ...formTeacher, name: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="temail">Email</Label>
                        <Input id="temail" type="email" placeholder="name@eduemail.com" value={formTeacher.email} onChange={(e) => setFormTeacher({ ...formTeacher, email: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tpass">Temporary Password</Label>
                        <Input id="tpass" type="password" value={formTeacher.password} onChange={(e) => setFormTeacher({ ...formTeacher, password: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tclgid">College ID</Label>
                        <Input id="tclgid" placeholder="Enter college ID" value={formTeacher.clg_id} onChange={(e) => setFormTeacher({ ...formTeacher, clg_id: e.target.value })} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenAddTeacher(false)}>Cancel</Button>
                      <Button disabled={submitting} onClick={async () => {
                        if (!formTeacher.name || !formTeacher.email || !formTeacher.password) return;
                        setSubmitting(true);
                        await adminApi.createTeacher(formTeacher as any);
                        setSubmitting(false);
                        setOpenAddTeacher(false);
                        setFormTeacher({ name: "", email: "", password: "", clg_id: "" });
                        await refreshUsers();
                      }}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Dialog open={openAddStudent} onOpenChange={setOpenAddStudent}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" /> Add Student
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Student</DialogTitle>
                      <DialogDescription>Enter student details below.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                      <div className="grid gap-2">
                        <Label htmlFor="sname">Name</Label>
                        <Input id="sname" value={formStudent.name} onChange={(e) => setFormStudent({ ...formStudent, name: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="semail">Email</Label>
                        <Input id="semail" type="email" placeholder="name@eduemail.com" value={formStudent.email} onChange={(e) => setFormStudent({ ...formStudent, email: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="spass">Temporary Password</Label>
                        <Input id="spass" type="password" value={formStudent.password} onChange={(e) => setFormStudent({ ...formStudent, password: e.target.value })} />
                      </div>
                      {/* Class ID removed */}
                      <div className="grid gap-2">
                        <Label htmlFor="sclgid">College ID</Label>
                        <Input id="sclgid" placeholder="Enter college ID" value={formStudent.clg_id} onChange={(e) => setFormStudent({ ...formStudent, clg_id: e.target.value })} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpenAddStudent(false)}>Cancel</Button>
                      <Button disabled={submitting} onClick={async () => {
                        if (!formStudent.name || !formStudent.email || !formStudent.password || !formStudent.clg_id) return;
                        setSubmitting(true);
                        await adminApi.createStudent(formStudent as any);
                        setSubmitting(false);
                        setOpenAddStudent(false);
                        setFormStudent({ name: "", email: "", password: "", clg_id: "" });
                        await refreshUsers();
                      }}>Create</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Users</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Filter</span>
                    <Select value={userFilter} onValueChange={(v) => setUserFilter(v as any)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="teacher">Instructors</SelectItem>
                        <SelectItem value="student">Students</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayUsers.map((u: any) => (
                    <div key={u._id || u.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-sm text-muted-foreground">{u.email}</p>
                          </div>
                          {u.role && (
                            <Badge className={u.role === 'student' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}>
                              {u.role === 'student' ? 'Student' : 'Teacher'}
                            </Badge>
                          )}
                          {u.clg_id && (
                            <span className="text-sm text-muted-foreground">College ID: {u.clg_id}</span>
                          )}
                          {/* Class removed */}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {displayUsers.length === 0 && (
                    <div className="text-sm text-muted-foreground">No users found for this filter.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "create-course":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Create New Course</h1>
            <AdminCourseForm mode="create" onSuccess={() => setActiveSection("courses")} />
          </div>
        );

      case "edit-course":
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Edit Course</h1>
            <AdminCourseForm mode="edit" initialData={editingCourse} onSuccess={() => setActiveSection("courses")} />
          </div>
        );

      case "course-detail":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Course Detail</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setActiveSection("courses")}>Back</Button>
                <Button onClick={() => setActiveSection("edit-course")}>Edit</Button>
              </div>
            </div>
            {selectedCourseId ? (
              <AdminCourseDetail id={selectedCourseId} />
            ) : (
              <div className="text-sm text-muted-foreground">Select a course from the list.</div>
            )}
          </div>
        );

      case "notices":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">Notice Management</h1>
              <Button className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create Notice
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Create New Notice</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="noticeTitle">Notice Title</Label>
                  <Input id="noticeTitle" placeholder="Enter notice title" />
                </div>
                <div>
                  <Label htmlFor="noticeContent">Content</Label>
                  <Textarea id="noticeContent" placeholder="Notice content..." rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select className="w-full p-2 border rounded-lg">
                      <option>Normal</option>
                      <option>Important</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <select className="w-full p-2 border rounded-lg">
                      <option>All Users</option>
                      <option>Students Only</option>
                      <option>Teachers Only</option>
                      <option>Specific Class</option>
                    </select>
                  </div>
                </div>
                <Button>
                  <Bell className="h-4 w-4 mr-2" />
                  Publish Notice
                </Button>
              </CardContent>
            </Card>
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
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;