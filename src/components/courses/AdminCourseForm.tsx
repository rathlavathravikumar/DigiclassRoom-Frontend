import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface AdminCourseFormProps {
  mode: "create" | "edit";
  initialData?: any;
  onSuccess?: () => void;
}

const AdminCourseForm = ({ mode, initialData, onSuccess }: AdminCourseFormProps) => {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: initialData?.name || "",
    code: initialData?.code || "",
    description: initialData?.description || "",
    teacher_id: initialData?.teacher?._id || initialData?.teacher_id || "",
    credits: initialData?.credits || "",
  });

  useEffect(() => {
    setForm({
      name: initialData?.name || "",
      code: initialData?.code || "",
      description: initialData?.description || "",
      teacher_id: initialData?.teacher?._id || initialData?.teacher_id || "",
      credits: initialData?.credits || "",
    });
  }, [initialData]);

  const { data: teachersRes } = useQuery({
    queryKey: ["teachers"],
    queryFn: () => adminApi.listUsers("teacher"),
  });

  const teachers: any[] = teachersRes?.data?.users || teachersRes?.users || [];

  const create = useMutation({
    mutationFn: () => adminApi.createCourse({ name: form.name, code: form.code, description: form.description, teacher_id: form.teacher_id }),
    onSuccess: () => {
      toast.success("Course created");
      qc.invalidateQueries({ queryKey: ["courses"] });
      onSuccess?.();
    },
    onError: () => toast.error("Failed to create course"),
  });

  const update = useMutation({
    mutationFn: () => adminApi.updateCourse(initialData?._id || initialData?.id, { name: form.name, code: form.code, description: form.description, teacher_id: form.teacher_id }),
    onSuccess: () => {
      toast.success("Course updated");
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["course", initialData?._id || initialData?.id] });
      onSuccess?.();
    },
    onError: () => toast.error("Failed to update course"),
  });

  const disabled = useMemo(() => !form.name || !form.code || !form.teacher_id, [form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New Course" : "Edit Course"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Course Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="code">Course Code</Label>
            <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Assign Teacher</Label>
            <Select value={form.teacher_id} onValueChange={(v) => setForm({ ...form, teacher_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t: any) => (
                  <SelectItem key={t._id || t.id} value={t._id || t.id}>{t.name} ({t.email})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="credits">Credits</Label>
            <Input id="credits" type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => (mode === "create" ? create.mutate() : update.mutate())}
            disabled={disabled || create.isPending || update.isPending}
          >
            {mode === "create" ? "Create" : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCourseForm;
