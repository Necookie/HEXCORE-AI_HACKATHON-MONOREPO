async function parseApiResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    return res.json();
  }

  const text = await res.text();
  return { error: text || `HTTP ${res.status} ${res.statusText}` };
}

export const userService = {
  async updateProfile(name: string, bio: string): Promise<void> {
    const res = await fetch('/api/user/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, bio }),
    });
    const json = await parseApiResponse(res);
    if (!res.ok) throw new Error(json.error ?? 'Something went wrong.');
  },

  async updatePassword(current: string, next: string): Promise<void> {
    const res = await fetch('/api/user/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const json = await parseApiResponse(res);
    if (!res.ok) throw new Error(json.error ?? 'Something went wrong.');
  },

  async deleteAccount(): Promise<void> {
    const res = await fetch('/api/user/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const json = await parseApiResponse(res);
    if (!res.ok) throw new Error(json.error ?? 'Something went wrong.');
  }
};
