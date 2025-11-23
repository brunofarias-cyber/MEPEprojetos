import type { Express } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

const JWT_SECRET = process.env.SESSION_SECRET || 'fallback-secret-change-in-production';
import { 
  insertUserSchema,
  insertProjectSchema, 
  insertTeacherSchema, 
  insertRubricCriteriaSchema,
  insertStudentSchema,
  insertAchievementSchema,
  insertStudentAchievementSchema,
  insertBnccCompetencySchema,
  insertProjectCompetencySchema,
  insertSubmissionSchema,
  insertClassSchema,
} from "@shared/schema";
import { z } from "zod";

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
    const competencies = await storage.getProjectCompetencies(req.params.projectId);
    res.json(competencies);
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
      res.status(201).json(submission);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
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

  const httpServer = createServer(app);
  return httpServer;
}
