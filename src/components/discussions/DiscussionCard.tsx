import { MessageCircle, ThumbsUp, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Discussion {
  id: string;
  title: string;
  content: string;
  course: string;
  author: string;
  timeAgo: string;
  replies: number;
  likes: number;
  isResolved: boolean;
  tag: string;
}

interface DiscussionCardProps {
  discussion: Discussion;
  onDiscussionClick: (discussionId: string) => void;
}

const DiscussionCard = ({ discussion, onDiscussionClick }: DiscussionCardProps) => {
  return (
    <div className="card-discussion p-6 cursor-pointer hover:scale-[1.02] transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {discussion.course}
            </Badge>
            <Badge 
              className={`text-xs ${discussion.isResolved ? 'status-present' : 'status-due'}`}
            >
              {discussion.isResolved ? 'Resolved' : 'Open'}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {discussion.tag}
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
            {discussion.title}
          </h3>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {discussion.content}
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{discussion.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{discussion.timeAgo}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <MessageCircle className="h-4 w-4" />
            <span>{discussion.replies}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{discussion.likes}</span>
          </div>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onDiscussionClick(discussion.id)}
            className="text-xs"
          >
            Join Discussion
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionCard;