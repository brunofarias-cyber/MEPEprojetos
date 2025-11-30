import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface StudentWithStatus {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    xp: number;
    level: number;
    hasSubmission: boolean;
    submissionDate: string | null;
    grade: number | null;
    status: 'Pending' | 'Submitted' | 'Graded';
}

interface StudentsTabProps {
    projectId: string;
}

export function StudentsTab({ projectId }: StudentsTabProps) {
    const { data: students = [], isLoading } = useQuery<StudentWithStatus[]>({
        queryKey: [`/api/projects/${projectId}/students`],
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const getStatusBadge = (status: string, grade: number | null) => {
        switch (status) {
            case 'Graded':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">Nota: {grade}</Badge>;
            case 'Submitted':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200">Enviado</Badge>;
            default:
                return <Badge variant="outline" className="text-muted-foreground">Pendente</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Alunos do Projeto</CardTitle>
                <CardDescription>Acompanhe o progresso e entregas dos alunos</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {students.map((student) => (
                        <div
                            key={student.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={student.avatar || undefined} />
                                    <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-semibold text-foreground">{student.name}</h4>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground mb-1">Status da Entrega</p>
                                    {getStatusBadge(student.status, student.grade)}
                                </div>

                                <div className="text-right min-w-[80px]">
                                    <p className="text-xs text-muted-foreground mb-1">Nível</p>
                                    <div className="flex items-center justify-end gap-1 font-medium">
                                        <Icon name="award" size={14} className="text-yellow-500" />
                                        {student.level}
                                    </div>
                                </div>

                                <Button variant="ghost" size="icon">
                                    <Icon name="more-vertical" size={18} />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {students.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Icon name="users" size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Nenhum aluno encontrado.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
