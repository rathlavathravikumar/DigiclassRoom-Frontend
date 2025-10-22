import { Bell, Calendar, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const NoticeBoard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedNotices, setExpandedNotices] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Fetch notices for students and notices for all users
        const [studentsRes, allRes] = await Promise.all([
          api.listPublicNotices({ target: 'students', admin_id: (user as any)?.admin_id }),
          api.listPublicNotices({ target: 'all', admin_id: (user as any)?.admin_id })
        ]);
        
        const studentsList = (studentsRes as any)?.data || [];
        const allList = (allRes as any)?.data || [];
        
        // Combine and deduplicate notices
        const combinedNotices = [...studentsList, ...allList];
        const uniqueNotices = combinedNotices.filter((notice, index, self) => 
          index === self.findIndex(n => n._id === notice._id)
        );
        
        setItems(uniqueNotices);
      } catch (error) {
        console.error('Failed to fetch notices:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [(user as any)?.admin_id]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Notice Board</h2>
        <Badge className="bg-primary/10 text-primary border-primary/20">
          {loading ? 'Loading...' : `${items.length} Active Notices`}
        </Badge>
      </div>

      {(items || []).map((n, i) => {
        const isExpanded = expandedNotices.has(n._id || i.toString());
        const shouldTruncate = n.content && n.content.length > 200;
        
        return (
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
                <div className="text-muted-foreground text-sm mb-3">
                  {shouldTruncate && !isExpanded ? (
                    <p className="whitespace-pre-wrap break-words">
                      {n.content.substring(0, 200)}...
                    </p>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">
                      {n.content}
                    </p>
                  )}
                </div>
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
              <div className="flex items-center space-x-2">
                {shouldTruncate && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => {
                      const newExpanded = new Set(expandedNotices);
                      if (isExpanded) {
                        newExpanded.delete(n._id || i.toString());
                      } else {
                        newExpanded.add(n._id || i.toString());
                      }
                      setExpandedNotices(newExpanded);
                    }}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" />
                        Read More
                      </>
                    )}
                  </Button>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-xs">
                      <Eye className="h-3 w-3 mr-1" />
                      View Full
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center space-x-2">
                        <span>{n.title}</span>
                        {n.priority === 'urgent' && (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Urgent</Badge>
                        )}
                        {n.priority === 'important' && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">Important</Badge>
                        )}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Bell className="h-4 w-4" />
                          <span>{n.target === 'students' ? 'For Students' : n.target === 'teachers' ? 'For Teachers' : 'For All'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</span>
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap break-words text-foreground leading-relaxed">
                          {n.content}
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NoticeBoard;