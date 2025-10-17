import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import StatsCards from "@/components/dashboard/StatsCards";
import CourseCard from "@/components/courses/CourseCard";
import DiscussionCard from "@/components/discussions/DiscussionCard";
import AssignmentCard from "@/components/assignments/AssignmentCard";
import NoticeBoard from "@/components/notices/NoticeBoard";
import { Button } from "@/components/ui/button";
import { Plus, MessageCirclePlus } from "lucide-react";

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  // Mock data
  const courses = [
    {
      id: "1",
      name: "Data Structures & Algorithms",
      teacher: "Dr. Smith",
      progress: 75,
      nextClass: "Mon 10:00 AM",
      pendingAssignments: 2,
      unreadMessages: 5,
      resources: 12,
      color: "bg-gradient-to-r from-blue-500 to-blue-600"
    },
    {
      id: "2", 
      name: "Database Management Systems",
      teacher: "Prof. Johnson",
      progress: 60,
      nextClass: "Tue 2:00 PM",
      pendingAssignments: 1,
      unreadMessages: 3,
      resources: 8,
      color: "bg-gradient-to-r from-green-500 to-green-600"
    },
    {
      id: "3",
      name: "Computer Networks",
      teacher: "Dr. Brown",
      progress: 85,
      nextClass: "Wed 11:00 AM", 
      pendingAssignments: 0,
      unreadMessages: 1,
      resources: 15,
      color: "bg-gradient-to-r from-purple-500 to-purple-600"
    }
  ];

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

  const assignments = [
    {
      id: "1",
      title: "Implement Red-Black Tree",
      course: "DSA",
      dueDate: "2024-01-20",
      status: "pending" as const,
      totalMarks: 100,
      description: "Implement a Red-Black Tree with insertion, deletion and search operations",
      submissionType: "Code + Report",
      isOverdue: false
    },
    {
      id: "2",
      title: "Database Design Project",
      course: "DBMS", 
      dueDate: "2024-01-25",
      status: "submitted" as const,
      grade: 85,
      totalMarks: 100,
      description: "Design and implement a database for library management system",
      submissionType: "SQL + ER Diagram",
      isOverdue: false
    }
  ];

  const handleCourseClick = (courseId: string) => {
    console.log("Opening course:", courseId);
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
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, John! Here's your academic overview.</p>
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
        
      case "notices":
        return <NoticeBoard />;
        
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
      <Header />
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
