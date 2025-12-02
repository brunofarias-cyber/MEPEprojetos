import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/AppSidebar";

// Auth pages
import Login from "@/pages/login";
import Register from "@/pages/register";

// Teacher views
import TeacherDashboard from "@/pages/teacher/dashboard";
import TeacherProjectDetail from "@/pages/teacher/project-detail";
import TeacherClasses from "@/pages/teacher/classes";
import TeacherReports from "@/pages/teacher/reports";
import TeacherRubrics from "@/pages/teacher/rubrics";
import TeacherBncc from "@/pages/teacher/bncc";
import TeacherFeedback from "@/pages/teacher/feedbacks";
import TeacherCalendar from "@/pages/teacher/calendar";
import TeacherAttendance from "@/pages/teacher/attendance";
import TeacherAttendanceReport from "@/pages/teacher/attendance-report";

// Student views
import StudentHome from "@/pages/student/home";
import StudentProjects from "@/pages/student/projects";
import StudentCalendar from "@/pages/student/calendar";
import StudentAchievements from "@/pages/student/achievements";

// Coordinator views
import CoordinatorKanban from "@/pages/coordinator/kanban";
import CoordinatorTeachers from "@/pages/coordinator/teachers";
import CoordinatorStudents from "@/pages/coordinator/students";
import CoordinatorMetrics from "@/pages/coordinator/metrics";
import CoordinatorBncc from "@/pages/coordinator/bncc";
import CoordinatorCalendar from "@/pages/coordinator/calendar";

function ProtectedRoutes() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  // Custom sidebar width
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar role={user.role} onLogout={logout} userName={user.name} userAvatar={user.avatar} />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b md:hidden">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="text-xl font-bold">BProjetos</h1>
          </header>
          <main className="flex-1 overflow-auto p-8 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
            <div className="max-w-7xl mx-auto">
              <Switch>
                {/* Teacher Routes */}
                {user.role === 'teacher' && (
                  <>
                    <Route path="/" component={TeacherDashboard} />
                    <Route path="/teacher/dashboard" component={TeacherDashboard} />
                    <Route path="/project/:id" component={TeacherProjectDetail} />
                    <Route path="/classes" component={TeacherClasses} />
                    <Route path="/reports" component={() => <TeacherReports />} />
                    <Route path="/rubrics" component={TeacherRubrics} />
                    <Route path="/bncc" component={TeacherBncc} />
                    <Route path="/feedbacks" component={TeacherFeedback} />
                    <Route path="/calendar" component={TeacherCalendar} />
                    <Route path="/attendance" component={TeacherAttendance} />
                    <Route path="/attendance-report" component={TeacherAttendanceReport} />
                  </>
                )}

                {/* Student Routes */}
                {user.role === 'student' && (
                  <>
                    <Route path="/" component={StudentHome} />
                    <Route path="/projects" component={() => <StudentProjects />} />
                    <Route path="/calendar" component={StudentCalendar} />
                    <Route path="/achievements" component={() => <StudentAchievements />} />
                  </>
                )}

                {/* Coordinator Routes */}
                {user.role === 'coordinator' && (
                  <>
                    <Route path="/" component={CoordinatorKanban} />
                    <Route path="/teachers" component={CoordinatorTeachers} />
                    <Route path="/students" component={CoordinatorStudents} />
                    <Route path="/metrics" component={CoordinatorMetrics} />
                    <Route path="/calendar" component={CoordinatorCalendar} />
                    <Route path="/bncc" component={CoordinatorBncc} />
                  </>
                )}

                <Route>
                  <Redirect to="/" />
                </Route>
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route component={ProtectedRoutes} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Router />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
