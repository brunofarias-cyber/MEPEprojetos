import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import LandingPage from "@/pages/landing";
import { AppSidebar } from "@/components/AppSidebar";

// Teacher views
import TeacherDashboard from "@/pages/teacher/dashboard";
import TeacherClasses from "@/pages/teacher/classes";
import TeacherReports from "@/pages/teacher/reports";
import TeacherRubrics from "@/pages/teacher/rubrics";

// Student views
import StudentHome from "@/pages/student/home";
import StudentProjects from "@/pages/student/projects";
import StudentCalendar from "@/pages/student/calendar";
import StudentAchievements from "@/pages/student/achievements";

// Coordinator views
import CoordinatorKanban from "@/pages/coordinator/kanban";
import CoordinatorTeachers from "@/pages/coordinator/teachers";
import CoordinatorMetrics from "@/pages/coordinator/metrics";

import type { ProjectWithTeacher, Teacher, Class, BnccCompetency, RubricCriteria, StudentAchievementWithDetails } from "@shared/schema";

type Role = 'teacher' | 'student' | 'coordinator' | null;

function AppContent() {
  const [role, setRole] = useState<Role>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Fetch data from APIs
  const { data: projects = [], isLoading: projectsLoading } = useQuery<ProjectWithTeacher[]>({
    queryKey: ['/api/projects'],
    enabled: !!role,
  });

  const { data: teachers = [], isLoading: teachersLoading } = useQuery<Teacher[]>({
    queryKey: ['/api/teachers'],
    enabled: !!role,
  });

  const { data: classes = [], isLoading: classesLoading } = useQuery<Class[]>({
    queryKey: ['/api/classes'],
    enabled: role === 'teacher',
  });

  const { data: competencies = [], isLoading: competenciesLoading } = useQuery<BnccCompetency[]>({
    queryKey: ['/api/competencies'],
    enabled: role === 'teacher',
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<StudentAchievementWithDetails[]>({
    queryKey: ['/api/students', 'student-1', 'achievements'],
    enabled: role === 'student', // Using mock student ID for demo
  });

  const handleEnter = (selectedRole: Role) => {
    setRole(selectedRole);
    if (selectedRole === 'teacher') setActiveTab('dashboard');
    else if (selectedRole === 'student') setActiveTab('student-home');
    else if (selectedRole === 'coordinator') setActiveTab('kanban');
  };

  const handleLogout = () => {
    setRole(null);
    setActiveTab('dashboard');
  };

  const renderContent = () => {
    if (!role) return null;

    const isLoading = projectsLoading || teachersLoading;

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </div>
      );
    }

    // Teacher views
    if (role === 'teacher') {
      if (activeTab === 'dashboard') return <TeacherDashboard projects={projects} teachers={teachers} />;
      if (activeTab === 'classes') return <TeacherClasses classes={classes} />;
      if (activeTab === 'reports') return <TeacherReports competencies={competencies} />;
      if (activeTab === 'rubrics') return <TeacherRubrics />;
    }

    // Student views
    if (role === 'student') {
      if (activeTab === 'student-home') return <StudentHome projects={projects} studentXp={2450} studentLevel={3} />;
      if (activeTab === 'projects') return <StudentProjects projects={projects} />;
      if (activeTab === 'calendar') return <StudentCalendar projects={projects} />;
      if (activeTab === 'achievements') return <StudentAchievements achievements={achievements} />;
    }

    // Coordinator views
    if (role === 'coordinator') {
      if (activeTab === 'kanban') return <CoordinatorKanban projects={projects} />;
      if (activeTab === 'teachers') return <CoordinatorTeachers teachers={teachers} />;
      if (activeTab === 'metrics') return <CoordinatorMetrics projects={projects} teachers={teachers} />;
    }

    return null;
  };

  // Show landing page if no role selected
  if (!role) {
    return <LandingPage onEnter={handleEnter} />;
  }

  // Custom sidebar width
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          role={role} 
          onLogout={handleLogout} 
        />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b md:hidden">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="text-xl font-bold">BProjetos</h1>
          </header>
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}
