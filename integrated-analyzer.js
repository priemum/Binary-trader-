/**
 * المحلل المتكامل للشموع والمؤشرات الفنية
 * يجمع بين جميع الخوارزميات المتاحة لتقديم تحليل شامل
 */

// استيراد المكتبات المطلوبة
const { AdvancedIndicators } = require('./advanced-indicators');
const { EnhancedIndicators } = require('./enhanced-indicators');
const { PatternRecognition } = require('./pattern-recognition');
const { ImprovedPatternAnalyzer } = require('./improved-analyzer');
const { MLCandlestickAnalyzer } = require('./ml-candlestick-analyzer');

class IntegratedAnalyzer {
  /**
   * تهيئة المحلل المتكامل
   */
  constructor() {
    this.mlAnalyzer = new MLCandlestickAnalyzer();
    this.weightFactors = {
      advancedPatterns: 0.25,
      enhancedIndicators: 0.25,
      patternRecognition: 0.2,
      improvedAnalyzer: 0.15,
      mlAnalyzer: 0.15
    };
  }
  
  /**
   * تحليل متكامل للشموع والمؤشرات
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} timeframe - الإطار الزمني بالثواني
   * @returns {Object} - نتائج التحليل المتكامل
   */
  analyze(candles, timeframe = 60) {
    if (candles.length < 5) {
      return this.insufficientDataResult();
    }
    
    // 1. تحليل المؤشرات المتقدمة
    const advancedAnalysis = AdvancedIndicators.integratedAnalysis(candles, timeframe);
    
    // 2. تحليل المؤشرات المحسنة
    const enhancedAnalysis = EnhancedIndicators.advancedTrendAnalysis(candles);
    
    // 3. تحليل أنماط الشموع المتقدمة
    const patternAnalysis = PatternRecognition.analyzeAllPatterns(candles);
    
    // 4. تحليل محسن للشموع
    const improvedAnalysis = ImprovedPatternAnalyzer.analyzeCandles(candles, timeframe);
    
    // 5. تحليل التعلم الآلي
    const mlAnalysis = this.mlAnalyzer.analyzeCandles(candles);
    
    // دمج نتائج التحليل
    return this.mergeAnalysisResults(
      advancedAnalysis,
      enhancedAnalysis,
      patternAnalysis,
      improvedAnalysis,
      mlAnalysis,
      timeframe
    );
  }
  
  /**
   * دمج نتائج التحليل من مختلف الخوارزميات
   * @private
   */
  mergeAnalysisResults(advancedAnalysis, enhancedAnalysis, patternAnalysis, improvedAnalysis, mlAnalysis, timeframe) {
    // تحديد الاتجاه المرجح
    const directions = {
      UP: 0,
      DOWN: 0,
      NEUTRAL: 0
    };
    
    // إضافة أوزان الاتجاهات من التحليلات المختلفة
    directions[advancedAnalysis.direction] += this.weightFactors.advancedPatterns * (advancedAnalysis.confidence / 100);
    directions[enhancedAnalysis.signal] += this.weightFactors.enhancedIndicators * (enhancedAnalysis.strength / 100);
    
    if (patternAnalysis.length > 0) {
      directions[patternAnalysis[0].signal] += this.weightFactors.patternRecognition * (patternAnalysis[0].confidence / 100);
    }
    
    directions[improvedAnalysis.direction] += this.weightFactors.improvedAnalyzer * (improvedAnalysis.confidence / 100);
    directions[mlAnalysis.direction] += this.weightFactors.mlAnalyzer * (mlAnalysis.confidence / 100);
    
    // تحديد الاتجاه النهائي
    let finalDirection = "NEUTRAL";
    let maxWeight = directions.NEUTRAL;
    
    if (directions.UP > maxWeight) {
      finalDirection = "UP";
      maxWeight = directions.UP;
    }
    
    if (directions.DOWN > maxWeight) {
      finalDirection = "DOWN";
      maxWeight = directions.DOWN;
    }
    
    // حساب مستوى الثقة النهائي
    const totalWeight = directions.UP + directions.DOWN + directions.NEUTRAL;
    const finalConfidence = Math.round((maxWeight / totalWeight) * 100);
    
    // تحديد النمط الأكثر أهمية
    let finalPattern = advancedAnalysis.pattern;
    if (patternAnalysis.length > 0 && patternAnalysis[0].confidence > 70) {
      finalPattern = patternAnalysis[0].pattern;
    }
    
    // تحديد المدة المقترحة للصفقة
    let recommendedDuration = timeframe * 2;
    if (finalConfidence > 80) {
      recommendedDuration = timeframe * 3;
    } else if (finalConfidence > 60) {
      recommendedDuration = timeframe * 2;
    }
    
    // حساب قيم الشمعة المتوقعة
    const lastCandle = candles[candles.length - 1];
    const volatility = this.calculateVolatility(candles);
    const moveSize = (finalConfidence / 100) * volatility * 1.5;
    const moveDirection = finalDirection === "UP" ? 1 : finalDirection === "DOWN" ? -1 : 0;
    
    const predictedOpen = lastCandle.close;
    const predictedClose = predictedOpen * (1 + moveDirection * moveSize);
    const wickFactor = 0.3;
    const predictedHigh = Math.max(predictedOpen, predictedClose) * (1 + wickFactor * moveSize);
    const predictedLow = Math.min(predictedOpen, predictedClose) * (1 - wickFactor * moveSize);
    
    // تجميع المؤشرات من جميع التحليلات
    const combinedIndicators = {
      ...advancedAnalysis.indicators,
      ...enhancedAnalysis.indicators,
      patternStrength: patternAnalysis.length > 0 ? patternAnalysis[0].confidence : 0,
      mlConfidence: mlAnalysis.confidence
    };
    
    return {
      pattern: finalPattern,
      direction: finalDirection,
      confidence: finalConfidence,
      recommendedDuration: recommendedDuration,
      open: predictedOpen,
      close: predictedClose,
      high: predictedHigh,
      low: predictedLow,
      indicators: combinedIndicators,
      analysisDetails: {
        advancedAnalysis,
        enhancedAnalysis,
        patternAnalysis: patternAnalysis.length > 0 ? patternAnalysis[0] : null,
        improvedAnalysis,
        mlAnalysis
      }
    };
  }
  
  /**
   * حساب تقلب السعر
   * @private
   */
  calculateVolatility(candles) {
    if (candles.length < 2) return 0.01;
    
    const closes = candles.map(c => c.close);
    let totalChange = 0;
    
    for (let i = 1; i < closes.length; i++) {
      totalChange += Math.abs(closes[i] - closes[i-1]) / closes[i-1];
    }
    
    return totalChange / (closes.length - 1);
  }
  
  /**
   * إنشاء نتيجة افتراضية عند عدم وجود بيانات كافية
   * @private
   */
  insufficientDataResult() {
    return {
      pattern: "INSUFFICIENT_DATA",
      direction: "NEUTRAL",
      confidence: 0,
      recommendedDuration: 60,
      open: 0,
      close: 0,
      high: 0,
      low: 0,
      indicators: {},
      analysisDetails: {}
    };
  }
  
  /**
   * تدريب محلل التعلم الآلي باستخدام بيانات تاريخية
   * @param {Array<Object>} trainingData - بيانات التدريب
   */
  trainMLAnalyzer(trainingData) {
    this.mlAnalyzer.train(trainingData);
  }
  
  /**
   * تعديل أوزان الخوارزميات المختلفة
   * @param {Object} weights - أوزان جديدة للخوارزميات
   */
  adjustWeights(weights) {
    if (weights) {
      // التحقق من صحة الأوزان
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
      if (Math.abs(totalWeight - 1) < 0.01) {
        this.weightFactors = { ...this.weightFactors, ...weights };
      }
    }
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { IntegratedAnalyzer };
}