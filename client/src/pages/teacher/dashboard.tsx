import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { ProjectCard } from "@/components/ProjectCard";
import { CreateProjectModal } from "@/components/CreateProjectModal";
import { PendingActionsCard } from "@/components/PendingActionsCard";
import { useAuth } from "@/contexts/AuthContext";
import type { ProjectWithTeacher } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PendingAction {
  projectsWithoutPlanning: number;
  projectsWithoutCompetencies: number;
  upcomingDeadlines: Array<{ projectId: string; title: string; deadline: string }>;
  upcomingEvents: Array<{ id: string; title: string; date: string; projectId: string | null }>;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialFilter = searchParams.get('filter');
  const [statusFilter, setStatusFilter] = useState<string | null>(initialFilter);

  // Update URL when filter changes
  const handleFilterChange = (filter: string | null) => {
    setStatusFilter(filter);
    if (filter) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('filter', filter);
      window.history.pushState({}, '', newUrl.toString());
    } else {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('filter');
      window.history.pushState({}, '', newUrl.toString());
    }
  };

  const { data: projects = [], isLoading } = useQuery<ProjectWithTeacher[]>({
    queryKey: ['/api/projects'],
  });

  const { data: pendingActions, isLoading: pendingActionsLoading } = useQuery<PendingAction>({
    queryKey: ['/api/teachers/me/pending-actions'],
    enabled: user?.role === 'teacher',
  });

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

  const stats = [
    {
      label: "Projetos Ativos",
      value: projects.filter(p => p.status === "Em Andamento").length,
      icon: "book",
      color: "text-blue-600 bg-blue-50 border-blue-200",
      filter: "Em Andamento"
    },
    {
      label: "Alunos Engajados",
      value: projects.reduce((sum, p) => sum + p.students, 0),
      icon: "users",
      color: "text-green-600 bg-green-50 border-green-200",
      filter: null // Não filtra por status
    },
    {
      label: "Entregas Pendentes",
      value: projects.filter(p => p.status === "Para Avaliação").length,
      icon: "clock",
      color: "text-purple-600 bg-purple-50 border-purple-200",
      filter: "Para Avaliação"
    },
    {
      label: "Projetos Atrasados",
      value: projects.filter(p => p.delayed).length,
      icon: "alert-triangle",
      color: "text-red-600 bg-red-50 border-red-200",
      filter: "Atrasado" // Filtro especial
    },
  ];

  // Dados para o gráfico
  const chartData = projects.map(p => ({
    name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
    progresso: p.progress,
    status: p.status
  }));

  const filteredProjects = statusFilter
    ? (statusFilter === "Atrasado"
      ? projects.filter(p => p.delayed)
      : projects.filter(p => p.status === statusFilter))
    : projects;

  return (
    <div className="animate-fade-in space-y-8 pb-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-dashboard">Visão Geral</h2>
        <p className="text-muted-foreground">Acompanhe o progresso dos seus projetos em tempo real.</p>
      </div>

      {/* Pending Actions Card */}
      {!pendingActionsLoading && pendingActions && (
        <PendingActionsCard data={pendingActions} />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-card border p-6 rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md ${statusFilter === stat.filter && stat.filter !== null ? 'ring-2 ring-primary border-primary' : 'border-card-border'
              }`}
            onClick={() => stat.filter !== undefined && handleFilterChange(statusFilter === stat.filter ? null : stat.filter)}
            data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground" data-testid={`text-stat-value-${idx}`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center border`}>
                <Icon name={stat.icon} size={24} />
              </div>
            </div>
            {stat.filter && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/50"></span>
                Clique para filtrar
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold text-foreground">
                {statusFilter ? `Projetos: ${statusFilter}` : 'Todos os Projetos'}
              </h3>
              {statusFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFilterChange(null)}
                  className="h-8 px-2 text-muted-foreground"
                >
                  Limpar filtro <Icon name="x" size={14} className="ml-1" />
                </Button>
              )}
            </div>
            <CreateProjectModal />
          </div>

          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
              <Icon name="search" size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground font-medium">Nenhum projeto encontrado com este filtro.</p>
              <Button variant="ghost" onClick={() => handleFilterChange(null)}>Ver todos os projetos</Button>
            </div>
          )}
        </div>

        {/* Activity Chart */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Progresso dos Projetos</CardTitle>
              <CardDescription>Visão geral do andamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'transparent' }}
                    />
                    <Bar dataKey="progresso" radius={[0, 4, 4, 0]} barSize={20}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.progresso === 100 ? '#22c55e' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 space-y-4">
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Atividades Recentes</h4>
                <div className="space-y-3">
                  {/* Mock de atividades recentes - Futuramente virá do backend */}
                  <div className="flex gap-3 items-start text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Novo projeto criado</p>
                      <p className="text-xs text-muted-foreground">Há 2 horas • Feira de Ciências</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">3 alunos entregaram atividades</p>
                      <p className="text-xs text-muted-foreground">Há 5 horas • Robótica</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start text-sm">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-foreground">Prazo de entrega próximo</p>
                      <p className="text-xs text-muted-foreground">Amanhã • Horta Comunitária</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
