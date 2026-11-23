import React, { useRef, useState } from 'react';
import {
  User,
  Shield,
  LogIn,
  Camera,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  LogOut,
  Check,
  Building2,
} from 'lucide-react';
import CartoonAvatar, { CARTOON_AVATAR_LIST } from './CartoonAvatar';
import { Member, RankingMember, Result, UserRegistration } from '../types';

interface ProfileViewProps {
  currentAuthUser: UserRegistration | null;
  isAdmin: boolean;
  customLogo?: string;
  myMember: Member | null;
  results: Record<string, Result>;
  leaderRanking: RankingMember[];
  trainerRanking: RankingMember[];
  savingPic: boolean;
  updatingPass: boolean;
  onProfilePicFile: (file: File) => void;
  onRemoveProfilePic: () => void;
  onSelectCartoonAvatar: (avatarId: string) => void;
  onUpdatePassword: (newPassword: string) => Promise<void>;
  onOpenAdminPanel: () => void;
  onGoLogin: () => void;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentAuthUser,
  isAdmin,
  customLogo,
  myMember,
  results,
  leaderRanking,
  trainerRanking,
  savingPic,
  updatingPass,
  onProfilePicFile,
  onRemoveProfilePic,
  onSelectCartoonAvatar,
  onUpdatePassword,
  onOpenAdminPanel,
  onGoLogin,
  onLogout,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPass, setShowPass] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleSavePass = async () => {
    if (!newPassword.trim()) return;
    await onUpdatePassword(newPassword);
    setNewPassword('');
  };

  const totalConvertsScore = currentAuthUser
    ? [...leaderRanking, ...trainerRanking].find(
        (r) => r.name.trim().toLowerCase() === currentAuthUser.fullName.trim().toLowerCase()
      )?.score || 0
    : 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Title */}
      <div className="fintech-card p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#EEF5FF] text-[#0B4F9C] flex items-center justify-center shrink-0">
            <User size={19} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-[#0F172A] truncate">My Profile</h1>
            <p className="text-xs text-[#64748B] truncate">
              Personal details, brand crest &amp; security settings
            </p>
          </div>
        </div>

        {/* Official Brand Logo Showcase Badge (Synced live from Admin Upload) */}
        <div className="flex items-center gap-2.5 bg-[#F4F6F9] border border-[#E5E7EB] rounded-xl px-3 py-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-[#0B4F9C] text-white flex items-center justify-center overflow-hidden border border-[#D6E6FF]">
            {customLogo ? (
              <img
                src={customLogo}
                alt="Organization Crest"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-extrabold text-xs">UE</span>
            )}
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] block">
              Official Logo
            </span>
            <span className="text-xs font-bold text-[#0F172A]">Unity Earning</span>
          </div>
        </div>
      </div>

      {/* Prominent Brand Identity Card inside User Profile */}
      <div className="rounded-2xl bg-[#EEF5FF] border border-[#D6E6FF] p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-[#0B4F9C] border border-[#D6E6FF] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
            {customLogo ? (
              <img
                src={customLogo}
                alt="Official Brand Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#0B4F9C] text-white flex items-center justify-center font-extrabold text-lg">
                UE
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0B4F9C]">
              <Building2 size={14} />
              <span>Official Organization Branding</span>
            </div>
            <p className="text-xs text-[#475569] mt-0.5">
              {customLogo
                ? 'Official brand crest synced live from Admin Panel'
                : 'Default "UE" official badge active'}
            </p>
          </div>
        </div>
      </div>

      {!currentAuthUser ? (
        <div className="fintech-card p-8 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#EEF5FF] text-[#0B4F9C] flex items-center justify-center mx-auto mb-4">
            <Shield size={28} />
          </div>
          <h3 className="text-lg font-bold text-[#0F172A] mb-1.5">
            {isAdmin ? 'Admin Session Active' : 'Login Required'}
          </h3>
          <p className="text-xs sm:text-sm text-[#64748B] mb-6 leading-relaxed">
            {isAdmin
              ? 'You are currently signed in as System Administrator. Manage portal settings, brand logo, and team records from the Admin Panel.'
              : 'Sign in with your account to view your profile details, change avatar, and manage password settings.'}
          </p>
          {isAdmin ? (
            <button
              type="button"
              onClick={onOpenAdminPanel}
              className="bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 text-sm cursor-pointer transition-colors"
            >
              <Shield size={17} />
              Open Admin Panel
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoLogin}
              className="bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold py-3 px-6 rounded-xl inline-flex items-center gap-2 text-sm cursor-pointer transition-colors"
            >
              <LogIn size={17} />
              Go to Login
            </button>
          )}
        </div>
      ) : (
        <div className="fintech-card overflow-hidden">
          {/* Profile Identity Header */}
          <div className="p-6 flex flex-col items-center border-b border-[#E5E7EB] bg-[#F8FAFC]">
            <div
              className="relative cursor-pointer mb-3"
              onClick={() => fileInputRef.current?.click()}
              title="Change Profile Picture"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#EEF5FF] border-2 border-[#D6E6FF] relative shadow-sm">
                {savingPic ? (
                  <div className="absolute inset-0 bg-[#0B4F9C]/85 flex items-center justify-center text-xs text-white font-bold z-20">
                    Saving...
                  </div>
                ) : (
                  <CartoonAvatar src={currentAuthUser.profilePic} name={currentAuthUser.fullName} />
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-[#0B4F9C] text-white p-1.5 rounded-full border-2 border-white shadow-xs">
                <Camera size={14} />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onProfilePicFile(f);
                e.target.value = '';
              }}
              accept="image/*"
              className="hidden"
            />

            <h2 className="text-xl font-extrabold text-[#0F172A] text-center">
              {currentAuthUser.fullName}
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-[#0B4F9C]">
              {currentAuthUser.position || 'Sub-Admin'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={savingPic}
                className="bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 text-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                <Upload size={14} />
                {savingPic ? 'Uploading...' : 'Upload Custom Photo'}
              </button>
              {currentAuthUser.profilePic && (
                <button
                  type="button"
                  onClick={onRemoveProfilePic}
                  disabled={savingPic}
                  className="bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] font-bold py-2 px-3.5 rounded-xl flex items-center gap-1.5 text-xs cursor-pointer transition-colors"
                >
                  <Trash2 size={14} />
                  Use Auto Avatar
                </button>
              )}
            </div>
          </div>

          {/* Cartoon Avatar Picker */}
          <div className="p-5 sm:p-6 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Choose Cartoon Avatar
              </h3>
              <span className="text-[11px] font-semibold text-[#64748B]">8 Options</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CARTOON_AVATAR_LIST.map((avatar) => {
                const isSelected = currentAuthUser.profilePic === `cartoon:${avatar.id}`;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => onSelectCartoonAvatar(avatar.id)}
                    disabled={savingPic}
                    className={`p-2.5 rounded-xl flex flex-col items-center gap-1.5 transition-colors text-center cursor-pointer border ${
                      isSelected
                        ? 'bg-[#EEF5FF] border-[#0B4F9C]'
                        : 'bg-[#F8FAFC] border-[#E5E7EB] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-[#E5E7EB] relative">
                      <CartoonAvatar src={`cartoon:${avatar.id}`} name={avatar.label} />
                      {isSelected && (
                        <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-[#0B4F9C] text-white flex items-center justify-center">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div className="w-full min-w-0">
                      <div className="text-xs font-bold text-[#0F172A] truncate">{avatar.label}</div>
                      <div className="text-[10px] font-medium text-[#64748B]">
                        {avatar.gender === 'male' ? 'Boy' : 'Girl'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Overview Grid */}
          <div className="p-5 sm:p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
                Account Overview
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3.5">
                  <span className="block text-[11px] text-[#64748B] font-semibold mb-0.5">
                    Full Name
                  </span>
                  <span className="text-[#0F172A] font-bold text-sm">{currentAuthUser.fullName}</span>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3.5">
                  <span className="block text-[11px] text-[#64748B] font-semibold mb-0.5">
                    WhatsApp Number
                  </span>
                  <span className="text-[#0B4F9C] font-bold text-sm font-mono tabular-nums">
                    {currentAuthUser.whatsapp}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3.5">
                  <span className="block text-[11px] text-[#64748B] font-semibold mb-0.5">
                    Position Role
                  </span>
                  <span className="text-[#0F172A] font-bold text-sm">
                    {currentAuthUser.position || 'Sub-Admin'}
                  </span>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3.5">
                  <span className="block text-[11px] text-[#64748B] font-semibold mb-0.5">
                    Total Verified Converts
                  </span>
                  <span className="text-[#047857] font-extrabold text-lg font-mono tabular-nums">
                    {totalConvertsScore}
                  </span>
                </div>

                {myMember && (
                  <>
                    <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3.5">
                      <span className="block text-[11px] text-[#64748B] font-semibold mb-0.5">
                        Today&apos;s Session Converts
                      </span>
                      <span className="text-[#047857] font-extrabold text-lg font-mono tabular-nums">
                        {results[myMember.id]?.convert || 0}
                      </span>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3.5">
                      <span className="block text-[11px] text-[#64748B] font-semibold mb-0.5">
                        Today&apos;s Personal Leads
                      </span>
                      <span className="text-[#0B4F9C] font-extrabold text-lg font-mono tabular-nums">
                        {results[myMember.id]?.personalLead || 0}
                      </span>
                    </div>
                  </>
                )}

                <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl p-3.5 sm:col-span-2">
                  <span className="block text-[11px] text-[#64748B] font-semibold mb-0.5">
                    Current Password
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-[#0F172A] font-bold font-mono text-sm">
                      {showPass ? currentAuthUser.password : '••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="text-[#0B4F9C] hover:bg-[#EEF5FF] p-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change */}
            <div className="pt-4 border-t border-[#E5E7EB]">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
                Change Password
              </h3>
              <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="fintech-input flex-1 rounded-xl px-4 py-2.5 text-sm"
                />
                <button
                  type="button"
                  onClick={handleSavePass}
                  disabled={updatingPass || !newPassword.trim()}
                  className="bg-[#0B4F9C] hover:bg-[#094182] text-white font-bold px-5 py-2.5 rounded-xl text-xs disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {updatingPass ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
              <button
                type="button"
                onClick={onLogout}
                className="bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
