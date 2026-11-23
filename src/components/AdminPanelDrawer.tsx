import React, { useState } from 'react';
import {
  Shield,
  X,
  LogOut,
  Upload,
  Clock,
  Copy,
  Trophy,
  RefreshCw,
  Users,
  AlertTriangle,
  Megaphone,
  MessageSquare,
  Calendar,
  Briefcase,
  Info,
  Trash2,
  Presentation,
  Crown,
  Award,
  Coins,
  Target,
} from 'lucide-react';
import { InlineCountdown } from './SessionTimer';
import StlAdminManager from './StlAdminManager';
import RankingExportManager from './RankingExportManager';
import {
  AdminAccordion,
  AdminPasswordManager,
  AdminSection,
  AnnouncementManager,
  BalanceManagementSection,
  BrandLogoManager,
  CounsellingManager,
  FineSettingsManager,
  LifetimeConvertsInput,
  NoticeManager,
  PickingScheduleManager,
  QuickLinksManagementSection,
  RankingSection,
  ResultCopyManager,
  SecurityManager,
  SimpleManagementSection,
  SocialLinksManager,
  StlManager,
  TeacherManagementSection,
  UserManagementSection,
} from './AdminManagers';
import {
  Application,
  AttendanceRecord,
  AuditLog,
  Config,
  CounsellingSchedule,
  DemoAttendance,
  DemoMember,
  Member,
  PaymentMethods,
  PickingItem,
  QuickLink,
  RankingMember,
  Result,
  ShowMsgFn,
  SocialLinks,
  STLAttendance,
  STLMember,
  Teacher,
  UserBalance,
  UserRegistration,
} from '../types';

export interface AdminPanelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  config: Config;
  members: Member[];
  sortedLeaders: any[];
  sortedTrainers: any[];
  results: Record<string, Result>;
  quickLinks: QuickLink[];
  stlMembers: STLMember[];
  stlAttendance: STLAttendance[];
  demoMembers: DemoMember[];
  demoAttendance: DemoAttendance[];
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  applications: Application[];
  pickingSchedule: PickingItem[];
  leaderRanking: RankingMember[];
  trainerRanking: RankingMember[];
  pendingUsers: UserRegistration[];
  approvedUsers: UserRegistration[];
  userBalances: Record<string, UserBalance>;
  auditLogs: AuditLog[];
  showMsg: ShowMsgFn;
  timerDurationSelect: number;
  setTimerDurationSelect: (val: number) => void;
  startTimer: (duration: number) => Promise<void>;
  stopTimer: () => Promise<void>;
  clearResults: () => Promise<void>;
  updateAutoTimer: (enabled: boolean, time: string) => Promise<void>;
  updateWebsiteLogo: (url: string | null) => Promise<void>;
  updateTotalConverts: (val: number) => Promise<void>;
  resetAndSyncRankings: () => Promise<void>;
  syncMembersToRankings: () => Promise<void>;
  forceSyncFromRankings: () => Promise<void>;
  destructiveDataReset: () => void;
  updateAnnouncement: (text: string, active: boolean) => Promise<void>;
  addQuickLink: (name: string, url: string) => Promise<void>;
  deleteQuickLink: (id: string) => Promise<void>;
  updateSocialLinks: (links: SocialLinks) => Promise<void>;
  updateNoticeText: (text: string) => Promise<void>;
  toggleCommunityActive: () => Promise<void>;
  addSTLMember: (name: string, target?: number) => Promise<void>;
  deleteSTLMember: (id: string) => Promise<void>;
  onOpenStlAssign: (stl: STLMember) => void;
  removeTLFromSTL: (stlId: string, tlId: string) => Promise<void>;
  updateStlTarget: (id: string, target: number) => Promise<void>;
  addMember: (name: string, type: 'leader' | 'trainer', target?: number) => Promise<void>;
  deleteMember: (id: string) => void;
  updateMemberTarget: (id: string, target: number) => Promise<void>;
  addTeacher: (name: string) => Promise<void>;
  deleteTeacher: (id: string, name: string) => void;
  onViewTeacherHistory: (teacher: Teacher) => void;
  onViewAppDetails: (app: Application) => void;
  deleteApplication: (id: string) => void;
  addPickingItem: (name: string) => Promise<void>;
  deletePickingItem: (id: string) => Promise<void>;
  togglePickingItem: (id: string, current: boolean) => Promise<void>;
  addDemoMember: (name: string) => Promise<void>;
  deleteDemoMember: (id: string) => Promise<void>;
  updateAttendanceConfig: (
    stl?: boolean,
    demo?: boolean,
    leaderR?: boolean,
    trainerR?: boolean
  ) => Promise<void>;
  updateAdminPassword: (newPass: string) => Promise<void>;
  updateSecurity: (password: string, locked: boolean) => Promise<void>;
  updateStlSettings: (password: string, active: boolean) => Promise<void>;
  updateCounsellingSettings: (
    schedules: CounsellingSchedule[],
    methods: PaymentMethods
  ) => Promise<void>;
  addRankingMember: (
    type: 'leader' | 'trainer',
    name: string,
    score: number,
    leads?: number
  ) => Promise<void>;
  deleteRankingMember: (type: 'leader' | 'trainer', id: string) => Promise<void>;
  setRankingScore: (
    type: 'leader' | 'trainer',
    id: string,
    newScore: number
  ) => Promise<void>;
  approveUser: (user: UserRegistration) => Promise<void>;
  rejectUser: (id: string) => Promise<void>;
  toggleUserBlock: (user: UserRegistration) => Promise<void>;
  deleteUser: (whatsapp: string) => void;
  changeUserPassword: (whatsapp: string, newPass: string) => Promise<void>;
  updateFineRate: (amount: number) => Promise<void>;
  toggleFineSystem: (active: boolean) => Promise<void>;
  clearAllFineData: () => Promise<void>;
  adminWaiveDay1ForAll: () => Promise<void>;
  handleAllReset: () => Promise<void>;
  adminUpdateBalance: (
    whatsapp: string,
    userName: string,
    amount: number,
    isDeduct: boolean,
    reason: string
  ) => Promise<void>;
  adminWaiveFine: (
    whatsapp: string,
    userName: string,
    amount: number,
    reason: string
  ) => Promise<void>;
  adminRemoveDayFine: (
    whatsapp: string,
    userName: string,
    dateStr: string,
    reason: string
  ) => Promise<void>;
  adminRecalculateFine: (whatsapp: string, userName: string) => Promise<void>;
  computeUserSubmissionStats: (userWhatsapp: string, memberId?: string) => any;
}

const AdminPanelDrawer: React.FC<AdminPanelDrawerProps> = ({
  isOpen,
  onClose,
  onLogout,
  config,
  members,
  sortedLeaders,
  sortedTrainers,
  results,
  quickLinks,
  stlMembers,
  stlAttendance,
  demoMembers,
  demoAttendance,
  teachers,
  attendanceRecords,
  applications,
  pickingSchedule,
  leaderRanking,
  trainerRanking,
  pendingUsers,
  approvedUsers,
  userBalances,
  auditLogs,
  showMsg,
  timerDurationSelect,
  setTimerDurationSelect,
  startTimer,
  stopTimer,
  clearResults,
  updateAutoTimer,
  updateWebsiteLogo,
  updateTotalConverts,
  resetAndSyncRankings,
  syncMembersToRankings,
  forceSyncFromRankings,
  destructiveDataReset,
  updateAnnouncement,
  addQuickLink,
  deleteQuickLink,
  updateSocialLinks,
  updateNoticeText,
  toggleCommunityActive,
  addSTLMember,
  deleteSTLMember,
  onOpenStlAssign,
  removeTLFromSTL,
  updateStlTarget,
  addMember,
  deleteMember,
  updateMemberTarget,
  addTeacher,
  deleteTeacher,
  onViewTeacherHistory,
  onViewAppDetails,
  deleteApplication,
  addPickingItem,
  deletePickingItem,
  togglePickingItem,
  addDemoMember,
  deleteDemoMember,
  updateAttendanceConfig,
  updateAdminPassword,
  updateSecurity,
  updateStlSettings,
  updateCounsellingSettings,
  addRankingMember,
  deleteRankingMember,
  setRankingScore,
  approveUser,
  rejectUser,
  toggleUserBlock,
  deleteUser,
  changeUserPassword,
  updateFineRate,
  toggleFineSystem,
  clearAllFineData,
  adminWaiveDay1ForAll,
  handleAllReset,
  adminUpdateBalance,
  adminWaiveFine,
  adminRemoveDayFine,
  adminRecalculateFine,
  computeUserSubmissionStats,
}) => {
  const [autoTimeVal, setAutoTimeVal] = useState(config.autoTimerTime || '22:00');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[450]">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/45 animate-fade-in"
      />
      <aside className="fixed top-0 right-0 w-full max-w-xl h-full bg-[#F4F6F9] border-l border-[#E5E7EB] z-[500] flex flex-col shadow-2xl overflow-hidden animate-drawer-right">
        {/* Sticky White Corporate Header */}
        <div className="bg-white border-b border-[#E5E7EB] px-4 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#EEF5FF] border border-[#D6E6FF] text-[#0B4F9C] flex items-center justify-center shrink-0">
              <Shield size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A] truncate">
                Admin Control Center
              </h2>
              <p className="text-[11px] text-[#64748B] truncate">
                Unity Earning Operations & Branding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="p-2 rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-[#F4F6F9] text-[#64748B] hover:text-[#0F172A] border border-[#E5E7EB] transition-colors cursor-pointer"
              aria-label="Close admin panel"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 custom-scrollbar space-y-3.5">
          {/* 1. Website Branding & Logo */}
          <AdminAccordion
            title="Website Logo & Branding"
            icon={<Upload size={16} />}
            colorClass="text-[#0B4F9C]"
          >
            <BrandLogoManager
              config={config}
              onUpdateLogo={updateWebsiteLogo}
              showMsg={showMsg}
            />
          </AdminAccordion>

          {/* 2. Operations & Auto-Timer */}
          <AdminAccordion
            title="Operations & Auto-Timer"
            icon={<Clock size={16} />}
            colorClass="text-[#0B4F9C]"
          >
            <div className="space-y-4">
              <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0F172A]">Submission Session Timer</h4>
                  <span
                    className={`text-[11px] font-bold ${
                      config.timerActive ? 'text-[#047857]' : 'text-[#64748B]'
                    }`}
                  >
                    {config.timerActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#64748B] block mb-2">
                    Select Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: '15 Min', val: 900 },
                      { label: '30 Min', val: 1800 },
                      { label: '45 Min', val: 2700 },
                      { label: '60 Min', val: 3600 },
                    ].map((d) => (
                      <button
                        key={d.val}
                        type="button"
                        disabled={config.timerActive}
                        onClick={() => setTimerDurationSelect(d.val)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer disabled:opacity-40 ${
                          timerDurationSelect === d.val
                            ? 'bg-[#EEF5FF] text-[#0B4F9C] border-[#0B4F9C]'
                            : 'bg-[#F8FAFC] text-[#64748B] border-[#E5E7EB] hover:border-[#CBD5E1]'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                {config.timerActive && (
                  <div className="bg-[#EEF5FF] border border-[#D6E6FF] py-3 rounded-xl text-center">
                    <InlineCountdown
                      timerActive={config.timerActive}
                      timerEndTime={config.timerEndTime}
                      className="text-3xl font-mono font-extrabold text-[#0B4F9C] tabular-nums"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => startTimer(timerDurationSelect)}
                    disabled={config.timerActive}
                    className="py-2.5 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Start Session ({Math.round(timerDurationSelect / 60)}m)
                  </button>
                  <button
                    type="button"
                    onClick={stopTimer}
                    disabled={!config.timerActive}
                    className="py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl text-xs transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Stop Session
                  </button>
                </div>

                <button
                  type="button"
                  onClick={clearResults}
                  className="w-full py-2 text-xs font-bold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#FECACA] rounded-xl transition-colors cursor-pointer"
                >
                  Clear Today&apos;s Submission Data
                </button>
              </div>

              <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0F172A]">Auto-Timer Schedule</h4>
                  <button
                    type="button"
                    onClick={() =>
                      updateAutoTimer(!config.autoTimerEnabled, autoTimeVal || '22:00')
                    }
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                      config.autoTimerEnabled
                        ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                        : 'bg-[#F4F6F9] text-[#64748B] border-[#E5E7EB]'
                    }`}
                  >
                    {config.autoTimerEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={autoTimeVal}
                    onChange={(e) => setAutoTimeVal(e.target.value)}
                    className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-sm font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => updateAutoTimer(!!config.autoTimerEnabled, autoTimeVal)}
                    className="px-4 py-2 bg-[#0B4F9C] text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Save Time
                  </button>
                </div>
              </div>
            </div>
          </AdminAccordion>

          {/* 3. Result Copy Hub */}
          <AdminAccordion
            title="Result Copy & Export Hub"
            icon={<Copy size={16} />}
            colorClass="text-[#0B4F9C]"
          >
            <ResultCopyManager
              sortedLeaders={sortedLeaders}
              sortedTrainers={sortedTrainers}
              results={results}
              showMsg={showMsg}
            />
          </AdminAccordion>

          {/* 4. Conversion Intelligence */}
          <AdminAccordion
            title="Conversion Intelligence"
            icon={<Trophy size={16} />}
            colorClass="text-[#B45309]"
          >
            <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl space-y-3">
              <label className="text-xs font-bold text-[#0F172A] block">
                Lifetime Total Converts
              </label>
              <LifetimeConvertsInput
                currentValue={config.totalConverts || 0}
                onSave={updateTotalConverts}
              />
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={resetAndSyncRankings}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] text-xs font-bold hover:bg-[#FEF3C7] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} /> Reset & Re-sync All Rankings
                </button>
                <button
                  type="button"
                  onClick={syncMembersToRankings}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#EEF5FF] text-[#0B4F9C] border border-[#D6E6FF] text-xs font-bold hover:bg-[#D6E6FF] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Users size={14} /> Sync All Members to Ranking
                </button>
                <button
                  type="button"
                  onClick={forceSyncFromRankings}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] text-xs font-bold hover:bg-[#D1FAE5] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={14} /> Force Sync from Rankings
                </button>
                <button
                  type="button"
                  onClick={destructiveDataReset}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] text-xs font-bold hover:bg-[#FEE2E2] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <AlertTriangle size={14} /> Destructive Data Reset (All Scores Zero)
                </button>
              </div>
            </div>
          </AdminAccordion>

          {/* 5. Communication & Hub */}
          <AdminAccordion
            title="Communication & Hub"
            icon={<Megaphone size={16} />}
            colorClass="text-[#0B4F9C]"
          >
            <div className="space-y-4">
              <AnnouncementManager config={config} onUpdate={updateAnnouncement} />
              <QuickLinksManagementSection
                links={quickLinks}
                onAdd={addQuickLink}
                onDelete={deleteQuickLink}
              />
              <SocialLinksManager config={config} onUpdate={updateSocialLinks} />
              <NoticeManager config={config} onUpdate={updateNoticeText} />

              <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#EEF5FF] text-[#0B4F9C] rounded-xl">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Community Tab</h4>
                    <p className="text-[11px] text-[#64748B]">Enable or disable the team community feed</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleCommunityActive}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                    config.communityActive
                      ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                      : 'bg-[#F4F6F9] text-[#64748B] border-[#E5E7EB]'
                  }`}
                >
                  {config.communityActive ? 'Active' : 'Closed'}
                </button>
              </div>
            </div>
          </AdminAccordion>

          {/* 6. Team Roster Management */}
          <AdminAccordion
            title="Team Roster Management"
            icon={<Users size={16} />}
            colorClass="text-[#0B4F9C]"
          >
            <div className="space-y-4">
              <StlAdminManager
                stlMembers={stlMembers}
                registeredUsers={approvedUsers}
                teamLeaders={members.filter((m) => m.type === 'leader')}
                leaderRanking={leaderRanking}
                results={results}
                onAddSTL={addSTLMember}
                onDeleteSTL={deleteSTLMember}
                onOpenAssignModal={onOpenStlAssign}
                onRemoveTLFromSTL={removeTLFromSTL}
                onUpdateTarget={updateStlTarget}
              />

              <div className="p-3.5 bg-[#EEF5FF] border border-[#D6E6FF] rounded-xl flex items-start gap-2.5">
                <Target size={16} className="text-[#0B4F9C] shrink-0 mt-0.5" />
                <p className="text-xs text-[#334155]">
                  Update monthly conversion targets for each Team Leader and Trainer below.
                </p>
              </div>

              <AdminSection
                title="Team Leaders"
                onAdd={(name, target) => addMember(name, 'leader', target)}
                members={members.filter((m) => m.type === 'leader')}
                onDelete={deleteMember}
                onUpdateTarget={updateMemberTarget}
              />
              <AdminSection
                title="Team Trainers"
                onAdd={(name, target) => addMember(name, 'trainer', target)}
                members={members.filter((m) => m.type === 'trainer')}
                onDelete={deleteMember}
                onUpdateTarget={updateMemberTarget}
              />
              <TeacherManagementSection
                teachers={teachers}
                attendanceRecords={attendanceRecords}
                onAdd={addTeacher}
                onDelete={deleteTeacher}
                onViewHistory={onViewTeacherHistory}
              />
            </div>
          </AdminAccordion>

          {/* 7. Schedules & Logs */}
          <AdminAccordion
            title="Schedules & Logs"
            icon={<Calendar size={16} />}
            colorClass="text-[#047857]"
          >
            <div className="space-y-4">
              <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E5E7EB]">
                  <Briefcase size={16} className="text-[#0B4F9C]" />
                  <h4 className="text-xs font-bold text-[#0F172A]">
                    Job Applications ({applications.length})
                  </h4>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
                  {applications.length === 0 ? (
                    <p className="text-xs text-[#64748B] text-center py-6">No applications submitted yet</p>
                  ) : (
                    applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0F172A] truncate">
                            {app.fullName}
                          </div>
                          <div className="text-[11px] text-[#64748B] font-mono tabular-nums">
                            {app.mobileNumber}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onViewAppDetails(app)}
                            className="p-1.5 text-[#0B4F9C] hover:bg-[#EEF5FF] rounded-lg cursor-pointer"
                            title="Details"
                          >
                            <Info size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteApplication(app.id)}
                            className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <PickingScheduleManager
                items={pickingSchedule}
                onAdd={addPickingItem}
                onDelete={deletePickingItem}
                onToggle={togglePickingItem}
              />

              <SimpleManagementSection
                title="STL Meeting Members"
                icon={Users}
                colorClass="text-[#0B4F9C]"
                members={stlMembers}
                onAdd={(name) => addSTLMember(name)}
                onDelete={deleteSTLMember}
                isActive={config.stlActive || false}
                onToggleActive={(val) => updateAttendanceConfig(val, undefined)}
                attendanceRecords={stlAttendance}
              />

              <SimpleManagementSection
                title="Demo Members"
                icon={Presentation}
                colorClass="text-[#047857]"
                members={demoMembers}
                onAdd={addDemoMember}
                onDelete={deleteDemoMember}
                isActive={config.demoActive || false}
                onToggleActive={(val) => updateAttendanceConfig(undefined, val)}
                attendanceRecords={demoAttendance}
              />
            </div>
          </AdminAccordion>

          {/* 8. Security & Environment */}
          <AdminAccordion
            title="Security & Environment"
            icon={<Shield size={16} />}
            colorClass="text-[#DC2626]"
          >
            <div className="space-y-4">
              <AdminPasswordManager onUpdate={updateAdminPassword} />
              <SecurityManager config={config} onUpdate={updateSecurity} />
              <StlManager config={config} onUpdate={updateStlSettings} />
              <CounsellingManager config={config} onUpdate={updateCounsellingSettings} />
            </div>
          </AdminAccordion>

          {/* 9. Leaderboard & Ranking */}
          <AdminAccordion
            title="Leaderboard & Ranking Management"
            icon={<Crown size={16} />}
            colorClass="text-[#B45309]"
          >
            <div className="space-y-4">
              <RankingSection
                title="Leader Ranking Management"
                icon={Crown}
                colorClass="text-[#B45309]"
                members={leaderRanking}
                onAdd={(name, score, leads) => addRankingMember('leader', name, score, leads)}
                onDelete={(id) => deleteRankingMember('leader', id)}
                onSetScore={(id, newScore) => setRankingScore('leader', id, newScore)}
                isActive={config.leaderRankingActive || false}
                onToggleActive={(val) =>
                  updateAttendanceConfig(undefined, undefined, val, undefined)
                }
              />
              <RankingSection
                title="Trainer Ranking Management"
                icon={Award}
                colorClass="text-[#0B4F9C]"
                members={trainerRanking}
                onAdd={(name, score, leads) => addRankingMember('trainer', name, score, leads)}
                onDelete={(id) => deleteRankingMember('trainer', id)}
                onSetScore={(id, newScore) => setRankingScore('trainer', id, newScore)}
                isActive={config.trainerRankingActive || false}
                onToggleActive={(val) =>
                  updateAttendanceConfig(undefined, undefined, undefined, val)
                }
              />
              <RankingExportManager
                leaderRanking={leaderRanking}
                trainerRanking={trainerRanking}
                customLogo={config.customLogo}
              />
            </div>
          </AdminAccordion>

          {/* 10. Member Approvals */}
          <AdminAccordion
            title={`Member Approvals & Permissions (${pendingUsers.length} Pending)`}
            icon={<Users size={16} />}
            colorClass="text-[#0B4F9C]"
            defaultOpen={pendingUsers.length > 0}
          >
            <UserManagementSection
              pending={pendingUsers}
              approved={approvedUsers}
              onApprove={approveUser}
              onReject={rejectUser}
              onToggleBlock={toggleUserBlock}
              onDelete={deleteUser}
              onUpdatePass={changeUserPassword}
            />
          </AdminAccordion>

          {/* 11. Fine Settings & Balance Management */}
          <AdminAccordion
            title="Fine Settings & Balance Management"
            icon={<Coins size={16} />}
            colorClass="text-[#047857]"
          >
            <div className="space-y-4">
              <FineSettingsManager
                config={config}
                onUpdateFine={updateFineRate}
                onToggleFineSystem={toggleFineSystem}
                onClearAllFines={clearAllFineData}
                onFixDay1Fine={adminWaiveDay1ForAll}
                onAllReset={handleAllReset}
              />
              <BalanceManagementSection
                approvedUsers={approvedUsers}
                members={members}
                userBalances={userBalances}
                auditLogs={auditLogs}
                onUpdateBalance={adminUpdateBalance}
                onWaiveFine={adminWaiveFine}
                onRemoveDayFine={adminRemoveDayFine}
                onRecalculateFine={adminRecalculateFine}
                computeUserSubmissionStats={computeUserSubmissionStats}
              />
            </div>
          </AdminAccordion>
        </div>
      </aside>
    </div>
  );
};

export default AdminPanelDrawer;
