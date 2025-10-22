import { CheckCircle2, Users, BookOpen, ClipboardList, TestTube, MessageCircle, Bell, Shield, ArrowRight, Zap, Target, Globe } from "lucide-react";
import { educationalImages, getResponsiveImageUrls } from "../../lib/images";

const features = [
  { 
    icon: BookOpen, 
    title: "Interactive Courses", 
    desc: "Engage with multimedia content, track progress, and access resources anytime, anywhere.",
    image: educationalImages.features.courses,
    color: "from-blue-500/20 to-blue-600/20",
    iconBg: "bg-blue-500/10 text-blue-600"
  },
  { 
    icon: ClipboardList, 
    title: "Smart Assignments", 
    desc: "Create, submit, and grade assignments with automated feedback and plagiarism detection.",
    image: educationalImages.features.assignments,
    color: "from-green-500/20 to-green-600/20",
    iconBg: "bg-green-500/10 text-green-600"
  },
  { 
    icon: TestTube, 
    title: "Advanced Testing", 
    desc: "Build comprehensive assessments with real-time analytics and detailed performance insights.",
    image: educationalImages.features.tests,
    color: "from-purple-500/20 to-purple-600/20",
    iconBg: "bg-purple-500/10 text-purple-600"
  },
  { 
    icon: MessageCircle, 
    title: "Collaborative Discussions", 
    desc: "Foster meaningful conversations with threaded discussions and peer-to-peer learning.",
    image: educationalImages.features.discussions,
    color: "from-orange-500/20 to-orange-600/20",
    iconBg: "bg-orange-500/10 text-orange-600"
  },
  { 
    icon: Users, 
    title: "Smart Attendance", 
    desc: "Automated attendance tracking with detailed analytics and export capabilities.",
    image: educationalImages.features.attendance,
    color: "from-teal-500/20 to-teal-600/20",
    iconBg: "bg-teal-500/10 text-teal-600"
  },
  { 
    icon: Bell, 
    title: "Real-time Notifications", 
    desc: "Stay updated with instant notifications for assignments, announcements, and deadlines.",
    image: educationalImages.features.notices,
    color: "from-red-500/20 to-red-600/20",
    iconBg: "bg-red-500/10 text-red-600"
  },
];

const highlights = [
  { icon: Zap, title: "Lightning Fast", desc: "Optimized performance for seamless learning" },
  { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade security for your data" },
  { icon: Target, title: "Goal Oriented", desc: "Track progress and achieve learning objectives" },
  { icon: Globe, title: "Accessible Anywhere", desc: "Learn from any device, anytime, anywhere" },
];

const FeatureCard = ({ feature, index }: { feature: any, index: number }) => {
  const imageUrls = getResponsiveImageUrls(feature.image);
  
  return (
    <div 
      className="group relative overflow-hidden rounded-3xl bg-card border border-border/30 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 backdrop-blur-sm"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className="relative p-8 lg:p-10">
        <div className="flex items-start space-x-6">
          <div className={`p-4 rounded-3xl ${feature.iconBg} group-hover:scale-110 transition-all duration-300 shadow-lg`}>
            <feature.icon className="h-7 w-7" strokeWidth={2} />
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl lg:text-2xl font-heading font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
              {feature.title}
            </h3>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6 font-light">
              {feature.desc}
            </p>
            
            <div className="flex items-center text-primary group-hover:translate-x-2 transition-transform duration-300">
              <span className="text-sm font-semibold">Explore feature</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
        
        <div className="mt-8 relative overflow-hidden rounded-2xl">
          <img
            src={imageUrls.tablet}
            alt={`${feature.title} illustration`}
            className="w-full h-40 lg:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/10 group-hover:to-primary/20 transition-colors duration-500" />
        </div>
      </div>
    </div>
  );
};

const Features = () => {
  return (
    <section className="relative py-20 lg:py-32 bg-gradient-to-b from-background via-muted/5 to-background overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-6 relative">
        {/* Enhanced Header */}
        <div className="text-center max-w-5xl mx-auto mb-24 animate-fade-in-up">
          <div className="inline-flex items-center px-6 py-3 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-8 border border-primary/20">
            <CheckCircle2 className="h-5 w-5 mr-3" />
            Comprehensive Learning Ecosystem
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-foreground mb-8 leading-[0.9] tracking-tight">
            Everything you need for{" "}
            <span className="bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent block mt-2">
              modern education
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-light">
            A unified platform that brings together all the tools educators and students need for 
            <span className="text-foreground font-medium"> effective digital learning</span> and 
            <span className="text-foreground font-medium"> seamless collaboration</span>.
          </p>
        </div>

        {/* Enhanced Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-32">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>

        {/* Enhanced Highlights Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-3xl blur-xl" />
          
          <div className="relative bg-card/90 backdrop-blur-lg rounded-3xl border border-border/30 p-10 lg:p-16 shadow-2xl">
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-6 tracking-tight">
                Why choose DigiClassroom?
              </h3>
              <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
                Built with modern technology, educational expertise, and a deep understanding of learning needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
              {highlights.map((highlight, index) => (
                <div 
                  key={highlight.title}
                  className="text-center group animate-scale-in hover:-translate-y-2 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl mb-6 group-hover:from-primary/30 group-hover:to-purple-500/30 transition-all duration-300 group-hover:scale-110">
                    <highlight.icon className="h-10 w-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {highlight.title}
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {highlight.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
