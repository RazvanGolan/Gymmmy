import { useCallback } from 'react';
import { WorkoutTemplate } from '../types';
import { databaseService } from '../services/database';
import { useTemplatesData } from './useTemplatesData';

export const useTemplateActions = () => {
  const { 
    addTemplate, 
    updateTemplate, 
    removeTemplate, 
    setTemplates, 
    setLoading, 
    setError 
  } = useTemplatesData();

  const createTemplate = useCallback(async (
    templateData: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await databaseService.createTemplate(templateData);
      
      if (result.success && result.data) {
        addTemplate(result.data);
        setLoading(false);
        return result.data.id;
      } else {
        setError(result.error || 'Failed to create template');
        setLoading(false);
        return null;
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create template');
      setLoading(false);
      return null;
    }
  }, [addTemplate, setLoading, setError]);

  const updateTemplateAction = useCallback(async (
    id: string, 
    updates: Partial<WorkoutTemplate>
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await databaseService.updateTemplate(id, updates);
      
      if (result.success && result.data) {
        updateTemplate(id, result.data);
        setLoading(false);
      } else {
        setError(result.error || 'Failed to update template');
        setLoading(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update template');
      setLoading(false);
    }
  }, [updateTemplate, setLoading, setError]);

  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await databaseService.deleteTemplate(id);
      
      if (result.success) {
        removeTemplate(id);
        setLoading(false);
      } else {
        setError(result.error || 'Failed to delete template');
        setLoading(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete template');
      setLoading(false);
    }
  }, [removeTemplate, setLoading, setError]);

  const incrementTemplateUsage = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await databaseService.incrementTemplateUsage(id);
      
      if (result.success) {
        const { getTemplate } = useTemplatesData.getState();
        const template = getTemplate(id);
        if (template) {
          updateTemplate(id, { ...template, usageCount: template.usageCount + 1 });
        }
        setLoading(false);
      } else {
        setError(result.error || 'Failed to increment template usage');
        setLoading(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to increment template usage');
      setLoading(false);
    }
  }, [updateTemplate, setLoading, setError]);

  const loadTemplates = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await databaseService.getTemplates();
      
      if (result.success && result.data) {
        setTemplates(result.data);
        setLoading(false);
      } else {
        setError(result.error || 'Failed to load templates');
        setLoading(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load templates');
      setLoading(false);
    }
  }, [setTemplates, setLoading, setError]);

  return {
    createTemplate,
    updateTemplate: updateTemplateAction,
    deleteTemplate,
    incrementTemplateUsage,
    loadTemplates,
  };
};