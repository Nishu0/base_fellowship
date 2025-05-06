import { Logger } from './logger';

/**
 * This file provides examples of how to use the enhanced timer-based logging
 * system throughout the codebase.
 */

// Example class that uses the timer-based logging
class ExampleService {
  // Example of using the timer logging for a synchronous operation
  public performOperation(): string {
    // Start a timer with additional context information
    const timer = Logger.time('EXAMPLE', 'perform complex operation', {
      timestamp: new Date(),
      context: 'Additional information can be logged at the start'
    });
    
    // Simulate work
    let result = '';
    for (let i = 0; i < 1000; i++) {
      result += 'Processing... ';
    }
    
    // End the timer with success status and additional info about the result
    timer.success('Operation completed successfully', {
      resultLength: result.length,
      executionDetail: 'Provides details about what happened'
    });
    
    return result;
  }
  
  // Example of using the timer logging for an asynchronous operation
  public async fetchData(userId: string): Promise<any> {
    // Start a timer with relevant context
    const timer = Logger.time('EXAMPLE', `Fetch data for user ${userId}`, { userId });
    
    try {
      // Simulate an async operation like a database query or API call
      const result = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ userId, name: 'Example User', data: [1, 2, 3] });
        }, 500);
      });
      
      // End the timer with success status
      timer.success('User data retrieved', { 
        dataPoints: (result as any).data.length 
      });
      
      return result;
    } catch (error) {
      // Log an error with the timer if something goes wrong
      timer.error('Failed to fetch user data', error);
      throw error;
    }
  }
  
  // Example of nested timers for complex operations
  public async complexOperation(): Promise<void> {
    // Start a timer for the overall operation
    const mainTimer = Logger.time('COMPLEX_OP', 'Execute complex operation');
    
    try {
      // First step with its own timer
      const step1Timer = Logger.time('COMPLEX_OP', 'Step 1: Data preparation');
      await new Promise(resolve => setTimeout(resolve, 200));
      step1Timer.success('Data preparation completed');
      
      // Second step with its own timer
      const step2Timer = Logger.time('COMPLEX_OP', 'Step 2: Data processing');
      
      try {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // This step could fail
        if (Math.random() > 0.7) {
          throw new Error('Random processing error');
        }
        
        step2Timer.success('Data processing completed');
      } catch (error) {
        // Handle step errors but continue the main operation
        step2Timer.warning('Data processing had issues, continuing with partial results', error);
      }
      
      // Third step with its own timer
      const step3Timer = Logger.time('COMPLEX_OP', 'Step 3: Finalization');
      await new Promise(resolve => setTimeout(resolve, 100));
      step3Timer.success('Finalization completed');
      
      // Complete the main operation
      mainTimer.success('Complex operation completed successfully');
    } catch (error) {
      // If the overall operation fails
      mainTimer.error('Complex operation failed', error);
      throw error;
    }
  }
  
  // Example of manually timing a method instead of using a decorator
  public async timedMethod(param: string): Promise<string> {
    const timer = Logger.time('EXAMPLE', 'Timed method execution', { param });
    
    try {
      // The method execution is manually timed
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = `Processed: ${param}`;
      
      timer.success('Method executed successfully', { resultLength: result.length });
      return result;
    } catch (error) {
      timer.error('Method execution failed', error);
      throw error;
    }
  }
}

// Example of using the logger for non-timed informational logs
export function demonstrateLogging(): void {
  // Standard info log for non-timed information
  Logger.info('DEMO', 'Starting logging demonstration');
  
  // Create an instance of the example service
  const service = new ExampleService();
  
  // Demonstrate synchronous operation with timing
  service.performOperation();
  
  // Demonstrate asynchronous operation with timing
  service.fetchData('user123')
    .then(() => {
      // Demonstrate warning logs
      Logger.warn('DEMO', 'This is a warning message', { 
        reason: 'Something looks suspicious but not critical' 
      });
      
      // Demonstrate complex operation with nested timers
      return service.complexOperation();
    })
    .then(() => {
      // Demonstrate timed method (manual approach instead of decorator)
      return service.timedMethod('test input');
    })
    .then(() => {
      // Demonstrate debug logs (only shown when process.env.DEBUG is set)
      Logger.debug('DEMO', 'This is a debug message that will only appear in debug mode', {
        details: 'Extra debugging information'
      });
      
      Logger.info('DEMO', 'Logging demonstration completed');
    })
    .catch(error => {
      // Demonstrate error logs
      Logger.error('DEMO', 'An error occurred during demonstration', error);
    });
}

// Execute the demonstration if this file is run directly
if (require.main === module) {
  demonstrateLogging();
} 