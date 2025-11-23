import { Icon } from "@/components/Icon";
import type { Teacher } from "@shared/schema";

interface CoordinatorTeachersProps {
  teachers: Teacher[];
}

export default function CoordinatorTeachers({ teachers }: CoordinatorTeachersProps) {
  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-teachers">Professores</h2>
        <p className="text-muted-foreground">Acompanhe o desempenho e atividades dos docentes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div 
            key={teacher.id} 
            className="bg-card border border-card-border p-6 rounded-2xl shadow-sm hover:shadow-md transition hover-elevate"
            data-testid={`card-teacher-${teacher.id}`}
          >
            <div className="flex items-start gap-4 mb-4">
              <img 
                src={teacher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.name}`} 
                alt={teacher.name}
                className="w-16 h-16 rounded-full border-2 border-border"
                data-testid={`img-avatar-${teacher.id}`}
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1" data-testid={`text-teacher-name-${teacher.id}`}>
                  {teacher.name}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid={`text-teacher-subject-${teacher.id}`}>
                  {teacher.subject}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Icon name="book" size={16} />
                  Projetos Ativos
                </span>
                <span className="font-bold text-foreground" data-testid={`text-teacher-projects-${teacher.id}`}>
                  {teacher.rating || 0}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Icon name="award" size={16} />
                  Avaliação
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(teacher.rating || 0) ? 'text-yellow-500' : 'text-muted'}>★</span>
                  ))}
                  <span className="ml-1 font-bold text-foreground" data-testid={`text-teacher-rating-${teacher.id}`}>
                    {teacher.rating || 0}/5
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
