import { BrandLogo } from "@/components/BrandLogo";
import { Icon } from "@/components/Icon";

interface LandingPageProps {
  onEnter: (role: 'teacher' | 'student' | 'coordinator') => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  return (
    <div className="min-h-screen hero-gradient flex flex-col relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-300/30 rounded-full blur-3xl mix-blend-multiply filter animate-float -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-3xl mix-blend-multiply filter animate-float -z-10" style={{animationDelay: "2s"}}></div>

      {/* Navbar */}
      <nav className="px-8 py-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <BrandLogo size={40} />
          <span className="text-2xl font-bold text-slate-800 tracking-tight">BProjetos</span>
        </div>
        <div className="hidden md:flex gap-6 text-sm font-semibold text-slate-600">
          <a href="#" className="hover:text-primary transition" data-testid="link-about">Sobre</a>
          <a href="#" className="hover:text-primary transition" data-testid="link-features">Recursos</a>
          <a href="#" className="hover:text-primary transition" data-testid="link-pricing">Preços</a>
        </div>
        <button className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition shadow-lg shadow-primary/20 text-sm" data-testid="button-schedule-demo">
          Agendar Demo
        </button>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto w-full px-6 md:px-12 gap-12 py-12">
        
        {/* Left Text */}
        <div className="md:w-1/2 animate-slide-up space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
            Plataforma #1 para Escolas Inovadoras
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight">
            Projetos que <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Engajam Alunos</span>
          </h1>
          
          <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
            Centralize a gestão pedagógica, automatize o acompanhamento da BNCC e transforme atividades escolares em experiências gamificadas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-4">
                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="" data-testid="img-avatar-1"/>
                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ane" alt="" data-testid="img-avatar-2"/>
                <img className="w-10 h-10 rounded-full border-2 border-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" alt="" data-testid="img-avatar-3"/>
              </div>
              <span className="ml-6 text-sm font-bold text-slate-600" data-testid="text-school-count">+500 Escolas usam</span>
            </div>
          </div>
        </div>

        {/* Right Login Cards */}
        <div className="md:w-1/2 w-full grid gap-4 animate-slide-up" style={{animationDelay: "0.2s"}}>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">Acesso Rápido (Ambiente Demo)</p>
          
          <button 
            onClick={() => onEnter('teacher')} 
            data-testid="button-enter-teacher"
            className="glass-card p-6 rounded-2xl flex items-center gap-6 hover:scale-[1.02] transition-all shadow-sm hover:shadow-xl group cursor-pointer text-left"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
              <Icon name="book" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">Sou Professor</h3>
              <p className="text-sm text-slate-500">Gerenciar projetos, turmas e rubricas.</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Icon name="arrowRight" size={16} />
            </div>
          </button>

          <button 
            onClick={() => onEnter('student')} 
            data-testid="button-enter-student"
            className="glass-card p-6 rounded-2xl flex items-center gap-6 hover:scale-[1.02] transition-all shadow-sm hover:shadow-xl group cursor-pointer text-left"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
              <Icon name="rocket" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">Sou Aluno</h3>
              <p className="text-sm text-slate-500">Ver missões, XP e enviar atividades.</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Icon name="arrowRight" size={16} />
            </div>
          </button>

          <button 
            onClick={() => onEnter('coordinator')} 
            data-testid="button-enter-coordinator"
            className="glass-card p-6 rounded-2xl flex items-center gap-6 hover:scale-[1.02] transition-all shadow-sm hover:shadow-xl group cursor-pointer text-left"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform">
              <Icon name="grid" size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">Coordenação</h3>
              <p className="text-sm text-slate-500">Monitorar Kanban e desempenho docente.</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <Icon name="arrowRight" size={16} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
