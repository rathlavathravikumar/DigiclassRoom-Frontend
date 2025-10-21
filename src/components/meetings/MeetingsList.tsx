import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Video, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import MeetingCard from "./MeetingCard";
import MeetingForm from "./MeetingForm";
import { format, startOfDay, endOfDay } from "date-fns";

interface MeetingsListProps {
  userRole: 'admin' | 'teacher' | 'student';
  userId: string;
}

export default function MeetingsList({ userRole, userId }: MeetingsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const { user } = useAuth();

  const pageSize = 10;

  // Fetch meetings with filters
  const actualUserId = user?._id || user?.id;
  const { data: meetingsResponse, isLoading: meetingsLoading, error } = useQuery({
    queryKey: ["meetings", searchTerm, statusFilter, courseFilter, currentPage, userRole, actualUserId],
    queryFn: () => {
      console.log('Fetching meetings with params:', { userRole, userId: actualUserId });
      const params: any = {
        page: currentPage,
        limit: pageSize,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      if (courseFilter !== "all") {
        params.course_id = courseFilter;
      }
      
      // Backend automatically filters by user role and ID

      return api.getMeetings(params);
    },
    enabled: !!actualUserId, // Only run query when user is loaded
  });

  // Fetch courses for filter dropdown
  const { data: coursesResponse } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.getCourses(),
  });

  const meetings = meetingsResponse?.data?.meetings || [];
  const pagination = meetingsResponse?.data?.pagination || { total: 0, pages: 1 };
  const courses = coursesResponse?.data || [];

  // Debug logging
  console.log('User object:', user);
  console.log('User role:', userRole);
  console.log('User ID (prop):', userId);
  console.log('Actual User ID:', actualUserId);
  console.log('Meetings response:', meetingsResponse);
  console.log('Meetings array:', meetings);
  console.log('Error:', error);

  // Filter meetings by search term (client-side for better UX)
  const filteredMeetings = meetings.filter((meeting: any) =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.course_id.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.teacher_id.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditMeeting = (meeting: any) => {
    // Convert scheduled_time to date and time for form
    const scheduledDate = new Date(meeting.scheduled_time);
    const timeString = format(scheduledDate, 'HH:mm');
    
    setEditingMeeting({
      ...meeting,
      scheduled_date: scheduledDate,
      scheduled_time: timeString,
    });
  };

  const handleCloseDialogs = () => {
    setIsCreateDialogOpen(false);
    setEditingMeeting(null);
  };

  const canCreateMeeting = userRole === 'admin' || userRole === 'teacher';

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-red-600">Failed to load meetings. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6" />
            Meetings
          </h1>
          <p className="text-muted-foreground">
            Manage and join online classes and meetings
          </p>
        </div>
        
        {canCreateMeeting && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Schedule New Meeting</DialogTitle>
              </DialogHeader>
              <MeetingForm 
                onSuccess={handleCloseDialogs}
                onCancel={handleCloseDialogs}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course: any) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetingsLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredMeetings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Video className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No meetings found</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || statusFilter !== "all" || courseFilter !== "all"
                  ? "Try adjusting your filters to see more results."
                  : canCreateMeeting
                  ? "Get started by scheduling your first meeting."
                  : "No meetings have been scheduled yet."
                }
              </p>
              {canCreateMeeting && !searchTerm && statusFilter === "all" && courseFilter === "all" && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule First Meeting
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results summary */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredMeetings.length} of {pagination.total} meetings
              </p>
              {(searchTerm || statusFilter !== "all" || courseFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCourseFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Meetings */}
            {filteredMeetings.map((meeting: any) => (
              <MeetingCard
                key={meeting._id}
                meeting={meeting}
                userRole={userRole}
                userId={userId}
                onEdit={handleEditMeeting}
              />
            ))}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  {pagination.pages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <Button
                        variant={currentPage === pagination.pages ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pagination.pages)}
                      >
                        {pagination.pages}
                      </Button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Meeting Dialog */}
      {editingMeeting && (
        <Dialog open={!!editingMeeting} onOpenChange={() => setEditingMeeting(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Meeting</DialogTitle>
            </DialogHeader>
            <MeetingForm
              mode="edit"
              initialData={editingMeeting}
              onSuccess={handleCloseDialogs}
              onCancel={handleCloseDialogs}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
