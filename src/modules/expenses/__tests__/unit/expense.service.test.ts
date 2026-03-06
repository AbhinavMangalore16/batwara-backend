import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { ExpenseService } from '../../domain/expense.service';
import { ExpensePGRepository } from '../../repos/expense.repo';

describe('ExpenseService - Unit Tests', () => {
  let expenseService: ExpenseService;
  let mockRepo: ExpensePGRepository;

  beforeEach(() => {
    // Create mock repository
    mockRepo = {
      splitThat: mock(() => Promise.resolve({ transactionId: 'test-transaction-123' }))
    } as any;
    
    // supply no settlement repository for these tests
    expenseService = new ExpenseService(mockRepo);
  });

  describe('createBill - equal split', () => {
    it('should split amount equally among users', async () => {
      const billData = {
        totalAmount: 100,
        description: 'Test Dinner',
        splitData: {
          splitType: 'equal' as const,
          data: [
            { userId: 'user1' },
            { userId: 'user2' },
            { userId: 'user3' }
          ]
        }
      };

      const result = await expenseService.createBill('payer-id', billData);
      
      expect(result).toBe('test-transaction-123');
      expect(mockRepo.splitThat).toHaveBeenCalled();
    });

    it('should handle remainder correctly when amount does not divide evenly', async () => {
      const billData = {
        totalAmount: 100,
        description: 'Test',
        splitData: {
          splitType: 'equal' as const,
          data: [
            { userId: 'user1' },
            { userId: 'user2' },
            { userId: 'user3' }
          ]
        }
      };

      const result = await expenseService.createBill('payer-id', billData);
      
      // $100 / 3 = $33.33... → $34, $33, $33
      const callArgs = (mockRepo.splitThat as any).mock.calls[0][1];
      expect(callArgs.splitData[0].splitAmount).toBe(34);
      expect(callArgs.splitData[1].splitAmount).toBe(33);
      expect(callArgs.splitData[2].splitAmount).toBe(33);
      expect(result).toBe('test-transaction-123');
    });

    it('should handle single user split', async () => {
      const billData = {
        totalAmount: 50,
        description: 'Test',
        splitData: {
          splitType: 'equal' as const,
          data: [{ userId: 'user1' }]
        }
      };

      const result = await expenseService.createBill('payer-id', billData);
      
      const callArgs = (mockRepo.splitThat as any).mock.calls[0][1];
      expect(callArgs.splitData[0].splitAmount).toBe(50);
      expect(result).toBe('test-transaction-123');
    });
  });

  describe('createBill - exact split', () => {
    it('should split using exact amounts provided', async () => {
      const billData = {
        totalAmount: 100,
        description: 'Test',
        splitData: {
          splitType: 'exact' as const,
          data: [
            { userId: 'user1', amount: 40 },
            { userId: 'user2', amount: 35 },
            { userId: 'user3', amount: 25 }
          ]
        }
      };

      const result = await expenseService.createBill('payer-id', billData);
      
      const callArgs = (mockRepo.splitThat as any).mock.calls[0][1];
      expect(callArgs.splitData[0].splitAmount).toBe(40);
      expect(callArgs.splitData[1].splitAmount).toBe(35);
      expect(callArgs.splitData[2].splitAmount).toBe(25);
      expect(result).toBe('test-transaction-123');
    });
  });

  describe('createBill - percentage split', () => {
    it('should split using percentages', async () => {
      const billData = {
        totalAmount: 100,
        description: 'Test',
        splitData: {
          splitType: 'percentage' as const,
          data: [
            { userId: 'user1', percentage: 50 },
            { userId: 'user2', percentage: 30 },
            { userId: 'user3', percentage: 20 }
          ]
        }
      };

      const result = await expenseService.createBill('payer-id', billData);
      
      const callArgs = (mockRepo.splitThat as any).mock.calls[0][1];
      expect(callArgs.splitData[0].splitAmount).toBe(50); // 50% of 100
      expect(callArgs.splitData[1].splitAmount).toBe(30); // 30% of 100
      expect(callArgs.splitData[2].splitAmount).toBe(20); // 20% of 100
      expect(result).toBe('test-transaction-123');
    });

    it('should handle percentage calculations correctly', async () => {
      const billData = {
        totalAmount: 150,
        description: 'Test',
        splitData: {
          splitType: 'percentage' as const,
          data: [
            { userId: 'user1', percentage: 33.33 },
            { userId: 'user2', percentage: 33.33 },
            { userId: 'user3', percentage: 33.34 }
          ]
        }
      };

      const result = await expenseService.createBill('payer-id', billData);
      
      const callArgs = (mockRepo.splitThat as any).mock.calls[0][1];
      // Math.floor((33.33 * 150) / 100) = 49
      expect(callArgs.splitData[0].splitAmount).toBe(49);
      expect(callArgs.splitData[1].splitAmount).toBe(49);
      expect(callArgs.splitData[2].splitAmount).toBe(50);
      expect(result).toBe('test-transaction-123');
    });
  });

  describe('createBill - invalid split type', () => {
    it('should return null for invalid split type', async () => {
      const billData = {
        totalAmount: 100,
        description: 'Test',
        splitData: {
          splitType: 'invalid' as any,
          data: [{ userId: 'user1' }]
        }
      };

      const result = await expenseService.createBill('payer-id', billData);
      expect(result).toBeNull();
    });
  });

  describe('getDashboardChartData', () => {
    it('should delegate to repository with correct params', async () => {
      const chartMock = { paidByMe: [], owedByMe: [] };
      (mockRepo as any).getChartData = mock(() => Promise.resolve(chartMock));

      const result = await expenseService.getDashboardChartData('userX', 'week');
      expect(result).toBe(chartMock);
      expect((mockRepo as any).getChartData).toHaveBeenCalledWith('userX', 'week');
    });
  });

  describe('getFriendDetails', () => {
    it('should return history and active settlement filtered by friendId', async () => {
      const historyData = [{ id: 'bill1' }];
      (mockRepo as any).getFriendTransactions = mock(() => Promise.resolve(historyData));
      const fakeSettlementRepo = {
        getUserSettlements: mock(() =>
          Promise.resolve([
            { from: 'userX', to: 'friendY', amount: 50 },
            { from: 'other', to: 'userX', amount: 20 }
          ])
        )
      } as any;

      const service = new ExpenseService(mockRepo, fakeSettlementRepo);
      const result = await service.getFriendDetails('userX', 'friendY');

      expect(result.friendId).toBe('friendY');
      expect(result.history).toBe(historyData);
      expect(result.activeSettlements).toEqual([
        { from: 'userX', to: 'friendY', amount: 50 }
      ]);
      expect(fakeSettlementRepo.getUserSettlements).toHaveBeenCalledWith('userX');
      expect((mockRepo as any).getFriendTransactions).toHaveBeenCalledWith('userX', 'friendY');
    });
  });

  describe('createBill - repository error handling', () => {
    it('should handle repository errors gracefully', async () => {
      const errorRepo = {
        splitThat: mock(() => Promise.reject(new Error('Database error')))
      } as any;
      
      const errorService = new ExpenseService(errorRepo);
      
      const billData = {
        totalAmount: 100,
        description: 'Test',
        splitData: {
          splitType: 'equal' as const,
          data: [{ userId: 'user1' }]
        }
      };

      await expect(errorService.createBill('payer-id', billData)).rejects.toThrow('Database error');
    });
  });
});
