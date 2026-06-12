import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'care_partner' | 'caregiver' | 'clinician';
  mobile_number?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signin: (email: string, password: string) => Promise<User>;
  signup: (
    email: string,
    password: string,
    name: string,
    role: User['role'],
    mobile_number: string
  ) => Promise<User>;
  signout: (showToast?: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<User>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
