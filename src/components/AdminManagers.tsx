import React, { useState, useMemo } from 'react';
import {
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Upload,
  Check,
  Trash2,
  Image as ImageIcon,
  Copy,
  Megaphone,
  Bell,
  Calendar,
  Plus,
  Link as LinkIcon,
  ExternalLink,
  Globe,
  UserPlus,
  GraduationCap,
  History,
  Crown,
  Award,
  Search,
  CheckCircle2,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  Coins,
  RefreshCw,
  AlertTriangle,
  Wallet,
  CreditCard,
  X,
  Building2,
  Users,
  Database,
} from 'lucide-react';
import { SUPABASE_SETUP_SQL, checkSupabaseConnection, SUPABASE_URL } from '../supabase';
import CartoonAvatar from './CartoonAvatar';
import {
  Application,
  AuditLog,
  Config,
  CounsellingSchedule,
  Member,
  PaymentMethods,
  PickingItem,
  QuickLink,
  RankingMember,
  Result,
  ShowMsgFn,
  SocialLinks,
  Teacher,
  UserBalance,
  UserRegistration,
} from '../types';
import {
  compressImageFile,
  copyTextToClipboard,
  generateResultExportText,
} from '../utils/helpers';

export const PasswordDisplay = ({ password }: { password: string }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-2.5 py-1 rounded-lg border border-[#E5E7EB]">
      <span className="text-[11px] font-mono font-semibold text-[#0B4F9C] tabular-nums">
        {show ? password : '••••••'}
      </span>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={12} /> : <Eye size={12} />}
      </button>
    </div>
  );
};

export const AdminAccordion = ({
  title,
  icon,
  children,
  defaultOpen = false,
  colorClass = 'text-[#0B4F9C]',
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  colorClass?: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-2 rounded-xl bg-[#EEF5FF] border border-[#D6E6FF] shrink-0 ${colorClass}`}>
            {icon}
          </div>
          <span className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">
            {title}
          </span>
        </div>
        <div className="text-[#64748B] shrink-0 ml-2">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-[#E5E7EB] bg-[#F8FAFC]/50 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

export const BrandLogoManager = ({
  config,
  onUpdateLogo,
  showMsg,
}: {
  config: Config;
  onUpdateLogo: (url: string | null) => Promise<void>;
  showMsg: ShowMsgFn;
}) => {
  const [logoUrlInput, setLogoUrlInput] = useState(config.customLogo || '');
  const [saving, setSaving] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showMsg('Please select a valid image file', 'error');
      return;
    }
    setSaving(true);
    try {
      const compressed = await compressImageFile(file, 256, 'image/png');
      if (compressed.length > 750000) {
        showMsg('Image file is too large, please use a smaller image', 'error');
        return;
      }
      await onUpdateLogo(compressed);
      setLogoUrlInput(compressed);
    } catch {
      showMsg('Failed to process logo image', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUrl = async () => {
    setSaving(true);
    try {
      await onUpdateLogo(logoUrlInput.trim() || null);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await onUpdateLogo(null);
      setLogoUrlInput('');
    } finally {
      setSaving(false);
    }
  };

  const previewLogo = config.customLogo || '';

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-[#0F172A]">Brand Logo Upload & Sync</p>
            <p className="text-[11px] text-[#64748B]">
              Updating the logo here automatically syncs across the header and every user profile.
            </p>
          </div>
          {previewLogo && (
            <button
              type="button"
              disabled={saving}
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] text-[11px] font-bold hover:bg-[#FEE2E2] transition-colors flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={12} /> Reset
            </button>
          )}
        </div>

        <label className="w-full py-2.5 px-4 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center gap-2 transition-colors">
          <Upload size={15} />
          <span>{saving ? 'Uploading...' : 'Upload New Logo from Gallery'}</span>
          <input
            type="file"
            accept="image/*"
            disabled={saving}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={logoUrlInput}
            onChange={(e) => setLogoUrlInput(e.target.value)}
            placeholder="Or paste logo image URL..."
            className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs font-medium"
          />
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveUrl}
            className="px-4 py-2 rounded-xl bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] hover:bg-[#D1FAE5] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Check size={14} /> Save URL
          </button>
        </div>
      </div>

      {/* Live Dual Preview: Header Crest + User Profile Brand Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB]">
          <p className="text-[11px] font-semibold text-[#64748B] mb-2.5">
            1. Header Preview
          </p>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB]">
            <div className="w-9 h-9 rounded-xl bg-[#0B4F9C] text-white flex items-center justify-center font-extrabold text-sm overflow-hidden border border-[#D6E6FF] shrink-0">
              {previewLogo ? (
                <img
                  src={previewLogo}
                  alt="Header Logo Preview"
                  className="w-full h-full object-contain bg-white p-0.5"
                />
              ) : (
                'UE'
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-[#0F172A] truncate">Unity Earning</div>
              <div className="text-[10px] text-[#64748B]">Performance Portal</div>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-[#E5E7EB]">
          <p className="text-[11px] font-semibold text-[#64748B] mb-2.5">
            2. User Profile Card Preview
          </p>
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#EEF5FF] border border-[#D6E6FF]">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#D6E6FF] flex items-center justify-center overflow-hidden shrink-0">
              {previewLogo ? (
                <img
                  src={previewLogo}
                  alt="Profile Brand Preview"
                  className="w-full h-full object-contain p-1"
                />
              ) : (
                <Building2 size={16} className="text-[#0B4F9C]" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[#0F172A] truncate">Official Brand</div>
              <div className="text-[10px] text-[#0B4F9C] font-medium truncate">Unity Earning Workspace</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LifetimeConvertsInput = ({
  currentValue,
  onSave,
}: {
  currentValue: number;
  onSave: (val: number) => Promise<void>;
}) => {
  const [val, setVal] = useState(currentValue.toString());
  const [isDirty, setIsDirty] = useState(false);

  React.useEffect(() => {
    if (!isDirty) setVal(currentValue.toString());
  }, [currentValue, isDirty]);

  return (
    <div className="flex items-center gap-2 mb-4">
      <input
        type="number"
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          setIsDirty(true);
        }}
        className="flex-1 fintech-input rounded-xl px-4 py-2.5 text-lg font-bold font-mono tabular-nums text-[#0F172A]"
      />
      <button
        type="button"
        onClick={async () => {
          const parsed = parseInt(val, 10);
          if (!isNaN(parsed)) {
            await onSave(parsed);
            setIsDirty(false);
          }
        }}
        className="px-4 py-2.5 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
      >
        Update
      </button>
    </div>
  );
};

export const ResultCopyManager = ({
  sortedLeaders,
  sortedTrainers,
  results,
  showMsg,
}: {
  sortedLeaders: any[];
  sortedTrainers: any[];
  results: Record<string, Result>;
  showMsg: ShowMsgFn;
}) => {
  const [scope, setScope] = useState<'all' | 'leaders' | 'trainers'>('all');
  const [formatType, setFormatType] = useState<'compact' | 'detailed' | 'bangla'>('compact');
  const [onlySubmitted, setOnlySubmitted] = useState(true);
  const [includeHeader, setIncludeHeader] = useState(true);

  const exportText = useMemo(
    () =>
      generateResultExportText(sortedLeaders, sortedTrainers, results, {
        scope,
        formatType,
        onlySubmitted,
        includeHeader,
      }),
    [sortedLeaders, sortedTrainers, results, scope, formatType, onlySubmitted, includeHeader]
  );

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(exportText);
    if (ok) {
      showMsg('All results copied successfully!', 'success');
    } else {
      showMsg('Copy failed. Please copy directly from the text box below.', 'error');
    }
  };

  return (
    <div className="bg-white border border-[#E5E7EB] p-4 rounded-xl space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold text-[#64748B] block mb-1.5">Target Scope</label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#F4F6F9] rounded-xl border border-[#E5E7EB]">
            {[
              { id: 'all', label: 'All' },
              { id: 'leaders', label: 'Leaders' },
              { id: 'trainers', label: 'Trainers' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScope(s.id as any)}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  scope === s.id
                    ? 'bg-white text-[#0B4F9C] shadow-xs border border-[#E5E7EB]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-[#64748B] block mb-1.5">Format</label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#F4F6F9] rounded-xl border border-[#E5E7EB]">
            {[
              { id: 'compact', label: 'Short' },
              { id: 'detailed', label: 'Detailed' },
              { id: 'bangla', label: 'Bangla' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormatType(f.id as any)}
                className={`py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                  formatType === f.id
                    ? 'bg-white text-[#0B4F9C] shadow-xs border border-[#E5E7EB]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-[#334155]">
        <label className="flex items-center gap-2 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={onlySubmitted}
            onChange={(e) => setOnlySubmitted(e.target.checked)}
            className="w-4 h-4 accent-[#0B4F9C] rounded"
          />
          <span>Only Submitted Members</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={includeHeader}
            onChange={(e) => setIncludeHeader(e.target.checked)}
            className="w-4 h-4 accent-[#0B4F9C] rounded"
          />
          <span>Include Report Header</span>
        </label>
      </div>

      <textarea
        readOnly
        value={exportText}
        rows={6}
        className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3 text-xs font-mono text-[#0F172A] custom-scrollbar focus:outline-none"
      />

      <button
        type="button"
        onClick={handleCopy}
        className="w-full py-2.5 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <Copy size={14} /> Copy Results
      </button>
    </div>
  );
};

export const AnnouncementManager = ({
  config,
  onUpdate,
}: {
  config: Config;
  onUpdate: (text: string, active: boolean) => Promise<void>;
}) => {
  const [text, setText] = useState(config.announcement || '');
  const [active, setActive] = useState(config.announcementActive || false);

  React.useEffect(() => {
    setText(config.announcement || '');
    setActive(config.announcementActive || false);
  }, [config.announcement, config.announcementActive]);

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-[#0B4F9C]" />
          <h4 className="text-xs font-bold text-[#0F172A]">Global Announcement</h4>
        </div>
        <button
          type="button"
          onClick={() => setActive(!active)}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
            active
              ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
              : 'bg-[#F4F6F9] text-[#64748B] border border-[#E5E7EB]'
          }`}
        >
          {active ? 'Active' : 'Inactive'}
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write important team announcement..."
        className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs h-20 resize-none"
      />

      <button
        type="button"
        onClick={() => onUpdate(text, active)}
        className="w-full py-2.5 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
      >
        Update Announcement
      </button>
    </div>
  );
};

export const NoticeManager = ({
  config,
  onUpdate,
}: {
  config: Config;
  onUpdate: (text: string) => Promise<void>;
}) => {
  const [text, setText] = useState(config.noticeText || '');

  React.useEffect(() => {
    setText(config.noticeText || '');
  }, [config.noticeText]);

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <Bell size={16} className="text-[#D97706]" />
        <h4 className="text-xs font-bold text-[#0F172A]">Special Offer &amp; Notice Box (Gift Box)</h4>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write special offer details or important notice for the team..."
        className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs h-24 resize-none"
      />
      <button
        type="button"
        onClick={() => onUpdate(text)}
        className="w-full py-2.5 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
      >
        Save Offer / Notice
      </button>
    </div>
  );
};

export const PickingScheduleManager = ({
  items,
  onAdd,
  onDelete,
  onToggle,
}: {
  items: PickingItem[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string, current: boolean) => Promise<void>;
}) => {
  const [name, setName] = useState('');

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-[#0B4F9C]" />
        <h4 className="text-xs font-bold text-[#0F172A]">Picking Schedule</h4>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter team or member name..."
          className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs"
        />
        <button
          type="button"
          onClick={() => {
            if (name.trim()) {
              onAdd(name);
              setName('');
            }
          }}
          className="px-3.5 py-2 bg-[#0B4F9C] hover:bg-[#094182] text-white rounded-xl transition-colors cursor-pointer"
          aria-label="Add picking item"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => onToggle(item.id, item.isSelected)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                  item.isSelected
                    ? 'bg-[#047857] border-[#047857] text-white'
                    : 'bg-white border-[#CBD5E1]'
                }`}
              >
                {item.isSelected && <Check size={12} strokeWidth={3} />}
              </button>
              <span
                className={`text-xs font-semibold truncate ${
                  item.isSelected ? 'text-[#047857]' : 'text-[#0F172A]'
                }`}
              >
                {item.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
              aria-label="Delete item"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const QuickLinksManagementSection = ({
  links,
  onAdd,
  onDelete,
}: {
  links: QuickLink[];
  onAdd: (name: string, url: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <LinkIcon size={16} className="text-[#0B4F9C]" />
        <h4 className="text-xs font-bold text-[#0F172A]">Quick Links Management</h4>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Link title (e.g., Payment Form)"
          className="w-full fintech-input rounded-xl px-3.5 py-2 text-xs"
        />
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs"
          />
          <button
            type="button"
            onClick={() => {
              if (name.trim() && url.trim()) {
                onAdd(name, url);
                setName('');
                setUrl('');
              }
            }}
            className="px-4 py-2 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar">
        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]"
          >
            <div className="min-w-0 pr-2">
              <div className="text-xs font-bold text-[#0F172A] truncate flex items-center gap-1.5">
                {link.name}
                <ExternalLink size={11} className="text-[#0B4F9C] shrink-0" />
              </div>
              <div className="text-[11px] text-[#64748B] truncate">{link.url}</div>
            </div>
            <button
              type="button"
              onClick={() => onDelete(link.id)}
              className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Delete quick link"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SocialLinksManager = ({
  config,
  onUpdate,
}: {
  config: Config;
  onUpdate: (links: SocialLinks) => Promise<void>;
}) => {
  const [links, setLinks] = useState<SocialLinks>(config.socialLinks || {});

  React.useEffect(() => {
    if (config.socialLinks) setLinks(config.socialLinks);
  }, [config.socialLinks]);

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <Globe size={16} className="text-[#0B4F9C]" />
        <h4 className="text-xs font-bold text-[#0F172A]">Social Media Links</h4>
      </div>
      <div className="space-y-2">
        {(['facebook', 'youtube', 'whatsapp', 'telegram', 'tiktok'] as const).map((plat) => (
          <div key={plat} className="flex items-center gap-2">
            <span className="w-20 text-[11px] font-bold text-[#64748B] capitalize">{plat}</span>
            <input
              type="text"
              value={links[plat] || ''}
              onChange={(e) => setLinks({ ...links, [plat]: e.target.value })}
              placeholder={`${plat} URL...`}
              className="flex-1 fintech-input rounded-xl px-3 py-1.5 text-xs"
            />
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onUpdate(links)}
        className="w-full py-2.5 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
      >
        Save Social Links
      </button>
    </div>
  );
};

export const AdminSection = ({
  title,
  onAdd,
  members,
  onDelete,
  onUpdateTarget,
}: {
  title: string;
  onAdd: (name: string, target?: number) => Promise<void>;
  members: Member[];
  onDelete: (id: string) => void;
  onUpdateTarget: (id: string, target: number) => Promise<void>;
}) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('30');
  const [editingTargets, setEditingTargets] = useState<Record<string, string>>({});

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <UserPlus size={16} className="text-[#0B4F9C]" />
        <h4 className="text-xs font-bold text-[#0F172A]">
          {title} ({members.length})
        </h4>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Member name..."
          className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs"
        />
        <div className="flex gap-2">
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Target"
            className="w-24 fintech-input rounded-xl px-3 py-2 text-xs font-mono tabular-nums"
          />
          <button
            type="button"
            onClick={() => {
              if (name.trim()) {
                onAdd(name, parseInt(target, 10) || 0);
                setName('');
              }
            }}
            className="px-4 py-2 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
          >
            Add
          </button>
        </div>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-2 p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]"
          >
            <span className="text-xs font-bold text-[#0F172A] truncate flex-1">{m.name}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="number"
                value={editingTargets[m.id] !== undefined ? editingTargets[m.id] : m.target ?? 0}
                onChange={(e) =>
                  setEditingTargets({ ...editingTargets, [m.id]: e.target.value })
                }
                className="w-16 bg-white border border-[#D1D5DB] rounded-lg px-2 py-1 text-xs font-mono tabular-nums text-center text-[#0F172A]"
              />
              {editingTargets[m.id] !== undefined && (
                <button
                  type="button"
                  onClick={async () => {
                    await onUpdateTarget(m.id, parseInt(editingTargets[m.id], 10) || 0);
                    setEditingTargets((prev) => {
                      const next = { ...prev };
                      delete next[m.id];
                      return next;
                    });
                  }}
                  className="p-1.5 bg-[#ECFDF5] text-[#047857] rounded-lg border border-[#A7F3D0] cursor-pointer"
                  aria-label="Save target"
                >
                  <Check size={12} />
                </button>
              )}
              <button
                type="button"
                onClick={() => onDelete(m.id)}
                className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                aria-label="Remove member"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TeacherManagementSection = ({
  teachers,
  attendanceRecords,
  onAdd,
  onDelete,
  onViewHistory,
}: {
  teachers: Teacher[];
  attendanceRecords: any[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: string, name: string) => void;
  onViewHistory: (teacher: Teacher) => void;
}) => {
  const [name, setName] = useState('');

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <GraduationCap size={16} className="text-[#0B4F9C]" />
        <h4 className="text-xs font-bold text-[#0F172A]">
          Teacher Management ({teachers.length})
        </h4>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Teacher name..."
          className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs"
        />
        <button
          type="button"
          onClick={() => {
            if (name.trim()) {
              onAdd(name);
              setName('');
            }
          }}
          className="px-4 py-2 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
        >
          Add
        </button>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
        {teachers.map((t) => {
          const count = attendanceRecords.filter((r) => r.teacherId === t.id).length;
          return (
            <div
              key={t.id}
              className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]"
            >
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F172A] truncate">{t.name}</div>
                <div className="text-[11px] text-[#64748B] tabular-nums">{count} Classes</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onViewHistory(t)}
                  className="p-1.5 bg-[#EEF5FF] text-[#0B4F9C] rounded-lg hover:bg-[#D6E6FF] transition-colors cursor-pointer"
                  title="View History"
                >
                  <History size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(t.id, t.name)}
                  className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                  aria-label="Delete teacher"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SimpleManagementSection = ({
  title,
  icon: Icon,
  colorClass = 'text-[#0B4F9C]',
  members,
  onAdd,
  onDelete,
  isActive,
  onToggleActive,
  attendanceRecords,
}: {
  title: string;
  icon: any;
  colorClass?: string;
  members: any[];
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isActive: boolean;
  onToggleActive: (val: boolean) => Promise<void>;
  attendanceRecords: any[];
}) => {
  const [name, setName] = useState('');
  const [historyMember, setHistoryMember] = useState<any | null>(null);

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={16} className={colorClass} />
          <h4 className="text-xs font-bold text-[#0F172A] truncate">
            {title} ({members.length})
          </h4>
        </div>
        <button
          type="button"
          onClick={() => onToggleActive(!isActive)}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
            isActive
              ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
              : 'bg-[#F4F6F9] text-[#64748B] border border-[#E5E7EB]'
          }`}
        >
          {isActive ? 'Active' : 'Inactive'}
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name..."
          className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs"
        />
        <button
          type="button"
          onClick={() => {
            if (name.trim()) {
              onAdd(name);
              setName('');
            }
          }}
          className="px-4 py-2 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
        >
          Add
        </button>
      </div>

      <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar">
        {members.map((m) => {
          const logs = attendanceRecords.filter((r) => r.memberId === m.id);
          return (
            <div
              key={m.id}
              className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]"
            >
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0F172A] truncate">{m.name}</div>
                <div className="text-[11px] text-[#64748B] tabular-nums">{logs.length} Attendance</div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setHistoryMember({ ...m, logs })}
                  className="p-1.5 bg-[#EEF5FF] text-[#0B4F9C] rounded-lg hover:bg-[#D6E6FF] transition-colors cursor-pointer"
                  aria-label="View history"
                >
                  <History size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(m.id)}
                  className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                  aria-label="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {historyMember && (
        <div
          className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
          onClick={() => setHistoryMember(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-slide-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <h5 className="text-sm font-bold text-[#0F172A]">
                {historyMember.name} — Attendance Logs
              </h5>
              <button
                type="button"
                onClick={() => setHistoryMember(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F6F9] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
              {historyMember.logs.length === 0 ? (
                <p className="text-xs text-[#64748B] text-center py-8">No records found</p>
              ) : (
                historyMember.logs.map((l: any) => (
                  <div
                    key={l.id}
                    className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[#0F172A]">{l.memberName}</span>
                    <span className="text-[#64748B] font-mono tabular-nums">
                      {l.submittedAt?.toDate ? l.submittedAt.toDate().toLocaleString() : 'Completed'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const RankingSection = ({
  title,
  icon: Icon,
  colorClass = 'text-[#B45309]',
  members,
  onAdd,
  onDelete,
  onSetScore,
  isActive,
  onToggleActive,
}: {
  title: string;
  icon: any;
  colorClass?: string;
  members: RankingMember[];
  onAdd: (name: string, score: number, leads?: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSetScore: (id: string, newScore: number) => Promise<void>;
  isActive: boolean;
  onToggleActive: (val: boolean) => Promise<void>;
}) => {
  const [name, setName] = useState('');
  const [score, setScore] = useState('0');
  const [leads, setLeads] = useState('0');

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Icon size={16} className={colorClass} />
          <h4 className="text-xs font-bold text-[#0F172A] truncate">
            {title} ({members.length})
          </h4>
        </div>
        <button
          type="button"
          onClick={() => onToggleActive(!isActive)}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
            isActive
              ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
              : 'bg-[#F4F6F9] text-[#64748B] border border-[#E5E7EB]'
          }`}
        >
          {isActive ? 'Active' : 'Closed'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name..."
          className="sm:col-span-2 fintech-input rounded-xl px-3.5 py-2 text-xs"
        />
        <input
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="Converts"
          className="fintech-input rounded-xl px-3 py-2 text-xs font-mono tabular-nums"
        />
        <button
          type="button"
          onClick={() => {
            if (name.trim()) {
              onAdd(name, parseInt(score, 10) || 0, parseInt(leads, 10) || 0);
              setName('');
              setScore('0');
              setLeads('0');
            }
          }}
          className="py-2 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Add Member
        </button>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
        {members.map((m, idx) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-2 p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB]"
          >
            <div className="min-w-0 flex items-center gap-2">
              <span className="w-6 text-center text-[11px] font-mono font-bold text-[#64748B] tabular-nums">
                #{idx + 1}
              </span>
              <span className="text-xs font-bold text-[#0F172A] truncate">{m.name}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                defaultValue={m.score || 0}
                key={m.score}
                onBlur={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    onSetScore(m.id, val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = parseInt((e.target as HTMLInputElement).value, 10);
                    if (!isNaN(val)) {
                      onSetScore(m.id, val);
                      (e.target as HTMLInputElement).blur();
                    }
                  }
                }}
                className="w-20 px-2.5 py-1.5 text-xs font-bold font-mono tabular-nums text-[#0B4F9C] fintech-input rounded-xl text-center"
                placeholder="Score"
              />
              <button
                type="button"
                onClick={() => onDelete(m.id)}
                className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                aria-label="Remove ranking member"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const UserManagementSection = ({
  pending,
  approved,
  onApprove,
  onReject,
  onToggleBlock,
  onDelete,
  onUpdatePass,
}: {
  pending: UserRegistration[];
  approved: UserRegistration[];
  onApprove: (user: UserRegistration) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onToggleBlock: (user: UserRegistration) => Promise<void>;
  onDelete: (whatsapp: string) => void;
  onUpdatePass: (whatsapp: string, newPass: string) => Promise<void>;
}) => {
  const [editingPass, setEditingPass] = useState<{ wa: string; pass: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApproved = useMemo(
    () =>
      approved.filter(
        (u) =>
          u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.whatsapp.includes(searchTerm) ||
          u.position.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [approved, searchTerm]
  );

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div className="p-4 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#B45309]">
              Pending Approvals ({pending.length})
            </span>
          </div>
          <div className="space-y-2">
            {pending.map((u) => (
              <div
                key={u.id || u.whatsapp}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-xl border border-[#FDE68A]"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#0F172A] truncate">{u.fullName}</div>
                  <div className="text-[11px] text-[#64748B] font-mono tabular-nums">
                    {u.whatsapp} · Vacancy: <span className="font-semibold text-[#047857]">{u.vacancy || u.position}</span> {u.teamLeader ? `· TL: ${u.teamLeader}` : ''}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onApprove(u)}
                    className="px-3 py-1.5 rounded-lg bg-[#047857] text-white text-xs font-bold hover:bg-[#065F46] transition-colors cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(u.id || u.whatsapp)}
                    className="px-3 py-1.5 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] text-xs font-bold hover:bg-[#FEE2E2] transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#0F172A]">
            Approved Members ({approved.length})
          </span>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name or number..."
              className="fintech-input rounded-xl py-1.5 pl-8 pr-3 text-xs w-full sm:w-52"
            />
          </div>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
          {filteredApproved.map((u) => (
            <div
              key={u.whatsapp}
              className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] overflow-hidden shrink-0">
                    <CartoonAvatar src={u.profilePic} name={u.fullName} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0F172A] truncate">
                      {u.fullName}{' '}
                      {u.status === 'blocked' && (
                        <span className="text-[10px] text-[#DC2626] font-bold">(Blocked)</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#64748B] font-mono tabular-nums">
                      {u.whatsapp} · {u.position}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  <PasswordDisplay password={u.password} />
                  <button
                    type="button"
                    onClick={() =>
                      setEditingPass(
                        editingPass?.wa === u.whatsapp ? null : { wa: u.whatsapp, pass: u.password }
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#EEF5FF] text-[#0B4F9C] border border-[#D6E6FF] text-[11px] font-bold cursor-pointer"
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleBlock(u)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                      u.status === 'blocked'
                        ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
                        : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
                    }`}
                  >
                    {u.status === 'blocked' ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(u.whatsapp)}
                    className="p-1.5 text-[#64748B] hover:text-[#DC2626] rounded-lg transition-colors cursor-pointer"
                    aria-label="Delete user"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {editingPass?.wa === u.whatsapp && (
                <div className="flex gap-2 pt-1.5 border-t border-[#E5E7EB]">
                  <input
                    type="text"
                    value={editingPass.pass}
                    onChange={(e) => setEditingPass({ ...editingPass, pass: e.target.value })}
                    className="flex-1 fintech-input rounded-lg px-3 py-1.5 text-xs"
                    placeholder="New password..."
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (editingPass.pass.trim().length >= 4) {
                        await onUpdatePass(u.whatsapp, editingPass.pass.trim());
                        setEditingPass(null);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0B4F9C] text-white text-xs font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FineSettingsManager = ({
  config,
  onUpdateFine,
  onToggleFineSystem,
  onClearAllFines,
  onFixDay1Fine,
  onAllReset,
}: {
  config: Config;
  onUpdateFine: (amount: number) => Promise<void>;
  onToggleFineSystem: (active: boolean) => Promise<void>;
  onClearAllFines: () => Promise<void>;
  onFixDay1Fine: () => Promise<void>;
  onAllReset?: () => Promise<void>;
}) => {
  const [fine, setFine] = useState((config.fineAmount ?? 10).toString());
  const [confirmClearModal, setConfirmClearModal] = useState(false);
  const [confirmAllResetModal, setConfirmAllResetModal] = useState(false);
  const [confirmFixModal, setConfirmFixModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  const isFineSystemActive = config.fineSystemActive !== false;

  React.useEffect(() => {
    setFine((config.fineAmount ?? 10).toString());
  }, [config.fineAmount]);

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-4">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <Coins size={16} className="text-[#B45309]" />
          <h4 className="text-xs font-bold text-[#0F172A]">Fine Settings & Controls</h4>
        </div>
        <button
          type="button"
          onClick={() => onToggleFineSystem(!isFineSystemActive)}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
            isFineSystemActive
              ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
              : 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
          }`}
        >
          {isFineSystemActive ? 'System Active' : 'System Off'}
        </button>
      </div>

      <div className="space-y-2.5">
        <label className="text-[11px] font-semibold text-[#64748B] block">
          Daily Missed Submission Fine (৳)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[10, 15, 20, 25, 50].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setFine(preset.toString());
                onUpdateFine(preset);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono tabular-nums border cursor-pointer transition-colors ${
                Number(fine) === preset
                  ? 'bg-[#0B4F9C] text-white border-[#0B4F9C]'
                  : 'bg-[#F8FAFC] text-[#334155] border-[#E5E7EB] hover:border-[#CBD5E1]'
              }`}
            >
              ৳{preset}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            value={fine}
            onChange={(e) => setFine(e.target.value)}
            className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs font-mono tabular-nums"
          />
          <button
            type="button"
            onClick={() => onUpdateFine(parseInt(fine, 10) || 10)}
            className="px-4 py-2 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Save Rate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#E5E7EB]">
        <button
          type="button"
          onClick={() => setConfirmFixModal(true)}
          className="py-2.5 px-3 rounded-xl bg-[#EEF5FF] text-[#0B4F9C] border border-[#D6E6FF] text-[11px] font-bold hover:bg-[#D6E6FF] transition-colors cursor-pointer"
        >
          Fix Day 1 Fine
        </button>
        <button
          type="button"
          onClick={() => setConfirmClearModal(true)}
          className="py-2.5 px-3 rounded-xl bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] text-[11px] font-bold hover:bg-[#FEF3C7] transition-colors cursor-pointer"
        >
          Clear All Fines
        </button>
        {onAllReset && (
          <button
            type="button"
            onClick={() => setConfirmAllResetModal(true)}
            className="py-2.5 px-3 rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] text-[11px] font-bold hover:bg-[#FEE2E2] transition-colors cursor-pointer"
          >
            All Data Reset
          </button>
        )}
      </div>

      {confirmFixModal && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
          onClick={() => setConfirmFixModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-slide-up"
          >
            <h4 className="text-base font-bold text-[#0F172A]">Fix Day 1 Fine?</h4>
            <p className="text-xs text-[#64748B]">
              Missed submission fines for the 1st day of the current month will be waived for all members.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmFixModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F4F6F9] text-[#334155] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={clearing}
                onClick={async () => {
                  setClearing(true);
                  await onFixDay1Fine();
                  setClearing(false);
                  setConfirmFixModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#0B4F9C] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {clearing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmClearModal && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
          onClick={() => setConfirmClearModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-slide-up"
          >
            <h4 className="text-base font-bold text-[#0F172A]">Clear All Fines?</h4>
            <p className="text-xs text-[#64748B]">
              Fine tracking will restart from today and all previous fines will be reset to zero.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmClearModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F4F6F9] text-[#334155] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={clearing}
                onClick={async () => {
                  setClearing(true);
                  await onClearAllFines();
                  setClearing(false);
                  setConfirmClearModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#D97706] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Clear Fines'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmAllResetModal && onAllReset && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
          onClick={() => setConfirmAllResetModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-slide-up"
          >
            <h4 className="text-base font-bold text-[#DC2626]">Reset All System Data?</h4>
            <p className="text-xs text-[#64748B]">
              This will permanently reset all submission logs, today&apos;s results, ranking scores, and fine balances.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmAllResetModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#F4F6F9] text-[#334155] text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={clearing}
                onClick={async () => {
                  setClearing(true);
                  await onAllReset();
                  setClearing(false);
                  setConfirmAllResetModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#DC2626] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {clearing ? 'Resetting...' : 'Reset All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const BalanceManagementSection = ({
  approvedUsers,
  members,
  userBalances,
  auditLogs,
  onUpdateBalance,
  onWaiveFine,
  onRemoveDayFine,
  onRecalculateFine,
  computeUserSubmissionStats,
}: {
  approvedUsers: UserRegistration[];
  members: Member[];
  userBalances: Record<string, UserBalance>;
  auditLogs: AuditLog[];
  onUpdateBalance: (
    whatsapp: string,
    userName: string,
    amount: number,
    isDeduct: boolean,
    reason: string
  ) => Promise<void>;
  onWaiveFine: (whatsapp: string, userName: string, amount: number, reason: string) => Promise<void>;
  onRemoveDayFine: (
    whatsapp: string,
    userName: string,
    dateStr: string,
    reason: string
  ) => Promise<void>;
  onRecalculateFine: (whatsapp: string, userName: string) => Promise<void>;
  computeUserSubmissionStats: (userWhatsapp: string, memberId?: string) => any;
}) => {
  const [selectedUserKey, setSelectedUserKey] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [activeTab, setActiveTab] = useState<
    'overview' | 'add' | 'deduct' | 'waive' | 'remove_day' | 'logs'
  >('overview');
  const [search, setSearch] = useState('');
  const [quickUser, setQuickUser] = useState<{
    key: string;
    name: string;
    action: 'add' | 'deduct' | 'waive' | 'remove_day';
  } | null>(null);
  const [quickAmount, setQuickAmount] = useState('');
  const [quickDate, setQuickDate] = useState('');
  const [quickReason, setQuickReason] = useState('');

  const allUserList = useMemo(() => {
    const list: { key: string; whatsapp: string; name: string; position: string; memberId?: string }[] = [];
    const seen = new Set<string>();
    approvedUsers.forEach((u) => {
      seen.add(u.fullName.trim().toLowerCase());
      const m = members.find((x) => x.name.trim().toLowerCase() === u.fullName.trim().toLowerCase());
      list.push({
        key: u.whatsapp,
        whatsapp: u.whatsapp,
        name: u.fullName,
        position: u.position,
        memberId: m?.id,
      });
    });
    members.forEach((m) => {
      if (!seen.has(m.name.trim().toLowerCase())) {
        list.push({
          key: m.whatsapp || m.id,
          whatsapp: m.whatsapp || '',
          name: m.name,
          position: m.type === 'leader' ? 'Team Leader' : 'Team Trainer',
          memberId: m.id,
        });
      }
    });
    return list;
  }, [approvedUsers, members]);

  const filteredOverview = useMemo(
    () =>
      allUserList.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.whatsapp.includes(search) ||
          u.position.toLowerCase().includes(search.toLowerCase())
      ),
    [allUserList, search]
  );

  const selectedUserObj = allUserList.find((u) => u.key === selectedUserKey);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserObj) return;
    if (activeTab === 'add' || activeTab === 'deduct') {
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) return;
      await onUpdateBalance(
        selectedUserObj.key,
        selectedUserObj.name,
        amt,
        activeTab === 'deduct',
        reason || 'Admin Adjustment'
      );
    } else if (activeTab === 'waive') {
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) return;
      await onWaiveFine(
        selectedUserObj.key,
        selectedUserObj.name,
        amt,
        reason || 'Fine Waived'
      );
    } else if (activeTab === 'remove_day') {
      if (!targetDate) return;
      await onRemoveDayFine(
        selectedUserObj.key,
        selectedUserObj.name,
        targetDate,
        reason || 'Day Fine Removed'
      );
    }
    setAmount('');
    setReason('');
    setTargetDate('');
  };

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-4">
      <div className="flex items-center gap-2">
        <Wallet size={16} className="text-[#0B4F9C]" />
        <h4 className="text-xs font-bold text-[#0F172A]">Fine & Balance Controls</h4>
      </div>

      <div className="flex gap-1 p-1 bg-[#F4F6F9] rounded-xl border border-[#E5E7EB] overflow-x-auto">
        {[
          { id: 'overview', label: 'All Members' },
          { id: 'add', label: 'Add Fine' },
          { id: 'deduct', label: 'Deduct Fine' },
          { id: 'waive', label: 'Waive' },
          { id: 'remove_day', label: 'Remove Day' },
          { id: 'logs', label: 'Audit Logs' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              activeTab === t.id
                ? 'bg-white text-[#0B4F9C] shadow-xs border border-[#E5E7EB]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member name..."
              className="w-full fintech-input rounded-xl py-2 pl-8 pr-3 text-xs"
            />
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
            {filteredOverview.map((u) => {
              const stats = computeUserSubmissionStats(u.whatsapp, u.memberId);
              return (
                <div
                  key={u.key}
                  className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#0F172A] truncate">{u.name}</div>
                    <div className="text-[11px] text-[#64748B] font-mono tabular-nums">
                      Missed: {stats.missedDays}d · Total Fine: ৳{stats.totalFine}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                    <button
                      type="button"
                      onClick={() => setQuickUser({ key: u.key, name: u.name, action: 'deduct' })}
                      className="px-2.5 py-1 rounded-lg bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] text-[11px] font-bold cursor-pointer"
                    >
                      Deduct
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickUser({ key: u.key, name: u.name, action: 'add' })}
                      className="px-2.5 py-1 rounded-lg bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] text-[11px] font-bold cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => onRecalculateFine(u.key, u.name)}
                      className="p-1.5 rounded-lg bg-[#EEF5FF] text-[#0B4F9C] border border-[#D6E6FF] cursor-pointer"
                      title="Recalculate"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(activeTab === 'add' ||
        activeTab === 'deduct' ||
        activeTab === 'waive' ||
        activeTab === 'remove_day') && (
        <form onSubmit={handleAction} className="space-y-3">
          <select
            value={selectedUserKey}
            onChange={(e) => setSelectedUserKey(e.target.value)}
            required
            className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs font-medium"
          >
            <option value="">-- Select Member --</option>
            {allUserList.map((u) => (
              <option key={u.key} value={u.key}>
                {u.name} ({u.position})
              </option>
            ))}
          </select>

          {activeTab === 'remove_day' ? (
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
              className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs"
            />
          ) : (
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (৳)..."
              required
              className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs font-mono tabular-nums"
            />
          )}

          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)..."
            className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs"
          />

          <button
            type="submit"
            className="w-full py-2.5 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Confirm Update
          </button>
        </form>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-[#64748B] text-center py-8">No audit logs found</p>
          ) : (
            auditLogs.map((l, i) => (
              <div
                key={l.id || i}
                className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] text-xs space-y-0.5"
              >
                <div className="flex items-center justify-between font-bold text-[#0F172A]">
                  <span>
                    {l.userName} · {l.action}
                  </span>
                  {l.amount ? (
                    <span className="font-mono tabular-nums text-[#0B4F9C]">৳{l.amount}</span>
                  ) : null}
                </div>
                {l.reason && <p className="text-[11px] text-[#64748B]">{l.reason}</p>}
              </div>
            ))
          )}
        </div>
      )}

      {quickUser && (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-900/45 animate-fade-in"
          onClick={() => setQuickUser(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#E5E7EB] rounded-2xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-slide-up"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E7EB]">
              <h5 className="text-sm font-bold text-[#0F172A]">
                {quickUser.name} — {quickUser.action === 'deduct' ? 'Deduct Fine' : 'Add Fine'}
              </h5>
              <button
                type="button"
                onClick={() => setQuickUser(null)}
                className="p-1 text-[#64748B] hover:text-[#0F172A] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {quickUser.action === 'remove_day' ? (
                <input
                  type="date"
                  value={quickDate}
                  onChange={(e) => setQuickDate(e.target.value)}
                  className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs"
                />
              ) : (
                <input
                  type="number"
                  value={quickAmount}
                  onChange={(e) => setQuickAmount(e.target.value)}
                  placeholder="Amount (৳)..."
                  className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs font-mono tabular-nums"
                />
              )}
              <input
                type="text"
                value={quickReason}
                onChange={(e) => setQuickReason(e.target.value)}
                placeholder="Enter reason..."
                className="w-full fintech-input rounded-xl px-3.5 py-2.5 text-xs"
              />
              <button
                type="button"
                onClick={async () => {
                  const amt = parseFloat(quickAmount) || 0;
                  if (amt > 0) {
                    await onUpdateBalance(
                      quickUser.key,
                      quickUser.name,
                      amt,
                      quickUser.action === 'deduct',
                      quickReason || 'Quick Adjustment'
                    );
                  }
                  setQuickAmount('');
                  setQuickReason('');
                  setQuickUser(null);
                }}
                className="w-full py-2.5 bg-[#0B4F9C] text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminPasswordManager = ({
  onUpdate,
}: {
  onUpdate: (newPass: string) => Promise<void>;
}) => {
  const [pass, setPass] = useState('');
  const [errorText, setErrorText] = useState('');

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <KeyRound size={16} className="text-[#DC2626]" />
        <h4 className="text-xs font-bold text-[#0F172A]">Change Admin Password</h4>
      </div>
      <div className="flex gap-2">
        <input
          type="password"
          value={pass}
          onChange={(e) => {
            setPass(e.target.value);
            if (errorText) setErrorText('');
          }}
          placeholder="New admin password..."
          className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs"
        />
        <button
          type="button"
          onClick={async () => {
            if (pass.trim().length < 4) {
              setErrorText('Password must be at least 4 characters.');
              return;
            }
            await onUpdate(pass.trim());
            setPass('');
            setErrorText('');
          }}
          className="px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
        >
          Update
        </button>
      </div>
      {errorText && <p className="text-[11px] font-semibold text-[#DC2626]">{errorText}</p>}
    </div>
  );
};

export const SecurityManager = ({
  config,
  onUpdate,
}: {
  config: Config;
  onUpdate: (password: string, locked: boolean) => Promise<void>;
}) => {
  const [password, setPassword] = useState(config.securityPassword || '');
  const [locked, setLocked] = useState(config.isLocked || false);

  React.useEffect(() => {
    setPassword(config.securityPassword || '');
    setLocked(config.isLocked || false);
  }, [config.securityPassword, config.isLocked]);

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-[#0B4F9C]" />
          <h4 className="text-xs font-bold text-[#0F172A]">Site Security PIN</h4>
        </div>
        <button
          type="button"
          onClick={() => setLocked(!locked)}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
            locked
              ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
              : 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
          }`}
        >
          {locked ? <Lock size={12} /> : <Unlock size={12} />}
          <span>{locked ? 'Lock Active' : 'Unlocked'}</span>
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Security password..."
          className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs"
        />
        <button
          type="button"
          onClick={() => onUpdate(password, locked)}
          className="px-4 py-2 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export const StlManager = ({
  config,
  onUpdate,
}: {
  config: Config;
  onUpdate: (password: string, active: boolean) => Promise<void>;
}) => {
  const [password, setPassword] = useState(config.stlPassword || '');
  const [active, setActive] = useState(config.stlLoginActive || false);

  React.useEffect(() => {
    setPassword(config.stlPassword || '');
    setActive(config.stlLoginActive || false);
  }, [config.stlPassword, config.stlLoginActive]);

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#0B4F9C]" />
          <h4 className="text-xs font-bold text-[#0F172A]">STL Access Password</h4>
        </div>
        <button
          type="button"
          onClick={() => setActive(!active)}
          className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
            active
              ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
              : 'bg-[#F4F6F9] text-[#64748B] border border-[#E5E7EB]'
          }`}
        >
          {active ? 'Active' : 'Inactive'}
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="STL password..."
          className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs"
        />
        <button
          type="button"
          onClick={() => onUpdate(password, active)}
          className="px-4 py-2 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export const CounsellingManager = ({
  config,
  onUpdate,
}: {
  config: Config;
  onUpdate: (schedules: CounsellingSchedule[], methods: PaymentMethods) => Promise<void>;
}) => {
  const [schedules, setSchedules] = useState<CounsellingSchedule[]>(
    config.counsellingSchedules || []
  );
  const [newSched, setNewSched] = useState('');
  const [methods, setMethods] = useState<PaymentMethods>(config.paymentMethods || {});

  React.useEffect(() => {
    if (config.counsellingSchedules) setSchedules(config.counsellingSchedules);
    if (config.paymentMethods) setMethods(config.paymentMethods);
  }, [config.counsellingSchedules, config.paymentMethods]);

  const handleAdd = () => {
    if (!newSched.trim()) return;
    setSchedules([...schedules, { id: Date.now().toString(), text: newSched.trim() }]);
    setNewSched('');
  };

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center gap-2">
        <CreditCard size={16} className="text-[#047857]" />
        <h4 className="text-xs font-bold text-[#0F172A]">Counselling Schedule & Payment Numbers</h4>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newSched}
          onChange={(e) => setNewSched(e.target.value)}
          placeholder="Add new schedule..."
          className="flex-1 fintech-input rounded-xl px-3.5 py-2 text-xs"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3.5 py-2 bg-[#0B4F9C] text-white rounded-xl cursor-pointer"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between p-2.5 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] text-xs"
          >
            <span className="text-[#0F172A] truncate pr-2">{s.text}</span>
            <button
              type="button"
              onClick={() => setSchedules(schedules.filter((x) => x.id !== s.id))}
              className="text-[#64748B] hover:text-[#DC2626] cursor-pointer shrink-0"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB]">
        {(['bkash', 'nagad', 'rocket', 'upay'] as const).map((m) => (
          <input
            key={m}
            type="text"
            value={methods[m] || ''}
            onChange={(e) => setMethods({ ...methods, [m]: e.target.value })}
            placeholder={`${m.toUpperCase()} Number`}
            className="fintech-input rounded-xl px-3 py-2 text-xs font-mono tabular-nums"
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => onUpdate(schedules, methods)}
        className="w-full py-2.5 bg-[#047857] hover:bg-[#065F46] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
      >
        Save Schedule & Numbers
      </button>
    </div>
  );
};

export const SupabaseStatusManager = ({
  showMsg,
}: {
  showMsg: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) => {
  const [checking, setChecking] = useState(false);
  const [statusInfo, setStatusInfo] = useState<{
    connected: boolean;
    tableReady: boolean;
    message: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const testConnection = async () => {
    setChecking(true);
    const res = await checkSupabaseConnection();
    setStatusInfo(res);
    setChecking(false);
    if (res.tableReady) {
      showMsg('Supabase is connected & ready!', 'success');
    } else {
      showMsg(res.message, 'info');
    }
  };

  React.useEffect(() => {
    testConnection();
  }, []);

  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
      setCopied(true);
      showMsg('Supabase SQL Setup script copied!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showMsg('Please copy the SQL script manually.', 'error');
    }
  };

  return (
    <div className="p-4 bg-white border border-[#E5E7EB] rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-[#047857]" />
          <h4 className="text-xs font-bold text-[#0F172A]">Supabase Database</h4>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            statusInfo?.tableReady
              ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
              : 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]'
          }`}
        >
          {statusInfo?.tableReady ? 'Cloud Ready' : 'Setup Required'}
        </span>
      </div>

      <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#64748B]">Project URL:</span>
          <span className="font-mono text-[#0F172A] font-semibold truncate max-w-[210px]">
            {SUPABASE_URL}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#64748B]">Quota / Read Limit:</span>
          <span className="font-bold text-[#047857]">Unlimited (Zero Daily Limit)</span>
        </div>
      </div>

      <div className="p-3 bg-[#EEF5FF] border border-[#D6E6FF] rounded-xl text-xs space-y-2">
        <p className="text-[11px] font-medium text-[#0B4F9C] leading-relaxed">
          {statusInfo?.tableReady
            ? 'Supabase is fully configured. All data, ranking, and results sync to Supabase!'
            : 'To complete cloud sync, open your Supabase Dashboard -> SQL Editor, paste the SQL setup script and click Run.'}
        </p>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopySql}
            className="flex-1 py-2 px-3 bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied SQL!' : 'Copy Supabase SQL Setup'}</span>
          </button>

          <button
            type="button"
            disabled={checking}
            onClick={testConnection}
            className="py-2 px-3 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] font-bold rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={checking ? 'animate-spin' : ''} />
            <span>Test</span>
          </button>
        </div>
      </div>
    </div>
  );
};

