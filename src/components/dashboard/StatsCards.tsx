import { TrendingUp, TrendingDown, Clock, Target } from "lucide-react";

const StatsCards = () => {
  const stats = [
    {
      title: "Attendance",
      value: "89.5%",
      change: "+2.1%",
      trend: "up",
      icon: Clock,
      color: "success"
    },
    {
      title: "Overall Grade",
      value: "85.2%",
      change: "+5.3%",
      trend: "up", 
      icon: Target,
      color: "primary"
    },
    {
      title: "Pending Assignments",
      value: "4",
      change: "-2",
      trend: "down",
      icon: TrendingDown,
      color: "warning"
    },
    {
      title: "Completed Tests",
      value: "12/15",
      change: "+3",
      trend: "up",
      icon: TrendingUp,
      color: "success"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isPositive = stat.trend === "up";
        
        return (
          <div key={index} className="card-academic p-6 hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                stat.color === 'success' ? 'bg-success-light' :
                stat.color === 'warning' ? 'bg-warning-light' :
                stat.color === 'primary' ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <Icon className={`h-6 w-6 ${
                  stat.color === 'success' ? 'text-success' :
                  stat.color === 'warning' ? 'text-warning' :
                  stat.color === 'primary' ? 'text-primary' : 'text-muted-foreground'
                }`} />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                isPositive ? 'text-success' : 'text-destructive'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                from last month
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;