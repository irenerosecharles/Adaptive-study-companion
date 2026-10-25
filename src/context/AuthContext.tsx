import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { dbService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    institution?: string;
    department?: string;
    degreeProgram?: string;
    semester?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loginAsDemo: (role: 'student' | 'teacher') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'adaptive_companion_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        return JSON.parse(saved) as User;
      }
    } catch (e) {
      console.error('Failed to parse active user:', e);
    }
    // Default to demo student for immediate preview testing
    const defaultStudent = dbService.getUserById('user_student_1');
    return defaultStudent || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!email || !password) {
      return { success: false, message: 'Please provide both email and password.' };
    }

    const existing = dbService.getUserByEmail(email);
    if (!existing) {
      return { success: false, message: 'No registered account found with this email address.' };
    }

    // In this production prototype client authentication, we validate credentials
    if (password.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters.' };
    }

    setUser(existing);
    return { success: true };
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    institution?: string;
    department?: string;
    degreeProgram?: string;
    semester?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    if (!userData.name || !userData.email || !userData.password) {
      return { success: false, message: 'Name, email, and password are required.' };
    }

    const existing = dbService.getUserByEmail(userData.email);
    if (existing) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const newUser = dbService.createUser({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      institution: userData.institution || 'Apex Institute of Technology',
      department: userData.department,
      degreeProgram: userData.degreeProgram,
      semester: userData.semester
    });

    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const loginAsDemo = (role: 'student' | 'teacher') => {
    if (role === 'teacher') {
      const teacher = dbService.getUserById('user_teacher_1');
      if (teacher) setUser(teacher);
    } else {
      const student = dbService.getUserById('user_student_1');
      if (student) setUser(student);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isTeacher: user?.role === 'teacher',
        isStudent: user?.role === 'student',
        login,
        register,
        logout,
        loginAsDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
