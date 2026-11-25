import React, { useState, useRef } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
  Calendar,
  Check,
  Briefcase,
  Trash2,
  GraduationCap,
  History,
  Crown,
  Award,
  Download,
  Loader2,
  Globe,
  Megaphone,
  Clock,
  CreditCard,
  Shield,
  Users,
  Lock,
  Gift,
} from 'lucide-react';
import RankingExportTemplate from './RankingExportTemplate';
import CartoonAvatar from './CartoonAvatar';
import { generateRankingPdf } from '../utils/exportRankingPdf';
import {
  Application,
  AttendanceRecord,
  Config,
  Member,
  PickingItem,
  QuickLink,
  RankingMember,
  Result,
  SocialLinks,
  Teacher,
  UserRegistration,
} from '../types';

export const Toast: React.FC<{
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  onClose?: () => void;
}> = ({ toast, onClose }) => {
  if (!toast) return null;
  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[1500] max-w-md w-[calc(100%-2rem)] animate-slide-up">
      <div
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm font-bold ${
          isError
            ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
            : isInfo
              ? 'bg-[#EEF5FF] border-[#D6E6FF] text-[#0B4F9C]'
              : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#047857]'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {isError ? (
            <AlertCircle size={17} className="shrink-0" />
          ) : (
            <CheckCircle2 size={17} className="shrink-0" />
          )}
          <span className="truncate">{toast.message}</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 opacity-70 hover:opacity-100 cursor-pointer shrink-0"
            aria-label="Close notification"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export const QuickLinksModal = ({
  links,
  onClose,
}: {
  links: QuickLink[];
  onClose: () => void;
}) => {
  const displayLinks = links || [];

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E5E7EB] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[82vh]"
      >
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EEF5FF] text-[#0B4F9C]">
              <LinkIcon size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">All Links & Resources</h3>
              <p className="text-[11px] text-[#64748B]">Official Portals & Quick Links</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F6F9] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-2.5 custom-scrollbar">
          {displayLinks.length === 0 ? (
            <div className="py-10 text-center space-y-1">
              <p className="text-xs font-bold text-[#475569]">No links added yet</p>
              <p className="text-[11px] text-[#94A3B8]">
                Links added by Admin will appear here.
              </p>
            </div>
          ) : (
            displayLinks.map((link) => {
              const href = link.url.startsWith('http') ? link.url : `https://${link.url}`;
              return (
                <a
                  key={link.id || link.name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#EEF5FF] border border-[#E5E7EB] hover:border-[#D6E6FF] transition-colors group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="text-xs font-bold text-[#0F172A] group-hover:text-[#0B4F9C] truncate">
                      {link.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] truncate">{link.url}</div>
                  </div>
                  <ExternalLink size={15} className="text-[#0B4F9C] shrink-0" />
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export const ConfirmModal = ({
  title,
  message,
  isDestructive = true,
  onConfirm,
  onClose,
}: {
  title: string;
  message?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-slide-up"
    >
      <h3 className="text-base font-extrabold text-[#0F172A]">{title}</h3>
      {message && <p className="text-xs text-[#64748B] leading-relaxed">{message}</p>}
      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl bg-[#F4F6F9] hover:bg-[#E5E7EB] text-[#334155] text-xs font-bold transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={`flex-1 py-2.5 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer ${
            isDestructive
              ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
              : 'bg-[#0B4F9C] hover:bg-[#094182]'
          }`}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

export const PickingBoardModal = ({
  items,
  onClose,
}: {
  items: PickingItem[];
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white border border-[#E5E7EB] rounded-2xl max-w-md w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slide-up"
    >
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EEF5FF] text-[#0B4F9C]">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A]">Picking Board</h3>
            <p className="text-[11px] text-[#64748B]">Selection & Schedule List</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F6F9] cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-2 custom-scrollbar">
        {items.length === 0 ? (
          <p className="text-xs text-[#64748B] text-center py-12">No picking schedules available</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-3.5 rounded-xl border ${
                item.isSelected
                  ? 'bg-[#ECFDF5] border-[#A7F3D0]'
                  : 'bg-[#F8FAFC] border-[#E5E7EB]'
              }`}
            >
              <span
                className={`text-sm font-bold ${
                  item.isSelected ? 'text-[#047857]' : 'text-[#0F172A]'
                }`}
              >
                {item.name}
              </span>
              {item.isSelected && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#047857]">
                  <Check size={14} strokeWidth={2.5} /> Active
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC]">
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export const ApplicationForm = ({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: Omit<Application, 'id' | 'createdAt'>) => Promise<void>;
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    fathersName: '',
    mothersName: '',
    dob: '',
    gender: 'Male',
    age: '',
    maritalStatus: 'Unmarried',
    hasChildren: 'No',
    religion: 'Islam',
    nationality: 'Bangladeshi',
    mobileNumber: '',
    parentMobileNumber: '',
    paymentMethod: 'bKash',
    methodNumber: '',
    email: '',
    presentAddress: '',
    permanentAddress: '',
    highestQualification: '',
    passingYear: '',
    occupation: '',
    timeIssue: 'No',
    regularTime: 'Yes',
    joiningDuration: '',
    totalConverts: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E5E7EB] rounded-2xl max-w-xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
      >
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EEF5FF] text-[#0B4F9C]">
              <Briefcase size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">Team Member Application</h3>
              <p className="text-[11px] text-[#64748B]">Fill in the form with accurate details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F6F9] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Father's Name *"
              value={formData.fathersName}
              onChange={(e) => setFormData({ ...formData, fathersName: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <input
              type="text"
              required
              placeholder="Mother's Name *"
              value={formData.mothersName}
              onChange={(e) => setFormData({ ...formData, mothersName: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <input
              type="date"
              required
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <input
              type="text"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <select
              value={formData.maritalStatus}
              onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            >
              <option value="Unmarried">Unmarried</option>
              <option value="Married">Married</option>
            </select>
            <select
              value={formData.hasChildren}
              onChange={(e) => setFormData({ ...formData, hasChildren: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            >
              <option value="No">Children: No</option>
              <option value="Yes">Children: Yes</option>
            </select>
            <input
              type="text"
              placeholder="Religion"
              value={formData.religion}
              onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <input
              type="text"
              placeholder="Nationality"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <input
              type="tel"
              required
              placeholder="Mobile Number *"
              value={formData.mobileNumber}
              onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs font-mono"
            />
            <input
              type="tel"
              required
              placeholder="Guardian Mobile *"
              value={formData.parentMobileNumber}
              onChange={(e) => setFormData({ ...formData, parentMobileNumber: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs font-mono"
            />
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            >
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
            </select>
            <input
              type="tel"
              placeholder="Payment Number"
              value={formData.methodNumber}
              onChange={(e) => setFormData({ ...formData, methodNumber: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs font-mono"
            />
            <input
              type="email"
              required
              placeholder="Email Address *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs sm:col-span-2"
            />
            <input
              type="text"
              required
              placeholder="Present Address *"
              value={formData.presentAddress}
              onChange={(e) => setFormData({ ...formData, presentAddress: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs sm:col-span-2"
            />
            <input
              type="text"
              placeholder="Permanent Address"
              value={formData.permanentAddress}
              onChange={(e) => setFormData({ ...formData, permanentAddress: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs sm:col-span-2"
            />
            <input
              type="text"
              placeholder="Highest Qualification"
              value={formData.highestQualification}
              onChange={(e) => setFormData({ ...formData, highestQualification: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <input
              type="text"
              placeholder="Passing Year"
              value={formData.passingYear}
              onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <input
              type="text"
              placeholder="Occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <input
              type="text"
              placeholder="Any Time Constraint?"
              value={formData.timeIssue}
              onChange={(e) => setFormData({ ...formData, timeIssue: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <input
              type="text"
              placeholder="Available Regularly?"
              value={formData.regularTime}
              onChange={(e) => setFormData({ ...formData, regularTime: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <input
              type="text"
              placeholder="Joining Duration"
              value={formData.joiningDuration}
              onChange={(e) => setFormData({ ...formData, joiningDuration: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
            <input
              type="text"
              placeholder="Total Converts"
              value={formData.totalConverts}
              onChange={(e) => setFormData({ ...formData, totalConverts: e.target.value })}
              className="fintech-input rounded-xl px-3.5 py-2.5 text-xs sm:col-span-2"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const ApplicationDetailsModal = ({
  application,
  onClose,
  onRemove,
}: {
  application: Application;
  onClose: () => void;
  onRemove: (id: string) => void;
}) => (
  <div
    className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white border border-[#E5E7EB] rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
    >
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A]">{application.fullName}</h3>
          <p className="text-[11px] text-[#64748B]">Application Details</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs custom-scrollbar">
        {Object.entries(application)
          .filter(([k]) => !['id', 'createdAt'].includes(k))
          .map(([k, v]) => (
            <div key={k} className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
              <span className="block text-[10px] font-semibold text-[#64748B] capitalize mb-0.5">
                {k}
              </span>
              <span className="font-bold text-[#0F172A] break-words">{String(v || 'N/A')}</span>
            </div>
          ))}
      </div>

      <div className="p-4 border-t border-[#E5E7EB] bg-[#F8FAFC] flex gap-2.5">
        <button
          type="button"
          onClick={() => onRemove(application.id)}
          className="px-4 py-2.5 rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 size={14} /> Delete
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl bg-[#0B4F9C] text-white text-xs font-bold cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export const TeacherAttendanceModal = ({
  teachers,
  courses,
  onClose,
  onSubmit,
}: {
  teachers: Teacher[];
  courses: string[];
  onClose: () => void;
  onSubmit: (teacherId: string, teacherName: string, course: string, date: string) => Promise<void>;
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || '');
  const [course, setCourse] = useState(courses[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    if (!selectedTeacherId && teachers.length > 0) {
      setSelectedTeacherId(teachers[0].id);
    }
  }, [teachers, selectedTeacherId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const teacher = teachers.find((t) => t.id === selectedTeacherId);
    if (!teacher) {
      setErrorMsg('Please select a teacher.');
      return;
    }
    setErrorMsg('');
    await onSubmit(teacher.id, teacher.name, course, date);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-slide-up"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EEF5FF] text-[#0B4F9C]">
              <GraduationCap size={18} />
            </div>
            <h3 className="text-base font-extrabold text-[#0F172A]">Teacher Attendance</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-[#64748B] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1.5">Teacher</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                setErrorMsg('');
              }}
              className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs font-semibold"
            >
              <option value="">-- Select Teacher --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1.5">Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs font-semibold"
            >
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs font-mono"
            />
          </div>

          {errorMsg && <p className="text-xs font-semibold text-[#DC2626]">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Submit Attendance
          </button>
        </form>
      </div>
    </div>
  );
};

export const TeacherHistoryModal = ({
  teacher,
  records,
  onClose,
  onDeleteRecord,
}: {
  teacher: Teacher;
  records: AttendanceRecord[];
  onClose: () => void;
  onDeleteRecord: (id: string) => Promise<void>;
}) => (
  <div
    className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white border border-[#E5E7EB] rounded-2xl max-w-lg w-full max-h-[82vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
    >
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <History size={18} className="text-[#0B4F9C]" />
          <h3 className="text-base font-extrabold text-[#0F172A]">
            {teacher.name} — Class History ({records.length})
          </h3>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 text-[#64748B] cursor-pointer">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-2 custom-scrollbar">
        {records.length === 0 ? (
          <p className="text-xs text-[#64748B] text-center py-10">No records found</p>
        ) : (
          records.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]"
            >
              <div>
                <div className="text-xs font-bold text-[#0F172A]">{r.course}</div>
                <div className="text-[11px] text-[#64748B] font-mono tabular-nums">{r.date}</div>
              </div>
              <button
                type="button"
                onClick={() => onDeleteRecord(r.id)}
                className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg cursor-pointer"
                aria-label="Delete attendance record"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export const SimpleAttendanceModal = ({
  title,
  icon: Icon,
  members,
  onClose,
  onConfirm,
  isActive,
  attendanceRecords,
}: {
  title: string;
  icon: any;
  members: any[];
  onClose: () => void;
  onConfirm: (memberId: string, memberName: string) => void;
  isActive: boolean;
  attendanceRecords: any[];
}) => {
  const [selectedId, setSelectedId] = useState(members[0]?.id || '');
  const [viewingRecords, setViewingRecords] = useState<{ name: string; logs: any[] } | null>(null);
  const [emptyNotice, setEmptyNotice] = useState('');

  React.useEffect(() => {
    if (!selectedId && members.length > 0) setSelectedId(members[0].id);
  }, [members, selectedId]);

  const handleViewMemberHistory = () => {
    const member = members.find((m) => m.id === selectedId);
    if (!member) return;
    const logs = attendanceRecords.filter((r) => r.memberId === member.id);
    if (logs.length === 0) {
      setEmptyNotice(`No attendance records found for ${member.name}.`);
      return;
    }
    setEmptyNotice('');
    setViewingRecords({ name: member.name, logs });
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-slide-up"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EEF5FF] text-[#0B4F9C]">
              <Icon size={18} />
            </div>
            <h3 className="text-base font-extrabold text-[#0F172A]">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-[#64748B] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {!isActive ? (
          <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs font-semibold text-[#B45309] text-center">
            This attendance system is currently disabled by the admin.
          </div>
        ) : (
          <div className="space-y-3">
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setEmptyNotice('');
              }}
              className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs font-semibold"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            {emptyNotice && (
              <p className="text-xs font-semibold text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] px-3 py-2 rounded-xl">
                {emptyNotice}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleViewMemberHistory}
                className="px-3.5 py-2.5 rounded-xl bg-[#F4F6F9] hover:bg-[#E5E7EB] text-[#334155] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <History size={14} /> History
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = members.find((x) => x.id === selectedId);
                  if (m) onConfirm(m.id, m.name);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] text-white text-xs font-bold cursor-pointer"
              >
                Confirm Attendance
              </button>
            </div>
          </div>
        )}

        {viewingRecords && (
          <div className="pt-3 border-t border-[#E5E7EB] space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
              <span>{viewingRecords.name} — Logs</span>
              <button
                type="button"
                onClick={() => setViewingRecords(null)}
                className="text-[#64748B] cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            {viewingRecords.logs.map((l) => (
              <div
                key={l.id}
                className="p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] flex justify-between text-[11px]"
              >
                <span className="font-semibold text-[#0F172A]">{l.memberName}</span>
                <span className="text-[#64748B] font-mono">
                  {l.submittedAt?.toDate ? l.submittedAt.toDate().toLocaleString() : 'Submitted'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const AttendanceLogsModal = ({
  title,
  records,
  onClose,
}: {
  title: string;
  records: { id: string; memberName: string; submittedAt?: any }[];
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl animate-slide-up"
    >
      <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#E5E7EB]">
        <h3 className="text-base font-extrabold text-[#0F172A]">{title}</h3>
        <button type="button" onClick={onClose} className="p-1.5 text-[#64748B] cursor-pointer">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
        {records.length === 0 ? (
          <p className="text-xs text-[#64748B] text-center py-10">No logs found</p>
        ) : (
          records.map((a) => (
            <div
              key={a.id}
              className="bg-[#F8FAFC] border border-[#E5E7EB] p-3 rounded-xl flex justify-between items-center text-xs"
            >
              <span className="font-bold text-[#0F172A]">{a.memberName}</span>
              <span className="text-[11px] text-[#64748B] font-mono tabular-nums">
                {a.submittedAt?.toDate ? a.submittedAt.toDate().toLocaleString() : 'Completed'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

export const RankingBoardModal = ({
  title,
  icon: Icon,
  members,
  allLeaders,
  allTrainers,
  approvedUsers = [],
  rosterMembers = [],
  customLogo,
  onClose,
  isActive,
}: {
  title: string;
  icon: any;
  colorClass?: string;
  members: RankingMember[];
  allLeaders: RankingMember[];
  allTrainers: RankingMember[];
  approvedUsers?: UserRegistration[];
  rosterMembers?: Member[];
  results?: Record<string, Result>;
  customLogo?: string;
  onClose: () => void;
  isActive: boolean;
}) => {
  const findAvatar = (name: string) => {
    const clean = name.trim().toLowerCase().replace(/\s+/g, ' ');
    const memberMatch = rosterMembers.find(
      (m) => m.name?.trim().toLowerCase().replace(/\s+/g, ' ') === clean && (m as any).profilePic
    );
    if ((memberMatch as any)?.profilePic) return (memberMatch as any).profilePic as string;
    return approvedUsers.find(
      (u) => u.fullName?.trim().toLowerCase().replace(/\s+/g, ' ') === clean
    )?.profilePic;
  };
  const sortedMembers = [...members].sort((a, b) => (b.score || 0) - (a.score || 0));
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const exportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    setExportStatus('Generating PDF...');
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      await generateRankingPdf({
        element: exportRef.current,
        fileName: `Unity_Earning_Ranking_${dateStr}.pdf`,
        onProgress: (s) => setExportStatus(s),
      });
      setExportStatus('PDF download complete!');
    } catch {
      setExportStatus('Failed to download PDF.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E5E7EB] rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
      >
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#FFF9E6] text-[#B45309] border border-[#FDE68A]">
              <Icon size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A]">{title}</h3>
              <p className="text-[11px] text-[#64748B]">Total Members: {members.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isActive && (
              <button
                type="button"
                disabled={exporting}
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                <span>PDF</span>
              </button>
            )}
            <button type="button" onClick={onClose} className="p-1.5 text-[#64748B] cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {exportStatus && (
          <div className="px-5 py-2 bg-[#EEF5FF] border-b border-[#D6E6FF] text-xs font-semibold text-[#0B4F9C]">
            {exportStatus}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-2 custom-scrollbar">
          {!isActive ? (
            <p className="text-xs text-[#64748B] text-center py-12">
              This ranking board is currently closed.
            </p>
          ) : sortedMembers.length === 0 ? (
            <p className="text-xs text-[#64748B] text-center py-12">No data available</p>
          ) : (
            sortedMembers.map((m, idx) => (
              <div
                key={m.id}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                  idx < 3
                    ? 'bg-[#FFF9E6] border-[#FDE68A]'
                    : 'bg-[#F8FAFC] border-[#E5E7EB]'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold font-mono tabular-nums shrink-0 ${
                      idx === 0
                        ? 'bg-[#FF6B00] text-white'
                        : idx < 3
                          ? 'bg-[#B45309] text-white'
                          : 'bg-white border border-[#E5E7EB] text-[#64748B]'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E2E8F0] bg-white shrink-0">
                    <CartoonAvatar src={findAvatar(m.name)} name={m.name} />
                  </div>
                  <span className="text-sm font-bold text-[#0F172A] leading-snug break-words">
                    {m.name}
                  </span>
                </div>
                <span
                  className={`shrink-0 min-w-[2.25rem] px-2.5 py-1 rounded-lg text-center text-sm font-extrabold font-mono tabular-nums ${
                    idx < 3
                      ? 'bg-white text-[#B45309] border border-[#FDE68A]'
                      : 'bg-[#EEF5FF] text-[#0B4F9C] border border-[#D6E6FF]'
                  }`}
                >
                  {m.score || 0}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <RankingExportTemplate
            ref={exportRef}
            leaderRanking={allLeaders}
            trainerRanking={allTrainers}
            customLogo={customLogo}
          />
        </div>
      </div>
    </div>
  );
};

export const OverallStatsModal = ({
  onClose,
  leaders,
  trainers,
  approvedUsers = [],
  rosterMembers = [],
  results = {},
  customLogo,
}: {
  onClose: () => void;
  leaders: RankingMember[];
  trainers: RankingMember[];
  approvedUsers?: UserRegistration[];
  rosterMembers?: Member[];
  results?: Record<string, Result>;
  customLogo?: string;
}) => {
  const [tab, setTab] = useState<'leaders' | 'trainers'>('leaders');
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const exportRef = useRef<HTMLDivElement>(null);

  const findAvatar = (name: string) => {
    const clean = name.trim().toLowerCase().replace(/\s+/g, ' ');
    const memberMatch = rosterMembers.find(
      (m) => m.name?.trim().toLowerCase().replace(/\s+/g, ' ') === clean && (m as any).profilePic
    );
    if ((memberMatch as any)?.profilePic) return (memberMatch as any).profilePic as string;
    return approvedUsers.find(
      (u) => u.fullName?.trim().toLowerCase().replace(/\s+/g, ' ') === clean
    )?.profilePic;
  };

  const findTodayResult = (m: RankingMember): Result | undefined => {
    if (results[m.id]?.submitted) return results[m.id];
    const cleanName = (m.name || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const wa = ((m as any).whatsapp || '').replace(/\s+/g, '');
    if (wa) {
      if (results[wa]?.submitted) return results[wa];
      if (results[`member_${wa}`]?.submitted) return results[`member_${wa}`];
    }
    const rosterMatch = rosterMembers.find(
      (rm) =>
        (wa && rm.whatsapp && rm.whatsapp.replace(/\s+/g, '') === wa) ||
        (cleanName && rm.name?.trim().toLowerCase().replace(/\s+/g, ' ') === cleanName)
    );
    if (rosterMatch && results[rosterMatch.id]?.submitted) {
      return results[rosterMatch.id];
    }
    return results[m.id];
  };

  const list = [...(tab === 'leaders' ? leaders : trainers)].sort((a, b) => (b.score || 0) - (a.score || 0));

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    setExportStatus('Generating report...');
    try {
      const dateStr = new Date().toISOString().split('T')[0];
      await generateRankingPdf({
        element: exportRef.current,
        fileName: `Unity_Earning_Overall_Stats_${dateStr}.pdf`,
        onProgress: (s) => setExportStatus(s),
      });
      setExportStatus('Download complete!');
    } catch {
      setExportStatus('Failed to download report.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E5E7EB] rounded-2xl max-w-lg w-full max-h-[86vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
      >
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A]">Monthly Performance Stats</h3>
            <p className="text-[11px] text-[#64748B]">Combined conversion records of Leaders & Trainers</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={exporting}
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
              <span>PDF</span>
            </button>
            <button type="button" onClick={onClose} className="p-1.5 text-[#64748B] cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 pt-3">
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F4F6F9] rounded-xl border border-[#E5E7EB]">
            <button
              type="button"
              onClick={() => setTab('leaders')}
              className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                tab === 'leaders' ? 'bg-white text-[#0B4F9C] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              Team Leaders ({leaders.length})
            </button>
            <button
              type="button"
              onClick={() => setTab('trainers')}
              className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                tab === 'trainers' ? 'bg-white text-[#0B4F9C] shadow-xs' : 'text-[#64748B]'
              }`}
            >
              Team Trainers ({trainers.length})
            </button>
          </div>
        </div>

        {exportStatus && (
          <div className="mx-5 mt-2 px-3 py-1.5 bg-[#EEF5FF] border border-[#D6E6FF] rounded-lg text-xs font-semibold text-[#0B4F9C]">
            {exportStatus}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-2 custom-scrollbar">
          {list.map((m, idx) => (
              <div
                key={m.id}
                className="flex items-center justify-between gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span className="w-6 text-center text-xs font-mono font-bold text-[#64748B] tabular-nums shrink-0">
                    {idx + 1}.
                  </span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#E2E8F0] bg-white shrink-0">
                    <CartoonAvatar src={findAvatar(m.name)} name={m.name} />
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] break-words leading-snug flex-1">
                    {m.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-extrabold font-mono tabular-nums text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 rounded-lg">
                    {m.score || 0}
                  </span>
                </div>
              </div>
            ))}
        </div>

        <div className="fixed -left-[9999px] top-0 pointer-events-none">
          <RankingExportTemplate
            ref={exportRef}
            leaderRanking={leaders}
            trainerRanking={trainers}
            customLogo={customLogo}
          />
        </div>
      </div>
    </div>
  );
};

export const SocialLinksModal = ({
  links,
  onClose,
}: {
  links?: SocialLinks;
  onClose: () => void;
}) => {
  const entries = [
    { key: 'facebook', label: 'Facebook Page / Group', url: links?.facebook },
    { key: 'youtube', label: 'YouTube Channel', url: links?.youtube },
    { key: 'whatsapp', label: 'WhatsApp Community', url: links?.whatsapp },
    { key: 'telegram', label: 'Telegram Channel', url: links?.telegram },
    { key: 'tiktok', label: 'TikTok Official', url: links?.tiktok },
  ].filter((item) => item.url && item.url.trim() !== '');

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-slide-up"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EEF5FF] text-[#0B4F9C]">
              <Globe size={18} />
            </div>
            <h3 className="text-base font-extrabold text-[#0F172A]">Official Social Media</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-[#64748B] cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {entries.length === 0 ? (
            <p className="text-xs text-[#64748B] text-center py-8">No social links added yet</p>
          ) : (
            entries.map((item) => {
              const absoluteUrl = item.url!.startsWith('http')
                ? item.url!
                : `https://${item.url!}`;
              return (
                <a
                  key={item.key}
                  href={absoluteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#EEF5FF] border border-[#E5E7EB] transition-colors"
                >
                  <span className="text-xs font-bold text-[#0F172A]">{item.label}</span>
                  <ExternalLink size={15} className="text-[#0B4F9C]" />
                </a>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export const NoticeModal = ({
  text,
  onClose,
}: {
  text?: string;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in"
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white border border-[#FDE68A] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-slide-up"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#EA580C] text-white flex items-center justify-center shadow-sm">
            <Gift size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A]">Special Offer &amp; Notice</h3>
            <p className="text-[11px] font-medium text-[#64748B]">Unity Earning Exclusive Update</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F6F9] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-4 rounded-xl bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]/60 border border-[#FDE68A] text-sm text-[#78350F] whitespace-pre-wrap leading-relaxed max-h-[55vh] overflow-y-auto custom-scrollbar">
        {text?.trim() || 'No special offers or notices at the moment. Stay active and keep growing with Unity Earning!'}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full py-2.5 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] text-white text-xs font-bold transition-colors cursor-pointer"
      >
        Got It
      </button>
    </div>
  </div>
);

export const CounsellingScheduleModal = ({
  config,
  onClose,
}: {
  config: Config;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white border border-[#E5E7EB] rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up"
    >
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#EEF5FF] text-[#0B4F9C]">
            <Clock size={18} />
          </div>
          <h3 className="text-base font-extrabold text-[#0F172A]">Counselling & Payment</h3>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 text-[#64748B] cursor-pointer">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-[#64748B]">Counselling Schedule</h4>
          {!config.counsellingSchedules || config.counsellingSchedules.length === 0 ? (
            <p className="text-xs text-[#64748B] py-4 text-center bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]">
              No schedules added yet
            </p>
          ) : (
            config.counsellingSchedules.map((s) => (
              <div
                key={s.id}
                className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-semibold text-[#0F172A]"
              >
                {s.text}
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 pt-3 border-t border-[#E5E7EB]">
          <h4 className="text-xs font-bold text-[#64748B] flex items-center gap-1.5">
            <CreditCard size={14} className="text-[#047857]" /> Payment Numbers
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {(['bkash', 'nagad', 'rocket', 'upay'] as const).map((key) => {
              const num = config.paymentMethods?.[key];
              if (!num) return null;
              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]"
                >
                  <span className="text-xs font-bold text-[#047857] uppercase">{key}</span>
                  <span className="text-sm font-extrabold font-mono tabular-nums text-[#0F172A]">
                    {num}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const StlLoginModal = ({
  onClose,
  onSuccess,
  config,
}: {
  onClose: () => void;
  onSuccess: () => void;
  config: Config;
}) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = config.stlPassword || 'stl2024';
    if (pass === expected) {
      onSuccess();
    } else {
      setError('Incorrect STL password!');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-slide-up"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#0B4F9C]" />
            <h3 className="text-base font-extrabold text-[#0F172A]">STL Login</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-[#64748B] cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setError('');
            }}
            placeholder="Enter STL password..."
            required
            className="w-full fintech-input rounded-xl px-4 py-2.5 text-sm"
          />
          {error && <p className="text-xs font-bold text-[#DC2626]">{error}</p>}
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] text-white text-xs font-bold cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export const AdminLoginModal = ({
  onClose,
  onSuccess,
  initialAdminPass,
}: {
  onClose: () => void;
  onSuccess: () => Promise<void>;
  initialAdminPass: string;
}) => {
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (pass === initialAdminPass) {
        await onSuccess();
      } else {
        setError('Incorrect Admin password!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-slide-up"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-[#0B4F9C]" />
            <h3 className="text-base font-extrabold text-[#0F172A]">Admin Verification</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-[#64748B] cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setError('');
              }}
              placeholder="Enter admin PIN..."
              required
              className="w-full fintech-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          {error && <p className="text-xs font-bold text-[#DC2626]">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#0B4F9C] hover:bg-[#094182] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Enter Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};
