import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  Upload,
  FileText,
  Download,
  Trash2,
  MessageSquare,
  Send,
  Plus,
  Users,
  ClipboardList,
  Video,
  Calendar,
  BookOpen,
  PlusCircle,
  UserCheck
} from "lucide-react";

interface Resource {
  _id: string;
  title: string;
  description: string;
  file_url: string;
  file_type: string;
  uploaded_by: {
    _id: string;
    name: string;
  };
  uploaded_at: string;
}

interface Discussion {
  _id: string;
  message: string;
  author: {
    _id: string;
    name: string;
    role: string;
  };
  created_at: string;
  replies: Discussion[];
}

interface CourseDetailPageProps {
  courseId: string;
}

export default function CourseDetailPage({ courseId }: CourseDetailPageProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [newMessage, setNewMessage] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCreateAssignmentDialogOpen, setIsCreateAssignmentDialogOpen] = useState(false);
  const [isCreateTestDialogOpen, setIsCreateTestDialogOpen] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    file: null as File | null
  });
  const [assignmentData, setAssignmentData] = useState({
    title: "",
    description: "",
    due_date: ""
  });
  const [testData, setTestData] = useState({
    title: "",
    description: "",
    scheduled_at: ""
  });
  const [isMarkAttendanceDialogOpen, setIsMarkAttendanceDialogOpen] = useState(false);
  const [isCreateMeetingDialogOpen, setIsCreateMeetingDialogOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent'>>({});
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingData, setMeetingData] = useState({
    title: "",
    description: "",
    scheduled_time: "",
    duration: 60
  });

  const userRole = user?.role;
  const isTeacher = userRole === 'teacher' || userRole === 'admin';

  // Fetch course details
  const { data: courseResponse, isLoading: courseLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => api.getCourse(courseId!),
    enabled: !!courseId,
  });

  // Fetch course resources
  const { data: resourcesResponse, isLoading: resourcesLoading } = useQuery({
    queryKey: ["course-resources", courseId],
    queryFn: () => api.getCourseResources(courseId!),
    enabled: !!courseId,
  });

  // Fetch course discussions
  const { data: discussionsResponse, isLoading: discussionsLoading } = useQuery({
    queryKey: ["course-discussions", courseId],
    queryFn: () => api.getCourseDiscussions(courseId!),
    enabled: !!courseId,
  });

  const course = courseResponse?.data;
  const resources = resourcesResponse?.data || [];
  const discussions = discussionsResponse?.data || [];

  // Upload resource mutation
  const uploadMutation = useMutation({
    mutationFn: (data: FormData) => api.uploadCourseResource(courseId!, data),
    onSuccess: () => {
      toast.success("Resource uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["course-resources", courseId] });
      setIsUploadDialogOpen(false);
      setUploadData({ title: "", description: "", file: null });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to upload resource");
    },
  });

  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: string) => api.deleteCourseResource(resourceId),
    onSuccess: () => {
      toast.success("Resource deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["course-resources", courseId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete resource");
    },
  });

  // Post discussion mutation
  const postDiscussionMutation = useMutation({
    mutationFn: (message: string) => api.postCourseDiscussion(courseId!, { message }),
    onSuccess: () => {
      toast.success("Message posted!");
      queryClient.invalidateQueries({ queryKey: ["course-discussions", courseId] });
      setNewMessage("");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to post message");
    },
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: (data: any) => api.createAssignment({ ...data, course_id: courseId! }),
    onSuccess: () => {
      toast.success("Assignment created successfully!");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setIsCreateAssignmentDialogOpen(false);
      setAssignmentData({ title: "", description: "", due_date: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create assignment");
    },
  });

  // Create test mutation
  const createTestMutation = useMutation({
    mutationFn: (data: any) => api.createTest({ ...data, course_id: courseId! }),
    onSuccess: () => {
      toast.success("Test created successfully!");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setIsCreateTestDialogOpen(false);
      setTestData({ title: "", description: "", scheduled_at: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create test");
    },
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: (data: any) => api.markAttendance(data),
    onSuccess: () => {
      toast.success("Attendance marked successfully!");
      setIsMarkAttendanceDialogOpen(false);
      setAttendanceData({});
      setAttendanceDate(new Date().toISOString().split('T')[0]);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to mark attendance");
    },
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: (data: any) => api.createMeeting({ ...data, course_id: courseId! }),
    onSuccess: () => {
      toast.success("Meeting created successfully!");
      queryClient.invalidateQueries({ queryKey: ["course", courseId] });
      setIsCreateMeetingDialogOpen(false);
      setMeetingData({ title: "", description: "", scheduled_time: "", duration: 60 });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create meeting");
    },
  });

  const handleUploadResource = () => {
    if (!uploadData.title || !uploadData.file) {
      toast.error("Please provide title and select a file");
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('file', uploadData.file);

    uploadMutation.mutate(formData);
  };

  const handleDeleteResource = (resourceId: string) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteResourceMutation.mutate(resourceId);
    }
  };

  const handlePostMessage = () => {
    if (!newMessage.trim()) return;
    postDiscussionMutation.mutate(newMessage);
  };

  const handleCreateAssignment = () => {
    if (!assignmentData.title || !assignmentData.due_date) {
      toast.error("Please provide title and due date");
      return;
    }
    createAssignmentMutation.mutate(assignmentData);
  };

  const handleCreateTest = () => {
    if (!testData.title || !testData.scheduled_at) {
      toast.error("Please provide title and scheduled date");
      return;
    }
    createTestMutation.mutate(testData);
  };

  const handleMarkAttendance = () => {
    const students = course?.students || [];
    if (students.length === 0) {
      toast.error("No students enrolled in this course");
      return;
    }

    const records = students.map((student: any) => ({
      student_id: student._id,
      status: attendanceData[student._id] || "present",
    }));

    markAttendanceMutation.mutate({
      course_id: courseId,
      date: attendanceDate,
      records,
    });
  };

  const handleCreateMeeting = () => {
    if (!meetingData.title || !meetingData.scheduled_time) {
      toast.error("Please provide title and scheduled time");
      return;
    }
    createMeetingMutation.mutate(meetingData);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (courseLoading) {
    return <div className="flex items-center justify-center py-8">Loading course...</div>;
  }

  if (!course) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-red-600">Course not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      {/* Course Info Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {course.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <Badge variant="outline">{course.code}</Badge>
                <span>{course.department}</span>
                <span>Semester {course.semester}</span>
              </CardDescription>
            </div>
            
            {isTeacher && (
              <div className="flex items-center gap-2">
                <Dialog open={isCreateMeetingDialogOpen} onOpenChange={setIsCreateMeetingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex items-center gap-2"
                    >
                      <Video className="h-4 w-4" />
                      Create Meeting
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule New Meeting</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={meetingData.title}
                          onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Meeting title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={meetingData.description}
                          onChange={(e) => setMeetingData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Meeting description (optional)"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Scheduled Time</label>
                        <Input
                          type="datetime-local"
                          value={meetingData.scheduled_time}
                          onChange={(e) => setMeetingData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Duration (minutes)</label>
                        <Input
                          type="number"
                          min="30"
                          max="480"
                          value={meetingData.duration}
                          onChange={(e) => setMeetingData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateMeetingDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateMeeting} disabled={createMeetingMutation.isPending}>
                          {createMeetingMutation.isPending ? "Creating..." : "Create"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isCreateAssignmentDialogOpen} onOpenChange={setIsCreateAssignmentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <ClipboardList className="h-4 w-4" />
                      Create Assignment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Assignment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={assignmentData.title}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Assignment title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          value={assignmentData.description}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Assignment description (optional)"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Due Date</label>
                        <Input
                          type="datetime-local"
                          value={assignmentData.due_date}
                          onChange={(e) => setAssignmentData(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateAssignmentDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAssignment} disabled={createAssignmentMutation.isPending}>
                          {createAssignmentMutation.isPending ? "Creating..." : "Create"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground mb-4">{course.description}</p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Students</p>
                <p className="text-lg font-bold text-blue-600">{course.students?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <FileText className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Resources</p>
                <p className="text-lg font-bold text-green-600">{resources.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <ClipboardList className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Assignments</p>
                <p className="text-lg font-bold text-orange-600">{course.totalAssignments || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
              <Video className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Tests</p>
                <p className="text-lg font-bold text-red-600">{course.totalTests || 0}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="discussions">Discussions</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Course Resources
                </CardTitle>
                {isTeacher && (
                  <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Resource
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload New Resource</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={uploadData.title}
                            onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Resource title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={uploadData.description}
                            onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Resource description (optional)"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">File</label>
                          <Input
                            type="file"
                            onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUploadResource} disabled={uploadMutation.isPending}>
                            {uploadMutation.isPending ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {resourcesLoading ? (
                <div>Loading resources...</div>
              ) : resources.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No resources uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resources.map((resource: Resource) => (
                    <div key={resource._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{resource.title}</h4>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Uploaded by {resource.uploaded_by.name} • {new Date(resource.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        {isTeacher && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteResource(resource._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Course Discussions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Post new message */}
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Share your thoughts or ask a question..."
                  className="flex-1"
                />
                <Button 
                  onClick={handlePostMessage}
                  disabled={!newMessage.trim() || postDiscussionMutation.isPending}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <Separator />

              {/* Discussion messages */}
              {discussionsLoading ? (
                <div>Loading discussions...</div>
              ) : discussions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No discussions yet. Start the conversation!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {discussions.map((discussion: Discussion) => (
                    <div key={discussion._id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {discussion.author.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{discussion.author.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {discussion.author.role}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(discussion.created_at).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{discussion.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Enrolled Students ({course.students?.length || 0})
                </CardTitle>
                {isTeacher && (
                  <Dialog open={isMarkAttendanceDialogOpen} onOpenChange={setIsMarkAttendanceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        Mark Attendance
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Mark Attendance</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Date</label>
                          <Input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto border rounded p-3">
                          {course?.students?.map((student: any) => (
                            <div key={student._id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {student.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">{student.clg_id}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={attendanceData[student._id] === "present" ? "default" : "outline"}
                                  onClick={() => setAttendanceData(prev => ({ ...prev, [student._id]: "present" }))}
                                  className="w-20"
                                >
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant={attendanceData[student._id] === "absent" ? "destructive" : "outline"}
                                  onClick={() => setAttendanceData(prev => ({ ...prev, [student._id]: "absent" }))}
                                  className="w-20"
                                >
                                  Absent
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsMarkAttendanceDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleMarkAttendance} disabled={markAttendanceMutation.isPending}>
                            {markAttendanceMutation.isPending ? "Marking..." : "Mark Attendance"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {course.students?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No students enrolled yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.students?.map((student: any) => (
                    <div key={student._id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-medium">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                          <p className="text-xs text-muted-foreground">ID: {student.clg_id}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            {isTeacher && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={isCreateMeetingDialogOpen} onOpenChange={setIsCreateMeetingDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule New Meeting</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={meetingData.title}
                            onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Meeting title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={meetingData.description}
                            onChange={(e) => setMeetingData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Meeting description (optional)"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Scheduled Time</label>
                          <Input
                            type="datetime-local"
                            value={meetingData.scheduled_time}
                            onChange={(e) => setMeetingData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Duration (minutes)</label>
                          <Input
                            type="number"
                            min="30"
                            max="480"
                            value={meetingData.duration}
                            onChange={(e) => setMeetingData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCreateMeetingDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateMeeting} disabled={createMeetingMutation.isPending}>
                            {createMeetingMutation.isPending ? "Creating..." : "Create"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isCreateAssignmentDialogOpen} onOpenChange={setIsCreateAssignmentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        Create Assignment
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Assignment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={assignmentData.title}
                            onChange={(e) => setAssignmentData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Assignment title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={assignmentData.description}
                            onChange={(e) => setAssignmentData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Assignment description (optional)"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Due Date</label>
                          <Input
                            type="datetime-local"
                            value={assignmentData.due_date}
                            onChange={(e) => setAssignmentData(prev => ({ ...prev, due_date: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCreateAssignmentDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateAssignment} disabled={createAssignmentMutation.isPending}>
                            {createAssignmentMutation.isPending ? "Creating..." : "Create"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isCreateTestDialogOpen} onOpenChange={setIsCreateTestDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Create Test
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Test</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title</label>
                          <Input
                            value={testData.title}
                            onChange={(e) => setTestData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Test title"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={testData.description}
                            onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Test description (optional)"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Scheduled Date</label>
                          <Input
                            type="datetime-local"
                            value={testData.scheduled_at}
                            onChange={(e) => setTestData(prev => ({ ...prev, scheduled_at: e.target.value }))}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsCreateTestDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateTest} disabled={createTestMutation.isPending}>
                            {createTestMutation.isPending ? "Creating..." : "Create"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={isMarkAttendanceDialogOpen} onOpenChange={setIsMarkAttendanceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Mark Attendance
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Mark Attendance</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Date</label>
                          <Input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 max-h-64 overflow-y-auto border rounded p-3">
                          {course?.students?.map((student: any) => (
                            <div key={student._id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {student.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">{student.clg_id}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={attendanceData[student._id] === "present" ? "default" : "outline"}
                                  onClick={() => setAttendanceData(prev => ({ ...prev, [student._id]: "present" }))}
                                  className="w-20"
                                >
                                  Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant={attendanceData[student._id] === "absent" ? "destructive" : "outline"}
                                  onClick={() => setAttendanceData(prev => ({ ...prev, [student._id]: "absent" }))}
                                  className="w-20"
                                >
                                  Absent
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsMarkAttendanceDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleMarkAttendance} disabled={markAttendanceMutation.isPending}>
                            {markAttendanceMutation.isPending ? "Marking..." : "Mark Attendance"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 border-l-2 border-blue-500 bg-blue-50">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">New resource uploaded</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 border-l-2 border-green-500 bg-green-50">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">New discussion message</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 border-l-2 border-orange-500 bg-orange-50">
                    <ClipboardList className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-sm font-medium">Assignment submitted</p>
                      <p className="text-xs text-muted-foreground">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
