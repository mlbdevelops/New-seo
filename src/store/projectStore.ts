import { create } from 'zustand';
import { getUserProjects, createProject as createProjectAPI, getProjectArticles } from '../lib/firebase';
import type { Project, Article } from '../lib/firebase';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  articles: Article[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  createProject: (title: string, description?: string) => Promise<{ error?: any }>;
  setCurrentProject: (project: Project | null) => void;
  fetchArticles: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  articles: [],
  loading: false,

  fetchProjects: async () => {
    set({ loading: true });
    const { data, error } = await getUserProjects();
    if (!error && data) {
      set({ projects: data });
    }
    set({ loading: false });
  },

  createProject: async (title: string, description?: string) => {
    set({ loading: true });
    const { data, error } = await createProjectAPI(title, description);
    
    if (!error && data) {
      const { projects } = get();
      set({ projects: [data, ...projects] });
    }
    
    set({ loading: false });
    return { error };
  },

  setCurrentProject: (project: Project | null) => {
    set({ currentProject: project, articles: [] });
  },

  fetchArticles: async (projectId: string) => {
    set({ loading: true });
    const { data, error } = await getProjectArticles(projectId);
    if (!error && data) {
      set({ articles: data });
    }
    set({ loading: false });
  },
}));