import { Icon } from "@/components/Icon";

export default function CoordinatorMetrics() {
  const stats = [
    { label: "Taxa de Conclusão", value: "87%", icon: "check", color: "text-green-600 bg-green-50", change: "+5%" },
    { label: "Projetos Ativos", value: "24", icon: "book", color: "text-blue-600 bg-blue-50", change: "+3" },
    { label: "Professores Engajados", value: "18", icon: "users", color: "text-purple-600 bg-purple-50", change: "+2" },
    { label: "Média BNCC", value: "85%", icon: "award", color: "text-orange-600 bg-orange-50", change: "+8%" },
  ];

  const recentActivity = [
    { teacher: "Ana Silva", action: "criou o projeto", project: "Horta Sustentável", time: "2h atrás" },
    { teacher: "Carlos Souza", action: "finalizou a rubrica do projeto", project: "Jornal Digital", time: "4h atrás" },
    { teacher: "Roberto Lima", action: "avaliou entregas do projeto", project: "Robótica Sucata", time: "6h atrás" },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2" data-testid="heading-metrics">Indicadores</h2>
        <p className="text-muted-foreground">Métricas gerais de desempenho da escola.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card border border-card-border p-6 rounded-xl shadow-sm" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground" data-testid={`text-stat-value-${idx}`}>{stat.value}</p>
                <p className="text-sm text-green-600 font-semibold mt-1" data-testid={`text-stat-change-${idx}`}>{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <Icon name={stat.icon} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-card-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-bold text-lg text-foreground">Atividades Recentes</h3>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((activity, idx) => (
            <div key={idx} className="p-6 hover-elevate transition" data-testid={`activity-${idx}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="clock" size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground">
                    <strong className="font-semibold" data-testid={`text-activity-teacher-${idx}`}>{activity.teacher}</strong>{' '}
                    {activity.action}{' '}
                    <strong className="font-semibold" data-testid={`text-activity-project-${idx}`}>{activity.project}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1" data-testid={`text-activity-time-${idx}`}>{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
