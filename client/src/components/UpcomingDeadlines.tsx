import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/Icon";
import type { ProjectWithTeacher } from "@shared/schema";
import { format, parseISO, differenceInDays, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";

export function UpcomingDeadlines() {
    const { data: projects = [], isLoading } = useQuery<ProjectWithTeacher[]>({
        queryKey: ["/api/projects"],
    });

    // Filter projects with valid deadlines and sort by date
    const upcomingDeadlines = projects
        .filter((p) => p.nextDeadline && isFuture(parseISO(p.nextDeadline)))
        .sort((a, b) => {
            const dateA = parseISO(a.nextDeadline!);
            const dateB = parseISO(b.nextDeadline!);
            return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 5); // Show only next 5 deadlines

    const getUrgencyColor = (deadline: string) => {
        const days = differenceInDays(parseISO(deadline), new Date());
        if (days <= 2) return "red";
        if (days <= 7) return "yellow";
        return "green";
    };

    const getUrgencyIcon = (deadline: string) => {
        const days = differenceInDays(parseISO(deadline), new Date());
        if (days <= 2) return "alert-triangle";
        if (days <= 7) return "clock";
        return "calendar";
    };

    const getUrgencyBadge = (deadline: string) => {
        const days = differenceInDays(parseISO(deadline), new Date());
        if (days === 0) return <Badge variant="destructive">Hoje!</Badge>;
        if (days === 1) return <Badge variant="destructive">Amanhã</Badge>;
        if (days <= 2) return <Badge variant="destructive">{days} dias</Badge>;
        if (days <= 7) return <Badge className="bg-yellow-500  hover:bg-yellow-600">{days} dias</Badge>;
        return <Badge variant="outline">{days} dias</Badge>;
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icon name="calendar" size={20} />
                        Próximos Prazos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-muted-foreground text-sm">
                        Carregando...
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon name="calendar" size={20} />
                    Próximos Prazos
                </CardTitle>
                <CardDescription>
                    Fique atento às entregas importantes
                </CardDescription>
            </CardHeader>
            <CardContent>
                {upcomingDeadlines.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Icon name="check-circle" size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium">Nenhum prazo próximo</p>
                        <p className="text-xs mt-1">Você está em dia com as entregas!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcomingDeadlines.map((project) => {
                            const deadline = parseISO(project.nextDeadline!);
                            const urgencyColor = getUrgencyColor(project.nextDeadline!);
                            const urgencyIcon = getUrgencyIcon(project.nextDeadline!);

                            return (
                                <div
                                    key={project.id}
                                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    <div
                                        className={`mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center ${urgencyColor === "red"
                                                ? "bg-red-100 text-red-600"
                                                : urgencyColor === "yellow"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-green-100 text-green-600"
                                            }`}
                                    >
                                        <Icon name={urgencyIcon as any} size={20} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className="font-semibold text-sm truncate">
                                                {project.title}
                                            </h4>
                                            {getUrgencyBadge(project.nextDeadline!)}
                                        </div>

                                        <p className="text-xs text-muted-foreground truncate mb-1">
                                            {project.deadlineLabel || "Entrega do projeto"}
                                        </p>

                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Icon name="calendar" size={12} />
                                            {format(deadline, "dd 'de' MMMM", { locale: ptBR })}
                                            <span className="text-muted-foreground/60">•</span>
                                            <Icon name="user" size={12} />
                                            {project.teacherName || "Professor"}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
