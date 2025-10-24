import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Copy,
  AlertCircle
} from "lucide-react";
import { format, isAfter, isBefore, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Meeting {
  _id: string;
  title: string;
  description?: string;
  course_id: {
    _id: string;
    name: string;
    code: string;
  };
  teacher_id: {
    _id: string;
    name: string;
    email: string;
  };
  scheduled_time: string;
  duration: number;
  meeting_link: string;
  meeting_password?: string;
  provider?: 'jitsi';
  room_name?: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  attendees: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  can_join?: boolean;
  is_active?: boolean;
  end_time?: string;
}

interface MeetingCardProps {
  meeting: Meeting;
  userRole: 'admin' | 'teacher' | 'student';
  userId: string;
  onEdit?: (meeting: Meeting) => void;
  showActions?: boolean;
}

export default function MeetingCard({ 
  meeting, 
  userRole, 
  userId, 
  onEdit, 
  showActions = true 
}: MeetingCardProps) {
  const [isJoining, setIsJoining] = useState(false);
  const queryClient = useQueryClient();

  const scheduledTime = new Date(meeting.scheduled_time);
  const endTime = meeting.end_time ? new Date(meeting.end_time) : addMinutes(scheduledTime, meeting.duration);
  const now = new Date();
  
  // Calculate if teacher can start the meeting (15-20 minutes before)
  const canStartTime = addMinutes(scheduledTime, -20); // 20 minutes before
  const canStartMeeting = userRole === 'teacher' && 
    isAfter(now, canStartTime) && 
    isBefore(now, endTime) &&
    meeting.status !== 'cancelled' &&
    meeting.status !== 'completed';

  // Cancel meeting mutation (soft delete - changes status to cancelled)
  const cancelMutation = useMutation({
    mutationFn: () => api.deleteMeeting(meeting._id),
    onSuccess: () => {
      toast.success("Meeting cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingMeetings"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to cancel meeting");
    },
  });
  
  // Delete meeting mutation (permanent delete)
  const deleteMutation = useMutation({
    mutationFn: () => api.deleteMeeting(meeting._id),
    onSuccess: () => {
      toast.success("Meeting deleted permanently");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingMeetings"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete meeting");
    },
  });

  // Join meeting mutation
  const joinMutation = useMutation({
    mutationFn: () => api.joinMeeting(meeting._id),
    onSuccess: (response) => {
      const meetingData = response.data;
      // Open meeting link in new tab
      window.open(meetingData.meeting_link, '_blank');
      
      // Show password if available
      if (meetingData.meeting_password) {
        toast.success(`Meeting opened! Password: ${meetingData.meeting_password}`, {
          duration: 10000,
        });
      } else {
        toast.success("Meeting opened in new tab");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to join meeting");
    },
  });

  const handleJoinMeeting = async () => {
    setIsJoining(true);
    try {
      await joinMutation.mutateAsync();
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meeting.meeting_link);
    toast.success("Meeting link copied to clipboard");
  };
  
  const handleStartMeeting = () => {
    // Verify meeting link exists
    if (!meeting.meeting_link) {
      toast.error("Meeting link not available. Please try refreshing the page.");
      console.error("Meeting link is missing:", meeting);
      return;
    }
    
    // Open meeting link in new tab
    const newWindow = window.open(meeting.meeting_link, '_blank', 'noopener,noreferrer');
    
    if (!newWindow) {
      toast.error("Please allow pop-ups for this site to open the meeting");
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(meeting.meeting_link);
      toast.info("Meeting link copied to clipboard instead");
    } else {
      toast.success("Meeting started! Opening in new tab...");
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      scheduled: { color: "bg-blue-100 text-blue-800", label: "Scheduled" },
      ongoing: { color: "bg-green-100 text-green-800", label: "Live" },
      completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const config = statusConfig[meeting.status] || statusConfig.scheduled;
    
    return (
      <Badge className={cn("text-xs", config.color)}>
        {meeting.is_active ? "Live" : config.label}
      </Badge>
    );
  };

  const canEdit = userRole !== 'student' && 
    (userRole === 'admin' || meeting.teacher_id._id === userId) &&
    meeting.status !== 'completed' && meeting.status !== 'cancelled';

  const canCancel = userRole !== 'student' && 
    (userRole === 'admin' || meeting.teacher_id._id === userId) &&
    meeting.status === 'scheduled';
    
  const canDelete = userRole !== 'student' && 
    (userRole === 'admin' || meeting.teacher_id._id === userId);

  const canJoin = meeting.can_join && meeting.status !== 'cancelled';

  return (
    <Card className={cn(
      "w-full transition-all duration-200 hover:shadow-md",
      meeting.is_active && "ring-2 ring-green-500 ring-opacity-50",
      meeting.status === 'cancelled' && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5" />
              {meeting.title}
              {meeting.is_active && (
                <Badge className="bg-red-100 text-red-800 animate-pulse">
                  LIVE
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {meeting.course_id.name} ({meeting.course_id.code})
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {showActions && canJoin && (
              <Button
                size="sm"
                onClick={handleJoinMeeting}
                disabled={isJoining}
                className={cn(
                  meeting.is_active && "bg-green-600 hover:bg-green-700"
                )}
              >
                {isJoining ? "Joining..." : meeting.is_active ? "Join Now" : "Join"}
                <ExternalLink className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {meeting.description && (
          <p className="text-sm text-muted-foreground">{meeting.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(scheduledTime, "PPP")}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(scheduledTime, "p")} - {format(endTime, "p")} 
              <span className="text-muted-foreground ml-1">
                ({meeting.duration} min)
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-xs">
                {meeting.teacher_id.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>{meeting.teacher_id.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{meeting.attendees.length} students enrolled</span>
          </div>
        </div>

        {/* Meeting status indicators */}
        {!canJoin && meeting.status !== 'cancelled' && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {isBefore(now, scheduledTime) 
                ? "Meeting will be available 15 minutes before start time"
                : "Meeting has ended"
              }
            </span>
          </div>
        )}

        {meeting.status === 'cancelled' && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">This meeting has been cancelled</span>
          </div>
        )}

        {/* Action buttons */}
        {showActions && (canEdit || canCancel || canDelete || canStartMeeting) && (
          <div className="flex items-center gap-2 pt-2 border-t">
            {/* Start Meeting Button - Only for teachers, 15-20 min before */}
            {userRole === 'teacher' && (
              <div className="flex-1">
                {canStartMeeting ? (
                  <Button
                    size="sm"
                    onClick={handleStartMeeting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Start Meeting
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled
                    className="cursor-not-allowed"
                  >
                    <Video className="h-4 w-4 mr-1" />
                    Start Meeting
                  </Button>
                )}
                {!canStartMeeting && meeting.status === 'scheduled' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Available 20 minutes before start time
                  </p>
                )}
              </div>
            )}
            
            {canEdit && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(meeting)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}

            {/* Cancel Meeting Button (Soft delete - changes status) */}
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Meeting</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this meeting? 
                      Students will no longer be able to join, but the meeting will remain in history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelMutation.mutate()}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Cancel Meeting
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {/* Delete Meeting Button (Permanent delete) */}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Meeting Permanently</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to permanently delete this meeting? This action cannot be undone.
                      The meeting will be completely removed from the system.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Meeting</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
