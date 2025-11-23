import { randomUUID } from "crypto";
import type {
  Teacher, InsertTeacher,
  Project, InsertProject,
  RubricCriteria, InsertRubricCriteria,
  Student, InsertStudent,
  Achievement, InsertAchievement,
  StudentAchievement, InsertStudentAchievement,
  BnccCompetency, InsertBnccCompetency,
  ProjectCompetency, InsertProjectCompetency,
  Submission, InsertSubmission,
  Class, InsertClass,
  ProjectWithTeacher,
  StudentAchievementWithDetails,
} from "@shared/schema";

export interface IStorage {
  // Teachers
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeachers(): Promise<Teacher[]>;
  createTeacher(teacher: InsertTeacher): Promise<Teacher>;
  updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined>;

  // Projects
  getProject(id: string): Promise<Project | undefined>;
  getProjects(): Promise<Project[]>;
  getProjectsWithTeacher(): Promise<ProjectWithTeacher[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Rubric Criteria
  getRubricCriteria(projectId: string): Promise<RubricCriteria[]>;
  createRubricCriteria(criteria: InsertRubricCriteria): Promise<RubricCriteria>;
  updateRubricCriteria(id: string, criteria: Partial<InsertRubricCriteria>): Promise<RubricCriteria | undefined>;
  deleteRubricCriteria(id: string): Promise<boolean>;

  // Students
  getStudent(id: string): Promise<Student | undefined>;
  getStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined>;

  // Achievements
  getAchievement(id: string): Promise<Achievement | undefined>;
  getAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: string, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined>;

  // Student Achievements
  getStudentAchievements(studentId: string): Promise<StudentAchievementWithDetails[]>;
  createStudentAchievement(studentAchievement: InsertStudentAchievement): Promise<StudentAchievement>;
  updateStudentAchievement(id: string, progress: number, unlocked: boolean): Promise<StudentAchievement | undefined>;

  // BNCC Competencies
  getCompetency(id: string): Promise<BnccCompetency | undefined>;
  getCompetencies(): Promise<BnccCompetency[]>;
  createCompetency(competency: InsertBnccCompetency): Promise<BnccCompetency>;
  updateCompetency(id: string, competency: Partial<InsertBnccCompetency>): Promise<BnccCompetency | undefined>;

  // Project Competencies
  getProjectCompetencies(projectId: string): Promise<ProjectCompetency[]>;
  createProjectCompetency(projectCompetency: InsertProjectCompetency): Promise<ProjectCompetency>;

  // Submissions
  getSubmissions(projectId: string): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;

  // Classes
  getClass(id: string): Promise<Class | undefined>;
  getClasses(): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;
}

export class MemStorage implements IStorage {
  private teachers: Map<string, Teacher> = new Map();
  private projects: Map<string, Project> = new Map();
  private rubricCriteria: Map<string, RubricCriteria> = new Map();
  private students: Map<string, Student> = new Map();
  private achievements: Map<string, Achievement> = new Map();
  private studentAchievements: Map<string, StudentAchievement> = new Map();
  private bnccCompetencies: Map<string, BnccCompetency> = new Map();
  private projectCompetencies: Map<string, ProjectCompetency> = new Map();
  private submissions: Map<string, Submission> = new Map();
  private classes: Map<string, Class> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed Teachers
    const teachers: InsertTeacher[] = [
      { name: "Ana Silva", subject: "Biologia", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana", rating: 4 },
      { name: "Carlos Souza", subject: "História", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos", rating: 4 },
      { name: "Roberto Lima", subject: "Física", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto", rating: 5 },
      { name: "Mariana Dias", subject: "Inglês", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana", rating: 4 },
    ];
    teachers.forEach(t => {
      const id = randomUUID();
      this.teachers.set(id, { ...t, id });
    });

    // Seed Projects
    const teacherIds = Array.from(this.teachers.keys());
    const projects: InsertProject[] = [
      { title: "Horta Sustentável", subject: "Bio & Mat", status: "Em Andamento", progress: 65, students: 24, nextDeadline: "2024-11-12", deadlineLabel: "Relatório de Crescimento", theme: "green", teacherId: teacherIds[0], delayed: false, description: "Projeto de agricultura urbana" },
      { title: "Jornal Digital", subject: "Port & Hist", status: "Planejamento", progress: 15, students: 18, nextDeadline: "2024-11-20", deadlineLabel: "Definição de Pautas", theme: "blue", teacherId: teacherIds[1], delayed: false, description: "Criação de jornal estudantil" },
      { title: "Robótica Sucata", subject: "Fís & Art", status: "Para Avaliação", progress: 100, students: 30, nextDeadline: "2024-10-30", deadlineLabel: "Apresentação Final", theme: "purple", teacherId: teacherIds[2], delayed: false, description: "Construção de robôs com materiais recicláveis" },
      { title: "Teatro Shakespeare", subject: "Lit & Ing", status: "Atrasado", progress: 40, students: 22, nextDeadline: "2024-10-15", deadlineLabel: "Ensaios Gerais", theme: "red", teacherId: teacherIds[3], delayed: true, description: "Montagem teatral em inglês" },
    ];
    projects.forEach(p => {
      const id = randomUUID();
      this.projects.set(id, { ...p, id });
    });

    // Seed Classes
    const classes: InsertClass[] = [
      { name: "1º Ano A", studentCount: 32, engagement: 75 },
      { name: "2º Ano B", studentCount: 28, engagement: 82 },
      { name: "3º Ano C", studentCount: 30, engagement: 68 },
    ];
    classes.forEach(c => {
      const id = randomUUID();
      this.classes.set(id, { ...c, id });
    });

    // Seed BNCC Competencies
    const competencies: InsertBnccCompetency[] = [
      { name: "Pensamento Científico, Crítico e Criativo", category: "Geral", description: "Exercitar a curiosidade intelectual" },
      { name: "Repertório Cultural", category: "Geral", description: "Valorizar e fruir manifestações artísticas" },
      { name: "Comunicação", category: "Geral", description: "Utilizar diferentes linguagens" },
      { name: "Cultura Digital", category: "Geral", description: "Compreender e utilizar tecnologias digitais" },
      { name: "Trabalho e Projeto de Vida", category: "Geral", description: "Valorizar a diversidade e o trabalho" },
    ];
    competencies.forEach(c => {
      const id = randomUUID();
      this.bnccCompetencies.set(id, { ...c, id });
    });

    // Seed Achievements
    const achievements: InsertAchievement[] = [
      { title: "Pontualidade Britânica", description: "Entregar 3 tarefas antes do prazo final.", xp: 500, icon: "clock" },
      { title: "Mestre da BNCC", description: "Completar todas as competências de um projeto.", xp: 1000, icon: "award" },
      { title: "Colaborador", description: "Participar de 2 projetos em grupo.", xp: 300, icon: "users" },
    ];
    achievements.forEach(a => {
      const id = randomUUID();
      this.achievements.set(id, { ...a, id });
    });

    // Seed Rubric Criteria for all projects
    const projectIds = Array.from(this.projects.keys());
    projectIds.forEach((projectId, idx) => {
      const rubricCriteria: InsertRubricCriteria[] = [
        { projectId, criteria: "Investigação e Pesquisa", weight: 40, level1: "Não apresentou pesquisa", level2: "Pesquisa superficial", level3: "Pesquisa consistente", level4: "Pesquisa aprofundada e inovadora" },
        { projectId, criteria: "Trabalho Colaborativo", weight: 30, level1: "Trabalho individual", level2: "Pouca colaboração", level3: "Boa colaboração", level4: "Excelente sinergia em equipe" },
        { projectId, criteria: "Apresentação e Comunicação", weight: 30, level1: "Apresentação deficiente", level2: "Comunicação básica", level3: "Boa comunicação", level4: "Comunicação excelente e criativa" },
      ];
      rubricCriteria.forEach(rc => {
        const id = randomUUID();
        this.rubricCriteria.set(id, { ...rc, id });
      });
    });
  }

  // Teachers
  async getTeacher(id: string): Promise<Teacher | undefined> {
    return this.teachers.get(id);
  }

  async getTeachers(): Promise<Teacher[]> {
    return Array.from(this.teachers.values());
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const id = randomUUID();
    const newTeacher: Teacher = { ...teacher, id };
    this.teachers.set(id, newTeacher);
    return newTeacher;
  }

  async updateTeacher(id: string, teacher: Partial<InsertTeacher>): Promise<Teacher | undefined> {
    const existing = this.teachers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...teacher };
    this.teachers.set(id, updated);
    return updated;
  }

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectsWithTeacher(): Promise<ProjectWithTeacher[]> {
    const projects = Array.from(this.projects.values());
    return projects.map(project => {
      const teacher = this.teachers.get(project.teacherId);
      return {
        ...project,
        teacherName: teacher?.name || "Unknown",
      };
    });
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = randomUUID();
    const newProject: Project = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...project };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Rubric Criteria
  async getRubricCriteria(projectId: string): Promise<RubricCriteria[]> {
    return Array.from(this.rubricCriteria.values()).filter(c => c.projectId === projectId);
  }

  async createRubricCriteria(criteria: InsertRubricCriteria): Promise<RubricCriteria> {
    const id = randomUUID();
    const newCriteria: RubricCriteria = { ...criteria, id };
    this.rubricCriteria.set(id, newCriteria);
    return newCriteria;
  }

  async updateRubricCriteria(id: string, criteria: Partial<InsertRubricCriteria>): Promise<RubricCriteria | undefined> {
    const existing = this.rubricCriteria.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...criteria };
    this.rubricCriteria.set(id, updated);
    return updated;
  }

  async deleteRubricCriteria(id: string): Promise<boolean> {
    return this.rubricCriteria.delete(id);
  }

  // Students
  async getStudent(id: string): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const newStudent: Student = { ...student, id };
    this.students.set(id, newStudent);
    return newStudent;
  }

  async updateStudent(id: string, student: Partial<InsertStudent>): Promise<Student | undefined> {
    const existing = this.students.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...student };
    this.students.set(id, updated);
    return updated;
  }

  // Achievements
  async getAchievement(id: string): Promise<Achievement | undefined> {
    return this.achievements.get(id);
  }

  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const newAchievement: Achievement = { ...achievement, id };
    this.achievements.set(id, newAchievement);
    return newAchievement;
  }

  async updateAchievement(id: string, achievement: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    const existing = this.achievements.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...achievement };
    this.achievements.set(id, updated);
    return updated;
  }

  // Student Achievements
  async getStudentAchievements(studentId: string): Promise<StudentAchievementWithDetails[]> {
    const studentAchievements = Array.from(this.studentAchievements.values())
      .filter(sa => sa.studentId === studentId);
    
    return studentAchievements.map(sa => {
      const achievement = this.achievements.get(sa.achievementId);
      return {
        ...sa,
        achievementTitle: achievement?.title || "",
        achievementDescription: achievement?.description || "",
        achievementXp: achievement?.xp || 0,
        achievementIcon: achievement?.icon || "award",
      };
    });
  }

  async createStudentAchievement(studentAchievement: InsertStudentAchievement): Promise<StudentAchievement> {
    const id = randomUUID();
    const newStudentAchievement: StudentAchievement = { ...studentAchievement, id };
    this.studentAchievements.set(id, newStudentAchievement);
    return newStudentAchievement;
  }

  async updateStudentAchievement(id: string, progress: number, unlocked: boolean): Promise<StudentAchievement | undefined> {
    const existing = this.studentAchievements.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, progress, unlocked };
    this.studentAchievements.set(id, updated);
    return updated;
  }

  // BNCC Competencies
  async getCompetency(id: string): Promise<BnccCompetency | undefined> {
    return this.bnccCompetencies.get(id);
  }

  async getCompetencies(): Promise<BnccCompetency[]> {
    return Array.from(this.bnccCompetencies.values());
  }

  async createCompetency(competency: InsertBnccCompetency): Promise<BnccCompetency> {
    const id = randomUUID();
    const newCompetency: BnccCompetency = { ...competency, id };
    this.bnccCompetencies.set(id, newCompetency);
    return newCompetency;
  }

  async updateCompetency(id: string, competency: Partial<InsertBnccCompetency>): Promise<BnccCompetency | undefined> {
    const existing = this.bnccCompetencies.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...competency };
    this.bnccCompetencies.set(id, updated);
    return updated;
  }

  // Project Competencies
  async getProjectCompetencies(projectId: string): Promise<ProjectCompetency[]> {
    return Array.from(this.projectCompetencies.values())
      .filter(pc => pc.projectId === projectId);
  }

  async createProjectCompetency(projectCompetency: InsertProjectCompetency): Promise<ProjectCompetency> {
    const id = randomUUID();
    const newProjectCompetency: ProjectCompetency = { ...projectCompetency, id };
    this.projectCompetencies.set(id, newProjectCompetency);
    return newProjectCompetency;
  }

  // Submissions
  async getSubmissions(projectId: string): Promise<Submission[]> {
    return Array.from(this.submissions.values())
      .filter(s => s.projectId === projectId);
  }

  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const id = randomUUID();
    const newSubmission: Submission = { ...submission, id, submittedAt: new Date() };
    this.submissions.set(id, newSubmission);
    return newSubmission;
  }

  // Classes
  async getClass(id: string): Promise<Class | undefined> {
    return this.classes.get(id);
  }

  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }

  async createClass(classData: InsertClass): Promise<Class> {
    const id = randomUUID();
    const newClass: Class = { ...classData, id };
    this.classes.set(id, newClass);
    return newClass;
  }
}

export const storage = new MemStorage();
