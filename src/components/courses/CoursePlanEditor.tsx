import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/adminApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface CoursePlanEditorProps {
  courseId: string;
}

const CoursePlanEditor = ({ courseId }: CoursePlanEditorProps) => {
  const qc = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["course-plan", courseId],
    queryFn: () => adminApi.getCoursePlan(courseId),
  });

  const [text, setText] = useState("");

  useEffect(() => {
    const plan = data?.data?.course_plan ?? data?.course_plan ?? "";
    setText(typeof plan === "string" ? plan : JSON.stringify(plan, null, 2));
  }, [data]);

  const save = useMutation({
    mutationFn: () => adminApi.setCoursePlan(courseId, text),
    onSuccess: () => {
      toast.success("Course plan saved");
      qc.invalidateQueries({ queryKey: ["course-plan", courseId] });
    },
    onError: () => toast.error("Failed to save plan"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading plan...</div>
        ) : isError ? (
          <div className="text-sm text-destructive">Failed to load plan.</div>
        ) : (
          <>
            <Textarea rows={12} value={text} onChange={(e) => setText(e.target.value)} />
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                className="text-destructive"
                onClick={() => {
                  setText("");
                  save.mutate();
                }}
                disabled={save.isPending}
              >
                Clear Plan
              </Button>
              <Button onClick={() => save.mutate()} disabled={save.isPending}>Save Plan</Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CoursePlanEditor;
