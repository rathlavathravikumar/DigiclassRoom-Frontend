import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock, Video } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { adminApi } from "@/lib/adminApi";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const meetingSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  course_id: z.string().min(1, "Course is required"),
  scheduled_date: z.date({
    required_error: "Please select a date",
  }),
  scheduled_time: z.string().min(1, "Time is required"),
  duration: z.number().min(15, "Minimum duration is 15 minutes").max(480, "Maximum duration is 8 hours").default(60),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface MeetingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<MeetingFormData & { _id: string }>;
  mode?: "create" | "edit";
}

export default function MeetingForm({ onSuccess, onCancel, initialData, mode = "create" }: MeetingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      course_id: initialData?.course_id || "",
      scheduled_date: initialData?.scheduled_date || undefined,
      scheduled_time: initialData?.scheduled_time || "",
      duration: initialData?.duration || 60,
    },
  });

  const { user } = useAuth();

  // Fetch courses for dropdown
  const { data: coursesResponse, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => {
      // Use adminApi for admin/teacher roles, regular api for students
      if (user?.role === 'admin' || user?.role === 'teacher') {
        return adminApi.listCourses(user?.role === 'teacher' ? { teacher_id: user._id } : undefined);
      }
      return api.getCourses();
    },
  });

  const courses = coursesResponse?.data || [];

  // Create meeting mutation
  const createMutation = useMutation({
    mutationFn: (data: MeetingFormData) => {
      const scheduledDateTime = new Date(data.scheduled_date);
      const [hours, minutes] = data.scheduled_time.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      return api.createMeeting({
        title: data.title,
        description: data.description,
        course_id: data.course_id,
        scheduled_time: scheduledDateTime.toISOString(),
        duration: data.duration,
      });
    },
    onSuccess: () => {
      toast.success("Meeting scheduled successfully!");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["upcomingMeetings"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to schedule meeting");
    },
  });

  // Update meeting mutation
  const updateMutation = useMutation({
    mutationFn: (data: MeetingFormData) => {
      if (!initialData?._id) throw new Error("Meeting ID is required for update");
      
      const scheduledDateTime = new Date(data.scheduled_date);
      const [hours, minutes] = data.scheduled_time.split(':').map(Number);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      return api.updateMeeting(initialData._id, {
        title: data.title,
        description: data.description,
        scheduled_time: scheduledDateTime.toISOString(),
        duration: data.duration,
      });
    },
    onSuccess: () => {
      toast.success("Meeting updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", initialData?._id] });
      queryClient.invalidateQueries({ queryKey: ["upcomingMeetings"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update meeting");
    },
  });

  const onSubmit = async (data: MeetingFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === "edit") {
        await updateMutation.mutateAsync(data);
      } else {
        await createMutation.mutateAsync(data);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time options (every 15 minutes)
  const timeOptions = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const displayTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      timeOptions.push({ value: timeString, label: displayTime });
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          {mode === "edit" ? "Edit Meeting" : "Schedule New Meeting"}
        </CardTitle>
        <CardDescription>
          {mode === "edit" 
            ? "Update the meeting details below" 
            : "Create a new online meeting for your course"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Math Class - Chapter 5" 
                      {...field} 
                      disabled={mode === "edit"}
                      className={mode === "edit" ? "bg-muted cursor-not-allowed" : ""}
                    />
                  </FormControl>
                  {mode === "edit" && (
                    <p className="text-xs text-muted-foreground">Title cannot be changed after creation</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Meeting agenda, topics to cover, etc."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="course_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={mode === "edit"}>
                    <FormControl>
                      <SelectTrigger className={mode === "edit" ? "bg-muted cursor-not-allowed" : ""}>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coursesLoading ? (
                        <SelectItem value="loading" disabled>Loading courses...</SelectItem>
                      ) : courses.length === 0 ? (
                        <SelectItem value="no-courses" disabled>No courses available</SelectItem>
                      ) : (
                        courses.map((course: any) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.name} {course.code ? `(${course.code})` : ''}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {mode === "edit" && (
                    <p className="text-xs text-muted-foreground">Course cannot be changed after creation</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scheduled_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduled_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <Clock className="h-4 w-4 mr-2" />
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                      <SelectItem value="240">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Processing..." : mode === "edit" ? "Update Meeting" : "Schedule Meeting"}
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
