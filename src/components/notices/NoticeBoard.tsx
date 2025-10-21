import { Bell, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const NoticeBoard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.listPublicNotices({ target: 'students', admin_id: user?.admin_id });
        const list = (res as any)?.data || [];
        setItems(list);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.admin_id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Notice Board</h2>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          {loading ? 'Loading...' : `${items.length} Active Notices`}
        </Badge>
      </div>

      {(items || []).map((n, i) => (
        <div key={n._id || i} className="card-academic p-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {n.priority === 'urgent' && (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Urgent</Badge>
                )}
                {n.priority === 'important' && (
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Important</Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">
                {n.title}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                {n.content}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Bell className="h-4 w-4" />
                <span>{n.target === 'students' ? 'For Students' : n.target === 'teachers' ? 'For Teachers' : 'For All'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="text-xs">Read More</Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoticeBoard;