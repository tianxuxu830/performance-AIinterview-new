

export enum Status {
  NotStarted = '未开始',
  InProgress = '进行中',
  PendingConfirmation = '待确认',
  Completed = '已完成',
  Archived = '已归档'
}

export enum InterviewType {
  Regular = '正式绩效',
  Probation = '试用期评估',
  PIP = '改进计划',
  Counseling = '日常辅导'
}

export type SchedulingStatus = 'scheduled' | 'pending';

export interface ShareConfig {
  items: {
      summary: boolean;
      form: boolean;
      info: boolean;
      ref: boolean;
      replay: boolean;
  };
  formPermission: 'read' | 'edit';
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  role: string;
  avatar: string;
}

export type FieldType = 'text' | 'textarea' | 'rating' | 'date' | 'number' | 'attachment' | 'select' | 'graph';

export interface TemplateField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  width?: 'full' | 'half' | 'one-third';
  options?: string[];
}

export interface TemplateSection {
  id: string;
  title: string;
  description?: string;
  viewType: 'form' | 'table';
  columns?: 1 | 2 | 3;
  fields: TemplateField[];
}

export interface InterviewTemplate {
  id: string;
  name: string;
  description: string;
  sections: TemplateSection[]; 
  status?: 'active' | 'disabled';
}

export interface InterviewSession {
  id: string;
  employeeId: string;
  employeeName: string;
  managerName: string;
  date: string;
  period: string;
  status: Status;
  type: InterviewType;
  method: 'direct' | 'appointment';
  templateId: string;
  linkedAssessmentId?: string;
  assessmentCycle?: string;
  content?: Record<string, any>; 
  schedulingStatus?: SchedulingStatus;
  deadline?: string;
  gradeTag?: string; 
  department?: string; 
  riskTag?: 'high_risk' | 'controversial' | 'normal';
  requireConfirmation?: boolean;
  signatureType?: 'confirmation' | 'handwritten' | 'electronic'; 
  shareConfig?: ShareConfig; // New: visibility and permission settings
}

export interface AssessmentItem {
  id: string;
  employeeId: string;
  employeeName: string;
  role: string;
  employeeStatus: string; 
  currentStage: string; 
  processStatus: string; 
  handler: string;
  group: string;
  templateName: string;
  indicatorTemplate: string;
  score: number;
  grade: string;
}

export interface DimensionItem {
  id: string;
  name: string;
  selfScore: number;
  managerScore: number;
  weight: number;
  description?: string;
  // New fields for analysis
  score?: number; // Final score for the dimension
  previousScore?: number;
  averageScore?: number;
  comparisonPrevious?: string; // e.g., "+3 (+4.48%)"
  comparisonAverage?: string; // e.g., "+15.83 (Higher than avg 29.23%)"
}

export interface IndicatorItem {
  id: string;
  name: string;
  score: number;
  previousScore?: number;
  averageScore?: number;
  comparisonPrevious?: string;
  comparisonAverage?: string;
  selfScore?: number;
  managerScore?: number;
  weight?: number;
  description?: string;
  trend?: 'up' | 'down' | 'stable';
}

export interface AssessmentDetail {
  id: string; 
  description: string;
  // Summary fields
  performanceScore?: number;
  performanceGrade?: string;
  performanceCoefficient?: number;
  percentile?: number;
  
  // Analysis Data
  dimensions?: DimensionItem[];
  indicators?: IndicatorItem[];
  
  highlights: DimensionItem[];
  improvements: DimensionItem[];
  controversies: DimensionItem[];
  attachments: AssessmentAttachment[];
  okrWeight?: number;
  kpiWeight?: number;
  okrs?: OKRItem[];
  kpis?: KPIItem[];
  
  // Trends
  scoreTrend?: PerformanceTrend[];
  coreIndicatorTrends?: { name: string, data: PerformanceTrend[] }[];
}

export interface AssessmentAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'img' | 'doc';
  url: string;
  size: string;
}

export interface OKRItem {
  id: string;
  sequence: number;
  name: string;
  weight: number;
  krs: { content: string }[];
}

export interface KPIItem {
  id: string;
  sequence: number;
  name: string;
  description: string;
  evaluationMethod: string;
  weight: number;
  targetValue: string;
}

export interface Notification {
  id: string;
  targetRole: 'HR' | 'Employee';
  type: 'system' | 'task' | 'alert';
  title: string;
  content: string;
  time: string;
  read: boolean;
}

/**
 * Fix: Added PerformanceRecord interface used in constants.ts
 */
export interface PerformanceRecord {
  id: string;
  employeeId: string;
  period: string;
  overallScore: number;
  grade: string;
  status: Status;
  kpiScore: number;
  okrScore: number;
}

/**
 * Fix: Added PerformanceTrend interface used in constants.ts
 */
export interface PerformanceTrend {
  period: string;
  score: number;
  grade: string;
}

/**
 * Fix: Added HistoricalRecord interface used in constants.ts and various components
 */
export interface HistoricalRecord {
  id: string;
  date: string;
  type: string;
  manager: string;
  summary: string;
}
