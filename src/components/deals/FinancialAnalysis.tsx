"use client";

import React from 'react';
import { FinancialCalculator } from '@/lib/utils/financial';

interface FinancialAnalysisProps {
  dealData: {
    totalValue: number;
    keyCount: number;
    totalBudget: number;
    spentAmount: number;
    projectedValue: number;
    timeHorizon: number;
  };
}

export function FinancialAnalysis({ dealData }: FinancialAnalysisProps) {
  const valuePerKey = FinancialCalculator.calculateValuePerKey(
    dealData.totalValue, 
    dealData.keyCount
  );
  
  const costBreakdown = FinancialCalculator.calculateCostBreakdown(
    dealData.totalBudget,
    dealData.spentAmount
  );
  
  const roiAnalysis = FinancialCalculator.calculateROI(
    dealData.totalValue,
    dealData.projectedValue,
    dealData.timeHorizon
  );

  return (
    <div className="bg-okoa-bg-secondary dark:bg-japanese-ink-sumi border-thin border-okoa-fg-primary dark:border-japanese-neutral-warm-gray p-6">
      
      {/* Header */}
      <div className="bg-okoa-terminal-bg dark:bg-japanese-ink-charcoal text-okoa-fg-primary dark:text-japanese-paper-warm p-4 mb-6 border-thin border-okoa-fg-primary dark:border-japanese-neutral-warm-gray">
        <div className="font-mono text-sm leading-tight text-center">
          ═══ FINANCIAL ANALYSIS ═══
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-sm">
        
        {/* Valuation Metrics */}
        <div className="bg-okoa-bg-tertiary dark:bg-japanese-ink-sumi border border-okoa-fg-secondary dark:border-japanese-neutral-warm-gray p-4">
          <h3 className="font-bold text-xs mb-3 text-okoa-fg-primary dark:text-japanese-paper-warm">
            VALUATION METRICS
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray">Total Value:</span>
              <span className="text-okoa-fg-primary dark:text-japanese-paper-warm font-bold">
                {FinancialCalculator.formatCurrency(dealData.totalValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray">Per Key:</span>
              <span className="text-okoa-fg-primary dark:text-japanese-paper-warm font-bold">
                {FinancialCalculator.formatCurrency(valuePerKey)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray">Key Count:</span>
              <span className="text-okoa-fg-primary dark:text-japanese-paper-warm font-bold">
                {dealData.keyCount}
              </span>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-okoa-bg-tertiary dark:bg-japanese-ink-sumi border border-okoa-fg-secondary dark:border-japanese-neutral-warm-gray p-4">
          <h3 className="font-bold text-xs mb-3 text-okoa-fg-primary dark:text-japanese-paper-warm">
            COST BREAKDOWN
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray">Total Budget:</span>
              <span className="text-okoa-fg-primary dark:text-japanese-paper-warm font-bold">
                {FinancialCalculator.formatCurrency(costBreakdown.totalBudget)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray">Spent:</span>
              <span className="text-okoa-fg-primary dark:text-japanese-paper-warm font-bold">
                {FinancialCalculator.formatCurrency(costBreakdown.spentAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray">Remaining:</span>
              <span className={`font-bold ${costBreakdown.isOverBudget ? 'text-red-600' : 'text-japanese-earth-sage'}`}>
                {FinancialCalculator.formatCurrency(costBreakdown.remainingAmount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray">Complete:</span>
              <span className="text-okoa-fg-primary dark:text-japanese-paper-warm font-bold">
                {costBreakdown.completionPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* ROI Analysis */}
        <div className="bg-okoa-bg-tertiary dark:bg-japanese-ink-sumi border border-okoa-fg-secondary dark:border-japanese-neutral-warm-gray p-4">
          <h3 className="font-bold text-xs mb-3 text-okoa-fg-primary dark:text-japanese-paper-warm">
            ROI PROJECTION
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray">Total Return:</span>
              <span className={`font-bold ${roiAnalysis.isPositiveReturn ? 'text-japanese-earth-sage' : 'text-red-600'}`}>
                {FinancialCalculator.formatCurrency(roiAnalysis.totalReturn)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray">Return %:</span>
              <span className={`font-bold ${roiAnalysis.isPositiveReturn ? 'text-japanese-earth-sage' : 'text-red-600'}`}>
                {roiAnalysis.totalReturnPercentage}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray">Annual Return:</span>
              <span className={`font-bold ${roiAnalysis.isPositiveReturn ? 'text-japanese-earth-sage' : 'text-red-600'}`}>
                {roiAnalysis.annualizedReturn}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-okoa-fg-secondary dark:text-japanese-neutral-warm-gray">Time Horizon:</span>
              <span className="text-okoa-fg-primary dark:text-japanese-paper-warm font-bold">
                {dealData.timeHorizon} years
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="mt-6 p-4 bg-japanese-ink-sumi dark:bg-japanese-ink-charcoal text-japanese-paper-warm border border-japanese-neutral-warm-gray">
        <h4 className="font-bold text-xs mb-2">RISK INDICATORS</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-japanese-neutral-warm-gray">Budget Status: </span>
            <span className={`font-bold ${costBreakdown.isOverBudget ? 'text-red-400' : 'text-japanese-earth-sage'}`}>
              {costBreakdown.isOverBudget ? 'OVER BUDGET' : 'ON TRACK'}
            </span>
          </div>
          <div>
            <span className="text-japanese-neutral-warm-gray">ROI Status: </span>
            <span className={`font-bold ${roiAnalysis.isPositiveReturn ? 'text-japanese-earth-sage' : 'text-red-400'}`}>
              {roiAnalysis.isPositiveReturn ? 'POSITIVE' : 'NEGATIVE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}