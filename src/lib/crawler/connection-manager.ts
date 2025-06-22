/**
 * Connection Manager cho Crawler
 * Quản lý database connections và tránh "too many clients" error
 */

import { prisma } from '../db';

class ConnectionManager {
  private static instance: ConnectionManager;
  private activeConnections = 0;
  private readonly maxConnections = 5; // Giới hạn tối đa 5 connections đồng thời
  private readonly queue: Array<() => void> = [];

  private constructor() {}

  static getInstance(): ConnectionManager {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  /**
   * Thực hiện database operation với connection management
   */
  async executeWithConnection<T>(operation: () => Promise<T>): Promise<T> {
    // Chờ cho đến khi có connection available
    await this.waitForConnection();
    
    this.activeConnections++;
    
    try {
      const result = await operation();
      return result;
    } finally {
      this.activeConnections--;
      this.processQueue();
    }
  }

  /**
   * Chờ connection available
   */
  private async waitForConnection(): Promise<void> {
    if (this.activeConnections < this.maxConnections) {
      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  /**
   * Xử lý queue khi có connection available
   */
  private processQueue(): void {
    if (this.queue.length > 0 && this.activeConnections < this.maxConnections) {
      const next = this.queue.shift();
      if (next) {
        next();
      }
    }
  }

  /**
   * Lấy thông tin trạng thái connection
   */
  getStatus(): { active: number; queued: number; max: number } {
    return {
      active: this.activeConnections,
      queued: this.queue.length,
      max: this.maxConnections,
    };
  }

  /**
   * Reset connection manager
   */
  reset(): void {
    this.activeConnections = 0;
    this.queue.length = 0;
  }

  /**
   * Cleanup và disconnect
   */
  async cleanup(): Promise<void> {
    // Chờ tất cả operations hoàn thành
    while (this.activeConnections > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }

    this.reset();
  }
}

export const connectionManager = ConnectionManager.getInstance();

/**
 * Helper function để wrap database operations
 */
export function withConnection<T>(operation: () => Promise<T>): Promise<T> {
  return connectionManager.executeWithConnection(operation);
} 