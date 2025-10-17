import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background dark:from-primary/20 text-foreground">
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-success/20 blur-3xl" />
      <div className="container mx-auto px-4 py-24 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="font-heading text-4xl md:text-5xl font-extrabold leading-tight">
            Learn, Collaborate, and Grow with Digital Classroom
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            A modern learning platform for students, teachers, and administrators with courses, assignments, tests, discussions, and more.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {!user ? (
              <>
                <Button className="btn-primary t" onClick={() => navigate("/login")}>Get Started</Button>
                <Button variant="outline" className="text-foreground" onClick={() => navigate("/signup")}>Create an Account</Button>
              </>
            ) : (
              <Button className="btn-primary" onClick={() => navigate("/app")}>Go to Dashboard</Button>
            )}
          </div>
          <div className="mt-6 text-sm text-muted-foreground">
            No credit card required • Seamless onboarding • Fully responsive
          </div>
        </div>
        <div>
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-card">
            <div className="relative w-full aspect-video grid place-items-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-transparent to-success/15" />
              <div className="relative z-10 text-center px-6 py-8">
                <p className="text-sm uppercase tracking-widest text-muted-foreground">Digital Classroom</p>
                <h3 className="mt-2 text-2xl font-semibold">Unified Learning Platform</h3>
                <p className="mt-2 text-sm text-muted-foreground">Courses • Assignments • Tests • Discussions • Attendance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
