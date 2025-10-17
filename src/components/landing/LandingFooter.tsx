const LandingFooter = () => {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-hero px-2 py-1 rounded-md">
            <span className="text-primary-foreground font-bold">DC</span>
          </div>
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Digital Classroom</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Built with love • Modern UI • Role-based access
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
