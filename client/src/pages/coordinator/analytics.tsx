import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Users, BookOpen, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function CoordinatorAnalytics() {
    // Fetch Overview Data
    const { data: overview, isLoading: isLoadingOverview } = useQuery({
        queryKey: ["analytics-overview"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/analytics/overview");
            return res.json();
        },
    });

    // Fetch Engagement Data
    const { data: engagement, isLoading: isLoadingEngagement } = useQuery({
        queryKey: ["analytics-engagement"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/analytics/engagement");
            return res.json();
        },
    });

    // Fetch BNCC Data
    const { data: bncc, isLoading: isLoadingBncc } = useQuery({
        queryKey: ["analytics-bncc"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/analytics/bncc");
            return res.json();
        },
    });

    // Fetch At Risk Students
    const { data: atRisk, isLoading: isLoadingAtRisk } = useQuery({
        queryKey: ["analytics-at-risk"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/analytics/at-risk-students");
            return res.json();
        },
    });

    const isLoading = isLoadingOverview || isLoadingEngagement || isLoadingBncc || isLoadingAtRisk;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
                <p className="text-muted-foreground">
                    Visão geral do desempenho escolar, engajamento e áreas de atenção.
                </p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview?.totalStudents || 0}</div>
                        <p className="text-xs text-muted-foreground">Matriculados ativos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview?.totalActiveProjects || 0}</div>
                        <p className="text-xs text-muted-foreground">Em andamento</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview?.averageSubmissionRate || 0}%</div>
                        <p className="text-xs text-muted-foreground">Média global</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nota Média</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overview?.averageSatisfaction || 0}</div>
                        <p className="text-xs text-muted-foreground">Desempenho geral (0-100)</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Engagement Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Engajamento por Turma</CardTitle>
                        <CardDescription>Comparativo de taxa de entrega e presença.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={engagement}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="className" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="submissionRate" name="Taxa de Entrega (%)" fill="#8884d8" />
                                <Bar dataKey="attendanceRate" name="Presença (%)" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* BNCC Chart */}
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Competências BNCC Mais Trabalhadas</CardTitle>
                        <CardDescription>Top 5 competências em projetos.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bncc?.slice(0, 5)}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="usageCount"
                                    nameKey="competencyName"
                                >
                                    {bncc?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* At Risk Students Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Alunos em Risco
                    </CardTitle>
                    <CardDescription>
                        Alunos com baixo engajamento, muitas faltas ou poucas entregas.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Turma</TableHead>
                                <TableHead>XP</TableHead>
                                <TableHead>Faltas</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {atRisk?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Nenhum aluno identificado em risco no momento.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                atRisk?.map((student: any) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.className}</TableCell>
                                        <TableCell>{student.xp}</TableCell>
                                        <TableCell>{student.absences}</TableCell>
                                        <TableCell>
                                            <Badge variant="destructive">Atenção Necessária</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
