import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X, Clock, Calendar as CalendarIcon, Save } from "lucide-react";
import type { Class, Student, Attendance } from "@shared/schema";

import { useAuth } from "@/contexts/AuthContext";

export default function TeacherAttendance() {
    const { toast } = useToast();
    const { user } = useAuth();
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
    const [attendanceData, setAttendanceData] = useState<Record<string, string>>({});

    const teacherId = user?.roleData?.id;

    // Fetch classes - only for this teacher
    const { data: classes = [] } = useQuery<Class[]>({
        queryKey: ["/api/teachers", teacherId, "classes"],
        enabled: !!teacherId,
    });

    // Fetch students for the selected class
    const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
        queryKey: [`/api/classes/${selectedClassId}/students`],
        enabled: !!selectedClassId,
    });

    // Fetch existing attendance for the selected date and class
    const { data: existingAttendance = [], isLoading: attendanceLoading } = useQuery<Attendance[]>({
        queryKey: [`/api/attendance/${selectedClassId}`, { date: selectedDate }],
        queryFn: async () => {
            if (!selectedClassId || !selectedDate) return [];
            const response = await fetch(`/api/attendance/${selectedClassId}?date=${selectedDate}`);
            if (!response.ok) throw new Error('Failed to fetch attendance');
            return response.json();
        },
        enabled: !!selectedClassId && !!selectedDate,
    });

    // Initialize attendance state when existing attendance loads
    // or when class/students change (default to 'present'?)
    // Actually, let's just use existing data to populate.

    const saveAttendanceMutation = useMutation({
        mutationFn: async (data: { classId: string; date: string; studentId: string; status: string; notes?: string }) => {
            console.log("[AttendanceMutation] Sending data:", data);

            const response = await apiRequest("/api/attendance", {
                method: "POST",
                body: data,
            });

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/attendance/${selectedClassId}`] });
            toast({
                title: "Presença registrada",
                description: "A chamada foi salva com sucesso.",
            });
        },
        onError: (error: any) => {
            console.error("Erro ao salvar chamada:", error);
            toast({
                title: "Erro",
                description: error.message || "Não foi possível salvar a chamada.",
                variant: "destructive",
            });
        },
    });

    const handleAttendanceChange = (studentId: string, status: string) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
        // Auto-save or wait for button? Let's wait for button for batch, or auto-save individual.
        // For simplicity, let's auto-save individual changes for now, or use a "Save All" button.
        // "Save All" is better for attendance to avoid too many requests.
    };

    const saveAll = async () => {
        if (!selectedClassId) return;

        if (Object.keys(attendanceData).length === 0) {
            toast({
                title: "Sem alterações",
                description: "Nenhuma alteração de presença para salvar.",
            });
            return;
        }

        console.log("[Attendance] Saving for class:", selectedClassId);

        const promises = Object.entries(attendanceData).map(([studentId, status]) => {
            const payload = {
                classId: selectedClassId,
                date: selectedDate,
                studentId,
                status,
                notes: ""
            };
            console.log("[Attendance] Payload:", payload);

            return saveAttendanceMutation.mutateAsync(payload);
        });

        try {
            await Promise.all(promises);
            toast({
                title: "Chamada salva",
                description: "Todos os registros foram atualizados.",
            });
        } catch (error) {
            console.error("Error saving attendance", error);
        }
    };

    return (
        <div className="h-full overflow-auto p-8 space-y-6" data-testid="page-teacher-attendance">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Chamada</h1>
                        <p className="text-muted-foreground">
                            Registre a presença dos alunos nas aulas
                        </p>
                    </div>
                    <Button onClick={saveAll} disabled={!selectedClassId || Object.keys(attendanceData).length === 0}>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Chamada
                    </Button>
                </div>

                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Turma</label>
                                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma turma" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Data</label>
                                <Input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {selectedClassId && !studentsLoading && !attendanceLoading && students.length > 0 ? (
                    <div className="space-y-4">
                        {students.map((student) => {
                            // Get status from local state or existing data
                            const existingRecord = existingAttendance.find(a => a.studentId === student.id);
                            const currentStatus = attendanceData[student.id] || existingRecord?.status || "";

                            return (
                                <Card key={student.id} className="hover:bg-muted/50 transition-colors">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{student.name}</p>
                                                <p className="text-sm text-muted-foreground">{student.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant={currentStatus === 'present' ? 'default' : 'outline'}
                                                className={currentStatus === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                onClick={() => handleAttendanceChange(student.id, 'present')}
                                            >
                                                <Check className="w-4 h-4 mr-1" />
                                                Presente
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={currentStatus === 'late' ? 'default' : 'outline'}
                                                className={currentStatus === 'late' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                                                onClick={() => handleAttendanceChange(student.id, 'late')}
                                            >
                                                <Clock className="w-4 h-4 mr-1" />
                                                Atrasado
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant={currentStatus === 'absent' ? 'default' : 'outline'}
                                                className={currentStatus === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                                                onClick={() => handleAttendanceChange(student.id, 'absent')}
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Ausente
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : selectedClassId ? (
                    studentsLoading || attendanceLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-lg font-medium mb-2">Nenhum aluno encontrado nesta turma</p>
                            <p className="text-sm">Adicione alunos à turma na página de Turmas</p>
                        </div>
                    ) : null
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        Selecione uma turma para realizar a chamada
                    </div>
                )}
            </div>
        </div>
    );
}
