import { ProjectCard } from "@/components/ProjectCard";
import React, { useEffect } from 'react';
import type { ProjectWithTeacher } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { queryClient, getQueryFn, parseApiError } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function StudentProjects() {
  const { toast } = useToast();
  const { data: projects, isLoading, isError } = useQuery<ProjectWithTeacher[]>({ queryKey: ["/api/projects"] });

  useEffect(() => {
    if (isError) {
      const parsed = parseApiError((isError as unknown) as Error);
      toast({
        title: "Erro ao carregar projetos",
        description: parsed.message,
        variant: "destructive",
      });
    }
  }, [isError, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-bold">Erro ao carregar projetos</h3>
        <p className="text-muted-foreground">Tente recarregar a página ou contate o administrador.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-projects">Todos os Projetos</h2>
        <p className="text-muted-foreground">Visualize todos os seus projetos e prazos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(projects || []).map((project) => (
          <ProjectCard key={project.id} project={project} showSubmitButton />
        ))}
      </div>
    </div>
  );
}
