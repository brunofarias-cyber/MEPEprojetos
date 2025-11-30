import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/Icon";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Student } from "@shared/schema";

interface ManageClassModalProps {
    classId: string;
    className: string;
    trigger?: React.ReactNode;
}

export function ManageClassModal({ classId, className, trigger }: ManageClassModalProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    // Fetch students currently in the class
    const { data: classStudents = [], isLoading: isLoadingClassStudents } = useQuery<Student[]>({
        queryKey: [`/api/classes/${classId}/students`],
        enabled: open,
    });

    // Fetch all students to add
    const { data: allStudents = [], isLoading: isLoadingAllStudents } = useQuery<Student[]>({
        queryKey: ["/api/students"],
        enabled: open,
    });

    const addStudentMutation = useMutation({
        mutationFn: async (studentId: string) => {
            return apiRequest(`/api/classes/${classId}/students`, {
                method: "POST",
                body: { studentId },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/classes/${classId}/students`] });
            queryClient.invalidateQueries({ queryKey: ["/api/teachers", "classes"] }); // Update student count
            toast({ title: "Aluno adicionado", description: "O aluno foi adicionado à turma com sucesso." });
        },
        onError: (error: any) => {
            toast({ title: "Erro ao adicionar", description: error.message, variant: "destructive" });
        },
    });

    const removeStudentMutation = useMutation({
        mutationFn: async (studentId: string) => {
            return apiRequest(`/api/classes/${classId}/students/${studentId}`, {
                method: "DELETE",
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/classes/${classId}/students`] });
            queryClient.invalidateQueries({ queryKey: ["/api/teachers", "classes"] }); // Update student count
            toast({ title: "Aluno removido", description: "O aluno foi removido da turma com sucesso." });
        },
        onError: (error: any) => {
            toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
        },
    });

    // Filter students not already in the class
    const availableStudents = allStudents.filter((student) =>
        !classStudents.some((cs) => cs.id === student.id) &&
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredClassStudents = classStudents.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Icon name="users" className="mr-2 h-4 w-4" />
                        Gerenciar Alunos
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Gerenciar Turma: {className}</DialogTitle>
                    <DialogDescription>Adicione ou remova alunos desta turma.</DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2 my-4">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar alunos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
                    {/* Current Students */}
                    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 p-3 border-b font-medium flex justify-between items-center">
                            <span>Alunos na Turma ({classStudents.length})</span>
                        </div>
                        <ScrollArea className="flex-1 p-3">
                            {isLoadingClassStudents ? (
                                <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                            ) : filteredClassStudents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "Nenhum aluno encontrado" : "Nenhum aluno nesta turma"}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {filteredClassStudents.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={student.avatar || undefined} />
                                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="truncate">
                                                    <p className="text-sm font-medium truncate">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                                onClick={() => removeStudentMutation.mutate(student.id)}
                                                disabled={removeStudentMutation.isPending}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Available Students */}
                    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 p-3 border-b font-medium flex justify-between items-center">
                            <span>Alunos Disponíveis</span>
                        </div>
                        <ScrollArea className="flex-1 p-3">
                            {isLoadingAllStudents ? (
                                <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                            ) : availableStudents.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? "Nenhum aluno encontrado" : "Todos os alunos já estão na turma"}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableStudents.map((student) => (
                                        <div key={student.id} className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={student.avatar || undefined} />
                                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="truncate">
                                                    <p className="text-sm font-medium truncate">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-primary hover:text-primary hover:bg-primary/10 h-8 w-8"
                                                onClick={() => addStudentMutation.mutate(student.id)}
                                                disabled={addStudentMutation.isPending}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
