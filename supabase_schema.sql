-- ==============================================================================
-- Supabase Database Schema for Unity Earning
-- Complete migration from Firebase Firestore to Supabase PostgreSQL
-- ==============================================================================

-- 1. members
CREATE TABLE IF NOT EXISTS "members" (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  "profilePic" TEXT,
  target NUMERIC,
  whatsapp TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 2. results
CREATE TABLE IF NOT EXISTS "results" (
  id TEXT PRIMARY KEY,
  "memberId" TEXT,
  lead NUMERIC DEFAULT 0,
  convert NUMERIC DEFAULT 0,
  "personalLead" NUMERIC DEFAULT 0,
  submitted BOOLEAN DEFAULT FALSE,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 3. config
CREATE TABLE IF NOT EXISTS "config" (
  id TEXT PRIMARY KEY,
  "timerActive" BOOLEAN DEFAULT FALSE,
  "timerEndTime" BIGINT DEFAULT 0,
  "timerDuration" NUMERIC DEFAULT 1800,
  "timerStartedAt" BIGINT DEFAULT 0,
  "timerNotificationsActive" BOOLEAN DEFAULT TRUE,
  "announcement" TEXT,
  "announcementActive" BOOLEAN DEFAULT FALSE,
  "isLocked" BOOLEAN DEFAULT TRUE,
  "securityPassword" TEXT,
  "stlPassword" TEXT,
  "autoTimerEnabled" BOOLEAN DEFAULT FALSE,
  "autoTimerTime" TEXT,
  "fineSystemActive" BOOLEAN DEFAULT FALSE,
  "fineAmount" NUMERIC DEFAULT 10,
  "fineStartDate" TEXT,
  "finesResetAt" BIGINT,
  "giftBoxActive" BOOLEAN DEFAULT FALSE,
  "giftBoxTitle" TEXT,
  "giftBoxContent" TEXT,
  "paymentMethods" JSONB DEFAULT '[]'::jsonb,
  "socialLinks" JSONB DEFAULT '{}'::jsonb,
  "noticeText" TEXT,
  "customLogo" TEXT,
  "appTheme" TEXT,
  "totalConverts" NUMERIC DEFAULT 0,
  "leaderRankingActive" BOOLEAN DEFAULT TRUE,
  "trainerRankingActive" BOOLEAN DEFAULT TRUE,
  "stlActive" BOOLEAN DEFAULT TRUE,
  "demoActive" BOOLEAN DEFAULT TRUE,
  "stlLoginActive" BOOLEAN DEFAULT TRUE,
  "counsellingSchedules" JSONB DEFAULT '[]'::jsonb,
  "lastAutoStartTime" BIGINT DEFAULT 0,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 4. pickingSchedule
CREATE TABLE IF NOT EXISTS "pickingSchedule" (
  id TEXT PRIMARY KEY,
  name TEXT,
  "isSelected" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 5. applications
CREATE TABLE IF NOT EXISTS "applications" (
  id TEXT PRIMARY KEY,
  "fullName" TEXT,
  "mobileNumber" TEXT,
  email TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 6. teachers
CREATE TABLE IF NOT EXISTS "teachers" (
  id TEXT PRIMARY KEY,
  name TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 7. teacherAttendance
CREATE TABLE IF NOT EXISTS "teacherAttendance" (
  id TEXT PRIMARY KEY,
  "teacherId" TEXT,
  "teacherName" TEXT,
  course TEXT,
  date TEXT,
  "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 8. stlMembers
CREATE TABLE IF NOT EXISTS "stlMembers" (
  id TEXT PRIMARY KEY,
  name TEXT,
  target NUMERIC,
  "assignedTLs" JSONB DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 9. stlAttendance
CREATE TABLE IF NOT EXISTS "stlAttendance" (
  id TEXT PRIMARY KEY,
  "memberId" TEXT,
  "memberName" TEXT,
  "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 10. demoMembers
CREATE TABLE IF NOT EXISTS "demoMembers" (
  id TEXT PRIMARY KEY,
  name TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 11. demoAttendance
CREATE TABLE IF NOT EXISTS "demoAttendance" (
  id TEXT PRIMARY KEY,
  "memberId" TEXT,
  "memberName" TEXT,
  "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 12. leaderRanking
CREATE TABLE IF NOT EXISTS "leaderRanking" (
  id TEXT PRIMARY KEY,
  name TEXT,
  score NUMERIC DEFAULT 0,
  leads NUMERIC DEFAULT 0,
  whatsapp TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 13. trainerRanking
CREATE TABLE IF NOT EXISTS "trainerRanking" (
  id TEXT PRIMARY KEY,
  name TEXT,
  score NUMERIC DEFAULT 0,
  leads NUMERIC DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 14. quickLinks
CREATE TABLE IF NOT EXISTS "quickLinks" (
  id TEXT PRIMARY KEY,
  name TEXT,
  url TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 15. pendingRegistrations
CREATE TABLE IF NOT EXISTS "pendingRegistrations" (
  id TEXT PRIMARY KEY,
  "fullName" TEXT,
  whatsapp TEXT,
  position TEXT,
  password TEXT,
  status TEXT DEFAULT 'pending',
  "profilePic" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 16. registeredUsers
CREATE TABLE IF NOT EXISTS "registeredUsers" (
  id TEXT PRIMARY KEY,
  "fullName" TEXT,
  whatsapp TEXT UNIQUE,
  position TEXT,
  password TEXT,
  status TEXT DEFAULT 'active',
  "profilePic" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 17. userBalances
CREATE TABLE IF NOT EXISTS "userBalances" (
  id TEXT PRIMARY KEY,
  whatsapp TEXT,
  "userName" TEXT,
  balance NUMERIC DEFAULT 0,
  "waivedFines" JSONB DEFAULT '[]'::jsonb,
  "manualAdjustments" JSONB DEFAULT '[]'::jsonb,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 18. submissionLogs
CREATE TABLE IF NOT EXISTS "submissionLogs" (
  id TEXT PRIMARY KEY,
  "memberId" TEXT,
  "memberName" TEXT,
  whatsapp TEXT,
  lead NUMERIC DEFAULT 0,
  convert NUMERIC DEFAULT 0,
  "personalLead" NUMERIC DEFAULT 0,
  date TEXT,
  "submittedAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 19. auditLogs
CREATE TABLE IF NOT EXISTS "auditLogs" (
  id TEXT PRIMARY KEY,
  action TEXT,
  amount NUMERIC,
  "userName" TEXT,
  whatsapp TEXT,
  "performedBy" TEXT,
  reason TEXT,
  date TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 20. notifications
CREATE TABLE IF NOT EXISTS "notifications" (
  id TEXT PRIMARY KEY,
  title TEXT,
  body TEXT,
  recipient TEXT,
  sender TEXT,
  "createdMillis" BIGINT,
  "readBy" JSONB DEFAULT '[]'::jsonb,
  "isSystem" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- 21. systemConfig
CREATE TABLE IF NOT EXISTS "systemConfig" (
  id TEXT PRIMARY KEY,
  data JSONB DEFAULT '{}'::jsonb,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 22. fcmTokens
CREATE TABLE IF NOT EXISTS "fcmTokens" (
  id TEXT PRIMARY KEY,
  whatsapp TEXT,
  platform TEXT,
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  data JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security (RLS) & Allow Access
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN (
      'members', 'results', 'config', 'pickingSchedule', 'applications',
      'teachers', 'teacherAttendance', 'stlMembers', 'stlAttendance',
      'demoMembers', 'demoAttendance', 'leaderRanking', 'trainerRanking',
      'quickLinks', 'pendingRegistrations', 'registeredUsers', 'userBalances',
      'submissionLogs', 'auditLogs', 'notifications', 'systemConfig', 'fcmTokens'
    )
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public full access" ON public.%I;', tbl);
    EXECUTE format('CREATE POLICY "Allow public full access" ON public.%I FOR ALL USING (true) WITH CHECK (true);', tbl);
  END LOOP;
END $$;

-- Enable Realtime Publication for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE 
  "members", "results", "config", "pickingSchedule", "applications",
  "teachers", "teacherAttendance", "stlMembers", "stlAttendance",
  "demoMembers", "demoAttendance", "leaderRanking", "trainerRanking",
  "quickLinks", "pendingRegistrations", "registeredUsers", "userBalances",
  "submissionLogs", "auditLogs", "notifications", "systemConfig", "fcmTokens";
