import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (authentication)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password").notNull(),
  role: text("role").notNull(), // teacher, student, coordinator
  name: text("name").notNull(),
  avatar: text("avatar"),
});

// Coordinators table
export const coordinators = pgTable("coordinators", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
});

// Teachers table
export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  avatar: text("avatar"),
  rating: integer("rating").default(0),
});

// Projects table
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull(), // Planejamento, Em Andamento, Para Avaliação, Atrasado
  progress: integer("progress").notNull().default(0),
  students: integer("students").notNull().default(0),
  nextDeadline: text("next_deadline"),
  deadlineLabel: text("deadline_label"),
  theme: text("theme").notNull(), // green, blue, purple, red
  teacherId: varchar("teacher_id").notNull(),
  delayed: boolean("delayed").notNull().default(false),
  description: text("description"),
});

// Rubric Criteria table
export const rubricCriteria = pgTable("rubric_criteria", {
  id: varchar("id").primaryKey(),
  projectId: varchar("project_id").notNull(),
  criteria: text("criteria").notNull(),
  weight: integer("weight").notNull(),
  levels: text("levels").notNull().array(), // Array of level descriptions
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  xp: integer("xp").notNull(),
  icon: text("icon").notNull(),
});

// Student Achievements (progress tracking)
export const studentAchievements = pgTable("student_achievements", {
  id: varchar("id").primaryKey(),
  studentId: varchar("student_id").notNull(),
  achievementId: varchar("achievement_id").notNull(),
  progress: integer("progress").notNull().default(0),
  total: integer("total").notNull(),
  unlocked: boolean("unlocked").notNull().default(false),
});

// BNCC Competencies
export const bnccCompetencies = pgTable("bncc_competencies", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Geral, Específica
  description: text("description"),
});

// Project Competencies (mapping)
export const projectCompetencies = pgTable("project_competencies", {
  id: varchar("id").primaryKey(),
  projectId: varchar("project_id").notNull(),
  competencyId: varchar("competency_id").notNull(),
  coverage: integer("coverage").notNull().default(0), // 0-100%
});

// Submissions
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey(),
  projectId: varchar("project_id").notNull(),
  studentId: varchar("student_id").notNull(),
  type: text("type").notNull(), // file or link
  content: text("content").notNull(), // URL or file path
  comment: text("comment"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

// Classes (Turmas)
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  studentCount: integer("student_count").notNull().default(0),
  engagement: integer("engagement").notNull().default(0), // 0-100%
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCoordinatorSchema = createInsertSchema(coordinators).omit({ id: true });
export const insertTeacherSchema = createInsertSchema(teachers).omit({ id: true });
export const insertProjectSchema = createInsertSchema(projects).omit({ id: true });
export const insertRubricCriteriaSchema = createInsertSchema(rubricCriteria).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertStudentAchievementSchema = createInsertSchema(studentAchievements).omit({ id: true });
export const insertBnccCompetencySchema = createInsertSchema(bnccCompetencies).omit({ id: true });
export const insertProjectCompetencySchema = createInsertSchema(projectCompetencies).omit({ id: true });
export const insertSubmissionSchema = createInsertSchema(submissions).omit({ id: true });
export const insertClassSchema = createInsertSchema(classes).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Coordinator = typeof coordinators.$inferSelect;
export type InsertCoordinator = z.infer<typeof insertCoordinatorSchema>;

export type Teacher = typeof teachers.$inferSelect;
export type InsertTeacher = z.infer<typeof insertTeacherSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type RubricCriteria = typeof rubricCriteria.$inferSelect;
export type InsertRubricCriteria = z.infer<typeof insertRubricCriteriaSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type StudentAchievement = typeof studentAchievements.$inferSelect;
export type InsertStudentAchievement = z.infer<typeof insertStudentAchievementSchema>;

export type BnccCompetency = typeof bnccCompetencies.$inferSelect;
export type InsertBnccCompetency = z.infer<typeof insertBnccCompetencySchema>;

export type ProjectCompetency = typeof projectCompetencies.$inferSelect;
export type InsertProjectCompetency = z.infer<typeof insertProjectCompetencySchema>;

export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

// Extended types for UI (with joined data)
export type ProjectWithTeacher = Project & { teacherName: string };
export type StudentAchievementWithDetails = StudentAchievement & { achievementTitle: string; achievementDescription: string; achievementXp: number; achievementIcon: string };
