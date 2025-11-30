import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import { useAuth } from "@/contexts/AuthContext";
import { CreateClassModal } from "@/components/CreateClassModal";
import { SpreadsheetImport } from "@/components/SpreadsheetImport";
import { ManageClassModal } from "@/components/ManageClassModal";
import type { Class } from "@shared/schema";

export default function TeacherClasses() {
  const { user } = useAuth();
  const teacherId = user?.roleData?.id;

  const { data: classes = [], isLoading } = useQuery<Class[]>({
    queryKey: ["/api/teachers", teacherId, "classes"],
    enabled: !!teacherId,
  });

  if (!teacherId) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground" data-testid="heading-classes">Minhas Turmas</h2>
        </div>
        <div className="bg-card border border-card-border p-12 rounded-2xl text-center">
          <p className="text-lg text-muted-foreground">Dados do professor não encontrados</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-foreground" data-testid="heading-classes">Minhas Turmas</h2>
          <div className="flex gap-2">
            <SpreadsheetImport />
            <CreateClassModal />
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Carregando turmas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-foreground" data-testid="heading-classes">Minhas Turmas</h2>
        <div className="flex gap-2">
          <SpreadsheetImport />
          <CreateClassModal />
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="bg-card border border-card-border p-12 rounded-2xl text-center">
          <Icon name="users" className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Nenhuma turma encontrada</p>
          <p className="text-sm text-muted-foreground mt-2">Suas turmas aparecerão aqui</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {classes.map((classItem) => (
            <div key={classItem.id} className="bg-card border border-card-border p-8 rounded-2xl shadow-sm hover:shadow-md transition hover-elevate" data-testid={`card-class-${classItem.id}`}>
              <div className="flex justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground" data-testid={`text-class-name-${classItem.id}`}>{classItem.name}</h3>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold" data-testid={`text-student-count-${classItem.id}`}>
                  {classItem.studentCount} Alunos
                </span>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-primary transition-all duration-1000"
                  style={{ width: `${classItem.engagement}%` }}
                  data-testid={`progress-engagement-${classItem.id}`}
                ></div>
              </div>
              <p className="text-xs text-muted-foreground" data-testid={`text-engagement-${classItem.id}`}>{classItem.engagement}% de Engajamento</p>

              <div className="mt-4 pt-4 border-t flex justify-end">
                <ManageClassModal classId={classItem.id} className={classItem.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
