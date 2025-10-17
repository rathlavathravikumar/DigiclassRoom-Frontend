import { CheckCircle2, Users, BookOpen, ClipboardList, TestTube, MessageCircle, Bell, Shield } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Courses", desc: "Browse and manage courses with progress tracking and resources." },
  { icon: ClipboardList, title: "Assignments", desc: "Create, submit, and grade assignments seamlessly." },
  { icon: TestTube, title: "Tests & Quizzes", desc: "Build timed tests with automatic evaluation and analytics." },
  { icon: MessageCircle, title: "Discussions", desc: "Collaborate via course-specific discussion threads." },
  { icon: Users, title: "Attendance", desc: "Take and view attendance with summaries and exports." },
  { icon: Bell, title: "Notices", desc: "Post announcements and receive real-time updates." },
  { icon: Shield, title: "Role-Based Access", desc: "Admin, Teacher, and Student roles with tailored dashboards." },
  { icon: CheckCircle2, title: "Beautiful UI", desc: "Modern, responsive design with consistent theming." },
];

const Features = () => {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Everything you need in one place</h2>
          <p className="mt-3 text-muted-foreground">A unified platform for managing academics: from courses and content to assessments and communications.</p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <ol className="relative border-s border-border">
            {features.map(({ icon: Icon, title, desc }, idx) => (
              <li key={title} className="ms-6 pb-10 last:pb-0">
                <span className="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary ring-2 ring-background">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="card-academic p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <span className="text-xs text-muted-foreground">Step {idx + 1}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default Features;
