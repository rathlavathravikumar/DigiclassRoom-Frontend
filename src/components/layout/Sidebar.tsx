import { 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  MessageCircle, 
  PieChart, 
  FileText,
  Clock,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { name: "Dashboard", icon: PieChart, id: "dashboard" },
  { name: "My Courses", icon: BookOpen, id: "courses" },
  { name: "Assignments", icon: ClipboardList, id: "assignments" },
  { name: "Timetable", icon: Calendar, id: "timetable" },
  { name: "Tests", icon: FileText, id: "tests" },
  { name: "Attendance", icon: Clock, id: "attendance" },
  { name: "Notices", icon: Users, id: "notices" },
];

const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  return (
    <aside className="w-64 bg-card border-r border-border h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.name}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;