import { randomUUID } from "crypto";
import { eq, and, inArray, sql, not, ne, or } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  Coordinator, InsertCoordinator,
  Teacher,
  InsertTeacher,
  Project,
  InsertProject,
  ProjectPlanning, InsertProjectPlanning,
  RubricCriteria,
  InsertRubricCriteria,
  Student,
  InsertStudent,
  Achievement,
  InsertAchievement,
  StudentAchievement,
  InsertStudentAchievement,
  BnccCompetency,
  InsertBnccCompetency,
  ProjectCompetency, InsertProjectCompetency,
  Submission,
  InsertSubmission,
  Class,
  InsertClass,
  BnccDocument,
  InsertBnccDocument,
  Feedback, InsertFeedback,
  Event, InsertEvent,
  EventResponse, InsertEventResponse,
  ProjectWithTeacher,
  StudentAchievementWithDetails,
  Attendance, InsertAttendance,
  StudentClass,
  InsertStudentClass,
  Team, InsertTeam,
  TeamMember, InsertTeamMember,
  Evaluation, InsertEvaluation,
  EvaluationScore, InsertEvaluationScore,
  PortfolioItem, InsertPortfolioItem,
  AnalyticsOverview, EngagementMetric, BnccUsage, AtRiskStudent,
} from "@shared/schema";

export interface IStorage {
  // Users (Authentication)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Coordinators
  getCoordinator(id: string): Promise<Coordinator | undefined>;
  getCoordinatorByUserId(userId: string): Promise<Coordinator | undefined>;
  getCoordinators(): Promise<Coordinator[]>;
  createCoordinator(coordinator: InsertCoordinator): Promise<Coordinator>;

  // Teachers
  getTeacher(id: string): Promise<Teacher | undefined>;
  getTeacherByUserId(userId: string): Promise<Teacher | undefined>;
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

  // Project Planning
  getProjectPlanning(projectId: string): Promise<ProjectPlanning | undefined>;
  createProjectPlanning(planning: InsertProjectPlanning): Promise<ProjectPlanning>;
  updateProjectPlanning(projectId: string, planning: Partial<InsertProjectPlanning>): Promise<ProjectPlanning | undefined>;

  // Rubric Criteria
  getRubricCriteria(projectId: string): Promise<RubricCriteria[]>;
  createRubricCriteria(criteria: InsertRubricCriteria): Promise<RubricCriteria>;
  updateRubricCriteria(id: string, criteria: Partial<InsertRubricCriteria>): Promise<RubricCriteria | undefined>;
  deleteRubricCriteria(id: string): Promise<boolean>;

  // Students
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByUserId(userId: string): Promise<Student | undefined>;
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
  getProjectCompetenciesWithDetails(projectId: string): Promise<any[]>;
  createProjectCompetency(projectCompetency: InsertProjectCompetency): Promise<ProjectCompetency>;
  deleteProjectCompetencies(projectId: string): Promise<void>;
  replaceProjectCompetencies(projectId: string, competencies: InsertProjectCompetency[]): Promise<ProjectCompetency[]>;

  // Submissions
  getSubmissions(projectId: string): Promise<Submission[]>;
  createSubmission(submission: InsertSubmission): Promise<Submission>;

  // Classes
  getClass(id: string): Promise<Class | undefined>;
  getClasses(): Promise<Class[]>;
  getClassesByTeacher(teacherId: string): Promise<Class[]>;
  createClass(classData: InsertClass): Promise<Class>;

  // BNCC Documents
  getBnccDocument(id: string): Promise<BnccDocument | undefined>;
  getBnccDocuments(): Promise<BnccDocument[]>;
  createBnccDocument(document: InsertBnccDocument): Promise<BnccDocument>;
  updateBnccDocument(id: string, document: Partial<InsertBnccDocument>): Promise<BnccDocument | undefined>;

  // Feedbacks
  getFeedback(id: string): Promise<Feedback | undefined>;
  getFeedbacksByProject(projectId: string): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  updateFeedback(id: string, comment: string): Promise<Feedback | undefined>;
  deleteFeedback(id: string): Promise<boolean>;

  // Events
  getEvent(id: string): Promise<Event | undefined>;
  getEvents(): Promise<Event[]>;
  getEventsByTeacher(teacherId: string): Promise<Event[]>;
  getEventsByProject(projectId: string): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;

  // Event Responses
  getEventResponse(eventId: string, studentId: string): Promise<EventResponse | undefined>;
  getEventResponsesByStudent(studentId: string): Promise<EventResponse[]>;
  getEventResponsesByEvent(eventId: string): Promise<EventResponse[]>;
  createEventResponse(response: InsertEventResponse): Promise<EventResponse>;
  updateEventResponse(eventId: string, studentId: string, status: string): Promise<EventResponse | undefined>;

  // Pending Actions (Teacher Dashboard)
  getPendingActions(teacherId: string): Promise<{
    projectsWithoutPlanning: number;
    projectsWithoutCompetencies: number;
    upcomingDeadlines: Array<{ projectId: string; title: string; deadline: string }>;
    upcomingEvents: Array<{ id: string; title: string; date: string; projectId: string | null }>;
  }>;

  // New methods for Teacher Dashboard improvements
  gradeSubmission(id: string, grade: number, feedback: string): Promise<Submission | undefined>;
  getProjectStudents(projectId: string): Promise<any[]>;

  // Attendance
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendanceByClass(classId: string, date: string): Promise<Attendance[]>;

  // Student Classes (Enrollments)
  addStudentToClass(studentClass: InsertStudentClass): Promise<StudentClass>;
  removeStudentFromClass(classId: string, studentId: string): Promise<void>;
  getStudentsByClass(classId: string): Promise<Student[]>;

  // Teams
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(id: string): Promise<Team | undefined>;
  getTeamsByProject(projectId: string): Promise<Team[]>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<boolean>;

  // Team Members
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: string, studentId: string): Promise<void>;
  getTeamMembers(teamId: string): Promise<Student[]>;

  // Evaluations
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  getEvaluation(id: string): Promise<Evaluation | undefined>;
  getEvaluationsByProject(projectId: string): Promise<Evaluation[]>;
  updateEvaluation(id: string, evaluation: Partial<InsertEvaluation>): Promise<Evaluation | undefined>;
  deleteEvaluation(id: string): Promise<boolean>;

  // Evaluation Scores
  getEvaluationScores(evaluationId: string): Promise<EvaluationScore[]>;
  createEvaluationScore(score: InsertEvaluationScore): Promise<EvaluationScore>;

  // Portfolio
  getPortfolioItems(studentId: string): Promise<any[]>;
  addToPortfolio(item: InsertPortfolioItem): Promise<PortfolioItem>;
  removeFromPortfolio(id: string): Promise<boolean>;
  getStudentByPortfolioSlug(slug: string): Promise<Student | undefined>;

  // Analytics
  getAnalyticsOverview(): Promise<AnalyticsOverview>;
  getEngagementMetrics(): Promise<EngagementMetric[]>;
  getBnccUsage(): Promise<BnccUsage[]>;
  getAtRiskStudents(): Promise<AtRiskStudent[]>;
}

// Helper functions for analytics (simple implementations to keep build green)
function calculateSubmissionRate(totalSubmissions: number, totalStudents: number, totalProjects: number): number {
  if (totalStudents === 0 || totalProjects === 0) return 0;
  const rate = (totalSubmissions / (totalStudents * totalProjects)) * 100;
  return Math.round(rate * 100) / 100;
}

function calculateAverageGrade(submissions: any[]): number {
  if (!submissions || submissions.length === 0) return 0;
  const grades = submissions.map(s => s.grade || 0);
  const avg = grades.reduce((a: number, b: number) => a + b, 0) / grades.length;
  return Math.round(avg * 100) / 100;
}

function calculateEngagement(submissionsCount: number, studentsCount: number, benchmark: number): number {
  if (studentsCount === 0) return 0;
  const rate = (submissionsCount / (studentsCount * benchmark)) * 100;
  return Math.round(rate * 100) / 100;
}

function calculateAttendanceRate(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

function isStudentAtRisk(student: any, absences: number, submissions: number): boolean {
  if (!student) return false;
  return (absences > 5) || (submissions < 1) || (student.xp || 0) < 50;
}

export class DatabaseStorage implements IStorage {
  // Users (Authentication)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const [user] = await db.insert(schema.users).values({ ...insertUser, id }).returning();
    return user;
  }

  // Coordinators
  async getCoordinator(id: string): Promise<Coordinator | undefined> {
    const [coordinator] = await db.select().from(schema.coordinators).where(eq(schema.coordinators.id, id));
    return coordinator || undefined;
  }

  async getCoordinatorByUserId(userId: string): Promise<Coordinator | undefined> {
    const [coordinator] = await db.select().from(schema.coordinators).where(eq(schema.coordinators.userId, userId));
    return coordinator || undefined;
  }

  async getCoordinators(): Promise<Coordinator[]> {
    return await db.select().from(schema.coordinators);
  }

  async createCoordinator(insertCoordinator: InsertCoordinator): Promise<Coordinator> {
    const id = randomUUID();
    const [coordinator] = await db.insert(schema.coordinators).values({ ...insertCoordinator, id }).returning();
    return coordinator;
  }

  // Teachers
  async getTeacher(id: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(schema.teachers).where(eq(schema.teachers.id, id));
    return teacher || undefined;
  }

  async getTeacherByUserId(userId: string): Promise<Teacher | undefined> {
    const [teacher] = await db.select().from(schema.teachers).where(eq(schema.teachers.userId, userId));
    return teacher || undefined;
  }

  async getTeachers(): Promise<Teacher[]> {
    return await db.select().from(schema.teachers);
  }

  async createTeacher(insertTeacher: InsertTeacher): Promise<Teacher> {
    const id = randomUUID();
    const [teacher] = await db.insert(schema.teachers).values({ ...insertTeacher, id }).returning();
    return teacher;
  }

  async updateTeacher(id: string, teacherUpdate: Partial<InsertTeacher>): Promise<Teacher | undefined> {
    const [updated] = await db.update(schema.teachers)
      .set(teacherUpdate)
      .where(eq(schema.teachers.id, id))
      .returning();
    return updated || undefined;
  }

  // Projects
  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(schema.projects).where(eq(schema.projects.id, id));
    return project || undefined;
  }

  async getProjects(): Promise<Project[]> {
    return await db.select().from(schema.projects);
  }

  async getProjectsWithTeacher(): Promise<ProjectWithTeacher[]> {
    const projects = await db.select({
      id: schema.projects.id,
      title: schema.projects.title,
      subject: schema.projects.subject,
      status: schema.projects.status,
      progress: schema.projects.progress,
      students: schema.projects.students,
      nextDeadline: schema.projects.nextDeadline,
      deadlineLabel: schema.projects.deadlineLabel,
      theme: schema.projects.theme,
      teacherId: schema.projects.teacherId,
      delayed: schema.projects.delayed,
      description: schema.projects.description,
      stages: schema.projects.stages,
      teacherName: schema.teachers.name,
    })
      .from(schema.projects)
      .leftJoin(schema.teachers, eq(schema.projects.teacherId, schema.teachers.id));

    return projects.map(p => ({
      ...p,
      teacherName: p.teacherName || 'Unknown',
    }));
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const [project] = await db.insert(schema.projects).values({ ...insertProject, id }).returning();
    return project;
  }

  async updateProject(id: string, projectUpdate: Partial<InsertProject>): Promise<Project | undefined> {
    const [updated] = await db.update(schema.projects)
      .set(projectUpdate)
      .where(eq(schema.projects.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(schema.projects).where(eq(schema.projects.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Project Planning
  async getProjectPlanning(projectId: string): Promise<ProjectPlanning | undefined> {
    const [planning] = await db.select().from(schema.projectPlanning).where(eq(schema.projectPlanning.projectId, projectId));
    return planning || undefined;
  }

  async createProjectPlanning(insertPlanning: InsertProjectPlanning): Promise<ProjectPlanning> {
    const id = randomUUID();
    const [planning] = await db.insert(schema.projectPlanning).values({ ...insertPlanning, id }).returning();
    return planning;
  }

  async updateProjectPlanning(projectId: string, planningUpdate: Partial<InsertProjectPlanning>): Promise<ProjectPlanning | undefined> {
    const now = new Date();
    const [updated] = await db.update(schema.projectPlanning)
      .set({ ...planningUpdate, updatedAt: now })
      .where(eq(schema.projectPlanning.projectId, projectId))
      .returning();
    return updated || undefined;
  }

  // Rubric Criteria
  async getRubricCriteria(projectId: string): Promise<RubricCriteria[]> {
    return await db.select().from(schema.rubricCriteria).where(eq(schema.rubricCriteria.projectId, projectId));
  }

  async createRubricCriteria(insertCriteria: InsertRubricCriteria): Promise<RubricCriteria> {
    const id = randomUUID();
    const [criteria] = await db.insert(schema.rubricCriteria).values({ ...insertCriteria, id }).returning();
    return criteria;
  }

  async updateRubricCriteria(id: string, criteriaUpdate: Partial<InsertRubricCriteria>): Promise<RubricCriteria | undefined> {
    const [updated] = await db.update(schema.rubricCriteria)
      .set(criteriaUpdate)
      .where(eq(schema.rubricCriteria.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteRubricCriteria(id: string): Promise<boolean> {
    const result = await db.delete(schema.rubricCriteria).where(eq(schema.rubricCriteria.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Students
  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(schema.students).where(eq(schema.students.id, id));
    return student || undefined;
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(schema.students).where(eq(schema.students.userId, userId));
    return student || undefined;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(schema.students);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const [student] = await db.insert(schema.students).values({ ...insertStudent, id }).returning();
    return student;
  }

  async updateStudent(id: string, studentUpdate: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updated] = await db.update(schema.students)
      .set(studentUpdate)
      .where(eq(schema.students.id, id))
      .returning();
    return updated || undefined;
  }

  // Achievements
  async getAchievement(id: string): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(schema.achievements).where(eq(schema.achievements.id, id));
    return achievement || undefined;
  }

  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(schema.achievements);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = randomUUID();
    const [achievement] = await db.insert(schema.achievements).values({ ...insertAchievement, id }).returning();
    return achievement;
  }

  async updateAchievement(id: string, achievementUpdate: Partial<InsertAchievement>): Promise<Achievement | undefined> {
    const [updated] = await db.update(schema.achievements)
      .set(achievementUpdate)
      .where(eq(schema.achievements.id, id))
      .returning();
    return updated || undefined;
  }

  // Student Achievements
  async getStudentAchievements(studentId: string): Promise<StudentAchievementWithDetails[]> {
    const results = await db.select({
      id: schema.studentAchievements.id,
      studentId: schema.studentAchievements.studentId,
      achievementId: schema.studentAchievements.achievementId,
      progress: schema.studentAchievements.progress,
      total: schema.studentAchievements.total,
      unlocked: schema.studentAchievements.unlocked,
      achievementTitle: schema.achievements.title,
      achievementDescription: schema.achievements.description,
      achievementXp: schema.achievements.xp,
      achievementIcon: schema.achievements.icon,
    })
      .from(schema.studentAchievements)
      .leftJoin(schema.achievements, eq(schema.studentAchievements.achievementId, schema.achievements.id))
      .where(eq(schema.studentAchievements.studentId, studentId));

    return results.map(r => ({
      ...r,
      achievementTitle: r.achievementTitle || '',
      achievementDescription: r.achievementDescription || '',
      achievementXp: r.achievementXp || 0,
      achievementIcon: r.achievementIcon || '',
    }));
  }

  async createStudentAchievement(insertStudentAchievement: InsertStudentAchievement): Promise<StudentAchievement> {
    const id = randomUUID();
    const [studentAchievement] = await db.insert(schema.studentAchievements).values({ ...insertStudentAchievement, id }).returning();
    return studentAchievement;
  }

  async updateStudentAchievement(id: string, progress: number, unlocked: boolean): Promise<StudentAchievement | undefined> {
    const [updated] = await db.update(schema.studentAchievements)
      .set({ progress, unlocked })
      .where(eq(schema.studentAchievements.id, id))
      .returning();
    return updated || undefined;
  }

  /**
   * Track achievement progress and unlock when completed
   * Returns true if achievement was unlocked, false otherwise
   */
  async trackAchievementProgress(
    studentId: string,
    achievementId: string,
    increment: number = 1,
    total?: number
  ): Promise<{ unlocked: boolean; xpAwarded: number }> {
    // Get achievement details
    const achievement = await this.getAchievement(achievementId);
    if (!achievement) {
      return { unlocked: false, xpAwarded: 0 };
    }

    // Check if student already has this achievement
    const existingProgress = await db.select()
      .from(schema.studentAchievements)
      .where(and(
        eq(schema.studentAchievements.studentId, studentId),
        eq(schema.studentAchievements.achievementId, achievementId)
      ))
      .limit(1);

    const existing = existingProgress[0];

    // If already unlocked, do nothing
    if (existing?.unlocked) {
      return { unlocked: false, xpAwarded: 0 };
    }

    // Determine total (use provided total or default to 1 for single achievements)
    const achievementTotal = total || existing?.total || 1;
    const currentProgress = existing?.progress || 0;
    const newProgress = currentProgress + increment;

    // Check if achievement is now unlocked
    const nowUnlocked = newProgress >= achievementTotal;

    if (existing) {
      // Update existing record
      await db.update(schema.studentAchievements)
        .set({
          progress: newProgress,
          unlocked: nowUnlocked,
          total: achievementTotal
        })
        .where(eq(schema.studentAchievements.id, existing.id));
    } else {
      // Create new record
      const id = randomUUID();
      await db.insert(schema.studentAchievements).values({
        id,
        studentId,
        achievementId,
        progress: newProgress,
        total: achievementTotal,
        unlocked: nowUnlocked,
      });
    }

    // If unlocked, award XP to student
    if (nowUnlocked) {
      const student = await this.getStudent(studentId);
      if (student) {
        const newXp = student.xp + achievement.xp;
        const newLevel = Math.floor(newXp / 100) + 1; // Simple level calculation: 100 XP per level

        await db.update(schema.students)
          .set({
            xp: newXp,
            level: newLevel
          })
          .where(eq(schema.students.id, studentId));

        // Check level-based achievements
        await this.checkLevelAchievements(studentId, newLevel, newXp);

        return { unlocked: true, xpAwarded: achievement.xp };
      }
    }

    return { unlocked: false, xpAwarded: 0 };
  }

  /**
   * Check and unlock level-based achievements
   */
  private async checkLevelAchievements(studentId: string, level: number, xp: number): Promise<void> {
    // Level 5 - Motivated Beginner
    if (level >= 5) {
      await this.trackAchievementProgress(studentId, 'ach-iniciante-motivado', 1, 1);
    }

    // Level 10 - Dedicated Student
    if (level >= 10) {
      await this.trackAchievementProgress(studentId, 'ach-estudante-dedicado', 1, 1);
    }

    // Level 20 - Expert
    if (level >= 20) {
      await this.trackAchievementProgress(studentId, 'ach-expert', 1, 1);
    }

    // 1000 XP Collector
    if (xp >= 1000) {
      await this.trackAchievementProgress(studentId, 'ach-coletor-xp', 1, 1);
    }
  }



  // BNCC Competencies
  async getCompetency(id: string): Promise<BnccCompetency | undefined> {
    const [competency] = await db.select().from(schema.bnccCompetencies).where(eq(schema.bnccCompetencies.id, id));
    return competency || undefined;
  }

  async getCompetencies(): Promise<BnccCompetency[]> {
    return await db.select().from(schema.bnccCompetencies);
  }

  async createCompetency(insertCompetency: InsertBnccCompetency): Promise<BnccCompetency> {
    const id = randomUUID();
    const [competency] = await db.insert(schema.bnccCompetencies).values({ ...insertCompetency, id }).returning();
    return competency;
  }

  async updateCompetency(id: string, competencyUpdate: Partial<InsertBnccCompetency>): Promise<BnccCompetency | undefined> {
    const [updated] = await db.update(schema.bnccCompetencies)
      .set(competencyUpdate)
      .where(eq(schema.bnccCompetencies.id, id))
      .returning();
    return updated || undefined;
  }

  // Project Competencies
  async getProjectCompetencies(projectId: string): Promise<ProjectCompetency[]> {
    return await db.select().from(schema.projectCompetencies).where(eq(schema.projectCompetencies.projectId, projectId));
  }

  async getProjectCompetenciesWithDetails(projectId: string): Promise<any[]> {
    return await db
      .select({
        id: schema.projectCompetencies.id,
        projectId: schema.projectCompetencies.projectId,
        competencyId: schema.projectCompetencies.competencyId,
        coverage: schema.projectCompetencies.coverage,
        competency: schema.bnccCompetencies,
      })
      .from(schema.projectCompetencies)
      .leftJoin(schema.bnccCompetencies, eq(schema.projectCompetencies.competencyId, schema.bnccCompetencies.id))
      .where(eq(schema.projectCompetencies.projectId, projectId));
  }

  async createProjectCompetency(insertProjectCompetency: InsertProjectCompetency): Promise<ProjectCompetency> {
    const id = randomUUID();
    const [projectCompetency] = await db.insert(schema.projectCompetencies).values({ ...insertProjectCompetency, id }).returning();
    return projectCompetency;
  }

  async deleteProjectCompetencies(projectId: string): Promise<void> {
    await db.delete(schema.projectCompetencies).where(eq(schema.projectCompetencies.projectId, projectId));
  }

  async replaceProjectCompetencies(projectId: string, competencies: InsertProjectCompetency[]): Promise<ProjectCompetency[]> {
    // Use Drizzle transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Delete old competencies
      await tx.delete(schema.projectCompetencies).where(eq(schema.projectCompetencies.projectId, projectId));

      // Insert new competencies
      const newCompetencies: ProjectCompetency[] = [];
      for (const comp of competencies) {
        const id = randomUUID();
        const [projectCompetency] = await tx.insert(schema.projectCompetencies)
          .values({ ...comp, id })
          .returning();
        newCompetencies.push(projectCompetency);
      }

      return newCompetencies;
    });
  }

  // Submissions
  async getSubmissions(projectId: string): Promise<Submission[]> {
    return await db.select().from(schema.submissions).where(eq(schema.submissions.projectId, projectId));
  }

  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const id = randomUUID();
    const [submission] = await db.insert(schema.submissions).values({ ...insertSubmission, id }).returning();
    return submission;
  }

  // Classes
  async getClass(id: string): Promise<Class | undefined> {
    const [classData] = await db.select().from(schema.classes).where(eq(schema.classes.id, id));
    return classData || undefined;
  }

  async getClasses(): Promise<Class[]> {
    return await db.select().from(schema.classes);
  }

  async getClassesByTeacher(teacherId: string): Promise<Class[]> {
    return await db.select().from(schema.classes).where(eq(schema.classes.teacherId, teacherId));
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const id = randomUUID();
    const [classData] = await db.insert(schema.classes).values({ ...insertClass, id }).returning();
    return classData;
  }

  // BNCC Documents
  async getBnccDocument(id: string): Promise<BnccDocument | undefined> {
    const [document] = await db.select().from(schema.bnccDocuments).where(eq(schema.bnccDocuments.id, id));
    return document || undefined;
  }

  async getBnccDocuments(): Promise<BnccDocument[]> {
    return await db.select().from(schema.bnccDocuments);
  }

  async createBnccDocument(insertDocument: InsertBnccDocument): Promise<BnccDocument> {
    const id = randomUUID();
    const [document] = await db.insert(schema.bnccDocuments).values({ ...insertDocument, id }).returning();
    return document;
  }

  async updateBnccDocument(id: string, documentUpdate: Partial<InsertBnccDocument>): Promise<BnccDocument | undefined> {
    const [updated] = await db.update(schema.bnccDocuments)
      .set(documentUpdate)
      .where(eq(schema.bnccDocuments.id, id))
      .returning();
    return updated || undefined;
  }

  // Feedbacks
  async getFeedback(id: string): Promise<Feedback | undefined> {
    const [feedback] = await db.select().from(schema.feedbacks).where(eq(schema.feedbacks.id, id));
    return feedback || undefined;
  }

  async getFeedbacksByProject(projectId: string): Promise<Feedback[]> {
    return await db.select().from(schema.feedbacks).where(eq(schema.feedbacks.projectId, projectId));
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const [feedback] = await db.insert(schema.feedbacks).values({ ...insertFeedback, id }).returning();
    return feedback;
  }

  async updateFeedback(id: string, comment: string): Promise<Feedback | undefined> {
    const [updated] = await db.update(schema.feedbacks)
      .set({ comment })
      .where(eq(schema.feedbacks.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteFeedback(id: string): Promise<boolean> {
    const result = await db.delete(schema.feedbacks).where(eq(schema.feedbacks.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Events
  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(schema.events).where(eq(schema.events.id, id));
    return event || undefined;
  }

  async getEvents(): Promise<Event[]> {
    return await db.select().from(schema.events);
  }

  async getEventsByTeacher(teacherId: string): Promise<Event[]> {
    return await db.select().from(schema.events).where(eq(schema.events.teacherId, teacherId));
  }

  async getEventsByProject(projectId: string): Promise<Event[]> {
    return await db.select().from(schema.events).where(eq(schema.events.projectId, projectId));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = randomUUID();
    const [event] = await db.insert(schema.events).values({ ...insertEvent, id }).returning();
    return event;
  }

  async updateEvent(id: string, eventUpdate: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updated] = await db.update(schema.events)
      .set(eventUpdate)
      .where(eq(schema.events.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(schema.events).where(eq(schema.events.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Event Responses
  async getEventResponse(eventId: string, studentId: string): Promise<EventResponse | undefined> {
    const [response] = await db.select().from(schema.eventResponses)
      .where(and(
        eq(schema.eventResponses.eventId, eventId),
        eq(schema.eventResponses.studentId, studentId)
      ));
    return response || undefined;
  }

  async getEventResponsesByStudent(studentId: string): Promise<EventResponse[]> {
    return await db.select().from(schema.eventResponses)
      .where(eq(schema.eventResponses.studentId, studentId));
  }

  async getEventResponsesByEvent(eventId: string): Promise<EventResponse[]> {
    return await db.select().from(schema.eventResponses)
      .where(eq(schema.eventResponses.eventId, eventId));
  }

  async createEventResponse(insertResponse: InsertEventResponse): Promise<EventResponse> {
    const id = randomUUID();
    const [response] = await db.insert(schema.eventResponses)
      .values({ ...insertResponse, id })
      .returning();
    return response;
  }

  async updateEventResponse(eventId: string, studentId: string, status: string): Promise<EventResponse | undefined> {
    const [updated] = await db.update(schema.eventResponses)
      .set({ status, respondedAt: new Date() })
      .where(and(
        eq(schema.eventResponses.eventId, eventId),
        eq(schema.eventResponses.studentId, studentId)
      ))
      .returning();
    return updated || undefined;
  }

  async getPendingActions(teacherId: string) {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const teacherProjects = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.teacherId, teacherId));

    if (teacherProjects.length === 0) {
      return {
        projectsWithoutPlanning: 0,
        projectsWithoutCompetencies: 0,
        upcomingDeadlines: [],
        upcomingEvents: [],
      };
    }

    const projectIds = teacherProjects.map(p => p.id);

    const allPlanning = await db
      .select({ projectId: schema.projectPlanning.projectId })
      .from(schema.projectPlanning)
      .where(inArray(schema.projectPlanning.projectId, projectIds));

    const planningSet = new Set(allPlanning.map(p => p.projectId));

    const allCompetencies = await db
      .select({ projectId: schema.projectCompetencies.projectId })
      .from(schema.projectCompetencies)
      .where(inArray(schema.projectCompetencies.projectId, projectIds));

    const competenciesSet = new Set(allCompetencies.map(c => c.projectId));

    let projectsWithoutPlanning = 0;
    let projectsWithoutCompetencies = 0;
    const upcomingDeadlines: Array<{ projectId: string; title: string; deadline: string }> = [];

    for (const project of teacherProjects) {
      if (!planningSet.has(project.id)) {
        projectsWithoutPlanning++;
      }

      if (!competenciesSet.has(project.id)) {
        projectsWithoutCompetencies++;
      }

      if (project.nextDeadline) {
        const deadlineDate = new Date(project.nextDeadline);
        if (deadlineDate >= now && deadlineDate <= sevenDaysFromNow) {
          upcomingDeadlines.push({
            projectId: project.id,
            title: project.title,
            deadline: project.nextDeadline,
          });
        }
      }
    }

    const upcomingEventsData = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.teacherId, teacherId));

    const upcomingEvents = upcomingEventsData
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= now && eventDate <= threeDaysFromNow;
      })
      .map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        projectId: event.projectId,
      }));

    return {
      projectsWithoutPlanning,
      projectsWithoutCompetencies,
      upcomingDeadlines,
      upcomingEvents,
    };
  }

  async gradeSubmission(id: string, grade: number, feedback: string): Promise<Submission | undefined> {
    const [updated] = await db.update(schema.submissions)
      .set({ grade, teacherFeedback: feedback })
      .where(eq(schema.submissions.id, id))
      .returning();
    return updated || undefined;
  }

  async getProjectStudents(projectId: string): Promise<any[]> {
    // Get all students
    const allStudents = await db.select().from(schema.students);

    // Get submissions for this project
    const submissions = await db.select().from(schema.submissions).where(eq(schema.submissions.projectId, projectId));

    // Map students with their submission status
    return allStudents.map(student => {
      const studentSubmission = submissions.find(s => s.studentId === student.id);
      return {
        ...student,
        hasSubmission: !!studentSubmission,
        submissionDate: studentSubmission?.submittedAt,
        grade: studentSubmission?.grade,
        status: studentSubmission ? (studentSubmission.grade ? 'Graded' : 'Submitted') : 'Pending'
      };
    });
  }

  // Attendance
  async createAttendance(insertAttendance: InsertAttendance): Promise<Attendance> {
    // Check if attendance already exists for this student, class and date
    const [existing] = await db.select().from(schema.attendance)
      .where(and(
        eq(schema.attendance.classId, insertAttendance.classId),
        eq(schema.attendance.studentId, insertAttendance.studentId),
        eq(schema.attendance.date, insertAttendance.date)
      ));

    if (existing) {
      // Update existing record
      const [updated] = await db.update(schema.attendance)
        .set({ status: insertAttendance.status, notes: insertAttendance.notes })
        .where(eq(schema.attendance.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new record
      const id = randomUUID();
      const [attendance] = await db.insert(schema.attendance).values({ ...insertAttendance, id }).returning();
      return attendance;
    }
  }

  async getAttendanceByClass(classId: string, date: string): Promise<Attendance[]> {
    return await db.select().from(schema.attendance)
      .where(and(
        eq(schema.attendance.classId, classId),
        eq(schema.attendance.date, date)
      ));
  }

  // Student Classes (Enrollments)
  async addStudentToClass(insertStudentClass: InsertStudentClass): Promise<StudentClass> {
    const id = randomUUID();
    const [studentClass] = await db.insert(schema.studentClasses).values({ ...insertStudentClass, id }).returning();

    // Update student count in class
    const [classData] = await db.select().from(schema.classes).where(eq(schema.classes.id, insertStudentClass.classId));
    if (classData) {
      await db.update(schema.classes)
        .set({ studentCount: (classData.studentCount || 0) + 1 })
        .where(eq(schema.classes.id, insertStudentClass.classId));
    }

    return studentClass;
  }

  async removeStudentFromClass(classId: string, studentId: string): Promise<void> {
    await db.delete(schema.studentClasses)
      .where(and(
        eq(schema.studentClasses.classId, classId),
        eq(schema.studentClasses.studentId, studentId)
      ));

    // Update student count in class
    const [classData] = await db.select().from(schema.classes).where(eq(schema.classes.id, classId));
    if (classData && classData.studentCount > 0) {
      await db.update(schema.classes)
        .set({ studentCount: classData.studentCount - 1 })
        .where(eq(schema.classes.id, classId));
    }
  }

  async getStudentsByClass(classId: string): Promise<Student[]> {
    const results = await db.select({
      student: schema.students
    })
      .from(schema.studentClasses)
      .innerJoin(schema.students, eq(schema.studentClasses.studentId, schema.students.id))
      .where(eq(schema.studentClasses.classId, classId));

    return results.map(r => r.student);
  }

  // ===== TEAMS =====
  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = randomUUID();
    const [team] = await db.insert(schema.teams).values({ ...insertTeam, id }).returning();
    return team;
  }

  async getTeamsByProject(projectId: string): Promise<Team[]> {
    return await db.select().from(schema.teams).where(eq(schema.teams.projectId, projectId));
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(schema.teams).where(eq(schema.teams.id, id));
    return team;
  }

  async updateTeam(id: string, update: Partial<InsertTeam>): Promise<Team | undefined> {
    const [updated] = await db.update(schema.teams)
      .set(update)
      .where(eq(schema.teams.id, id))
      .returning();
    return updated;
  }

  async deleteTeam(id: string): Promise<boolean> {
    const result = await db.delete(schema.teams).where(eq(schema.teams.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ===== TEAM MEMBERS =====
  async addStudentToTeam(teamId: string, studentId: string, role?: string): Promise<TeamMember> {
    const id = randomUUID();
    const [member] = await db.insert(schema.teamMembers).values({
      id,
      teamId,
      studentId,
      role: role || "member",
    }).returning();
    return member;
  }

  async getTeamMembers(teamId: string): Promise<Student[]> {
    const results = await db.select({
      student: schema.students
    })
      .from(schema.teamMembers)
      .innerJoin(schema.students, eq(schema.teamMembers.studentId, schema.students.id))
      .where(eq(schema.teamMembers.teamId, teamId));

    return results.map(r => r.student);
  }

  async removeStudentFromTeam(teamId: string, studentId: string): Promise<boolean> {
    const result = await db.delete(schema.teamMembers)
      .where(and(
        eq(schema.teamMembers.teamId, teamId),
        eq(schema.teamMembers.studentId, studentId)
      ));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ===== EVALUATIONS =====
  async createEvaluation(insertEvaluation: InsertEvaluation): Promise<Evaluation> {
    const id = randomUUID();
    const [evaluation] = await db.insert(schema.evaluations).values({ ...insertEvaluation, id }).returning();
    return evaluation;
  }

  async getEvaluationsByProject(projectId: string): Promise<Evaluation[]> {
    return await db.select().from(schema.evaluations).where(eq(schema.evaluations.projectId, projectId));
  }

  async getEvaluationByTeam(teamId: string): Promise<Evaluation | undefined> {
    const [evaluation] = await db.select().from(schema.evaluations).where(eq(schema.evaluations.teamId, teamId));
    return evaluation;
  }

  async getEvaluationByStudent(projectId: string, studentId: string): Promise<Evaluation | undefined> {
    const [evaluation] = await db.select().from(schema.evaluations)
      .where(and(
        eq(schema.evaluations.projectId, projectId),
        eq(schema.evaluations.studentId, studentId)
      ));
    return evaluation;
  }

  async updateEvaluation(id: string, update: Partial<InsertEvaluation>): Promise<Evaluation | undefined> {
    const [updated] = await db.update(schema.evaluations)
      .set(update)
      .where(eq(schema.evaluations.id, id))
      .returning();
    return updated;
  }

  async deleteEvaluation(id: string): Promise<boolean> {
    const result = await db.delete(schema.evaluations).where(eq(schema.evaluations.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // ===== EVALUATION SCORES =====
  async saveEvaluationScores(evaluationId: string, scores: InsertEvaluationScore[]): Promise<void> {
    // Delete existing scores for this evaluation
    await db.delete(schema.evaluationScores).where(eq(schema.evaluationScores.evaluationId, evaluationId));

    // Insert new scores
    if (scores.length > 0) {
      const scoresWithIds = scores.map(score => ({
        ...score,
        id: randomUUID(),
        evaluationId,
      }));
      await db.insert(schema.evaluationScores).values(scoresWithIds);
    }
  }

  async getEvaluationScores(evaluationId: string): Promise<EvaluationScore[]> {
    return await db.select().from(schema.evaluationScores)
      .where(eq(schema.evaluationScores.evaluationId, evaluationId));
  }

  async getSubmissionsByStudent(studentId: string): Promise<Submission[]> {
    return await db.select().from(schema.submissions).where(eq(schema.submissions.studentId, studentId));
  }

  async getStudentsByTeacher(teacherId: string): Promise<Student[]> {
    // Get all classes for the teacher
    const classes = await db.select().from(schema.classes).where(eq(schema.classes.teacherId, teacherId));
    const classIds = classes.map(c => c.id);

    if (classIds.length === 0) return [];

    // Get all students in these classes
    const students = await db.select({
      student: schema.students
    })
      .from(schema.studentClasses)
      .innerJoin(schema.students, eq(schema.studentClasses.studentId, schema.students.id))
      .where(inArray(schema.studentClasses.classId, classIds));

    return students.map(s => s.student);
  }

  async getPortfolioItems(studentId: string): Promise<any[]> {
    const items = await db
      .select({
        id: schema.portfolioItems.id,
        studentId: schema.portfolioItems.studentId,
        submissionId: schema.portfolioItems.submissionId,
        displayOrder: schema.portfolioItems.displayOrder,
        addedAt: schema.portfolioItems.addedAt,
        project: schema.projects,
        submission: schema.submissions,
      })
      .from(schema.portfolioItems)
      .innerJoin(schema.submissions, eq(schema.portfolioItems.submissionId, schema.submissions.id))
      .innerJoin(schema.projects, eq(schema.submissions.projectId, schema.projects.id))
      .where(eq(schema.portfolioItems.studentId, studentId))
      .orderBy(schema.portfolioItems.displayOrder);

    return items;
  }

  async addToPortfolio(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = randomUUID();
    const [newItem] = await db
      .insert(schema.portfolioItems)
      .values({ ...item, id })
      .returning();
    return newItem;
  }

  async removeFromPortfolio(id: string): Promise<boolean> {
    const [deleted] = await db
      .delete(schema.portfolioItems)
      .where(eq(schema.portfolioItems.id, id))
      .returning();
    return !!deleted;
  }

  async getStudentByPortfolioSlug(slug: string): Promise<Student | undefined> {
    const [student] = await db
      .select()
      .from(schema.students)
      .where(eq(schema.students.portfolioSlug, slug));
    return student;
  }

  // Missing Methods Implementation
  async addTeamMember(member: InsertTeamMember): Promise<TeamMember> {
    const id = randomUUID();
    const [newMember] = await db
      .insert(schema.teamMembers)
      .values({ ...member, id })
      .returning();
    return newMember;
  }
  async removeTeamMember(teamId: string, studentId: string): Promise<void> {
    await db
      .delete(schema.teamMembers)
      .where(and(eq(schema.teamMembers.teamId, teamId), eq(schema.teamMembers.studentId, studentId)));
    return;
  }

  async getEvaluation(id: string): Promise<Evaluation | undefined> {
    const [evaluation] = await db
      .select()
      .from(schema.evaluations)
      .where(eq(schema.evaluations.id, id));
    return evaluation;
  }

  async createEvaluationScore(score: InsertEvaluationScore): Promise<EvaluationScore> {
    const id = randomUUID();
    const [newScore] = await db
      .insert(schema.evaluationScores)
      .values({ ...score, id })
      .returning();
    return newScore;
  }

  // Analytics Implementation
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    // Total Active Projects
    const projects = await db.select().from(schema.projects);
    const activeProjects = projects.filter(p => p.status !== 'Concluído');

    // Total Students
    const students = await db.select().from(schema.students);

    // Average Submission Rate
    const submissions = await db.select().from(schema.submissions);
    const submissionRate = calculateSubmissionRate(
      submissions.length,
      students.length,
      activeProjects.length
    );

    // Average Grade (using as proxy for satisfaction)
    const averageGrade = calculateAverageGrade(submissions);

    return {
      totalActiveProjects: activeProjects.length,
      totalStudents: students.length,
      averageSubmissionRate: submissionRate,
      averageSatisfaction: averageGrade,
    };
  }

  async getEngagementMetrics(): Promise<EngagementMetric[]> {
    const classes = await db.select().from(schema.classes);
    const metrics: EngagementMetric[] = [];

    for (const cls of classes) {
      // Get students in class
      const studentClasses = await db.select()
        .from(schema.studentClasses)
        .where(eq(schema.studentClasses.classId, cls.id));
      const studentIds = studentClasses.map(sc => sc.studentId);

      if (studentIds.length === 0) {
        metrics.push({ className: cls.name, submissionRate: 0, attendanceRate: 0 });
        continue;
      }

      // Calculate Submission Rate
      const classSubmissions = await db.select()
        .from(schema.submissions)
        .where(inArray(schema.submissions.studentId, studentIds));

      const submissionRate = calculateEngagement(
        classSubmissions.length,
        studentIds.length,
        5 // benchmark: 5 projects
      );

      // Calculate Attendance Rate
      const presentRecords = await db.select()
        .from(schema.attendance)
        .where(and(
          eq(schema.attendance.classId, cls.id),
          eq(schema.attendance.status, 'present')
        ));

      const allAttendance = await db.select()
        .from(schema.attendance)
        .where(eq(schema.attendance.classId, cls.id));

      const attendanceRate = calculateAttendanceRate(
        presentRecords.length,
        allAttendance.length
      );

      metrics.push({
        className: cls.name,
        submissionRate,
        attendanceRate
      });
    }

    return metrics;
  }

  async getBnccUsage(): Promise<BnccUsage[]> {
    // Count project competencies
    const projectCompetencies = await db.select().from(schema.projectCompetencies);
    const usageMap = new Map<string, number>();

    for (const pc of projectCompetencies) {
      // We need to fetch the competency name. 
      // This is N+1, but for analytics on small dataset it's acceptable. 
      // Better: join with bncc_competencies table.
      const comp = await db.select().from(schema.bnccCompetencies).where(eq(schema.bnccCompetencies.id, pc.competencyId));
      if (comp.length > 0) {
        const name = comp[0].name;
        usageMap.set(name, (usageMap.get(name) || 0) + 1);
      }
    }

    return Array.from(usageMap.entries())
      .map(([competencyName, usageCount]) => ({ competencyName, usageCount }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10); // Top 10
  }

  async getAtRiskStudents(): Promise<AtRiskStudent[]> {
    // Define risk: Low XP, High Absences, or Missing Submissions
    const students = await db.select().from(schema.students);
    const atRisk: AtRiskStudent[] = [];

    for (const student of students) {
      // Get class name (first class found)
      const studentClasses = await db.select()
        .from(schema.studentClasses)
        .innerJoin(schema.classes, eq(schema.studentClasses.classId, schema.classes.id))
        .where(eq(schema.studentClasses.studentId, student.id));

      const className = studentClasses.length > 0 ? studentClasses[0].classes.name : "Sem turma";

      // Count absences
      const absences = await db.select()
        .from(schema.attendance)
        .where(and(
          eq(schema.attendance.studentId, student.id),
          eq(schema.attendance.status, 'absent')
        ));

      // Count submissions
      const submissions = await db.select()
        .from(schema.submissions)
        .where(eq(schema.submissions.studentId, student.id));

      // Check if student is at risk using helper
      if (isStudentAtRisk(student, absences.length, submissions.length)) {
        atRisk.push({
          id: student.id,
          name: student.name,
          className,
          xp: student.xp,
          absences: absences.length,
          missedSubmissions: 0 // Placeholder - would need project assignments
        });
      }
    }

    return atRisk;
  }

  async getSubmissionsByProject(projectId: string): Promise<Submission[]> {
    return await db.select().from(schema.submissions).where(eq(schema.submissions.projectId, projectId));
  }

  async getTeamsByStudent(studentId: string): Promise<Team[]> {
    const results = await db.select({
      team: schema.teams
    })
      .from(schema.teamMembers)
      .innerJoin(schema.teams, eq(schema.teamMembers.teamId, schema.teams.id))
      .where(eq(schema.teamMembers.studentId, studentId));

    return results.map(r => r.team);
  }
}

export const storage = new DatabaseStorage();
