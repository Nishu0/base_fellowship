/**
 * Enhanced logging utility for the application
 * This can be imported and used throughout the codebase for consistent logging
 * Provides timer-based logging that combines timing and information in one log entry
 */
export class Logger {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Internal log method used by all other logging functions
   */
  private static log(level: string, component: string, message: string, data?: any): void {
    const timestamp = this.getTimestamp();
    console.log(`[${timestamp}] [${level}] [${component}] ${message}`);
    if (data) {
      console.log(`[${timestamp}] [${level}] [${component}] Data:`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    }
  }

  /**
   * Start a timer for an operation and log the start of the operation
   * @param component Component name for the log
   * @param operation Operation being timed
   * @param additionalInfo Optional additional information to log
   * @returns Object with various methods to complete the timer with different status levels
   */
  public static time(component: string, operation: string, additionalInfo?: any): { 
    end: (additionalEndInfo?: any) => number;
    success: (message: string, data?: any) => number;
    warning: (message: string, data?: any) => number;
    error: (message: string, error?: any) => number;
  } {
    const start = performance.now();
    
    // Log the start of the operation with the additional info if provided
    this.log('TIMER', component, `Starting: ${operation}`, additionalInfo);
    
    // General end method that returns the duration
    const endTimer = (level: string, endMessage?: string, endData?: any) => {
      const duration = performance.now() - start;
      const formattedDuration = duration.toFixed(2);
      
      // Create a log message that includes the original operation and the duration
      const message = endMessage 
        ? `${endMessage} - ${operation} (${formattedDuration}ms)` 
        : `Completed: ${operation} (${formattedDuration}ms)`;
      
      this.log(level, component, message, endData);
      return duration;
    };

    return {
      // Standard completion - logs at INFO level
      end: (additionalEndInfo?: any) => endTimer('INFO', 'Completed', additionalEndInfo),
      
      // Success completion - logs at INFO level with custom message
      success: (message: string, data?: any) => endTimer('INFO', message, data),
      
      // Warning completion - logs at WARN level
      warning: (message: string, data?: any) => endTimer('WARN', message, data),
      
      // Error completion - logs at ERROR level and handles Error objects specially
      error: (message: string, error?: any) => {
        const duration = performance.now() - start;
        const formattedDuration = duration.toFixed(2);
        const timestamp = this.getTimestamp();
        
        // Log the error message with timing information
        console.error(`[${timestamp}] [ERROR] [${component}] ${message} - ${operation} (${formattedDuration}ms)`);
        
        // Handle error object if provided
        if (error) {
          if (error instanceof Error) {
            console.error(`[${timestamp}] [ERROR] [${component}] ${error.name}: ${error.message}`);
            if (error.stack) {
              console.error(`[${timestamp}] [ERROR] [${component}] Stack: ${error.stack}`);
            }
          } else {
            console.error(`[${timestamp}] [ERROR] [${component}] Details:`, typeof error === 'string' ? error : JSON.stringify(error, null, 2));
          }
        }
        
        return duration;
      }
    };
  }

  /**
   * Log information without timing
   * Only use this for non-operation logs where timing isn't relevant
   */
  public static info(component: string, message: string, data?: any): void {
    this.log('INFO', component, message, data);
  }

  /**
   * Log a warning without timing
   * Only use this for non-operation logs where timing isn't relevant
   */
  public static warn(component: string, message: string, data?: any): void {
    const timestamp = this.getTimestamp();
    console.warn(`[${timestamp}] [WARN] [${component}] ${message}`);
    if (data) {
      console.warn(`[${timestamp}] [WARN] [${component}] Data:`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log an error without timing
   * Only use this for non-operation logs where timing isn't relevant
   */
  public static error(component: string, message: string, error?: any): void {
    const timestamp = this.getTimestamp();
    console.error(`[${timestamp}] [ERROR] [${component}] ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error(`[${timestamp}] [ERROR] [${component}] ${error.name}: ${error.message}`);
        if (error.stack) {
          console.error(`[${timestamp}] [ERROR] [${component}] Stack: ${error.stack}`);
        }
      } else {
        console.error(`[${timestamp}] [ERROR] [${component}] Details:`, typeof error === 'string' ? error : JSON.stringify(error, null, 2));
      }
    }
  }

  /**
   * Log debug information when DEBUG environment variable is set
   * Only use this for non-operation logs where timing isn't relevant
   */
  public static debug(component: string, message: string, data?: any): void {
    if (process.env.DEBUG) {
      const timestamp = this.getTimestamp();
      console.debug(`[${timestamp}] [DEBUG] [${component}] ${message}`);
      if (data) {
        console.debug(`[${timestamp}] [DEBUG] [${component}] Data:`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
      }
    }
  }

  /**
   * Log function execution time
   * Use as a decorator for class methods or standalone functions
   * @param component Component name for the log
   * @param description Optional description of the operation
   */
  public static logExecutionTime(component: string, description?: string) {
    return function(
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;
      
      descriptor.value = function(...args: any[]) {
        const operation = description || `${propertyKey}()`;
        const timer = Logger.time(component, operation);
        
        try {
          const result = originalMethod.apply(this, args);
          
          // Handle promises
          if (result && typeof result.then === 'function') {
            return result.then((value: any) => {
              timer.success(`Successfully completed`, { async: true });
              return value;
            }).catch((error: any) => {
              timer.error(`Failed with error`, error);
              throw error;
            });
          }
          
          // Handle synchronous results
          timer.success(`Successfully completed`, { async: false });
          return result;
        } catch (error) {
          timer.error(`Failed with error`, error);
          throw error;
        }
      };
      
      return descriptor;
    };
  }
} 