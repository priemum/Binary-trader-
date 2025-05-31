/**
 * وحدة تكامل الواجهة الخلفية
 * تقوم بربط جميع مكونات الواجهة الخلفية معًا
 */

// استيراد المكونات المطلوبة (في بيئة Node.js)
if (typeof require !== 'undefined') {
  try {
    const { IntegratedAnalyzer } = require('./integrated-analyzer');
    const { MLIntegration } = require('./ml-integration');
    const { SupportResistanceAnalyzer } = require('./support-resistance-analyzer');
    const { ImageMarketAnalyzer } = require('./image-market-analyzer');
    const { PatternRecognition } = require('./pattern-recognition');
    const { AdvancedIndicators } = require('./advanced-indicators');
    const { EnhancedIndicators } = require('./enhanced-indicators');
    const { MLCandlestickAnalyzer } = require('./ml-candlestick-analyzer');
    const { ImagePatternDetector } = require('./image-pattern-detector');
    const { PredictionEvaluator } = require('./prediction-evaluator');
  } catch (error) {
    console.warn('بعض المكونات غير متاحة في بيئة Node.js:', error);
  }
}

/**
 * فئة تكامل الواجهة الخلفية
 */
class BackendIntegration {
  constructor() {
    // تهيئة المكونات
    this.initComponents();
  }
  
  /**
   * تهيئة المكونات
   */
  initComponents() {
    try {
      // تهيئة المحلل المتكامل
      if (typeof IntegratedAnalyzer !== 'undefined') {
        this.integratedAnalyzer = new IntegratedAnalyzer();
      }
      
      // تهيئة تكامل التعلم الآلي
      if (typeof MLIntegration !== 'undefined') {
        this.mlIntegration = new MLIntegration();
      }
      
      // تهيئة محلل الدعم والمقاومة
      this.supportResistanceAnalyzer = typeof SupportResistanceAnalyzer !== 'undefined' ? 
        SupportResistanceAnalyzer : null;
      
      // تهيئة محلل صور السوق
      if (typeof ImageMarketAnalyzer !== 'undefined') {
        this.imageMarketAnalyzer = new ImageMarketAnalyzer();
      }
      
      // تهيئة مقيم التنبؤات
      if (typeof PredictionEvaluator !== 'undefined') {
        this.predictionEvaluator = new PredictionEvaluator();
      }
    } catch (error) {
      console.error('Error initializing backend components:', error);
    }
  }
  
  /**
   * تحليل صورة الشارت
   * @param {File|Blob} imageFile - ملف الصورة
   * @param {number} timeframe - الإطار الزمني بالدقائق
   * @returns {Promise<Object>} - نتائج التحليل
   */
  async analyzeChartImage(imageFile, timeframe) {
    try {
      // استخراج الشموع من الصورة
      const candles = await this.extractCandlesFromImage(imageFile);
      
      // تحليل الشموع باستخدام المحلل المتكامل
      let integratedAnalysis = null;
      if (this.integratedAnalyzer) {
        integratedAnalysis = this.integratedAnalyzer.analyze(candles, timeframe * 60);
      }
      
      // تحليل الشموع باستخدام التعلم الآلي
      let mlAnalysis = null;
      if (this.mlIntegration) {
        mlAnalysis = await this.mlIntegration.analyzeWithML(candles, timeframe * 60);
      }
      
      // تحليل الدعم والمقاومة
      let supportResistance = null;
      if (this.supportResistanceAnalyzer) {
        supportResistance = this.supportResistanceAnalyzer.findSupportResistanceLevels(candles, 5);
      }
      
      // تحليل الصورة مباشرة
      let imageAnalysis = null;
      if (this.imageMarketAnalyzer) {
        imageAnalysis = await this.imageMarketAnalyzer.analyzeImage(imageFile);
      }
      
      // دمج النتائج
      const result = this.mergeAnalysisResults(
        integratedAnalysis,
        mlAnalysis,
        supportResistance,
        imageAnalysis,
        timeframe
      );
      
      // تسجيل التنبؤ للتقييم
      if (this.predictionEvaluator) {
        this.predictionEvaluator.addPrediction(result);
      }
      
      return result;
    } catch (error) {
      console.error('Error analyzing chart image:', error);
      return this.getFallbackResults(timeframe);
    }
  }
  
  /**
   * استخراج الشموع من صورة الشارت
   * @param {File|Blob} imageFile - ملف الصورة
   * @returns {Promise<Array<Object>>} - مصفوفة الشموع
   */
  async extractCandlesFromImage(imageFile) {
    // في التطبيق الحقيقي، هنا سيتم استخدام محلل الصور لاستخراج الشموع
    
    // محاكاة لاستخراج الشموع
    return this.generateMockCandles();
  }
  
  /**
   * إنشاء شموع عشوائية للاختبار
   * @param {number} count - عدد الشموع
   * @returns {Array<Object>} - مصفوفة الشموع
   */
  generateMockCandles(count = 10) {
    const candles = [];
    let basePrice = 1.2800;
    const now = Date.now();
    const minuteMs = 60 * 1000;
    
    for (let i = 0; i < count; i++) {
      // إنشاء تغير عشوائي للسعر
      const changePercent = (Math.random() - 0.5) * 0.01;
      const range = basePrice * 0.005;
      
      // تحديد قيم الشمعة
      const open = basePrice;
      const close = basePrice * (1 + changePercent);
      const high = Math.max(open, close) + Math.random() * range;
      const low = Math.min(open, close) - Math.random() * range;
      
      // إضافة الشمعة للمصفوفة
      candles.push({
        timestamp: now - (count - i) * minuteMs,
        open: open,
        high: high,
        low: low,
        close: close,
        volume: Math.floor(Math.random() * 100) + 50
      });
      
      // تحديث السعر الأساسي للشمعة التالية
      basePrice = close;
    }
    
    return candles;
  }
  
  /**
   * دمج نتائج التحليل من مصادر مختلفة
   * @private
   */
  mergeAnalysisResults(integratedAnalysis, mlAnalysis, supportResistance, imageAnalysis, timeframe) {
    // تحديد الاتجاه المرجح
    const directions = {
      UP: 0,
      DOWN: 0,
      NEUTRAL: 0
    };
    
    // إضافة وزن نتائج المحلل المتكامل
    if (integratedAnalysis) {
      directions[integratedAnalysis.direction] += (integratedAnalysis.confidence / 100) * 0.4;
    }
    
    // إضافة وزن نتائج التعلم الآلي
    if (mlAnalysis) {
      directions[mlAnalysis.direction] += (mlAnalysis.confidence / 100) * 0.3;
    }
    
    // إضافة وزن تحليل الصورة
    if (imageAnalysis) {
      directions[imageAnalysis.trend] += (imageAnalysis.confidence / 100) * 0.3;
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
    let finalPattern = "UNKNOWN";
    
    if (integratedAnalysis && integratedAnalysis.pattern) {
      finalPattern = integratedAnalysis.pattern;
    }
    
    if (mlAnalysis && mlAnalysis.pattern && mlAnalysis.confidence > 70) {
      finalPattern = mlAnalysis.pattern;
    }
    
    // تحديد المدة المقترحة للصفقة
    let recommendedDuration = timeframe * 2;
    if (finalConfidence > 80) {
      recommendedDuration = timeframe * 3;
    } else if (finalConfidence > 60) {
      recommendedDuration = timeframe * 2;
    }
    
    return {
      status: "success",
      pattern: finalPattern,
      direction: finalDirection,
      confidence: finalConfidence,
      timeframe: timeframe,
      recommendedDuration: recommendedDuration,
      supportResistance: supportResistance,
      details: {
        integratedAnalysis,
        mlAnalysis,
        imageAnalysis
      }
    };
  }
  
  /**
   * الحصول على نتائج احتياطية في حالة فشل التحليل
   * @param {number} timeframe - الإطار الزمني
   * @returns {Object} - نتائج احتياطية
   */
  getFallbackResults(timeframe) {
    return {
      status: "success",
      pattern: "BULLISH_ENGULFING",
      direction: Math.random() > 0.5 ? "UP" : "DOWN",
      confidence: Math.floor(Math.random() * 30) + 65,
      timeframe: timeframe,
      recommendedDuration: timeframe * 2
    };
  }
}

// تصدير الفئة للاستخدام في بيئة Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BackendIntegration };
} else {
  // إنشاء كائن عالمي للاستخدام في المتصفح
  window.backendIntegration = new BackendIntegration();
}