import { randomUUID } from "crypto";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "./db";
import * as schema from "@shared/schema";
import type {
  User, InsertUser,
  Coordinator, InsertCoordinator,
  Teacher, InsertTeacher,
  Project, InsertProject,
  ProjectPlanning, InsertProjectPlanning,
  RubricCriteria, InsertRubricCriteria,
  Student, InsertStudent,
  Achievement, InsertAchievement,
  StudentAchievement, InsertStudentAchievement,
  BnccCompetency, InsertBnccCompetency,
  ProjectCompetency, InsertProjectCompetency,
  Submission, InsertSubmission,
  Class, InsertClass,
  BnccDocument, InsertBnccDocument,
  Feedback, InsertFeedback,
  Event, InsertEvent,
  EventResponse, InsertEventResponse,
  ProjectWithTeacher,
  StudentAchievementWithDetails,
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
}

export const storage = new DatabaseStorage();
