/**
 * Shared test context for managing user lifecycle across test files
 */

const fs = require('fs');
const path = require('path');

const TEST_CONTEXT_FILE = path.join(__dirname, '../test-context.json');

class TestContext {
  static load() {
    try {
      if (fs.existsSync(TEST_CONTEXT_FILE)) {
        const data = fs.readFileSync(TEST_CONTEXT_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Could not load test context:', error.message);
    }
    return {
      users: {},
      sequence: {
        currentStep: 0,
        completedSteps: []
      }
    };
  }

  static save(context) {
    try {
      fs.writeFileSync(TEST_CONTEXT_FILE, JSON.stringify(context, null, 2));
    } catch (error) {
      console.warn('Could not save test context:', error.message);
    }
  }

  static cleanup() {
    try {
      if (fs.existsSync(TEST_CONTEXT_FILE)) {
        fs.unlinkSync(TEST_CONTEXT_FILE);
      }
    } catch (error) {
      console.warn('Could not cleanup test context:', error.message);
    }
  }

  static createUser(userData) {
    const context = this.load();
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    context.users[userId] = {
      ...userData,
      id: userId,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    this.save(context);
    return userId;
  }

  static updateUser(userId, updates) {
    const context = this.load();
    if (context.users[userId]) {
      context.users[userId] = {
        ...context.users[userId],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save(context);
    }
    return context.users[userId];
  }

  static getUser(userId) {
    const context = this.load();
    return context.users[userId];
  }

  static getAllUsers() {
    const context = this.load();
    return Object.values(context.users);
  }

  static getUsersByStatus(status) {
    const context = this.load();
    return Object.values(context.users).filter(user => user.status === status);
  }

  static setSequenceStep(step, data = {}) {
    const context = this.load();
    context.sequence.currentStep = step;
    context.sequence.completedSteps.push({
      step,
      data,
      timestamp: new Date().toISOString()
    });
    this.save(context);
  }

  static getSequenceStep() {
    const context = this.load();
    return context.sequence.currentStep;
  }

  static isStepCompleted(step) {
    const context = this.load();
    return context.sequence.completedSteps.some(s => s.step === step);
  }
}

module.exports = { TestContext };