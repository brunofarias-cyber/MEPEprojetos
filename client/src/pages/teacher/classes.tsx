import { Icon } from "@/components/Icon";
import type { Class } from "@shared/schema";

interface TeacherClassesProps {
  classes: Class[];
}

export default function TeacherClasses({ classes }: TeacherClassesProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-foreground mb-8" data-testid="heading-classes">Minhas Turmas</h2>
      
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
          </div>
        ))}
      </div>
    </div>
  );
}
