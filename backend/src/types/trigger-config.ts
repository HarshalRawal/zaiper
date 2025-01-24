export interface GmailTriggerConfig {
    // Basic Parameters
    labelIds?: string[];         // Default: ['INBOX']
    query?: string;              // Gmail search syntax
    maxResults?: number;         // Default: 10
    includeSpamTrash?: boolean;  // Default: false
  
    // Advanced Filtering
    newerThanMinutes?: number;   // Filter by time window
    markAsRead?: boolean;        // Processed emails get marked read
    requiredLabels?: string[];   // Must have ALL these labels
    excludedLabels?: string[];   // Must have NONE of these labels
  
    // Application-Specific
    deduplicationWindow?: number; // Minutes to remember processed emails
    priority?: 'HIGH' | 'NORMAL' | 'LOW';
    attachments?: {
      include: boolean;
      maxSizeMB?: number;
    };
};