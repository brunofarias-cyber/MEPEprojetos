import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/Icon";
import type { Achievement, StudentAchievementWithDetails, Student } from "@shared/schema";

export default function StudentAchievements() {
  // Fetch current student
  const { data: student } = useQuery<Student>({
    queryKey: ["/api/me/student"],
  });

  // Fetch all available achievements
  const { data: allAchievements = [], isLoading: loadingAchievements } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  // Fetch student's achievement progress
  const { data: studentAchievements = [], isLoading: loadingProgress } = useQuery<StudentAchievementWithDetails[]>({
    queryKey: [`/api/students/${student?.id}/achievements`],
    enabled: !!student?.id,
  });

  if (loadingAchievements || loadingProgress) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Merge achievements with student progress
  const achievementsWithProgress = allAchievements.map((achievement) => {
    const progress = studentAchievements.find(
      (sa) => sa.achievementId === achievement.id
    );

    return {
      ...achievement,
      progress: progress?.progress || 0,
      total: progress?.total || getDefaultTotal(achievement.id),
      unlocked: progress?.unlocked || false,
    };
  });

  // Sort: unlocked first, then by progress
  const sortedAchievements = [...achievementsWithProgress].sort((a, b) => {
    if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
    return (b.progress / b.total) - (a.progress / a.total);
  });

  return (
    <div className="animate-fade-in space-y-8 p-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-achievements">
          Conquistas
        </h2>
        <p className="text-muted-foreground">
          Desbloqueie conquistas e ganhe XP extra.
        </p>
      </div>

      {student && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Nível {student.level}</h3>
              <p className="opacity-90">{student.xp} XP acumulados</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {studentAchievements.filter((a) => a.unlocked).length}
              </p>
              <p className="text-sm opacity-90">
                de {allAchievements.length} conquistas
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`bg-card border border-card-border p-6 rounded-2xl shadow-sm relative overflow-hidden transition-all hover:shadow-lg ${achievement.unlocked ? '' : 'opacity-75'
              }`}
            data-testid={`card-achievement-${achievement.id}`}
          >
            {achievement.unlocked && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Icon name="check" size={16} className="text-white" />
              </div>
            )}

            <div className="flex items-start gap-4 mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center relative ${achievement.unlocked ? 'bg-primary/10' : 'bg-muted'
                }`}>
                <Icon
                  name={achievement.icon as any}
                  size={28}
                  className={achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}
                />
                {!achievement.unlocked && (
                  <div className="absolute inset-0 bg-muted/50 rounded-full flex items-center justify-center">
                    <Icon name="lock" size={20} className="text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3
                  className="text-lg font-bold text-foreground mb-1"
                  data-testid={`text-achievement-title-${achievement.id}`}
                >
                  {achievement.title}
                </h3>
                <p
                  className="text-sm text-muted-foreground"
                  data-testid={`text-achievement-desc-${achievement.id}`}
                >
                  {achievement.description}
                </p>
              </div>
            </div>

            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-xs font-bold inline-block mb-4"
              data-testid={`text-achievement-xp-${achievement.id}`}
            >
              +{achievement.xp} XP
            </div>

            {achievement.total > 1 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span
                    className="font-bold text-foreground"
                    data-testid={`text-achievement-progress-${achievement.id}`}
                  >
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
            )}
          </div>
        ))}
      </div>

      {sortedAchievements.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma conquista disponível no momento.</p>
        </div>
      )}
    </div>
  );
}

// Helper function to determine default total for progress-based achievements
function getDefaultTotal(achievementId: string): number {
  const totals: Record<string, number> = {
    'ach-entregas-pontuais': 5,
    'ach-mestre-projetos': 10,
    'ach-pontualidade': 20,
    'ach-bom-aluno': 3,
    'ach-excelencia': 5,
    'ach-melhoria-continua': 3,
    'ach-colaborador-ativo': 5,
    'ach-trabalho-equipe': 5,
    'ach-criativo': 3,
  };
  return totals[achievementId] || 1;
}
