import { BrandLogo } from "./BrandLogo";
import { Icon } from "./Icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  role: 'teacher' | 'student' | 'coordinator';
  onLogout: () => void;
}

export function AppSidebar({ activeTab, setActiveTab, role, onLogout }: AppSidebarProps) {
  const getRoleLabel = () => {
    if (role === 'teacher') return 'Professor';
    if (role === 'student') return 'Aluno';
    if (role === 'coordinator') return 'Coordenador';
  };
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-4">
          <BrandLogo size={36} />
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">BProjetos</h1>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeTab === 'dashboard' || activeTab === 'kanban' || activeTab === 'student-home'}
                >
                  <button
                    onClick={() => {
                      if(role === 'coordinator') setActiveTab('kanban');
                      else if(role === 'student') setActiveTab('student-home');
                      else setActiveTab('dashboard');
                    }}
                    data-testid="nav-visao-geral"
                  >
                    <Icon name="home" size={20} />
                    <span>Visão Geral</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            {role === 'teacher' ? 'Gestão' : role === 'student' ? 'Minhas Atividades' : 'Administração'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {role === 'teacher' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={activeTab === 'classes'}>
                      <button onClick={() => setActiveTab('classes')} data-testid="nav-turmas">
                        <Icon name="users" size={20} />
                        <span>Turmas</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={activeTab === 'reports'}>
                      <button onClick={() => setActiveTab('reports')} data-testid="nav-relatorios">
                        <Icon name="barChart" size={20} />
                        <span>Relatórios</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={activeTab === 'rubrics'}>
                      <button onClick={() => setActiveTab('rubrics')} data-testid="nav-rubricas">
                        <Icon name="clipboard" size={20} />
                        <span>Rubricas</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {role === 'student' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={activeTab === 'projects'}>
                      <button onClick={() => setActiveTab('projects')} data-testid="nav-projetos">
                        <Icon name="book" size={20} />
                        <span>Projetos</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={activeTab === 'calendar'}>
                      <button onClick={() => setActiveTab('calendar')} data-testid="nav-calendario">
                        <Icon name="calendar" size={20} />
                        <span>Calendário</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={activeTab === 'achievements'}>
                      <button onClick={() => setActiveTab('achievements')} data-testid="nav-conquistas">
                        <Icon name="award" size={20} />
                        <span>Conquistas</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {role === 'coordinator' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={activeTab === 'kanban'}>
                      <button onClick={() => setActiveTab('kanban')} data-testid="nav-kanban">
                        <Icon name="grid" size={20} />
                        <span>Kanban</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={activeTab === 'teachers'}>
                      <button onClick={() => setActiveTab('teachers')} data-testid="nav-professores">
                        <Icon name="users" size={20} />
                        <span>Professores</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={activeTab === 'metrics'}>
                      <button onClick={() => setActiveTab('metrics')} data-testid="nav-indicadores">
                        <Icon name="barChart" size={20} />
                        <span>Indicadores</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <button onClick={onLogout} data-testid="button-logout">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Icon name="logout" size={18} />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold">Sair</span>
                  <span className="text-xs text-muted-foreground">{getRoleLabel()}</span>
                </div>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
