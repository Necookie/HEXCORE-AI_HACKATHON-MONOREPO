export const userService = {
  async updateProfile(name: string, bio: string): Promise<void> {
    const res = await fetch('/api/user/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Something went wrong.');
  },

  async updatePassword(current: string, next: string): Promise<void> {
    const res = await fetch('/api/user/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Something went wrong.');
  }
};
