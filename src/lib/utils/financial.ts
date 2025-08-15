/**
 * Financial calculation utilities for OKOA system
 * Handles monetary calculations with proper precision
 */

import Decimal from 'decimal.js';

// Configure Decimal.js for financial precision
Decimal.config({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9e15,
  toExpPos: 9e15,
  maxE: 9e15,
  minE: -9e15
});

export class FinancialCalculator {
  /**
   * Calculate property valuation per key
   * @param totalValue - Total property value
   * @param keyCount - Number of keys/rooms
   * @returns Value per key with proper precision
   */
  static calculateValuePerKey(totalValue: number, keyCount: number): string {
    if (keyCount === 0) {
      throw new Error('Key count cannot be zero');
    }
    
    const value = new Decimal(totalValue);
    const keys = new Decimal(keyCount);
    const result = value.dividedBy(keys);
    
    return result.toFixed(2);
  }

  /**
   * Calculate development cost breakdown
   * @param totalBudget - Total development budget
   * @param spentAmount - Amount already spent
   * @returns Cost breakdown analysis
   */
  static calculateCostBreakdown(totalBudget: number, spentAmount: number) {
    const budget = new Decimal(totalBudget);
    const spent = new Decimal(spentAmount);
    const remaining = budget.minus(spent);
    const completionPercentage = spent.dividedBy(budget).times(100);
    
    return {
      totalBudget: budget.toFixed(2),
      spentAmount: spent.toFixed(2),
      remainingAmount: remaining.toFixed(2),
      completionPercentage: completionPercentage.toFixed(1),
      isOverBudget: remaining.isNegative()
    };
  }

  /**
   * Calculate ROI projections for real estate investments
   * @param initialInvestment - Initial capital investment
   * @param projectedValue - Projected future value
   * @param timeHorizonYears - Investment time horizon in years
   * @returns ROI analysis
   */
  static calculateROI(initialInvestment: number, projectedValue: number, timeHorizonYears: number) {
    const initial = new Decimal(initialInvestment);
    const projected = new Decimal(projectedValue);
    const years = new Decimal(timeHorizonYears);
    
    const totalReturn = projected.minus(initial);
    const totalReturnPercentage = totalReturn.dividedBy(initial).times(100);
    const annualizedReturn = totalReturnPercentage.dividedBy(years);
    
    return {
      totalReturn: totalReturn.toFixed(2),
      totalReturnPercentage: totalReturnPercentage.toFixed(2),
      annualizedReturn: annualizedReturn.toFixed(2),
      isPositiveReturn: totalReturn.isPositive()
    };
  }

  /**
   * Format currency for display
   * @param amount - Amount to format
   * @param currency - Currency code (default: USD)
   * @returns Formatted currency string
   */
  static formatCurrency(amount: number | string, currency = 'USD'): string {
    const decimal = new Decimal(amount);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(decimal.toFixed(2)));
    
    return formatted;
  }
}