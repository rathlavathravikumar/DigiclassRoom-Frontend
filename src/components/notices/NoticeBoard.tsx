import { Bell, Calendar, Pin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  isPinned: boolean;
  isImportant: boolean;
  views: number;
}

const NoticeBoard = () => {
  const notices: Notice[] = [
    {
      id: "1",
      title: "Mid-Semester Exam Schedule Released",
      content: "The mid-semester examination schedule for all courses has been published. Please check your individual timetables for specific dates and timings.",
      date: "2024-01-15",
      author: "Academic Office",
      isPinned: true,
      isImportant: true,
      views: 245
    },
    {
      id: "2", 
      title: "Library Extended Hours During Exams",
      content: "The library will remain open 24/7 during the examination period from January 20th to February 5th.",
      date: "2024-01-12",
      author: "Library Administration",
      isPinned: false,
      isImportant: false,
      views: 156
    },
    {
      id: "3",
      title: "Guest Lecture on AI & Machine Learning",
      content: "Distinguished speaker Dr. Sarah Johnson will deliver a guest lecture on 'Future of AI in Education' on January 25th at 2:00 PM in Auditorium A.",
      date: "2024-01-10",
      author: "CS Department",
      isPinned: false,
      isImportant: false,
      views: 89
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Notice Board</h2>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          {notices.length} Active Notices
        </Badge>
      </div>
      
      {notices.map((notice) => (
        <div key={notice.id} className="card-academic p-6 relative">
          {notice.isPinned && (
            <Pin className="absolute top-4 right-4 h-4 w-4 text-primary" />
          )}
          
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {notice.isImportant && (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
                    Important
                  </Badge>
                )}
                {notice.isPinned && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                    Pinned
                  </Badge>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">
                {notice.title}
              </h3>
              
              <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                {notice.content}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Bell className="h-4 w-4" />
                <span>{notice.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(notice.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{notice.views} views</span>
              </div>
            </div>
            
            <Button size="sm" variant="outline" className="text-xs">
              Read More
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoticeBoard;