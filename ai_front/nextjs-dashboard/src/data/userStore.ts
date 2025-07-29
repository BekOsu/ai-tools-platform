export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
}

const users: UserRecord[] = [];

export function createUser(name: string, email: string, password: string): UserRecord {
  const existing = users.find(u => u.email === email);
  if (existing) {
    throw new Error('User already exists');
  }
  const user: UserRecord = { id: Date.now().toString(), name, email, password };
  users.push(user);
  return user;
}

export function findUserByEmail(email: string): UserRecord | undefined {
  return users.find(u => u.email === email);
}

export function verifyUser(email: string, password: string): UserRecord | null {
  const user = users.find(u => u.email === email && u.password === password);
  return user || null;
}

export function updateUser(email: string, data: Partial<UserRecord>) {
  const user = users.find(u => u.email === email)
  if (user) {
    Object.assign(user, data)
  }
  return user
}
