import { Book, Calendar, MessageCircle, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Course {
  id: string;
  name: string;
  teacher: string;
  progress: number;
  nextClass: string;
  pendingAssignments: number;
  unreadMessages: number;
  resources: number;
  color: string;
}

interface CourseCardProps {
  course: Course;
  onCourseClick: (courseId: string) => void;
}

const CourseCard = ({ course, onCourseClick }: CourseCardProps) => {
  return (
    <div className="card-subject group cursor-pointer hover:scale-105 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {course.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            Prof. {course.teacher}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${course.color} flex items-center justify-center`}>
          <Book className="h-6 w-6 text-white" />
        </div>
      </div>
      
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            {course.nextClass}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mr-1" />
            <span>{course.resources} resources</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1" />
            <span>45 students</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {course.pendingAssignments > 0 && (
            <Badge className="status-due">
              {course.pendingAssignments} pending
            </Badge>
          )}
          {course.unreadMessages > 0 && (
            <Badge variant="outline" className="flex items-center">
              <MessageCircle className="h-3 w-3 mr-1" />
              {course.unreadMessages}
            </Badge>
          )}
        </div>
        
        <Button 
          size="sm" 
          onClick={() => onCourseClick(course.id)}
          className="btn-primary px-4 py-2"
        >
          View Course
        </Button>
      </div>
    </div>
  );
};

export default CourseCard;