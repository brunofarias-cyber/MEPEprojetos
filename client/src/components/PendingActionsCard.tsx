import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Award, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "wouter";

interface PendingAction {
  projectsWithoutPlanning: number;
  projectsWithoutCompetencies: number;
  upcomingDeadlines: Array<{ projectId: string; title: string; deadline: string }>;
  upcomingEvents: Array<{ id: string; title: string; date: string; projectId: string | null }>;
}

interface PendingActionsCardProps {
  data: PendingAction;
}

export function PendingActionsCard({ data }: PendingActionsCardProps) {
  const totalPending = 
    data.projectsWithoutPlanning + 
    data.projectsWithoutCompetencies + 
    data.upcomingDeadlines.length + 
    data.upcomingEvents.length;

  if (totalPending === 0) {
    return (
      <Card className="mb-6 border-green-200 dark:border-green-900" data-testid="card-pending-actions">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">✓</span>
            Sua Rotina Hoje
          </CardTitle>
          <CardDescription>
            Parabéns! Você está em dia com todas as suas atividades.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="mb-6 bg-gradient-to-br from-purple-50/50 via-white to-blue-50/50 dark:from-purple-950/20 dark:via-background dark:to-blue-950/20 border-purple-200 dark:border-purple-900" data-testid="card-pending-actions">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Sua Rotina Hoje
        </CardTitle>
        <CardDescription>
          {totalPending} {totalPending === 1 ? 'ação pendente' : 'ações pendentes'} que precisam da sua atenção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.projectsWithoutPlanning > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-900/40 border border-purple-100 dark:border-purple-900/50" data-testid="action-projects-without-planning">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">Projetos sem Planejamento</h4>
                <Badge variant="secondary" data-testid="badge-count-without-planning">
                  {data.projectsWithoutPlanning}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {data.projectsWithoutPlanning} {data.projectsWithoutPlanning === 1 ? 'projeto precisa' : 'projetos precisam'} de um planejamento detalhado
              </p>
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8" data-testid="button-view-projects-without-planning">
                  Ver projetos
                </Button>
              </Link>
            </div>
          </div>
        )}

        {data.projectsWithoutCompetencies > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-900/40 border border-blue-100 dark:border-blue-900/50" data-testid="action-projects-without-competencies">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">Projetos sem Competências BNCC</h4>
                <Badge variant="secondary" data-testid="badge-count-without-competencies">
                  {data.projectsWithoutCompetencies}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {data.projectsWithoutCompetencies} {data.projectsWithoutCompetencies === 1 ? 'projeto precisa' : 'projetos precisam'} de competências BNCC vinculadas
              </p>
              <Link href="/">
                <Button variant="ghost" size="sm" className="h-8" data-testid="button-view-projects-without-competencies">
                  Ver projetos
                </Button>
              </Link>
            </div>
          </div>
        )}

        {data.upcomingDeadlines.length > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-900/40 border border-orange-100 dark:border-orange-900/50" data-testid="action-upcoming-deadlines">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">Prazos Próximos (7 dias)</h4>
                <Badge variant="secondary" data-testid="badge-count-upcoming-deadlines">
                  {data.upcomingDeadlines.length}
                </Badge>
              </div>
              <div className="space-y-2 mt-2">
                {data.upcomingDeadlines.slice(0, 3).map((deadline, index) => (
                  <div key={deadline.projectId} className="flex items-center justify-between text-sm" data-testid={`deadline-item-${index}`}>
                    <Link href={`/project/${deadline.projectId}`}>
                      <span className="font-medium hover:underline hover-elevate cursor-pointer" data-testid={`link-deadline-project-${index}`}>
                        {deadline.title}
                      </span>
                    </Link>
                    <span className="text-muted-foreground text-xs" data-testid={`text-deadline-date-${index}`}>
                      {format(new Date(deadline.deadline), "dd/MM", { locale: ptBR })}
                    </span>
                  </div>
                ))}
                {data.upcomingDeadlines.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{data.upcomingDeadlines.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {data.upcomingEvents.length > 0 && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-white/60 dark:bg-gray-900/40 border border-green-100 dark:border-green-900/50" data-testid="action-upcoming-events">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">Reuniões Próximas (3 dias)</h4>
                <Badge variant="secondary" data-testid="badge-count-upcoming-events">
                  {data.upcomingEvents.length}
                </Badge>
              </div>
              <div className="space-y-2 mt-2">
                {data.upcomingEvents.slice(0, 3).map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between text-sm" data-testid={`event-item-${index}`}>
                    <Link href="/calendar">
                      <span className="font-medium hover:underline hover-elevate cursor-pointer" data-testid={`link-event-${index}`}>
                        {event.title}
                      </span>
                    </Link>
                    <span className="text-muted-foreground text-xs" data-testid={`text-event-date-${index}`}>
                      {format(new Date(event.date), "dd/MM HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                ))}
                {data.upcomingEvents.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{data.upcomingEvents.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
