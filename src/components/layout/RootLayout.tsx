import { Outlet } from "react-router-dom";
import LandingNavbar from "@/components/landing/LandingNavbar";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <Outlet />
    </div>
  );
};

export default RootLayout;
