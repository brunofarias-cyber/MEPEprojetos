import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
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

export async function registerRoutes(app: Express): Promise<Server> {
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
