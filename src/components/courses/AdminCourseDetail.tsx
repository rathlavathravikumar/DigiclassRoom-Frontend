import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import CoursePlanEditor from "./CoursePlanEditor";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AdminCourseDetailProps {
  id: string;
}

const AdminCourseDetail = ({ id }: AdminCourseDetailProps) => {
  const qc = useQueryClient();
  const courseQ = useQuery({ queryKey: ["course", id], queryFn: () => adminApi.getCourse(id) });
  const course: any = (courseQ.data?.data && !courseQ.data?.course)
    ? courseQ.data?.data
    : (courseQ.data?.data?.course || courseQ.data?.course || {});

  const teachersQ = useQuery({ queryKey: ["teachers"], queryFn: () => adminApi.listUsers("teacher") });
  const teachers: any[] = teachersQ.data?.data?.users || teachersQ.data?.users || [];

  const [teacherId, setTeacherId] = useState<string>(course?.teacher?._id || "");
  const [addStudentClgId, setAddStudentClgId] = useState("");

  const assign = useMutation({
    mutationFn: () => adminApi.assignCourseTeacher(id, teacherId),
    onSuccess: async () => {
      toast.success("Teacher assigned");
      await qc.invalidateQueries({ queryKey: ["course", id] });
    },
    onError: () => toast.error("Failed to assign teacher"),
  });

  useEffect(() => {
    setTeacherId(course?.teacher?._id || "");
  }, [course?.teacher?._id]);

  const updateStudents = useMutation({
    mutationFn: (payload: { add_clg_ids?: string[]; remove_clg_ids?: string[]; set_clg_ids?: string[] }) => adminApi.updateCourseStudents(id, payload),
    onSuccess: async () => {
      toast.success("Students updated");
      await qc.invalidateQueries({ queryKey: ["course", id] });
    },
    onError: () => toast.error("Failed to update students"),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{course?.name || "Course"}</CardTitle>
            <Badge className="status-present">Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Code</div>
              <div className="font-medium">{course?.code || "--"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Teacher</div>
              <div className="font-medium">{course?.teacher?.name || "--"}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Students</div>
              <div className="font-medium">{course?.students?.length ?? course?.students_count ?? "--"}</div>
            </div>
          </div>
          {course?.description && (
            <p className="text-sm text-muted-foreground">{course.description}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assign Teacher</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder={course?.teacher?.name || "Select teacher"} />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((t: any) => (
                <SelectItem key={t._id || t.id} value={t._id || t.id}>{t.name} ({t.email})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => assign.mutate()} disabled={!teacherId || assign.isPending}>Assign</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Input placeholder="Add student by College ID" value={addStudentClgId} onChange={(e) => setAddStudentClgId(e.target.value)} className="w-80" />
            <Button onClick={() => {
              const v = addStudentClgId.trim();
              if (!v) return;
              updateStudents.mutate({ add_clg_ids: [v] });
              setAddStudentClgId("");
            }}>Add</Button>
          </div>
          <div className="space-y-2">
            {(course?.students || []).map((s: any) => (
              <div key={s._id || s.id} className="flex items-center justify-between p-2 border rounded-md">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.email}{s.clg_id ? ` • ${s.clg_id}` : ''}</div>
                </div>
                <Button variant="outline" className="text-destructive" onClick={() => updateStudents.mutate({ remove_clg_ids: [s.clg_id] })} disabled={!s?.clg_id}>
                  Remove
                </Button>
              </div>
            ))}
            {(course?.students || []).length === 0 && (
              <div className="text-sm text-muted-foreground">No students enrolled.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <CoursePlanEditor courseId={id} />
    </div>
  );
};

export default AdminCourseDetail;
