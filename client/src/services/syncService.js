import { supabase } from '../config/supabase';
import { templateCache, submissionCache, userCache } from '../utils/cache';

/**
 * Service for handling data synchronization with the backend
 */
class SyncService {
  constructor() {
    this.subscriptions = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize real-time subscriptions
   */
  init() {
    if (this.isInitialized) {
      return;
    }

    // Subscribe to template changes
    this.subscribeToTemplates();

    // Subscribe to submission changes
    this.subscribeToSubmissions();

    this.isInitialized = true;
  }

  /**
   * Subscribe to template changes
   */
  subscribeToTemplates() {
    const templateChannel = supabase
      .channel('templates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'templates'
      }, (payload) => {
        // Invalidate caches on any template change
        templateCache.delete(`template-${payload.new?.id}`);
        templateCache.delete('public-templates');

        // Additional handling for specific events
        switch (payload.eventType) {
          case 'INSERT':
            // Handle new template
            console.log('New template created:', payload.new.id);
            break;
          case 'UPDATE':
            // Handle template update
            console.log('Template updated:', payload.new.id);
            break;
          case 'DELETE':
            // Handle template deletion
            console.log('Template deleted:', payload.old.id);
            break;
          default:
            break;
        }
      })
      .subscribe();

    this.subscriptions.set('templates', templateChannel);
  }

  /**
   * Subscribe to submission changes
   */
  subscribeToSubmissions() {
    const submissionChannel = supabase
      .channel('submissions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'submissions'
      }, (payload) => {
        // Invalidate caches on any submission change
        submissionCache.delete(`submission-${payload.new?.id}`);
        submissionCache.delete(`template-submissions-${payload.new?.template_id}`);

        // Additional handling
        switch (payload.eventType) {
          case 'INSERT':
            // Handle new submission
            console.log('New submission created:', payload.new.id);
            break;
          case 'UPDATE':
            // Handle submission update
            console.log('Submission updated:', payload.new.id);
            break;
          case 'DELETE':
            // Handle submission deletion
            console.log('Submission deleted:', payload.old.id);
            break;
          default:
            break;
        }
      })
      .subscribe();

    this.subscriptions.set('submissions', submissionChannel);
  }

  /**
   * Subscribe to specific template updates
   * @param {string} templateId 
   * @param {Function} callback 
   * @returns {string} Subscription ID
   */
  subscribeToTemplate(templateId, callback) {
    const subId = `template-${templateId}`;
    
    const channel = supabase
      .channel(subId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'templates',
        filter: `id=eq.${templateId}`
      }, (payload) => {
        callback(payload);
      })
      .subscribe();
    
    this.subscriptions.set(subId, channel);
    return subId;
  }

  /**
   * Subscribe to specific template's submissions
   * @param {string} templateId 
   * @param {Function} callback 
   * @returns {string} Subscription ID
   */
  subscribeToTemplateSubmissions(templateId, callback) {
    const subId = `template-submissions-${templateId}`;
    
    const channel = supabase
      .channel(subId)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'submissions',
        filter: `template_id=eq.${templateId}`
      }, (payload) => {
        callback(payload);
      })
      .subscribe();
    
    this.subscriptions.set(subId, channel);
    return subId;
  }

  /**
   * Unsubscribe from a specific subscription
   * @param {string} subscriptionId 
   */
  unsubscribe(subscriptionId) {
    const channel = this.subscriptions.get(subscriptionId);
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup() {
    this.subscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
    this.isInitialized = false;
  }
}

export const syncService = new SyncService(); 