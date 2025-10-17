import { 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  MessageCircle, 
  PieChart, 
  FileText,
  Users,
  Upload,
  TestTube,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeacherSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { name: "Dashboard", icon: PieChart, id: "dashboard" },
  { name: "Create Assignment", icon: ClipboardList, id: "create-assignment" },
  { name: "Create Test", icon: TestTube, id: "create-test" },
  { name: "Manage Attendance", icon: CheckSquare, id: "attendance" },
  { name: "Discussions", icon: MessageCircle, id: "discussions" },
  { name: "Course Plan", icon: BookOpen, id: "course-plan" },
  { name: "Student Progress", icon: Users, id: "progress" },
  { name: "Resources", icon: FileText, id: "resources" },
  { name: "Timetable", icon: Calendar, id: "timetable" },
];

const TeacherSidebar = ({ activeSection, onSectionChange }: TeacherSidebarProps) => {
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
                  ? "bg-success text-success-foreground shadow-md"
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

export default TeacherSidebar;