import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BranchAuth {
  token: string | null;
  branch: { id: string; name: string } | null;
  setAuth: (token: string, branch: any) => void;
  logout: () => void;
}

export const useBranchAuthStore = create<BranchAuth>()(
  persist(
    (set) => ({
      token: null,
      branch: null,
      setAuth: (token, branch) => set({ token, branch }),
      logout: () => set({ token: null, branch: null }),
    }),
    { name: 'branch-auth-storage' }
  )
);
