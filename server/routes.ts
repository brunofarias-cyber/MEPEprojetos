import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { extractCompetenciesFromText, analyzeProjectAlignment, analyzeProjectPlanning } from "./services/bnccAiService";

const JWT_SECRET = process.env.SESSION_SECRET || 'fallback-secret-change-in-production';
import {
  insertUserSchema,
  insertProjectSchema,
  insertProjectPlanningSchema,
  insertTeacherSchema,
  insertRubricCriteriaSchema,
  insertStudentSchema,
  insertAchievementSchema,
  insertStudentAchievementSchema,
  insertBnccCompetencySchema,
  insertProjectCompetencySchema,
  insertSubmissionSchema,
  insertClassSchema,
  insertFeedbackSchema,
  insertEventSchema,
  insertAttendanceSchema,
  insertStudentClassSchema,
  insertTeamSchema,
  insertBnccDocumentSchema,
  insertEvaluationSchema,
  insertEvaluationScoreSchema,
  insertPortfolioItemSchema,
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads (memory storage for PDF processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Configure multer for spreadsheet uploads (Excel/CSV)
const uploadSpreadsheet = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/csv', // .csv
    ];
    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos Excel (.xls, .xlsx) ou CSV são permitidos'));
    }
  },
});

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const registerSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(1),
        role: z.enum(["teacher", "student", "coordinator"]),
        subject: z.string().optional(), // for teachers
      });

      const data = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ error: "Email já está em uso" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 10);

      // Create user
      const user = await storage.createUser({
        email: data.email,
        hashedPassword,
        role: data.role,
        name: data.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      });

      // Create role-specific record
      if (data.role === "teacher") {
        await storage.createTeacher({
          userId: user.id,
          name: data.name,
          subject: data.subject || "Não especificado",
          avatar: user.avatar,
          rating: 0,
        });
      } else if (data.role === "student") {
        await storage.createStudent({
          userId: user.id,
          name: data.name,
          email: data.email,
          avatar: user.avatar,
          xp: 0,
          level: 1,
        });
      } else if (data.role === "coordinator") {
        await storage.createCoordinator({
          userId: user.id,
          name: data.name,
          avatar: user.avatar,
        });
      }

      res.status(201).json({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      console.log("[LOGIN] Request received:", {
        headers: req.headers,
        body: req.body,
        rawBody: JSON.stringify(req.body)
      });

      const loginSchema = z.object({
        email: z.string().email(),
        password: z.string(),
      });

      const data = loginSchema.parse(req.body);
      console.log("[LOGIN] Parsed data:", data);

      // Find user
      const user = await storage.getUserByEmail(data.email);
      console.log("[LOGIN] User found:", user ? { id: user.id, email: user.email, hasHash: !!user.hashedPassword } : "null");
      if (!user) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Verify password
      const validPassword = await bcrypt.compare(data.password, user.hashedPassword);
      if (!validPassword) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }

      // Get role-specific data
      let roleData = null;
      if (user.role === "teacher") {
        roleData = await storage.getTeacherByUserId(user.id);
      } else if (user.role === "student") {
        roleData = await storage.getStudentByUserId(user.id);
      } else if (user.role === "coordinator") {
        roleData = await storage.getCoordinatorByUserId(user.id);
      }

      // Store user in session
      req.session.userId = user.id;
      console.log("[LOGIN] Session after save:", {
        sessionID: req.sessionID,
        userId: req.session.userId,
        cookie: req.session.cookie
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Force save session before sending response
      req.session.save((err) => {
        if (err) {
          console.error("[LOGIN] Session save error:", err);
          return res.status(500).json({ error: "Erro ao salvar sessão" });
        }
        console.log("[LOGIN] Session saved successfully, sending response with token");
        res.json({
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          avatar: user.avatar,
          roleData,
          token, // Include token in response
        });
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao fazer logout" });
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.status(204).send();
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    console.log("[/api/auth/me] Request received:", {
      sessionID: req.sessionID,
      userId: req.session.userId,
      cookie: req.session.cookie,
      headers: req.headers.cookie
    });
    const userId = req.session.userId;
    if (!userId) {
      console.log("[/api/auth/me] No userId in session, returning 401");
      return res.status(401).json({ error: "Não autenticado" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Get role-specific data
    let roleData = null;
    if (user.role === "teacher") {
      roleData = await storage.getTeacherByUserId(user.id);
    } else if (user.role === "student") {
      roleData = await storage.getStudentByUserId(user.id);
    } else if (user.role === "coordinator") {
      roleData = await storage.getCoordinatorByUserId(user.id);
    }

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      roleData,
    });
  });

  // Get current teacher data
  app.get("/api/me/teacher", async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    if (user.role !== "teacher") {
      return res.status(403).json({ error: "Acesso permitido apenas para professores" });
    }

    const teacher = await storage.getTeacherByUserId(user.id);
    if (!teacher) {
      return res.status(404).json({ error: "Dados do professor não encontrados" });
    }

    res.json(teacher);
  });

  // Existing routes below...
  // Teachers
  app.get("/api/teachers", async (req, res) => {
    const teachers = await storage.getTeachers();
    res.json(teachers);
  });

  app.get("/api/teachers/:id", async (req, res) => {
    const teacher = await storage.getTeacher(req.params.id);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });
    res.json(teacher);
  });

  app.get("/api/teachers/me/pending-actions", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Acesso permitido apenas para professores" });
      }

      const teacher = await storage.getTeacherByUserId(req.user.id);
      if (!teacher) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }

      const pendingActions = await storage.getPendingActions(teacher.id);
      res.json(pendingActions);
    } catch (error: any) {
      console.error("[Pending Actions] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teachers", async (req, res) => {
    try {
      const data = insertTeacherSchema.parse(req.body);
      const teacher = await storage.createTeacher(data);
      res.status(201).json(teacher);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/teachers/:id", async (req, res) => {
    try {
      const data = insertTeacherSchema.partial().parse(req.body);
      const teacher = await storage.updateTeacher(req.params.id, data);
      if (!teacher) return res.status(404).json({ error: "Teacher not found" });
      res.json(teacher);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Projects
  app.get("/api/projects", async (req, res) => {
    const projects = await storage.getProjectsWithTeacher();
    res.json(projects);
  });

  app.get("/api/projects/:id", async (req, res) => {
    const project = await storage.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const teacher = await storage.getTeacher(project.teacherId);
    res.json({
      ...project,
      teacherName: teacher?.name || "Unknown",
    });
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, data);
      if (!project) return res.status(404).json({ error: "Project not found" });
      res.json(project);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    const deleted = await storage.deleteProject(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.status(204).send();
  });

  // Project Planning
  app.get("/api/projects/:id/planning", async (req, res) => {
    try {
      const planning = await storage.getProjectPlanning(req.params.id);
      if (!planning) {
        // Return empty planning object if not found
        return res.json({
          projectId: req.params.id,
          objectives: null,
          methodology: null,
          resources: null,
          timeline: null,
          expectedOutcomes: null,
        });
      }
      res.json(planning);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/projects/:id/planning", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Apenas professores podem criar planejamento" });
      }

      const data = insertProjectPlanningSchema.parse({
        ...req.body,
        projectId: req.params.id,
      });

      // Check if planning already exists
      const existing = await storage.getProjectPlanning(req.params.id);
      if (existing) {
        return res.status(400).json({ error: "Planejamento já existe para este projeto" });
      }

      const planning = await storage.createProjectPlanning(data);
      res.status(201).json(planning);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/projects/:id/planning", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Apenas professores podem atualizar planejamento" });
      }

      const data = insertProjectPlanningSchema.partial().parse(req.body);
      const planning = await storage.updateProjectPlanning(req.params.id, data);

      if (!planning) {
        return res.status(404).json({ error: "Planejamento não encontrado" });
      }

      res.json(planning);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // AI Analysis for Project Planning
  app.post("/api/projects/:id/planning/analyze", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Apenas professores podem analisar projetos" });
      }

      // Get project and planning
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Projeto não encontrado" });
      }

      const planning = await storage.getProjectPlanning(req.params.id);
      if (!planning) {
        return res.status(404).json({ error: "Planejamento não encontrado. Salve o planejamento antes de analisar." });
      }

      // Get available BNCC competencies
      const competencies = await storage.getCompetencies();
      if (competencies.length === 0) {
        return res.status(400).json({ error: "Nenhuma competência BNCC cadastrada. Faça o upload de um documento BNCC primeiro." });
      }

      // Run AI analysis
      const suggestions = await analyzeProjectPlanning(
        project.title,
        project.subject,
        {
          objectives: planning.objectives || undefined,
          methodology: planning.methodology || undefined,
          resources: planning.resources || undefined,
          timeline: planning.timeline || undefined,
          expectedOutcomes: planning.expectedOutcomes || undefined,
        },
        competencies
      );

      // Enrich suggestions with full competency objects
      const enrichedSuggestions = suggestions.map(s => {
        const competency = competencies.find(c => c.id === s.competencyId);
        return {
          competency,
          coverage: s.coverage,
          justification: s.justification,
        };
      }).filter(s => s.competency !== undefined); // Remove any suggestions without valid competency

      res.json({ suggestions: enrichedSuggestions });
    } catch (error: any) {
      console.error("[AI Analysis Error]:", error);
      res.status(500).json({ error: error.message || "Erro ao analisar projeto" });
    }
  });

  // Rubric Criteria
  app.get("/api/rubrics/:projectId", async (req, res) => {
    const criteria = await storage.getRubricCriteria(req.params.projectId);
    res.json(criteria);
  });

  app.post("/api/rubrics", async (req, res) => {
    try {
      const data = insertRubricCriteriaSchema.parse(req.body);
      const criteria = await storage.createRubricCriteria(data);
      res.status(201).json(criteria);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/rubrics/:id", async (req, res) => {
    try {
      const data = insertRubricCriteriaSchema.partial().parse(req.body);
      const criteria = await storage.updateRubricCriteria(req.params.id, data);
      if (!criteria) return res.status(404).json({ error: "Rubric criteria not found" });
      res.json(criteria);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/rubrics/:id", async (req, res) => {
    const deleted = await storage.deleteRubricCriteria(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Rubric criteria not found" });
    res.status(204).send();
  });

  // Students
  app.get("/api/students", async (req, res) => {
    const students = await storage.getStudents();
    res.json(students);
  });

  app.get("/api/students/:id", async (req, res) => {
    const student = await storage.getStudent(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  });

  app.post("/api/students", async (req, res) => {
    try {
      const data = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(data);
      res.status(201).json(student);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/students/:id", async (req, res) => {
    try {
      const data = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, data);
      if (!student) return res.status(404).json({ error: "Student not found" });
      res.json(student);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Achievements
  app.get("/api/achievements", async (req, res) => {
    const achievements = await storage.getAchievements();
    res.json(achievements);
  });

  app.get("/api/achievements/:id", async (req, res) => {
    const achievement = await storage.getAchievement(req.params.id);
    if (!achievement) return res.status(404).json({ error: "Achievement not found" });
    res.json(achievement);
  });

  app.post("/api/achievements", async (req, res) => {
    try {
      const data = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(data);
      res.status(201).json(achievement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/achievements/:id", async (req, res) => {
    try {
      const data = insertAchievementSchema.partial().parse(req.body);
      const achievement = await storage.updateAchievement(req.params.id, data);
      if (!achievement) return res.status(404).json({ error: "Achievement not found" });
      res.json(achievement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Student Achievements
  app.get("/api/students/:studentId/achievements", async (req, res) => {
    const achievements = await storage.getStudentAchievements(req.params.studentId);
    res.json(achievements);
  });

  app.post("/api/student-achievements", async (req, res) => {
    try {
      const data = insertStudentAchievementSchema.parse(req.body);
      const studentAchievement = await storage.createStudentAchievement(data);
      res.status(201).json(studentAchievement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/student-achievements/:id", async (req, res) => {
    try {
      const data = insertStudentAchievementSchema.partial().parse(req.body);
      const progress = data.progress ?? 0;
      const unlocked = data.unlocked ?? false;
      const achievement = await storage.updateStudentAchievement(req.params.id, progress, unlocked);
      if (!achievement) return res.status(404).json({ error: "Student achievement not found" });
      res.json(achievement);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // BNCC Competencies
  app.get("/api/competencies", async (req, res) => {
    const competencies = await storage.getCompetencies();
    res.json(competencies);
  });

  app.get("/api/competencies/:id", async (req, res) => {
    const competency = await storage.getCompetency(req.params.id);
    if (!competency) return res.status(404).json({ error: "Competency not found" });
    res.json(competency);
  });

  app.post("/api/competencies", async (req, res) => {
    try {
      const data = insertBnccCompetencySchema.parse(req.body);
      const competency = await storage.createCompetency(data);
      res.status(201).json(competency);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/competencies/:id", async (req, res) => {
    try {
      const data = insertBnccCompetencySchema.partial().parse(req.body);
      const competency = await storage.updateCompetency(req.params.id, data);
      if (!competency) return res.status(404).json({ error: "Competency not found" });
      res.json(competency);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Project Competencies
  app.get("/api/projects/:projectId/competencies", async (req, res) => {
    const competencies = await storage.getProjectCompetenciesWithDetails(req.params.projectId);
    res.json(competencies);
  });

  app.post("/api/projects/:projectId/competencies", async (req, res) => {
    try {
      // Validate authentication
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      // Validate teacher role
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Apenas professores podem vincular competências" });
      }

      const { projectId } = req.params;
      const { competencies } = req.body;

      if (!Array.isArray(competencies)) {
        return res.status(400).json({ error: "competencies deve ser um array" });
      }

      // Validate project exists and belongs to teacher
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Projeto não encontrado" });
      }

      const teacher = await storage.getTeacherByUserId(req.user.id);
      if (!teacher) {
        return res.status(404).json({ error: "Professor não encontrado" });
      }

      if (project.teacherId !== teacher.id) {
        return res.status(403).json({ error: "Você não tem permissão para modificar este projeto" });
      }

      // Replace existing competencies with new ones (transactional)
      const competenciesToInsert = competencies.map((comp: any) => ({
        projectId,
        competencyId: comp.competencyId,
        coverage: comp.coverage,
      }));

      const results = await storage.replaceProjectCompetencies(projectId, competenciesToInsert);

      res.status(201).json(results);
    } catch (error: any) {
      console.error("[Project Competencies] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/project-competencies", async (req, res) => {
    try {
      const data = insertProjectCompetencySchema.parse(req.body);
      const projectCompetency = await storage.createProjectCompetency(data);
      res.status(201).json(projectCompetency);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Submissions
  app.get("/api/projects/:projectId/submissions", async (req, res) => {
    const submissions = await storage.getSubmissions(req.params.projectId);
    res.json(submissions);
  });

  app.post("/api/submissions", async (req, res) => {
    try {
      const data = insertSubmissionSchema.parse(req.body);
      const submission = await storage.createSubmission(data);

      // Track achievements
      if (submission.studentId) {
        // First submission achievement
        await storage.trackAchievementProgress(submission.studentId, 'ach-primeira-entrega', 1, 1);

        // Master of projects (complete 10 projects)
        await storage.trackAchievementProgress(submission.studentId, 'ach-mestre-projetos', 1, 10);
      }

      res.status(201).json(submission);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Grade submission
  app.post("/api/submissions/:id/grade", async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Apenas professores podem avaliar submissões" });
      }

      const { grade, feedback } = req.body;
      const submission = await storage.gradeSubmission(req.params.id, grade, feedback);

      if (!submission) {
        return res.status(404).json({ error: "Submission not found" });
      }

      const achievementsUnlocked: string[] = [];

      // Track grade-based achievements
      if (submission.studentId && grade !== null && grade !== undefined) {
        // Perfect score (100)
        if (grade === 100) {
          const result = await storage.trackAchievementProgress(submission.studentId, 'ach-perfeccionista', 1, 1);
          if (result.unlocked) achievementsUnlocked.push('Perfeccionista');
        }

        // Excellence (grade above 90, 5 times)
        if (grade >= 90) {
          const result = await storage.trackAchievementProgress(submission.studentId, 'ach-excelencia', 1, 5);
          if (result.unlocked) achievementsUnlocked.push('Excelência');
        }

        // Good student (average above 80, 3 consecutive projects)
        if (grade >= 80) {
          const result = await storage.trackAchievementProgress(submission.studentId, 'ach-bom-aluno', 1, 3);
          if (result.unlocked) achievementsUnlocked.push('Bom Aluno');
        }
      }

      res.json({
        submission,
        achievementsUnlocked: achievementsUnlocked.length > 0 ? achievementsUnlocked : undefined
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Project Students
  app.get("/api/projects/:id/students", async (req, res) => {
    try {
      const students = await storage.getProjectStudents(req.params.id);
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Attendance
  app.post("/api/attendance", async (req, res) => {
    try {
      const data = insertAttendanceSchema.parse(req.body);
      const attendance = await storage.createAttendance(data);
      res.status(201).json(attendance);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/attendance/:classId", async (req, res) => {
    try {
      const { date } = req.query;
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: "Date parameter is required" });
      }
      const attendance = await storage.getAttendanceByClass(req.params.classId, date);
      res.json(attendance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Analysis for Submissions
  app.post("/api/submissions/:id/analyze", async (req, res) => {
    try {
      // Mock AI Analysis for now
      // In a real implementation, this would call an AI service to analyze the submission content
      // against the BNCC competencies and project rubrics.

      const submissionId = req.params.id;
      // Fetch submission details if needed

      // Mock response
      const analysis = {
        grade: 85,
        feedback: "O trabalho demonstra um bom entendimento dos conceitos. A estrutura está clara e os objetivos foram alcançados. Sugiro aprofundar um pouco mais na metodologia.",
        bnccAlignment: [
          { competency: "Pensamento Científico, Crítico e Criativo", score: 90 },
          { competency: "Comunicação", score: 80 }
        ]
      };

      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== TEAMS =====
  app.get("/api/projects/:projectId/teams", async (req, res) => {
    try {
      const teams = await storage.getTeamsByProject(req.params.projectId);
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const data = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(data);
      res.status(201).json(team);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const data = insertTeamSchema.partial().parse(req.body);
      const team = await storage.updateTeam(req.params.id, data);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.json(team);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/teams/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTeam(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Team not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Team Members
  app.get("/api/teams/:teamId/members", async (req, res) => {
    try {
      const members = await storage.getTeamMembers(req.params.teamId);
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teams/:teamId/members", async (req, res) => {
    try {
      const { studentId, role } = req.body;
      const member = await storage.addStudentToTeam(req.params.teamId, studentId, role);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/teams/:teamId/members/:studentId", async (req, res) => {
    try {
      const deleted = await storage.removeStudentFromTeam(req.params.teamId, req.params.studentId);
      if (!deleted) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ===== EVALUATIONS =====
  app.get("/api/projects/:projectId/evaluations", async (req, res) => {
    try {
      const evaluations = await storage.getEvaluationsByProject(req.params.projectId);
      res.json(evaluations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/evaluations", async (req, res) => {
    try {
      const { scores, ...evaluationData } = req.body;

      // Create evaluation
      const data = insertEvaluationSchema.parse(evaluationData);
      const evaluation = await storage.createEvaluation(data);

      // Save scores if provided
      if (scores && Array.isArray(scores)) {
        await storage.saveEvaluationScores(evaluation.id, scores);
      }

      res.status(201).json(evaluation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/evaluations/:id", async (req, res) => {
    try {
      const evaluation = await storage.getEvaluationsByProject(req.params.id);
      if (!evaluation) {
        return res.status(404).json({ error: "Evaluation not found" });
      }

      // Include scores
      const scores = await storage.getEvaluationScores(req.params.id);
      res.json({ ...evaluation, scores });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/evaluations/:id", async (req, res) => {
    try {
      const { scores, ...updateData } = req.body;

      // Update evaluation
      const data = insertEvaluationSchema.partial().parse(updateData);
      const evaluation = await storage.updateEvaluation(req.params.id, data);

      if (!evaluation) {
        return res.status(404).json({ error: "Evaluation not found" });
      }

      // Update scores if provided
      if (scores && Array.isArray(scores)) {
        await storage.saveEvaluationScores(req.params.id, scores);
      }

      res.json(evaluation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/evaluations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEvaluation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Evaluation not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/feedbacks/project/:projectId", async (req, res) => {
    const feedbacks = await storage.getFeedbacksByProject(req.params.projectId);
    res.json(feedbacks);
  });

  // Classes
  app.get("/api/classes", async (req, res) => {
    const classes = await storage.getClasses();
    res.json(classes);
  });

  app.get("/api/classes/:id", async (req, res) => {
    const classData = await storage.getClass(req.params.id);
    if (!classData) return res.status(404).json({ error: "Class not found" });
    res.json(classData);
  });

  app.post("/api/classes", async (req, res) => {
    try {
      const data = insertClassSchema.parse(req.body);
      const classData = await storage.createClass(data);
      res.status(201).json(classData);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Get students by class
  app.get("/api/classes/:classId/students", async (req, res) => {
    try {
      const students = await storage.getStudentsByClass(req.params.classId);
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Student Classes (Enrollments)
  app.post("/api/classes/:id/students", async (req, res) => {
    try {
      const data = insertStudentClassSchema.parse({
        ...req.body,
        classId: req.params.id,
      });
      const studentClass = await storage.addStudentToClass(data);
      res.status(201).json(studentClass);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/classes/:id/students/:studentId", async (req, res) => {
    try {
      await storage.removeStudentFromClass(req.params.id, req.params.studentId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/classes/:id/students", async (req, res) => {
    try {
      const students = await storage.getStudentsByClass(req.params.id);
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teachers/:id/classes", async (req, res) => {
    const classes = await storage.getClassesByTeacher(req.params.id);
    res.json(classes);
  });

  // Spreadsheet import endpoint for students
  app.post("/api/students/import-spreadsheet", uploadSpreadsheet.single('file'), async (req, res) => {
    try {
      // Validate authentication - check both req.user (JWT) and session
      let userId = req.user?.id || req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      // Get user to check role
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      // Only teachers and coordinators can import students
      if (user.role !== 'teacher' && user.role !== 'coordinator') {
        return res.status(403).json({ error: "Apenas professores e coordenadores podem importar alunos" });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo foi enviado" });
      }

      console.log("[Spreadsheet Import] Processing file:", req.file.originalname);

      // Parse spreadsheet
      let workbook: XLSX.WorkBook;
      try {
        workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      } catch (error: any) {
        return res.status(400).json({ error: "Erro ao ler planilha: " + error.message });
      }

      // Get first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (rawData.length === 0) {
        return res.status(400).json({ error: "A planilha está vazia" });
      }

      console.log("[Spreadsheet Import] Found", rawData.length, "rows");
      console.log("[Spreadsheet Import] First row keys:", Object.keys(rawData[0]));

      // Auto-detect columns (case-insensitive, flexible matching with normalization)
      const firstRow = rawData[0];
      const originalKeys = Object.keys(firstRow);

      // Normalize column names: lowercase, remove accents, trim
      const normalizeString = (str: string) => {
        return str.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove diacritics
          .trim();
      };

      const normalizedKeys = originalKeys.map(normalizeString);

      // Find column mappings with normalized comparisons
      const nameIndex = normalizedKeys.findIndex(k =>
        k.includes('nome') || k.includes('name') || k.includes('aluno') || k.includes('student')
      );
      const emailIndex = normalizedKeys.findIndex(k =>
        k.includes('email') || k.includes('e-mail') || k === 'email'
      );
      const classIndex = normalizedKeys.findIndex(k =>
        k.includes('turma') || k.includes('class') || k.includes('sala')
      );

      if (nameIndex === -1 || emailIndex === -1) {
        return res.status(400).json({
          error: "Planilha deve conter colunas 'Nome' e 'Email' (colunas detectadas: " + originalKeys.join(', ') + ")"
        });
      }

      // Get original column names using indices
      const nameKey = originalKeys[nameIndex];
      const emailKey = originalKeys[emailIndex];
      const classKey = classIndex !== -1 ? originalKeys[classIndex] : null;

      console.log("[Spreadsheet Import] Column mapping:", { nameKey, emailKey, classKey });

      // Process students
      const results = {
        total: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[],
      };

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const name = row[nameKey]?.toString().trim();
        const email = row[emailKey]?.toString().trim().toLowerCase();
        const className = classKey ? row[classKey]?.toString().trim() : null;

        results.total++;

        // Validate required fields
        if (!name || !email) {
          results.skipped++;
          results.errors.push(`Linha ${i + 2}: Nome ou email vazio`);
          continue;
        }

        // Validate email format
        if (!email.includes('@')) {
          results.skipped++;
          results.errors.push(`Linha ${i + 2}: Email inválido (${email})`);
          continue;
        }

        try {
          // Check if user already exists
          const existingUser = await storage.getUserByEmail(email);

          if (existingUser) {
            // User exists - update student if needed
            if (existingUser.role === 'student') {
              results.updated++;
              console.log(`[Import] Existing student: ${email}`);
            } else {
              results.skipped++;
              results.errors.push(`Linha ${i + 2}: Email ${email} já está em uso por um ${existingUser.role}`);
            }
          } else {
            // Create new user and student
            const hashedPassword = await bcrypt.hash('123456', 10); // Default password

            const user = await storage.createUser({
              email,
              hashedPassword,
              name,
              role: 'student',
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            });

            await storage.createStudent({
              userId: user.id,
              name,
              email,
              avatar: user.avatar,
              xp: 0,
              level: 1,
            });

            results.created++;
            console.log(`[Import] Created student: ${email}`);
          }
        } catch (error: any) {
          results.skipped++;
          results.errors.push(`Linha ${i + 2}: ${error.message}`);
        }
      }

      console.log("[Spreadsheet Import] Complete:", results);

      res.json({
        success: true,
        message: `Importação concluída: ${results.created} criados, ${results.updated} atualizados, ${results.skipped} ignorados`,
        results,
      });
    } catch (error: any) {
      console.error("[Spreadsheet Import] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // BNCC Competencies Routes (All authenticated users can view)
  app.get("/api/bncc-competencies", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const competencies = await storage.getCompetencies();
    res.json(competencies);
  });

  // Portfolio Routes

  // Get student portfolio (Public)
  app.get("/api/students/:id/portfolio", async (req, res) => {
    const studentId = req.params.id;
    const student = await storage.getStudent(studentId);

    if (!student) {
      return res.status(404).json({ error: "Estudante não encontrado" });
    }

    if (!student.portfolioVisible) {
      // If user is the student themselves or a teacher/coordinator, allow access
      const canAccess = req.user && (
        req.user.id === student.userId ||
        req.user.role === 'teacher' ||
        req.user.role === 'coordinator'
      );

      if (!canAccess) {
        return res.status(403).json({ error: "Este portfolio é privado" });
      }
    }

    const items = await storage.getPortfolioItems(studentId);
    res.json({
      student: {
        name: student.name,
        avatar: student.avatar,
        bio: student.portfolioBio,
        slug: student.portfolioSlug,
      },
      items
    });
  });

  // Get portfolio by slug (Public)
  app.get("/api/portfolio/:slug", async (req, res) => {
    const slug = req.params.slug;
    const student = await storage.getStudentByPortfolioSlug(slug);

    if (!student) {
      return res.status(404).json({ error: "Portfolio não encontrado" });
    }

    if (!student.portfolioVisible) {
      return res.status(403).json({ error: "Este portfolio é privado" });
    }

    const items = await storage.getPortfolioItems(student.id);
    res.json({
      student: {
        name: student.name,
        avatar: student.avatar,
        bio: student.portfolioBio,
        slug: student.portfolioSlug,
      },
      items
    });
  });

  // Add item to portfolio (Student only)
  app.post("/api/portfolio/items", async (req, res) => {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: "Apenas estudantes podem gerenciar seu portfolio" });
    }

    const student = await storage.getStudentByUserId(req.user.id);
    if (!student) return res.status(404).json({ error: "Estudante não encontrado" });

    const schema = insertPortfolioItemSchema.extend({
      studentId: z.string().optional(), // We'll set this from session
    });

    const parseResult = schema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json(parseResult.error);
    }

    // Verify submission belongs to student
    const submissions = await storage.getSubmissionsByStudent(student.id);
    const submission = submissions.find(s => s.id === parseResult.data.submissionId);

    if (!submission) {
      return res.status(403).json({ error: "Submissão inválida ou não pertence ao aluno" });
    }

    const item = await storage.addToPortfolio({
      ...parseResult.data,
      studentId: student.id,
    });

    res.status(201).json(item);
  });

  // Remove item from portfolio (Student only)
  app.delete("/api/portfolio/items/:id", async (req, res) => {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: "Apenas estudantes podem gerenciar seu portfolio" });
    }

    const student = await storage.getStudentByUserId(req.user.id);
    if (!student) return res.status(404).json({ error: "Estudante não encontrado" });

    const items = await storage.getPortfolioItems(student.id);
    const item = items.find(i => i.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: "Item não encontrado no portfolio" });
    }

    await storage.removeFromPortfolio(req.params.id);
    res.sendStatus(204);
  });

  // Update portfolio settings (Student only)
  app.patch("/api/students/:id/portfolio-settings", async (req, res) => {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({ error: "Apenas estudantes podem gerenciar seu portfolio" });
    }

    const student = await storage.getStudentByUserId(req.user.id);
    if (!student || student.id !== req.params.id) {
      return res.status(403).json({ error: "Não autorizado" });
    }

    const updatedStudent = await storage.updateStudent(student.id, {
      portfolioSlug: req.body.slug,
      portfolioVisible: req.body.visible,
      portfolioBio: req.body.bio,
    });

    res.json(updatedStudent);
  });

  // Get student submissions (Protected)
  app.get("/api/students/:id/submissions", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Não autenticado" });

    // Allow student to see own submissions, or teacher/coordinator
    if (req.user.role === 'student' && req.user.id !== req.params.id) {
      // Check if user.id matches the student's user_id. 
      // req.params.id is student.id (uuid), req.user.id is user.id (uuid)
      // We need to get student first to check ownership
      const student = await storage.getStudent(req.params.id);
      if (!student || student.userId !== req.user.id) {
        return res.status(403).json({ error: "Não autorizado" });
      }
    }

    const submissions = await storage.getSubmissionsByStudent(req.params.id);

    // Enrich with project details
    const submissionsWithProject = await Promise.all(submissions.map(async (sub) => {
      const project = await storage.getProject(sub.projectId);
      return { ...sub, project };
    }));

    res.json(submissionsWithProject);
  });

  // Analytics Routes (Coordinator only)
  app.get("/api/analytics/overview", async (req, res) => {
    if (!req.user || req.user.role !== 'coordinator') {
      return res.status(403).json({ error: "Acesso restrito a coordenadores" });
    }
    const data = await storage.getAnalyticsOverview();
    res.json(data);
  });

  app.get("/api/analytics/engagement", async (req, res) => {
    if (!req.user || req.user.role !== 'coordinator') {
      return res.status(403).json({ error: "Acesso restrito a coordenadores" });
    }
    const data = await storage.getEngagementMetrics();
    res.json(data);
  });

  app.get("/api/analytics/bncc", async (req, res) => {
    if (!req.user || req.user.role !== 'coordinator') {
      return res.status(403).json({ error: "Acesso restrito a coordenadores" });
    }
    const data = await storage.getBnccUsage();
    res.json(data);
  });

  app.get("/api/analytics/at-risk-students", async (req, res) => {
    if (!req.user || req.user.role !== 'coordinator') {
      return res.status(403).json({ error: "Acesso restrito a coordenadores" });
    }
    const data = await storage.getAtRiskStudents();
    res.json(data);
  });

  // BNCC Document Routes (Coordinator-only)
  app.get("/api/bncc-documents", async (req, res) => {
    // Validate authentication
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    // Validate coordinator role
    if (req.user.role !== 'coordinator') {
      return res.status(403).json({ error: "Apenas coordenadores podem acessar documentos BNCC" });
    }

    const documents = await storage.getBnccDocuments();
    res.json(documents);
  });

  app.post("/api/bncc-documents/upload", upload.single('pdf'), async (req, res) => {
    try {
      // Validate authentication
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      // Validate coordinator role
      if (req.user.role !== 'coordinator') {
        return res.status(403).json({ error: "Apenas coordenadores podem fazer upload de documentos BNCC" });
      }

      // Validate file upload
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo foi enviado" });
      }

      // Get coordinator ID from user
      const coordinator = await storage.getCoordinatorByUserId(req.user.id);
      if (!coordinator) {
        return res.status(404).json({ error: "Coordenador não encontrado" });
      }

      console.log("[BNCC Upload] Processing PDF:", req.file.originalname);

      // Extract text from PDF using pdf-parse v2 API
      let textContent: string;
      try {
        const parser = new PDFParse({ data: req.file.buffer });
        const result = await parser.getText();
        await parser.destroy();
        textContent = result.text;
        console.log("[BNCC Upload] PDF text extracted, length:", textContent.length);
      } catch (pdfError: any) {
        console.error("[BNCC Upload] PDF parsing failed:", pdfError);
        return res.status(400).json({ error: "Erro ao processar PDF: " + pdfError.message });
      }

      // Create document record with processing status
      const document = await storage.createBnccDocument({
        filename: req.file.originalname,
        uploadedBy: coordinator.id,
        textContent,
        processingStatus: "processing",
        competenciesExtracted: 0,
      });

      console.log("[BNCC Upload] Document record created:", document.id, "- starting AI extraction...");

      // Start async AI processing (don't block the response)
      (async () => {
        try {
          const extractedCompetencies = await extractCompetenciesFromText(textContent);
          console.log("[BNCC Upload] Extracted", extractedCompetencies.length, "competencies for document:", document.id);

          // Save extracted competencies to database with document linkage
          for (const comp of extractedCompetencies) {
            await storage.createCompetency({
              name: comp.name,
              category: comp.category,
              description: comp.description,
              documentId: document.id, // Link competency to source document
            });
          }

          // Update document status
          await storage.updateBnccDocument(document.id, {
            processingStatus: "completed",
            competenciesExtracted: extractedCompetencies.length,
          });

          console.log("[BNCC Upload] Processing completed successfully for document:", document.id);
        } catch (aiError) {
          console.error("[BNCC Upload] AI processing failed for document", document.id, ":", aiError);
          await storage.updateBnccDocument(document.id, {
            processingStatus: "failed",
          });
        }
      })();

      res.status(201).json(document);
    } catch (error: any) {
      console.error("[BNCC Upload] Unexpected error:", error);
      res.status(500).json({ error: "Erro interno do servidor: " + error.message });
    }
  });

  // Feedbacks
  app.get("/api/feedbacks/project/:projectId", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const feedbacks = await storage.getFeedbacksByProject(req.params.projectId);
    res.json(feedbacks);
  });

  app.post("/api/feedbacks", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      // Only teachers can create feedbacks
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Apenas professores podem criar feedbacks" });
      }

      const data = insertFeedbackSchema.parse(req.body);
      const feedback = await storage.createFeedback(data);
      res.status(201).json(feedback);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/feedbacks/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Apenas professores podem editar feedbacks" });
      }

      const { comment } = req.body;
      if (!comment) {
        return res.status(400).json({ error: "Comentário é obrigatório" });
      }

      const feedback = await storage.updateFeedback(req.params.id, comment);
      if (!feedback) return res.status(404).json({ error: "Feedback não encontrado" });
      res.json(feedback);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/feedbacks/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Apenas professores podem deletar feedbacks" });
    }

    const deleted = await storage.deleteFeedback(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Feedback não encontrado" });
    res.status(204).send();
  });

  // Events
  app.get("/api/events", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const events = await storage.getEvents();
    res.json(events);
  });

  app.get("/api/events/teacher/:teacherId", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const events = await storage.getEventsByTeacher(req.params.teacherId);
    res.json(events);
  });

  app.post("/api/events", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      // Only teachers can create events
      if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Apenas professores podem criar eventos" });
      }

      const data = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(data);

      // FIX: Automatically create event responses for students in the project
      if (event.projectId) {
        // 1. Get students from submissions
        const submissions = await storage.getSubmissionsByProject(event.projectId);
        const submissionStudentIds = submissions.map(s => s.studentId);

        // 2. Get students from teams
        const teams = await storage.getTeamsByProject(event.projectId);
        let teamStudentIds: string[] = [];
        for (const team of teams) {
          const members = await storage.getTeamMembers(team.id);
          teamStudentIds = [...teamStudentIds, ...members.map(m => m.id)];
        }

        // 3. Unique students
        const uniqueStudentIds = Array.from(new Set([...submissionStudentIds, ...teamStudentIds]));

        // 4. Create responses
        for (const studentId of uniqueStudentIds) {
          await storage.createEventResponse({
            eventId: event.id,
            studentId: studentId,
            status: 'pending',
          });
        }
      }

      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/events/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      if (req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Apenas professores podem editar eventos" });
      }

      const data = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(req.params.id, data);
      if (!event) return res.status(404).json({ error: "Evento não encontrado" });
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Apenas professores podem deletar eventos" });
    }

    const deleted = await storage.deleteEvent(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Evento não encontrado" });
    res.status(204).send();
  });

  // Notification endpoint
  app.post("/api/events/:id/notify", async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'teacher') {
        return res.status(403).json({ error: "Apenas professores podem enviar notificações" });
      }

      const event = await storage.getEvent(req.params.id);
      if (!event) return res.status(404).json({ error: "Evento não encontrado" });

      // Get students to notify
      let studentIds: string[] = [];

      if (event.projectId) {
        const submissions = await storage.getSubmissionsByProject(event.projectId);
        const teams = await storage.getTeamsByProject(event.projectId);

        const submissionStudentIds = submissions.map(s => s.studentId);
        let teamStudentIds: string[] = [];
        for (const team of teams) {
          const members = await storage.getTeamMembers(team.id);
          teamStudentIds = [...teamStudentIds, ...members.map(m => m.id)];
        }

        studentIds = Array.from(new Set([...submissionStudentIds, ...teamStudentIds]));
      }

      // Mock notification sending
      console.log(`Sending notifications to ${studentIds.length} students for event ${event.title}`);

      res.json({
        success: true,
        notifiedCount: studentIds.length,
        message: "Notificações enviadas com sucesso"
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Events for students (with responses)
  app.get("/api/events/student/:studentId", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const studentId = req.params.studentId;

      // FIX: Filter events relevant to the student

      // 1. Get student's projects (from submissions and teams)
      const submissions = await storage.getSubmissionsByStudent(studentId);
      const teams = await storage.getTeamsByStudent(studentId);

      const studentProjectIds = new Set([
        ...submissions.map(s => s.projectId),
        ...teams.map(t => t.projectId)
      ]);

      // 2. Get all events
      const allEvents = await storage.getEvents();

      // 3. Filter events
      const relevantEvents = allEvents.filter(event => {
        // Include if event is for one of the student's projects
        if (event.projectId && studentProjectIds.has(event.projectId)) {
          return true;
        }

        // Include if event has no project (general) - could be refined to check teacher
        if (!event.projectId) {
          return true;
        }

        return false;
      });

      const eventsWithResponses = [];

      for (const event of relevantEvents) {
        const response = await storage.getEventResponse(event.id, studentId);
        eventsWithResponses.push({
          ...event,
          responseStatus: response?.status || 'pending',
          respondedAt: response?.respondedAt || null,
        });
      }

      res.json(eventsWithResponses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Event response (accept/reject by student)
  app.post("/api/events/:eventId/response", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      if (req.user.role !== 'student') {
        return res.status(403).json({ error: "Apenas alunos podem responder a eventos" });
      }

      const { eventId } = req.params;
      const { studentId, status } = req.body;

      if (!['accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: "Status deve ser 'accepted' ou 'rejected'" });
      }

      // Check if response already exists
      const existing = await storage.getEventResponse(eventId, studentId);

      if (existing) {
        // Update existing response
        const updated = await storage.updateEventResponse(eventId, studentId, status);
        return res.json(updated);
      } else {
        // Create new response
        const response = await storage.createEventResponse({
          eventId,
          studentId,
          status,
        });
        return res.status(201).json(response);
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Events for coordinators (all events with statistics)
  app.get("/api/events/coordinator/all", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      if (req.user.role !== 'coordinator') {
        return res.status(403).json({ error: "Apenas coordenadores podem acessar esta rota" });
      }

      const events = await storage.getEvents();

      // Add response statistics to each event
      const eventsWithStats = await Promise.all(events.map(async (event) => {
        const responses = await storage.getEventResponsesByEvent(event.id);
        const accepted = responses.filter(r => r.status === 'accepted').length;
        const rejected = responses.filter(r => r.status === 'rejected').length;
        const pending = responses.filter(r => r.status === 'pending').length;

        // Get teacher name
        const teacher = await storage.getTeacher(event.teacherId);

        return {
          ...event,
          teacherName: teacher?.name || 'Desconhecido',
          statistics: {
            accepted,
            rejected,
            pending,
            total: responses.length,
          },
        };
      }));

      res.json(eventsWithStats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered project alignment analysis
  app.post("/api/projects/:id/analyze-alignment", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const competencies = await storage.getCompetencies();
      if (competencies.length === 0) {
        return res.status(400).json({ error: "No BNCC competencies available. Please upload the BNCC document first." });
      }

      console.log("[Project Alignment] Analyzing project:", project.title);

      const alignments = await analyzeProjectAlignment(
        project.title,
        project.subject,
        project.description,
        competencies
      );

      console.log("[Project Alignment] Found", alignments.length, "alignments");

      // Save alignments to database
      for (const alignment of alignments) {
        await storage.createProjectCompetency({
          projectId: project.id,
          competencyId: alignment.competencyId,
          coverage: alignment.coverage,
        });
      }

      res.json({ alignments });
    } catch (error: any) {
      console.error("[Project Alignment] Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
