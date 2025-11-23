import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import type {
  InsertUser,
  InsertCoordinator,
  InsertTeacher,
  InsertProject,
  InsertRubricCriteria,
  InsertStudent,
  InsertAchievement,
  InsertStudentAchievement,
  InsertBnccCompetency,
  InsertClass,
} from "@shared/schema";

export async function seedDatabase() {
  console.log("🌱 Starting database seed...");

  // Create demo users with hashed passwords
  const hashedPassword = await bcrypt.hash("demo123", 10);

  // Seed Coordinator User
  const coordinatorUser = await storage.createUser({
    email: "coordenador@escola.com",
    hashedPassword,
    role: "coordinator",
    name: "Maria Coordenadora",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
  });

  const coordinator = await storage.createCoordinator({
    userId: coordinatorUser.id,
    name: "Maria Coordenadora",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
  });
  console.log("✅ Coordinator created");

  // Seed Teacher Users
  const teacherData = [
    { name: "Ana Silva", subject: "Biologia", email: "ana@escola.com" },
    { name: "Carlos Souza", subject: "História", email: "carlos@escola.com" },
    { name: "Roberto Lima", subject: "Física", email: "roberto@escola.com" },
    { name: "Mariana Dias", subject: "Inglês", email: "mariana@escola.com" },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const user = await storage.createUser({
      email: t.email,
      hashedPassword,
      role: "teacher",
      name: t.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name.split(' ')[0]}`,
    });

    const teacher = await storage.createTeacher({
      userId: user.id,
      name: t.name,
      subject: t.subject,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name.split(' ')[0]}`,
      rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
    });

    teachers.push(teacher);
  }
  console.log("✅ Teachers created");

  // Seed Projects
  const projectsData: InsertProject[] = [
    { title: "Horta Sustentável", subject: "Bio & Mat", status: "Em Andamento", progress: 65, students: 24, nextDeadline: "2024-11-12", deadlineLabel: "Relatório de Crescimento", theme: "green", teacherId: teachers[0].id, delayed: false, description: "Projeto de agricultura urbana" },
    { title: "Jornal Digital", subject: "Port & Hist", status: "Planejamento", progress: 15, students: 18, nextDeadline: "2024-11-20", deadlineLabel: "Definição de Pautas", theme: "blue", teacherId: teachers[1].id, delayed: false, description: "Criação de jornal estudantil" },
    { title: "Robótica Sucata", subject: "Fís & Art", status: "Para Avaliação", progress: 100, students: 30, nextDeadline: "2024-10-30", deadlineLabel: "Apresentação Final", theme: "purple", teacherId: teachers[2].id, delayed: false, description: "Construção de robôs com materiais recicláveis" },
    { title: "Teatro Shakespeare", subject: "Lit & Ing", status: "Atrasado", progress: 40, students: 22, nextDeadline: "2024-10-15", deadlineLabel: "Ensaios Gerais", theme: "red", teacherId: teachers[3].id, delayed: true, description: "Montagem teatral em inglês" },
  ];

  const projects = [];
  for (const p of projectsData) {
    const project = await storage.createProject(p);
    projects.push(project);
  }
  console.log("✅ Projects created");

  // Seed Rubric Criteria for all projects
  for (const project of projects) {
    const rubrics: InsertRubricCriteria[] = [
      { projectId: project.id, criteria: "Investigação e Pesquisa", weight: 40, level1: "Não apresentou pesquisa", level2: "Pesquisa superficial", level3: "Pesquisa consistente", level4: "Pesquisa aprofundada e inovadora" },
      { projectId: project.id, criteria: "Trabalho Colaborativo", weight: 30, level1: "Trabalho individual", level2: "Pouca colaboração", level3: "Boa colaboração", level4: "Excelente sinergia em equipe" },
      { projectId: project.id, criteria: "Apresentação e Comunicação", weight: 30, level1: "Apresentação deficiente", level2: "Comunicação básica", level3: "Boa comunicação", level4: "Comunicação excelente e criativa" },
    ];

    for (const r of rubrics) {
      await storage.createRubricCriteria(r);
    }
  }
  console.log("✅ Rubric criteria created");

  // Seed Classes
  const classesData: InsertClass[] = [
    { name: "1º Ano A", studentCount: 32, engagement: 75 },
    { name: "2º Ano B", studentCount: 28, engagement: 82 },
    { name: "3º Ano C", studentCount: 30, engagement: 68 },
  ];

  for (const c of classesData) {
    await storage.createClass(c);
  }
  console.log("✅ Classes created");

  // Seed Student Users
  const studentNames = ["Lucas Alves", "Julia Costa", "Pedro Santos"];
  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const name = studentNames[i];
    const user = await storage.createUser({
      email: `${name.toLowerCase().replace(' ', '.')}@aluno.com`,
      hashedPassword,
      role: "student",
      name: name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.split(' ')[0]}`,
    });

    const student = await storage.createStudent({
      userId: user.id,
      name: name,
      email: `${name.toLowerCase().replace(' ', '.')}@aluno.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.split(' ')[0]}`,
      xp: 1200 + (i * 300),
      level: 3 + i,
    });

    students.push(student);
  }
  console.log("✅ Students created");

  // Seed Achievements
  const achievementsData: InsertAchievement[] = [
    { title: "Primeira Entrega", description: "Complete sua primeira submissão", xp: 100, icon: "rocket" },
    { title: "Colaborador Ativo", description: "Participe de 10 projetos em equipe", xp: 250, icon: "users" },
    { title: "Pesquisador", description: "Realize pesquisas em 5 projetos", xp: 300, icon: "book-open" },
    { title: "Apresentador Expert", description: "Apresente 3 projetos com nota máxima", xp: 500, icon: "trophy" },
  ];

  const achievements = [];
  for (const a of achievementsData) {
    const achievement = await storage.createAchievement(a);
    achievements.push(achievement);
  }
  console.log("✅ Achievements created");

  // Seed Student Achievements
  for (const student of students) {
    for (let i = 0; i < achievements.length; i++) {
      const achievement = achievements[i];
      const progress = Math.floor(Math.random() * achievement.xp);
      const unlocked = progress >= achievement.xp;

      await storage.createStudentAchievement({
        studentId: student.id,
        achievementId: achievement.id,
        progress,
        total: achievement.xp,
        unlocked,
      });
    }
  }
  console.log("✅ Student achievements created");

  // Seed BNCC Competencies
  const competenciesData: InsertBnccCompetency[] = [
    { name: "Conhecimento", category: "Geral", description: "Valorizar e utilizar conhecimentos sobre o mundo" },
    { name: "Pensamento Científico", category: "Geral", description: "Exercitar a curiosidade intelectual" },
    { name: "Repertório Cultural", category: "Geral", description: "Valorizar as diversas manifestações artísticas" },
    { name: "Comunicação", category: "Geral", description: "Utilizar diferentes linguagens" },
  ];

  for (const c of competenciesData) {
    await storage.createCompetency(c);
  }
  console.log("✅ BNCC competencies created");

  console.log("🎉 Database seeded successfully!");
  console.log("\n📝 Demo credentials:");
  console.log("Coordinator: coordenador@escola.com / demo123");
  console.log("Teacher: ana@escola.com / demo123");
  console.log("Student: lucas.alves@aluno.com / demo123");
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
