import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
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
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  avatar: text("avatar"),
});

// Teachers table
export const teachers = pgTable("teachers", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
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
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  delayed: boolean("delayed").notNull().default(false),
  description: text("description"),
});

// Rubric Criteria table
export const rubricCriteria = pgTable("rubric_criteria", {
  id: varchar("id").primaryKey(),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  criteria: text("criteria").notNull(),
  weight: integer("weight").notNull(),
  level1: text("level1").notNull(),
  level2: text("level2").notNull(),
  level3: text("level3").notNull(),
  level4: text("level4").notNull(),
});

// Students table
export const students = pgTable("students", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
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
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: 'cascade' }),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id, { onDelete: 'cascade' }),
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
  documentId: varchar("document_id").references(() => bnccDocuments.id, { onDelete: 'cascade' }),
});

// Project Competencies (mapping)
export const projectCompetencies = pgTable("project_competencies", {
  id: varchar("id").primaryKey(),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  competencyId: varchar("competency_id").notNull().references(() => bnccCompetencies.id, { onDelete: 'cascade' }),
  coverage: integer("coverage").notNull().default(0), // 0-100%
});

// Submissions
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey(),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: 'cascade' }),
  studentId: varchar("student_id").notNull().references(() => students.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // file or link
  content: text("content").notNull(), // URL or file path
  comment: text("comment"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

// Classes (Turmas)
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  teacherId: varchar("teacher_id").notNull().references(() => teachers.id, { onDelete: 'cascade' }),
  studentCount: integer("student_count").notNull().default(0),
  engagement: integer("engagement").notNull().default(0), // 0-100%
});

// BNCC Documents (uploaded PDF files)
export const bnccDocuments = pgTable("bncc_documents", {
  id: varchar("id").primaryKey(),
  filename: text("filename").notNull(),
  uploadedBy: varchar("uploaded_by").notNull().references(() => coordinators.id, { onDelete: 'cascade' }),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  textContent: text("text_content"), // Extracted text from PDF
  processingStatus: text("processing_status").notNull().default("processing"), // processing, completed, failed
  competenciesExtracted: integer("competencies_extracted").default(0),
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
export const insertBnccDocumentSchema = createInsertSchema(bnccDocuments).omit({ id: true, uploadedAt: true });

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

export type BnccDocument = typeof bnccDocuments.$inferSelect;
export type InsertBnccDocument = z.infer<typeof insertBnccDocumentSchema>;

// Extended types for UI (with joined data)
export type ProjectWithTeacher = Project & { teacherName: string };
export type StudentAchievementWithDetails = StudentAchievement & { achievementTitle: string; achievementDescription: string; achievementXp: number; achievementIcon: string };

// Drizzle Relations
export const usersRelations = relations(users, ({ one }) => ({
  teacher: one(teachers, { fields: [users.id], references: [teachers.userId] }),
  student: one(students, { fields: [users.id], references: [students.userId] }),
  coordinator: one(coordinators, { fields: [users.id], references: [coordinators.userId] }),
}));

export const coordinatorsRelations = relations(coordinators, ({ one }) => ({
  user: one(users, { fields: [coordinators.userId], references: [users.id] }),
}));

export const teachersRelations = relations(teachers, ({ one, many }) => ({
  user: one(users, { fields: [teachers.userId], references: [users.id] }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  teacher: one(teachers, { fields: [projects.teacherId], references: [teachers.id] }),
  rubricCriteria: many(rubricCriteria),
  competencies: many(projectCompetencies),
  submissions: many(submissions),
}));

export const rubricCriteriaRelations = relations(rubricCriteria, ({ one }) => ({
  project: one(projects, { fields: [rubricCriteria.projectId], references: [projects.id] }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  achievements: many(studentAchievements),
  submissions: many(submissions),
}));

export const studentAchievementsRelations = relations(studentAchievements, ({ one }) => ({
  student: one(students, { fields: [studentAchievements.studentId], references: [students.id] }),
  achievement: one(achievements, { fields: [studentAchievements.achievementId], references: [achievements.id] }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  studentAchievements: many(studentAchievements),
}));

export const projectCompetenciesRelations = relations(projectCompetencies, ({ one }) => ({
  project: one(projects, { fields: [projectCompetencies.projectId], references: [projects.id] }),
  competency: one(bnccCompetencies, { fields: [projectCompetencies.competencyId], references: [bnccCompetencies.id] }),
}));

export const bnccCompetenciesRelations = relations(bnccCompetencies, ({ many }) => ({
  projects: many(projectCompetencies),
}));

export const submissionsRelations = relations(submissions, ({ one }) => ({
  project: one(projects, { fields: [submissions.projectId], references: [projects.id] }),
  student: one(students, { fields: [submissions.studentId], references: [students.id] }),
}));
