import { randomBytes } from "crypto";

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  name: string;
  createdDate: Date;
  lastLogin?: Date;
}

export interface Session {
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
}

// Simple hash function for demo purposes (use bcryptjs in production)
function simpleHash(password: string, salt: string): string {
  let hash = 0;
  const combined = password + salt;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

export const AuthService = {
  // Initialize demo user if no users exist
  initializeDemoUser(): void {
    if (typeof window === "undefined") return;
    const users = this.getAllUsers();
    if (users.length === 0) {
      // Add demo user
      const salt = generateSalt();
      const demoPassword = simpleHash("demo123", salt);
      const demoUser: User = {
        id: "user_demo_1",
        email: "demo@shrim.com",
        password: `${demoPassword}:${salt}`,
        name: "Demo User",
        createdDate: new Date(),
      };
      localStorage.setItem("pos_users", JSON.stringify([demoUser]));
    }
  },

  // Get all users from localStorage
  getAllUsers(): User[] {
    if (typeof window === "undefined") return [];
    try {
      const users = localStorage.getItem("pos_users");
      if (!users) {
        this.initializeDemoUser();
        return this.getAllUsers();
      }
      return JSON.parse(users);
    } catch {
      return [];
    }
  },

  // Register a new user
  register(email: string, password: string, name: string): { success: boolean; error?: string; user?: User } {
    const users = this.getAllUsers();

    // Check if user already exists
    if (users.some((u) => u.email === email)) {
      return { success: false, error: "Email already registered" };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const salt = generateSalt();
    const hashedPassword = simpleHash(password, salt);

    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      password: `${hashedPassword}:${salt}`,
      name,
      createdDate: new Date(),
    };

    users.push(newUser);
    localStorage.setItem("pos_users", JSON.stringify(users));

    return { success: true, user: newUser };
  },

  // Login user
  login(email: string, password: string): { success: boolean; error?: string; session?: Session } {
    const users = this.getAllUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    const [storedHash, salt] = user.password.split(":");
    const passwordHash = simpleHash(password, salt);

    if (passwordHash !== storedHash) {
      return { success: false, error: "Invalid email or password" };
    }

    // Update last login
    const updatedUser = { ...user, lastLogin: new Date() };
    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
    localStorage.setItem("pos_users", JSON.stringify(updatedUsers));

    // Create session
    const token = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: Session = {
      userId: user.id,
      token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    localStorage.setItem("pos_session", JSON.stringify(session));

    return { success: true, session };
  },

  // Logout user
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pos_session");
    }
  },

  // Get current session
  getCurrentSession(): Session | null {
    if (typeof window === "undefined") return null;
    try {
      const session = localStorage.getItem("pos_session");
      if (!session) return null;

      const parsed: Session = JSON.parse(session);
      // Check if session has expired
      if (new Date(parsed.expiresAt) < new Date()) {
        this.logout();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    const session = this.getCurrentSession();
    if (!session) return null;

    const users = this.getAllUsers();
    return users.find((u) => u.id === session.userId) || null;
  },

  // Update password (for forgot password flow)
  resetPassword(email: string, newPassword: string): { success: boolean; error?: string } {
    if (newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const users = this.getAllUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const salt = generateSalt();
    const hashedPassword = simpleHash(newPassword, salt);

    const updatedUser = { ...user, password: `${hashedPassword}:${salt}` };
    const updatedUsers = users.map((u) => (u.id === user.id ? updatedUser : u));
    localStorage.setItem("pos_users", JSON.stringify(updatedUsers));

    return { success: true };
  },

  // Check if email exists
  emailExists(email: string): boolean {
    return this.getAllUsers().some((u) => u.email === email);
  },

  // Verify security question (simplified for demo)
  verifySecurity(email: string, question: string, answer: string): boolean {
    // In production, store and verify security answers
    // For demo, we'll accept a simple verification
    return answer.toLowerCase().includes("shrim");
  },
};
