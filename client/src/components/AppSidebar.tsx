import { BrandLogo } from "./BrandLogo";
import { Icon } from "./Icon";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
  role: 'teacher' | 'student' | 'coordinator';
  onLogout: () => void;
  userName: string;
  userAvatar?: string | null;
}

export function AppSidebar({ role, onLogout, userName, userAvatar }: AppSidebarProps) {
  const [location] = useLocation();

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
                <SidebarMenuButton asChild isActive={location === '/'}>
                  <Link href="/" data-testid="nav-visao-geral">
                    <Icon name="home" size={20} />
                    <span>Visão Geral</span>
                  </Link>
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
                    <SidebarMenuButton asChild isActive={location === '/classes'}>
                      <Link href="/classes" data-testid="nav-turmas">
                        <Icon name="users" size={20} />
                        <span>Turmas</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/reports'}>
                      <Link href="/reports" data-testid="nav-relatorios">
                        <Icon name="barChart" size={20} />
                        <span>Relatórios</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/rubrics'}>
                      <Link href="/rubrics" data-testid="nav-rubricas">
                        <Icon name="clipboard" size={20} />
                        <span>Rubricas</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/bncc'}>
                      <Link href="/bncc" data-testid="nav-bncc">
                        <Icon name="book" size={20} />
                        <span>BNCC</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/feedbacks'}>
                      <Link href="/feedbacks" data-testid="nav-feedbacks">
                        <Icon name="messageSquare" size={20} />
                        <span>Feedbacks</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/calendar'}>
                      <Link href="/calendar" data-testid="nav-calendario">
                        <Icon name="calendar" size={20} />
                        <span>Calendário</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {role === 'student' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/projects'}>
                      <Link href="/projects" data-testid="nav-projetos">
                        <Icon name="book" size={20} />
                        <span>Projetos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/calendar'}>
                      <Link href="/calendar" data-testid="nav-calendario">
                        <Icon name="calendar" size={20} />
                        <span>Calendário</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/achievements'}>
                      <Link href="/achievements" data-testid="nav-conquistas">
                        <Icon name="award" size={20} />
                        <span>Conquistas</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {role === 'coordinator' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/teachers'}>
                      <Link href="/teachers" data-testid="nav-professores">
                        <Icon name="users" size={20} />
                        <span>Professores</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/students'}>
                      <Link href="/students" data-testid="nav-alunos">
                        <Icon name="users" size={20} />
                        <span>Alunos</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/metrics'}>
                      <Link href="/metrics" data-testid="nav-metricas">
                        <Icon name="pieChart" size={20} />
                        <span>Métricas</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location === '/bncc'}>
                      <Link href="/bncc" data-testid="nav-bncc">
                        <Icon name="bookOpen" size={20} />
                        <span>BNCC</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={userAvatar || undefined} alt={userName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">{getRoleLabel()}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full bg-background border border-border text-foreground px-4 py-2 rounded-lg font-medium hover-elevate flex items-center justify-center gap-2 transition"
            data-testid="button-logout"
          >
            <Icon name="logOut" size={16} />
            <span>Sair</span>
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
