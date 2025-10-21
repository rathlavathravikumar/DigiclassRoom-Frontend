import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Video, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Plus,
  ArrowRight
} from "lucide-react";
import { format, isToday, isTomorrow, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

interface UpcomingMeetingsProps {
  userRole: 'admin' | 'teacher' | 'student';
  limit?: number;
  showCreateButton?: boolean;
  onCreateMeeting?: () => void;
  onViewAll?: () => void;
}

export default function UpcomingMeetings({ 
  userRole, 
  limit = 5, 
  showCreateButton = false,
  onCreateMeeting,
  onViewAll 
}: UpcomingMeetingsProps) {
  const [joiningMeetingId, setJoiningMeetingId] = useState<string | null>(null);
  const { user } = useAuth();

  const { data: meetingsResponse, isLoading, error } = useQuery({
    queryKey: ["upcomingMeetings", limit, userRole, user?._id],
    queryFn: () => {
      // Backend automatically filters by user role and ID
      const params: any = { 
        limit,
        status: 'scheduled,ongoing' // Only show scheduled and ongoing meetings
      };
      
      return api.getMeetings(params);
    },
    refetchInterval: 30000, // Refetch every 30 seconds to keep status updated
  });

  const meetings = Array.isArray(meetingsResponse?.data?.meetings) 
    ? meetingsResponse.data.meetings 
    : Array.isArray(meetingsResponse?.data) 
    ? meetingsResponse.data 
    : [];

  const handleJoinMeeting = async (meetingId: string) => {
    setJoiningMeetingId(meetingId);
    try {
      const response = await api.joinMeeting(meetingId);
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
    } catch (error: any) {
      toast.error(error.message || "Failed to join meeting");
    } finally {
      setJoiningMeetingId(null);
    }
  };

  const handleStartMeeting = async (meetingId: string) => {
    setJoiningMeetingId(meetingId);
    try {
      // First update the meeting status to 'ongoing'
      await api.updateMeeting(meetingId, { status: 'ongoing' });
      
      // Then join the meeting
      const response = await api.joinMeeting(meetingId);
      const meetingData = response.data;
      
      // Open meeting link in new tab
      window.open(meetingData.meeting_link, '_blank');
      
      // Show password if available
      if (meetingData.meeting_password) {
        toast.success(`Meeting started! Password: ${meetingData.meeting_password}`, {
          duration: 10000,
        });
      } else {
        toast.success("Meeting started and opened in new tab");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start meeting");
    } finally {
      setJoiningMeetingId(null);
    }
  };

  const formatMeetingTime = (scheduledTime: string) => {
    const date = new Date(scheduledTime);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, h:mm a');
    }
  };

  const getTimeUntilMeeting = (scheduledTime: string) => {
    const date = new Date(scheduledTime);
    const now = new Date();
    
    if (date <= now) {
      return "Starting now";
    }
    
    return `in ${formatDistanceToNow(date)}`;
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Failed to load meetings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Upcoming Meetings
            </CardTitle>
            <CardDescription>
              Your next {limit} scheduled meetings
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {showCreateButton && onCreateMeeting && (userRole === 'admin' || userRole === 'teacher') && (
              <Button size="sm" onClick={onCreateMeeting}>
                <Plus className="h-4 w-4 mr-1" />
                Schedule
              </Button>
            )}
            {onViewAll && (
              <Button variant="outline" size="sm" onClick={onViewAll}>
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-8">
            <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-muted-foreground mb-2">No upcoming meetings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {userRole === 'student' 
                ? "Your teachers haven't scheduled any meetings yet."
                : "You haven't scheduled any meetings yet."
              }
            </p>
            {showCreateButton && onCreateMeeting && (userRole === 'admin' || userRole === 'teacher') && (
              <Button size="sm" onClick={onCreateMeeting}>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting: any) => {
              const scheduledTime = new Date(meeting.scheduled_time);
              const isJoinable = meeting.can_join && meeting.status !== 'cancelled';
              const isActive = meeting.is_active;
              
              return (
                <div
                  key={meeting._id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-colors",
                    isActive && "bg-green-50 border-green-200",
                    meeting.status === 'cancelled' && "opacity-60"
                  )}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-lg",
                      isActive ? "bg-green-100" : "bg-blue-100"
                    )}>
                      <Video className={cn(
                        "h-6 w-6",
                        isActive ? "text-green-600" : "text-blue-600"
                      )} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{meeting.title}</h4>
                        {isActive && (
                          <Badge className="bg-red-100 text-red-800 text-xs animate-pulse">
                            LIVE
                          </Badge>
                        )}
                        {meeting.status === 'cancelled' && (
                          <Badge variant="destructive" className="text-xs">
                            Cancelled
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatMeetingTime(meeting.scheduled_time)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meeting.duration} min
                        </span>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {meeting.course_id.name} • {getTimeUntilMeeting(meeting.scheduled_time)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {userRole === 'teacher' ? (
                      // Teacher view - can start meeting anytime, join when active
                      <div className="flex gap-2">
                        {meeting.status === 'scheduled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartMeeting(meeting._id)}
                            disabled={joiningMeetingId === meeting._id}
                          >
                            {joiningMeetingId === meeting._id ? (
                              "Starting..."
                            ) : (
                              "Start Meeting"
                            )}
                            <Video className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                        {isActive && (
                          <Button
                            size="sm"
                            onClick={() => handleJoinMeeting(meeting._id)}
                            disabled={joiningMeetingId === meeting._id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {joiningMeetingId === meeting._id ? (
                              "Joining..."
                            ) : (
                              "Join Live"
                            )}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    ) : (
                      // Student view - can only join when meeting is active and joinable
                      isJoinable ? (
                        <Button
                          size="sm"
                          onClick={() => handleJoinMeeting(meeting._id)}
                          disabled={joiningMeetingId === meeting._id}
                          className={cn(
                            isActive && "bg-green-600 hover:bg-green-700"
                          )}
                        >
                          {joiningMeetingId === meeting._id ? (
                            "Joining..."
                          ) : isActive ? (
                            "Join Now"
                          ) : (
                            "Join"
                          )}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      ) : (
                        <div className="text-xs text-muted-foreground text-right">
                          {meeting.status === 'cancelled' ? (
                            "Cancelled"
                          ) : scheduledTime > new Date() ? (
                            "Available 15 min before"
                          ) : (
                            "Meeting ended"
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
