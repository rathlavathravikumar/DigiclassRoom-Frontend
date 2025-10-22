import { Calendar, Clock, FileText, AlertCircle, Eye, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded";
  grade?: number;
  totalMarks: number;
  description: string;
  submissionType: string;
  isOverdue: boolean;
  remarks?: string;
  submissionDate?: string;
}

interface AssignmentCardProps {
  assignment: Assignment;
  onAssignmentClick: (assignmentId: string) => void;
  onViewScore?: (assignmentId: string) => void;
}

const AssignmentCard = ({ assignment, onAssignmentClick, onViewScore }: AssignmentCardProps) => {
  const getStatusColor = () => {
    switch (assignment.status) {
      case "submitted":
        return "status-present";
      case "graded":
        return "status-grade";
      default:
        return assignment.isOverdue ? "bg-destructive/10 text-destructive border-destructive/20" : "status-due";
    }
  };

  const getDaysUntilDue = () => {
    const due = new Date(assignment.dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days left`;
  };

  return (
    <div className="card-academic p-6 hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {assignment.course}
            </Badge>
            <Badge className={`text-xs ${getStatusColor()}`}>
              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {assignment.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {assignment.description}
          </p>
        </div>
        
        {assignment.isOverdue && (
          <AlertCircle className="h-5 w-5 text-destructive ml-2" />
        )}
      </div>
      
      {assignment.grade && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Grade</span>
            <span className="font-medium">{assignment.grade}/{assignment.totalMarks}</span>
          </div>
          <Progress value={(assignment.grade / assignment.totalMarks) * 100} className="h-2" />
        </div>
      )}
      
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(assignment.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FileText className="h-4 w-4" />
            <span>{assignment.submissionType}</span>
          </div>
        </div>
        
        <div className={`flex items-center space-x-1 font-medium ${
          assignment.isOverdue ? 'text-destructive' : 'text-warning'
        }`}>
          <Clock className="h-4 w-4" />
          <span>{getDaysUntilDue()}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          Max Marks: {assignment.totalMarks}
        </span>
        
        <div className="flex gap-2">
          {assignment.status === "submitted" && assignment.grade !== undefined && onViewScore ? (
            <Button 
              size="sm"
              variant="outline"
              onClick={() => onViewScore(assignment.id)}
              className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
            >
              <Award className="h-3 w-3" />
              View Score
            </Button>
          ) : null}
          
          <Button 
            size="sm"
            onClick={() => onAssignmentClick(assignment.id)}
            className={assignment.status === "pending" ? "btn-primary" : ""}
            variant={assignment.status === "pending" ? "default" : "outline"}
          >
            {assignment.status === "pending" ? "Submit" : (
              assignment.status === "submitted" ? (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </>
              ) : "View Details"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentCard;