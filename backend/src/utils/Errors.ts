export class ConnectionNotFoundError extends Error {
    constructor(connectionId: string) {
      super(`Connection ${connectionId} not found`);
    }
  }
  
  export class TriggerDefinitionNotFoundError extends Error {
    constructor(key: string) {
      super(`Trigger definition ${key} not found`);
    }
  }
  export class AppMismatchError extends Error {
    constructor(
      public readonly connectionAppId: string,
      public readonly triggerAppId: string
    ) {
      super(`Application mismatch: Connection belongs to app ${connectionAppId} but trigger belongs to app ${triggerAppId}`);
      this.name = 'AppMismatchError';
      
      // Maintain proper stack trace for where our error was thrown
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, AppMismatchError);
      }
    }
  }
// Usage:
//   if (!connection) throw new ConnectionNotFoundError(connectionId);
//   if (!triggerDefinition) throw new TriggerDefinitionNotFoundError(triggerDefinitionKey)