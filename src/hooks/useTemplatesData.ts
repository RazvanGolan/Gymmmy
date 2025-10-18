import { create } from 'zustand';
import { WorkoutTemplate } from '../types';

interface TemplatesDataState {
  templates: WorkoutTemplate[];
  isLoading: boolean;
  error: string | null;
}

interface TemplatesDataActions {
  setTemplates: (templates: WorkoutTemplate[]) => void;
  addTemplate: (template: WorkoutTemplate) => void;
  updateTemplate: (id: string, template: WorkoutTemplate) => void;
  removeTemplate: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  getTemplate: (id: string) => WorkoutTemplate | undefined;
}

export const useTemplatesData = create<TemplatesDataState & TemplatesDataActions>()((set, get) => ({
  // State
  templates: [],
  isLoading: false,
  error: null,

  // Actions
  setTemplates: (templates) => {
    set({ templates });
  },

  addTemplate: (template) => {
    set(state => ({
      templates: [...state.templates, template],
    }));
  },

  updateTemplate: (id, updatedTemplate) => {
    set(state => ({
      templates: state.templates.map(template =>
        template.id === id ? updatedTemplate : template
      ),
    }));
  },

  removeTemplate: (id) => {
    set(state => ({
      templates: state.templates.filter(template => template.id !== id),
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  getTemplate: (id) => {
    return get().templates.find(template => template.id === id);
  },
}));