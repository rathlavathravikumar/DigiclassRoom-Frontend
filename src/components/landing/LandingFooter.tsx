import { BookOpen, Mail, Phone, MapPin, Github, Twitter, Linkedin, Heart, Star } from "lucide-react";
import { educationalImages, getResponsiveImageUrls } from "../../lib/images";

const LandingFooter = () => {
  const footerImage = getResponsiveImageUrls(educationalImages.backgrounds.library);
  
  return (
    <footer className="relative bg-gradient-to-br from-muted/20 via-background to-muted/10 border-t border-border/30">
      {/* Enhanced Background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <img
          src={footerImage.desktop}
          alt="Educational background"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      
      <div className="relative">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-20 lg:py-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Enhanced Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-4 mb-8">
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary via-purple-600 to-primary p-4 rounded-3xl shadow-xl">
                    <BookOpen className="h-10 w-10 text-primary-foreground" strokeWidth={2} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold text-foreground">DigiClassroom</h3>
                  <p className="text-sm text-muted-foreground font-medium">The future of learning</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-8 leading-relaxed text-base">
                Empowering educators and students worldwide with cutting-edge tools for 
                <span className="text-foreground font-medium"> collaborative learning</span>, 
                <span className="text-foreground font-medium"> comprehensive assessment</span>, and 
                <span className="text-foreground font-medium"> academic excellence</span>.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-3">
                {[
                  { icon: Github, href: "#", label: "GitHub" },
                  { icon: Twitter, href: "#", label: "Twitter" },
                  { icon: Linkedin, href: "#", label: "LinkedIn" }
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="p-2 bg-muted/50 hover:bg-primary/10 rounded-lg transition-colors duration-300 group"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-6">Platform</h4>
              <ul className="space-y-3">
                {[
                  "Courses & Content",
                  "Assignments & Tests",
                  "Discussion Forums",
                  "Attendance Tracking",
                  "Grade Management",
                  "Real-time Notifications"
                ].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-6">Support</h4>
              <ul className="space-y-3">
                {[
                  "Help Center",
                  "Documentation",
                  "API Reference",
                  "Community Forum",
                  "Contact Support",
                  "System Status"
                ].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-6">Get in Touch</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">digitalclassroom@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Phone className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Phone</p>
                    <p className="text-sm text-muted-foreground">+91 8896666666</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <MapPin className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Address</p>
                    <p className="text-sm text-muted-foreground">RGUKT, Education St,Learning City</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 bg-muted/20">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>© {new Date().getFullYear()} Digital Classroom Platform</span>
                <span className="hidden md:inline">•</span>
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Made with</span>
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                <span>for education</span>
                <div className="flex items-center ml-4">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="ml-1 font-medium">4.9/5 rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
