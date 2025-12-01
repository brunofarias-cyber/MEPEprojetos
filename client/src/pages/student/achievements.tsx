import { Icon } from "@/components/Icon";
import type { StudentAchievementWithDetails } from "@shared/schema";

interface StudentAchievementsProps {
  achievements?: StudentAchievementWithDetails[];
}

export default function StudentAchievements({ achievements = [] }: StudentAchievementsProps) {
  const mockAchievements = [
    { id: '1', title: "Pontualidade Britânica", desc: "Entregar 3 tarefas antes do prazo final.", xp: 500, progress: 2, total: 3, icon: "clock", unlocked: false },
    { id: '2', title: "Mestre da BNCC", desc: "Completar todas as competências de um projeto.", xp: 1000, progress: 8, total: 10, icon: "award", unlocked: false },
    { id: '3', title: "Colaborador", desc: "Participar de 2 projetos em grupo.", xp: 300, progress: 2, total: 2, icon: "users", unlocked: true },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-achievements">Conquistas</h2>
        <p className="text-muted-foreground">Desbloqueie conquistas e ganhe XP extra.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockAchievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`bg-card border border-card-border p-6 rounded-2xl shadow-sm relative overflow-hidden ${
              achievement.unlocked ? '' : 'opacity-75 grayscale'
            }`}
            data-testid={`card-achievement-${achievement.id}`}
          >
            {achievement.unlocked && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Icon name="check" size={16} className="text-white" />
              </div>
            )}

            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center relative">
                <Icon name={achievement.icon} size={28} className="text-primary" />
                {!achievement.unlocked && (
                  <div className="absolute inset-0 bg-muted/50 rounded-full flex items-center justify-center">
                    <Icon name="x" size={20} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1" data-testid={`text-achievement-title-${achievement.id}`}>
                  {achievement.title}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid={`text-achievement-desc-${achievement.id}`}>
                  {achievement.desc}
                </p>
              </div>

              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold" data-testid={`text-achievement-xp-${achievement.id}`}>
                +{achievement.xp} XP
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-bold text-foreground" data-testid={`text-achievement-progress-${achievement.id}`}>
                  {achievement.progress}/{achievement.total}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000" 
                  style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                  data-testid={`progress-achievement-${achievement.id}`}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
