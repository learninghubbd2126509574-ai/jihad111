export interface Member {
  id: string;
  name: string;
  type: 'leader' | 'trainer';
  target?: number;
  whatsapp?: string;
  createdAt: any;
}

export interface Result {
  id: string;
  memberId: string;
  lead: number;
  convert: number;
  personalLead: number;
  submitted: boolean;
  updatedAt: any;
}

export interface PickingItem {
  id: string;
  name: string;
  isSelected: boolean;
  createdAt: any;
}

export interface Application {
  id: string;
  fullName: string;
  fathersName: string;
  mothersName: string;
  dob: string;
  gender: string;
  age: string;
  maritalStatus: string;
  hasChildren: string;
  religion: string;
  nationality: string;
  mobileNumber: string;
  parentMobileNumber: string;
  paymentMethod: string;
  methodNumber: string;
  email: string;
  presentAddress: string;
  permanentAddress: string;
  highestQualification: string;
  passingYear: string;
  occupation: string;
  timeIssue: string;
  regularTime: string;
  joiningDuration: string;
  totalConverts: string;
  createdAt: any;
}

export interface Teacher {
  id: string;
  name: string;
  createdAt: any;
}

export interface AttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  course: string;
  date: string;
  submittedAt: any;
}

export interface STLMember {
  id: string;
  name: string;
  assignedTLs?: string[];
  whatsapp?: string;
  profilePic?: string;
  target?: number;
  createdAt: any;
}

export interface STLAttendance {
  id: string;
  memberId: string;
  memberName: string;
  submittedAt: any;
}

export interface DemoMember {
  id: string;
  name: string;
  createdAt: any;
}

export interface DemoAttendance {
  id: string;
  memberId: string;
  memberName: string;
  submittedAt: any;
}

export interface RankingMember {
  id: string;
  name: string;
  score: number;
  leads?: number;
  createdAt: any;
}

export interface QuickLink {
  id: string;
  name: string;
  url: string;
  createdAt: any;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  createdAt: any;
  likesCount: number;
}

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: any;
}

export interface UserRegistration {
  id?: string;
  fullName: string;
  whatsapp: string;
  position: 'Team Leader' | 'Team Trainer' | 'STL' | 'Teacher' | 'Counsellor';
  password: string;
  teamLeader?: string;
  vacancy?: string;
  status: 'pending' | 'active' | 'blocked';
  createdAt: any;
  profilePic?: string;
  memberId?: string;
}

export interface SocialLinks {
  facebook?: string;
  youtube?: string;
  whatsapp?: string;
  telegram?: string;
  tiktok?: string;
}

export interface CounsellingSchedule {
  id: string;
  text: string;
}

export interface PaymentMethods {
  bkash?: string;
  nagad?: string;
  rocket?: string;
  upay?: string;
}

export interface UserBalance {
  id?: string;
  whatsapp: string;
  userName: string;
  balance: number;
  waivedFines: number;
  waivedDays?: string[];
  manualAdjustments: number;
  updatedAt?: any;
}

export interface SubmissionLog {
  id?: string;
  whatsapp?: string;
  memberId: string;
  memberName?: string;
  date: string;
  lead: number;
  convert: number;
  personalLead: number;
  submittedAt: any;
}

export interface AuditLog {
  id?: string;
  whatsapp: string;
  userName: string;
  action: string;
  amount?: number;
  reason?: string;
  date?: string;
  performedBy: string;
  createdAt: any;
}

export interface Config {
  timerActive: boolean;
  timerEndTime: number;
  timerDuration: number;
  announcement?: string;
  announcementActive?: boolean;
  securityPassword?: string;
  isLocked?: boolean;
  stlActive?: boolean;
  demoActive?: boolean;
  teacherActive?: boolean;
  leaderRankingActive?: boolean;
  trainerRankingActive?: boolean;
  socialLinks?: SocialLinks;
  noticeText?: string;
  stlLoginActive?: boolean;
  stlPassword?: string;
  counsellingSchedules?: CounsellingSchedule[];
  paymentMethods?: PaymentMethods;
  autoTimerEnabled?: boolean;
  autoTimerTime?: string;
  lastAutoStartTime?: string;
  totalConverts?: number;
  fineAmount?: number;
  workingDaysInMonth?: number;
  fineSystemActive?: boolean;
  fineStartDate?: string;
  finesResetAt?: any;
  customLogo?: string;
  communityActive?: boolean;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export const COURSES = [
  'Photo Edit',
  'Video Edit',
  'Digital Marketing',
  'Data Entry',
  'Spoken English',
  'Freelancing Course',
];

export interface UserSubmissionStats {
  submittedCount: number;
  totalWorkingDays: number;
  missedCount: number;
  waivedCount: number;
  unwaivedMissedCount: number;
  totalFine: number;
  totalLead: number;
  totalConvert: number;
  totalPersonalLead: number;
  submittedDates: string[];
  missedDates: string[];
  waivedDays: string[];
  allWorkingDates: string[];
  logsByDate: Record<string, { lead: number; convert: number; personalLead: number; submittedAt: any }>;
  todaySubmitted: boolean;
  isExempt: boolean;
}

export type ShowMsgFn = (msg: string, type?: 'success' | 'error' | 'info') => void;
