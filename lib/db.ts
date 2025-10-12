import { promises as fs } from 'fs';
import path from 'path';
import { Issue, User } from './types';

const issuesDataPath = path.join(process.cwd(), 'data/issues.json');
const usersDataPath = path.join(process.cwd(), 'data/users.json');

export async function getIssues(): Promise<Issue[]> {
  try {
    const data = await fs.readFile(issuesDataPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveIssues(issues: Issue[]): Promise<void> {
  await fs.writeFile(issuesDataPath, JSON.stringify(issues, null, 2));
}

export async function getUsers(): Promise<User[]> {
    try {
      const data = await fs.readFile(usersDataPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

export async function saveUsers(users: User[]): Promise<void> {
await fs.writeFile(usersDataPath, JSON.stringify(users, null, 2));
}