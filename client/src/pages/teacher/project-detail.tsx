import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Icon } from "@/components/Icon";
import type { ProjectWithTeacher, RubricCriteria, ProjectPlanning, BnccCompetency, ProjectCompetency } from "@shared/schema";
import { ArrowLeft, Sparkles, Check, X, Loader2 } from "lucide-react";

const planningFormSchema = z.object({
  objectives: z.string().optional(),
  methodology: z.string().optional(),
  resources: z.string().optional(),
  timeline: z.string().optional(),
  expectedOutcomes: z.string().optional(),
});

type AiSuggestion = {
  competency: BnccCompetency;
  coverage: number;
  justification: string;
  selected: boolean;
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);

  const { data: project, isLoading: projectLoading } = useQuery<ProjectWithTeacher>({
    queryKey: ['/api/projects', id],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return response.json();
    },
    enabled: !!id,
  });

  const { data: rubrics = [] } = useQuery<RubricCriteria[]>({
    queryKey: [`/api/rubrics/${id}`],
    enabled: !!id,
  });

  const { data: planning } = useQuery<ProjectPlanning>({
    queryKey: [`/api/projects/${id}/planning`],
    enabled: !!id,
  });

  const { data: projectCompetencies = [] } = useQuery<(ProjectCompetency & { competency: BnccCompetency })[]>({
    queryKey: [`/api/projects/${id}/competencies`],
    enabled: !!id,
  });

  const form = useForm<z.infer<typeof planningFormSchema>>({
    resolver: zodResolver(planningFormSchema),
    defaultValues: {
      objectives: "",
      methodology: "",
      resources: "",
      timeline: "",
      expectedOutcomes: "",
    },
  });

  // Update form when planning data loads
  useEffect(() => {
    if (planning) {
      form.reset({
        objectives: planning.objectives || "",
        methodology: planning.methodology || "",
        resources: planning.resources || "",
        timeline: planning.timeline || "",
        expectedOutcomes: planning.expectedOutcomes || "",
      });
    }
  }, [planning, form]);

  const savePlanningMutation = useMutation({
    mutationFn: async (data: z.infer<typeof planningFormSchema>) => {
      if (!id) throw new Error('Project ID is required');
      // Check if planning exists by verifying if it has an id property
      const planningExists = planning && 'id' in planning && planning.id;
      const method = planningExists ? 'PATCH' : 'POST';
      const payload = planningExists ? data : { ...data, projectId: id };
      return apiRequest(`/api/projects/${id}/planning`, {
        method,
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/planning`] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Planejamento salvo!",
        description: "O planejamento do projeto foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o planejamento.",
        variant: "destructive",
      });
    },
  });

  const onSubmitPlanning = (data: z.infer<typeof planningFormSchema>) => {
    savePlanningMutation.mutate(data);
  };

  const analyzeWithAiMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Project ID is required');
      return apiRequest(`/api/projects/${id}/planning/analyze`, {
        method: 'POST',
      });
    },
    onSuccess: (data: any) => {
      const suggestions: AiSuggestion[] = data.suggestions.map((s: any) => ({
        competency: s.competency,
        coverage: s.coverage,
        justification: s.justification,
        selected: true,
      }));
      setAiSuggestions(suggestions);
      setShowAiModal(true);
    },
    onError: (error: any) => {
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar o planejamento.",
        variant: "destructive",
      });
    },
  });

  const saveCompetenciesMutation = useMutation({
    mutationFn: async (competencies: { competencyId: string; coverage: number }[]) => {
      if (!id) throw new Error('Project ID is required');
      return apiRequest(`/api/projects/${id}/competencies`, {
        method: 'POST',
        body: { competencies },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/competencies`] });
      setShowAiModal(false);
      setAiSuggestions([]);
      toast({
        title: "Competências vinculadas!",
        description: "As competências BNCC foram vinculadas ao projeto com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as competências.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyzeClick = () => {
    if (!planning) {
      toast({
        title: "Planejamento não encontrado",
        description: "Salve o planejamento antes de analisar com IA.",
        variant: "destructive",
      });
      return;
    }
    analyzeWithAiMutation.mutate();
  };

  const toggleSuggestion = (index: number) => {
    setAiSuggestions(prev => 
      prev.map((s, i) => i === index ? { ...s, selected: !s.selected } : s)
    );
  };

  const handleSaveCompetencies = () => {
    const selected = aiSuggestions
      .filter(s => s.selected)
      .map(s => ({
        competencyId: s.competency.id,
        coverage: s.coverage,
      }));
    
    if (selected.length === 0) {
      toast({
        title: "Nenhuma competência selecionada",
        description: "Selecione pelo menos uma competência para vincular ao projeto.",
        variant: "destructive",
      });
      return;
    }
    
    saveCompetenciesMutation.mutate(selected);
  };

  if (projectLoading || !project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planejamento": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Em Andamento": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Para Avaliação": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "Concluído": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const stages = [
    { name: "Pesquisa", description: "Investigação e coleta de informações", completed: project.progress >= 25 },
    { name: "Prototipagem", description: "Desenvolvimento de protótipos e ideias", completed: project.progress >= 50 },
    { name: "Implementação", description: "Execução do projeto", completed: project.progress >= 75 },
    { name: "Apresentação", description: "Entrega e demonstração final", completed: project.progress >= 100 },
  ];

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground" data-testid="heading-project-title">{project.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={getStatusColor(project.status)} data-testid="badge-status">
              {project.status}
            </Badge>
            <span className="text-sm text-muted-foreground" data-testid="text-subject">
              {project.subject}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3" data-testid="tabs-list">
          <TabsTrigger value="overview" data-testid="tab-overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="planning" data-testid="tab-planning">Planejamento</TabsTrigger>
          <TabsTrigger value="rubrics" data-testid="tab-rubrics">Avaliação</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6" data-testid="content-overview">
          <Card>
            <CardHeader>
              <CardTitle>Progresso do Projeto</CardTitle>
              <CardDescription>Acompanhe o andamento do projeto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progresso Geral</span>
                  <span className="text-sm font-bold text-primary" data-testid="text-progress">{project.progress}%</span>
                </div>
                <div className="w-full bg-muted h-3 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                    data-testid="progress-bar"
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Próximo Prazo</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1" data-testid="text-deadline">
                    <Icon name="calendar" size={14} />
                    {project.nextDeadline ? new Date(project.nextDeadline).toLocaleDateString('pt-BR') : 'Não definido'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Alunos Participantes</p>
                  <p className="text-sm font-semibold text-foreground flex items-center gap-1" data-testid="text-students">
                    <Icon name="users" size={14} />
                    {project.students}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Etapas do Projeto</CardTitle>
              <CardDescription>Marcos importantes do desenvolvimento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stages.map((stage, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-3 p-4 rounded-lg border ${
                      stage.completed 
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
                        : "bg-muted/50 border-border"
                    }`}
                    data-testid={`stage-${idx}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      stage.completed 
                        ? "bg-green-500 text-white" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {stage.completed ? (
                        <Icon name="check" size={18} />
                      ) : (
                        <span className="text-sm font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{stage.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planning Tab */}
        <TabsContent value="planning" className="space-y-6" data-testid="content-planning">
          <Card>
            <CardHeader>
              <CardTitle>Planejamento do Projeto</CardTitle>
              <CardDescription>
                Defina os objetivos, metodologia e recursos necessários para o projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitPlanning)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="objectives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Objetivos do Projeto</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva os objetivos de aprendizagem e metas do projeto..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-objectives"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="methodology"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Metodologia</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Explique como o projeto será desenvolvido (métodos, abordagens, etapas)..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-methodology"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resources"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recursos Necessários</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Liste materiais, ferramentas, tecnologias e outros recursos..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-resources"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cronograma</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Defina o cronograma com marcos e prazos principais..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-timeline"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expectedOutcomes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resultados Esperados</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva os resultados e entregas esperados ao final do projeto..."
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-expected-outcomes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAnalyzeClick}
                      disabled={!(planning && 'id' in planning && planning.id) || analyzeWithAiMutation.isPending || savePlanningMutation.isPending}
                      data-testid="button-analyze-ai"
                    >
                      {analyzeWithAiMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analisar com IA
                        </>
                      )}
                    </Button>
                    <Button
                      type="submit"
                      disabled={savePlanningMutation.isPending || !form.formState.isDirty}
                      data-testid="button-save-planning"
                    >
                      {savePlanningMutation.isPending ? "Salvando..." : "Salvar Planejamento"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {projectCompetencies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Competências BNCC Vinculadas</CardTitle>
                <CardDescription>
                  Competências da Base Nacional Comum Curricular vinculadas a este projeto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projectCompetencies.map((pc) => (
                    <div 
                      key={pc.id}
                      className="p-4 border border-border rounded-lg bg-muted/30"
                      data-testid={`competency-${pc.id}`}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-foreground">{pc.competency.name}</h4>
                            <Badge variant="outline" data-testid={`badge-category-${pc.id}`}>
                              {pc.competency.category}
                            </Badge>
                          </div>
                          {pc.competency.description && (
                            <p className="text-sm text-muted-foreground">{pc.competency.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Cobertura</div>
                          <div className="text-lg font-bold text-primary" data-testid={`text-coverage-${pc.id}`}>
                            {pc.coverage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Rubrics Tab */}
        <TabsContent value="rubrics" className="space-y-6" data-testid="content-rubrics">
          <Card>
            <CardHeader>
              <CardTitle>Critérios de Avaliação</CardTitle>
              <CardDescription>
                Critérios e pesos para avaliar o desempenho dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rubrics.length > 0 ? (
                <div className="space-y-2">
                  {rubrics.map((rubric) => (
                    <div 
                      key={rubric.id} 
                      className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border border-border"
                      data-testid={`rubric-${rubric.id}`}
                    >
                      <span className="text-sm font-medium text-foreground">{rubric.criteria}</span>
                      <Badge variant="outline" data-testid={`badge-weight-${rubric.id}`}>{rubric.weight}%</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground" data-testid="text-no-rubrics">
                  <Icon name="clipboard" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhum critério de avaliação definido ainda.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Analysis Modal */}
      <Dialog open={showAiModal} onOpenChange={setShowAiModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" data-testid="modal-ai-analysis">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Sugestões de Competências BNCC
            </DialogTitle>
            <DialogDescription>
              A IA analisou o planejamento do projeto e sugeriu as seguintes competências. 
              Selecione as que deseja vincular ao projeto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {aiSuggestions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma sugestão disponível.</p>
              </div>
            ) : (
              aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg transition-all ${
                    suggestion.selected
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/20'
                  }`}
                  data-testid={`suggestion-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleSuggestion(index)}
                      className={`mt-1 flex-shrink-0 ${
                        suggestion.selected
                          ? 'text-primary hover:text-primary'
                          : 'text-muted-foreground'
                      }`}
                      data-testid={`button-toggle-${index}`}
                    >
                      {suggestion.selected ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </Button>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">
                          {suggestion.competency.name}
                        </h4>
                        <Badge variant="outline" data-testid={`badge-category-${index}`}>
                          {suggestion.competency.category}
                        </Badge>
                        <Badge className="ml-auto" data-testid={`badge-coverage-${index}`}>
                          {suggestion.coverage}% cobertura
                        </Badge>
                      </div>
                      
                      {suggestion.competency.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {suggestion.competency.description}
                        </p>
                      )}
                      
                      <div className="mt-3 p-3 bg-background rounded-md border border-border">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Justificativa da IA:
                        </p>
                        <p className="text-sm text-foreground">
                          {suggestion.justification}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAiModal(false)}
              disabled={saveCompetenciesMutation.isPending}
              data-testid="button-cancel-ai"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSaveCompetencies}
              disabled={saveCompetenciesMutation.isPending || aiSuggestions.filter(s => s.selected).length === 0}
              data-testid="button-save-competencies"
            >
              {saveCompetenciesMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                `Vincular ${aiSuggestions.filter(s => s.selected).length} Competência${aiSuggestions.filter(s => s.selected).length !== 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
