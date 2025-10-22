import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import RoleBasedLayout from "@/components/layout/RoleBasedLayout";
import NotFound from "./pages/NotFound";
import Home from "@/pages/Home";
import LoginForm from "@/components/auth/LoginForm";
import RootLayout from "@/components/layout/RootLayout";
import SignupForm from "@/components/auth/SignupForm";
import CourseDetailPageWrapper from "@/pages/CourseDetailPage";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<LoginForm />} />
              <Route path="signup" element={<SignupForm />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="app" element={<RoleBasedLayout />} />
              <Route path="courses/:courseId" element={<CourseDetailPageWrapper />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
