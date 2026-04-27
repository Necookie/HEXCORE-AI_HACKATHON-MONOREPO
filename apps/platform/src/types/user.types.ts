export interface UserProfile {
  userName: string;
  userEmail: string;
  userBio: string;
  avatarUrl: string;
}

export type ProfileTabId = 'profile' | 'security';

export interface TabConfig {
  id: ProfileTabId;
  label: string;
  icon: string;
}

export const PROFILE_TABS: TabConfig[] = [
  { id: 'profile',  label: 'Profile',  icon: 'sparkles' },
  { id: 'security', label: 'Security', icon: 'lock'     },
];
