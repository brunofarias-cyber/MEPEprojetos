import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icon } from "@/components/Icon";
import type { Class } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AttendanceStatistics {
    totalDays: number;
    present: number;
    absent: number;
    late: number;
    presencePercentage: number;
}

interface StudentStats {
    studentId: string;
    studentName: string;
    avatar: string | null;
    statistics: AttendanceStatistics;
}

interface AttendanceReport {
    classId: string;
    className: string;
    period: {
        start: string | null;
        end: string | null;
    };
    students: StudentStats[];
}

export default function AttendanceReport() {
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // Fetch classes
    const { data: classes = [] } = useQuery<Class[]>({
        queryKey: ["/api/classes"],
    });

    // Fetch report when class is selected
    const { data: report, isLoading, refetch } = useQuery<AttendanceReport>({
        queryKey: ["/api/attendance/report", selectedClassId, startDate, endDate],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            const queryString = params.toString();
            const url = `/api/attendance/report/${selectedClassId}${queryString ? `?${queryString}` : ""}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error("Failed to fetch report");
            return response.json();
        },
        enabled: !!selectedClassId,
    });

    const getPresenceBadge = (percentage: number) => {
        if (percentage >= 90) {
            return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{percentage.toFixed(1)}%</Badge>;
        } else if (percentage >= 75) {
            return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{percentage.toFixed(1)}%</Badge>;
        } else {
            return <Badge variant="destructive">{percentage.toFixed(1)}%</Badge>;
        }
    };

    const generateReport = () => {
        refetch();
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Relatório de Presença</h1>
                <p className="text-muted-foreground">
                    Visualize estatísticas compiladas de presença por estudante
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                    <CardDescription>Selecione a turma e período para gerar o relatório</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Turma</label>
                            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma turma" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Data Início (opcional)</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Data Fim (opcional)</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>

                        <div className="flex items-end">
                            <Button
                                onClick={generateReport}
                                disabled={!selectedClassId || isLoading}
                                className="w-full"
                            >
                                <Icon name="bar-chart" size={16} className="mr-2" />
                                Gerar Relatório
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Report Results */}
            {isLoading && (
                <div className="text-center py-12 text-muted-foreground">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    Carregando relatório...
                </div>
            )}

            {report && !isLoading && (
                <>
                    {/* Summary Card */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Turma</p>
                                    <p className="text-2xl font-bold">{report.className}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Período</p>
                                    <p className="text-lg font-semibold">
                                        {report.period.start && report.period.end
                                            ? `${format(new Date(report.period.start), "dd/MM/yyyy", { locale: ptBR })} - ${format(new Date(report.period.end), "dd/MM/yyyy", { locale: ptBR })}`
                                            : "Todos os registros"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total de Aulas</p>
                                    <p className="text-2xl font-bold">
                                        {report.students[0]?.statistics.totalDays || 0}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Students Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Estatísticas por Estudante</CardTitle>
                            <CardDescription>
                                P = Presente | F = Falta | A = Atraso
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {report.students.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Icon name="inbox" size={48} className="mx-auto mb-3 opacity-30" />
                                    <p>Nenhum registro de presença encontrado para esta turma.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-left text-sm text-muted-foreground">
                                                <th className="pb-3 font-medium">Estudante</th>
                                                <th className="pb-3 text-center font-medium">P</th>
                                                <th className="pb-3 text-center font-medium">F</th>
                                                <th className="pb-3 text-center font-medium">A</th>
                                                <th className="pb-3 text-center font-medium">Presença %</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.students.map((student) => (
                                                <tr
                                                    key={student.studentId}
                                                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                                                >
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="w-10 h-10">
                                                                <AvatarImage src={student.avatar || undefined} />
                                                                <AvatarFallback>
                                                                    {student.studentName.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-medium">{student.studentName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge variant="outline" className="bg-green-50">
                                                            {student.statistics.present}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge variant="outline" className="bg-red-50">
                                                            {student.statistics.absent}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge variant="outline" className="bg-yellow-50">
                                                            {student.statistics.late}
                                                        </Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        {getPresenceBadge(student.statistics.presencePercentage)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {!selectedClassId && !isLoading && (
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                            <Icon name="file-bar-chart" size={64} className="mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium mb-2">Selecione uma turma para começar</p>
                            <p className="text-sm">
                                Escolha uma turma acima e clique em "Gerar Relatório" para visualizar as estatísticas
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
