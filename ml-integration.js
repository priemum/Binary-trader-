/**
 * تكامل نماذج التعلم الآلي مع نظام تحليل الشموع
 */

const { AdvancedPatternRecognition } = require('./advanced-pattern-recognition');
const { ImagePatternDetector } = require('./image-pattern-detector');
const { IntegratedAnalyzer } = require('./integrated-analyzer');

class MLIntegration {
  constructor() {
    this.patternRecognizer = new AdvancedPatternRecognition();
    this.imageDetector = new ImagePatternDetector();
    this.analyzer = new IntegratedAnalyzer();
    
    // معاملات الثقة للمصادر المختلفة
    this.confidenceWeights = {
      traditionalAnalysis: 0.4,
      patternRecognition: 0.3,
      imageDetection: 0.3
    };
  }

  /**
   * تهيئة نماذج التعلم الآلي
   */
  async initialize() {
    try {
      await Promise.all([
        this.patternRecognizer.loadModel(),
        this.imageDetector.loadModel()
      ]);
      
      return { success: true, message: 'تم تهيئة نماذج التعلم الآلي بنجاح' };
    } catch (error) {
      return { success: false, message: 'فشل تهيئة نماذج التعلم الآلي', error: error.message };
    }
  }

  /**
   * تحليل متكامل للشموع باستخدام التعلم الآلي
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} timeframe - الإطار الزمني
   * @returns {Promise<Object>} - نتائج التحليل المتكامل
   */
  async analyzeWithML(candles, timeframe = 60) {
    // التحليل التقليدي
    const traditionalAnalysis = this.analyzer.analyze(candles, timeframe);
    
    // التعرف على الأنماط باستخدام التعلم الآلي
    const mlPatterns = await this.patternRecognizer.recognizePatterns(candles);
    
    // دمج نتائج التحليل
    return this.mergeAnalysisResults(traditionalAnalysis, mlPatterns, null, timeframe);
  }

  /**
   * تحليل متكامل للصورة باستخدام التعلم الآلي
   * @param {ImageData|Blob} imageData - بيانات الصورة
   * @param {Array<Object>} candles - مصفوفة الشموع المستخرجة من الصورة
   * @param {number} timeframe - الإطار الزمني
   * @returns {Promise<Object>} - نتائج التحليل المتكامل
   */
  async analyzeImageWithML(imageData, candles, timeframe = 60) {
    // التحليل التقليدي
    const traditionalAnalysis = this.analyzer.analyze(candles, timeframe);
    
    // التعرف على الأنماط من بيانات الشموع
    const mlPatterns = await this.patternRecognizer.recognizePatterns(candles);
    
    // التعرف على الأنماط مباشرة من الصورة
    const imagePatterns = await this.imageDetector.enhancedPatternDetection(imageData);
    
    // دمج نتائج التحليل
    return this.mergeAnalysisResults(traditionalAnalysis, mlPatterns, imagePatterns, timeframe);
  }

  /**
   * دمج نتائج التحليل من المصادر المختلفة
   * @private
   */
  mergeAnalysisResults(traditionalAnalysis, mlPatterns, imagePatterns, timeframe) {
    // تحديد الاتجاه المرجح
    const directions = {
      UP: 0,
      DOWN: 0,
      NEUTRAL: 0
    };
    
    // إضافة وزن التحليل التقليدي
    directions[traditionalAnalysis.direction] += 
      this.confidenceWeights.traditionalAnalysis * (traditionalAnalysis.confidence / 100);
    
    // إضافة وزن أنماط التعلم الآلي
    if (mlPatterns && mlPatterns.length > 0) {
      directions[mlPatterns[0].signal] += 
        this.confidenceWeights.patternRecognition * (mlPatterns[0].confidence / 100);
    }
    
    // إضافة وزن أنماط الصورة
    if (imagePatterns && imagePatterns.length > 0) {
      directions[imagePatterns[0].signal] += 
        this.confidenceWeights.imageDetection * (imagePatterns[0].confidence / 100);
    }
    
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
    let finalPattern = traditionalAnalysis.pattern;
    
    if (mlPatterns && mlPatterns.length > 0 && mlPatterns[0].confidence > 70) {
      finalPattern = mlPatterns[0].pattern;
    }
    
    if (imagePatterns && imagePatterns.length > 0 && imagePatterns[0].confidence > 80) {
      finalPattern = imagePatterns[0].pattern;
    }
    
    // تحديد المدة المقترحة للصفقة
    let recommendedDuration = timeframe * 2;
    if (finalConfidence > 80) {
      recommendedDuration = timeframe * 3;
    } else if (finalConfidence > 60) {
      recommendedDuration = timeframe * 2;
    }
    
    // حساب قيم الشمعة المتوقعة
    const lastCandle = traditionalAnalysis.open ? traditionalAnalysis : { open: 0, close: 0, high: 0, low: 0 };
    const volatility = 0.01; // قيمة افتراضية
    const moveSize = (finalConfidence / 100) * volatility * 1.5;
    const moveDirection = finalDirection === "UP" ? 1 : finalDirection === "DOWN" ? -1 : 0;
    
    const predictedOpen = lastCandle.open;
    const predictedClose = predictedOpen * (1 + moveDirection * moveSize);
    const wickFactor = 0.3;
    const predictedHigh = Math.max(predictedOpen, predictedClose) * (1 + wickFactor * moveSize);
    const predictedLow = Math.min(predictedOpen, predictedClose) * (1 - wickFactor * moveSize);
    
    // تجميع المؤشرات من جميع التحليلات
    const combinedIndicators = {
      ...traditionalAnalysis.indicators,
      mlPatternConfidence: mlPatterns && mlPatterns.length > 0 ? mlPatterns[0].confidence : 0,
      imagePatternConfidence: imagePatterns && imagePatterns.length > 0 ? imagePatterns[0].confidence : 0
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
        traditionalAnalysis,
        mlPatterns: mlPatterns || [],
        imagePatterns: imagePatterns || []
      }
    };
  }

  /**
   * تعديل أوزان الثقة للمصادر المختلفة
   * @param {Object} weights - أوزان جديدة للمصادر
   */
  adjustConfidenceWeights(weights) {
    if (weights) {
      // التحقق من صحة الأوزان
      const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
      if (Math.abs(totalWeight - 1) < 0.01) {
        this.confidenceWeights = { ...this.confidenceWeights, ...weights };
        return { success: true, message: 'تم تعديل أوزان الثقة بنجاح' };
      }
    }
    
    return { success: false, message: 'أوزان الثقة غير صالحة' };
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MLIntegration };
}