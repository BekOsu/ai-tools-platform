import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface UserRecord {
  id: string
  name: string
  email: string
  passwordHash: string
  salt: string
  credits: number
}

const dataFile = path.join(process.cwd(), 'src/data/users.json')

function loadUsers(): UserRecord[] {
  try {
    const data = fs.readFileSync(dataFile, 'utf8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

function saveUsers(users: UserRecord[]) {
  fs.mkdirSync(path.dirname(dataFile), { recursive: true })
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2))
}

function hashPassword(password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, s, 10000, 64, 'sha512').toString('hex')
  return { salt: s, hash }
}

export async function createUser(name: string, email: string, password: string): Promise<UserRecord> {
  const users = loadUsers()
  const existing = users.find(u => u.email === email)
  if (existing) {
    throw new Error('User already exists')
  }
  const { salt, hash } = hashPassword(password)
  const user: UserRecord = {
    id: Date.now().toString(),
    name,
    email,
    passwordHash: hash,
    salt,
    credits: 15.69,
  }
  users.push(user)
  saveUsers(users)
  return user
}

export function findUserByEmail(email: string): UserRecord | undefined {
  const users = loadUsers()
  return users.find(u => u.email === email)
}

export async function verifyUser(email: string, password: string): Promise<UserRecord | null> {
  const user = findUserByEmail(email)
  if (!user) return null
  const { hash } = hashPassword(password, user.salt)
  return hash === user.passwordHash ? user : null
}

export function updateUser(email: string, data: Partial<UserRecord>) {
  const users = loadUsers()
  const user = users.find(u => u.email === email)
  if (user) {
    if (data.passwordHash && data.salt) {
      user.passwordHash = data.passwordHash
      user.salt = data.salt
    }
    Object.assign(user, data)
    saveUsers(users)
  }
  return user
}

export function deleteUser(email: string): boolean {
  const users = loadUsers()
  const index = users.findIndex(u => u.email === email)
  if (index !== -1) {
    users.splice(index, 1)
    saveUsers(users)
    return true
  }
  return false
}

export function getUserCredits(email: string): number | null {
  const user = findUserByEmail(email)
  return user ? user.credits : null
}
