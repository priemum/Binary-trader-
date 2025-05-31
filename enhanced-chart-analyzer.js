/**
 * محلل الشارت المحسن للواجهة الخلفية
 * يجمع بين تقنيات التعلم الآلي والرؤية الحاسوبية لتحليل شارت المستخدم بدقة عالية
 */

const { MLIntegration } = require('./ml-integration');
const { ImageMarketAnalyzer } = require('./image-market-analyzer');
const { SupportResistanceAnalyzer } = require('./support-resistance-analyzer');
const { PredictionEvaluator } = require('./prediction-evaluator');

class EnhancedChartAnalyzer {
  constructor() {
    this.mlIntegration = new MLIntegration();
    this.evaluator = new PredictionEvaluator();
    
    // تهيئة نماذج التعلم الآلي
    this.initialize();
  }

  /**
   * تهيئة نماذج التعلم الآلي
   */
  async initialize() {
    try {
      await this.mlIntegration.initialize();
      console.log('تم تهيئة محلل الشارت المحسن بنجاح');
      return true;
    } catch (error) {
      console.error('فشل تهيئة محلل الشارت المحسن:', error);
      return false;
    }
  }

  /**
   * تحليل شارت المستخدم من خلال الصورة
   * @param {ImageData|Blob} imageData - بيانات صورة الشارت
   * @returns {Promise<Object>} - نتائج التحليل المحسنة
   */
  async analyzeUserChart(imageData) {
    try {
      // 1. استخراج الشموع والإطار الزمني من الصورة
      const { analyzeChartImage } = require('./chart-analyzer');
      const imageAnalysis = await analyzeChartImage(imageData);
      
      if (!imageAnalysis.candles || imageAnalysis.candles.length < 3) {
        return {
          status: "error",
          message: "لم يتم استخراج عدد كافٍ من الشموع من الصورة"
        };
      }
      
      // 2. تحليل الشموع باستخدام التعلم الآلي
      const mlAnalysis = await this.mlIntegration.analyzeImageWithML(
        imageData,
        imageAnalysis.candles,
        imageAnalysis.timeframe
      );
      
      // 3. تحليل خطوط الدعم والمقاومة
      const supportResistance = SupportResistanceAnalyzer.findSupportResistanceLevels(
        imageAnalysis.candles, 
        5 // حساسية متوسطة
      );
      
      // 4. تحديد اتجاه السوق
      const marketTrend = SupportResistanceAnalyzer.determineTrend(imageAnalysis.candles);
      
      // 5. تحليل احتمالية اختراق مستويات الدعم والمقاومة
      const breakoutAnalysis = SupportResistanceAnalyzer.analyzeBreakout(
        supportResistance, 
        mlAnalysis
      );
      
      // 6. تحسين تحليل الاختراق
      const enhancedBreakout = ImageMarketAnalyzer.enhanceBreakoutAnalysis({
        candleAnalysis: mlAnalysis,
        supportResistance,
        marketTrend
      });
      
      // 7. تحديد نقاط الدخول والخروج المثالية
      const entryExitPoints = ImageMarketAnalyzer.determineEntryExitPoints({
        candleAnalysis: mlAnalysis,
        breakoutAnalysis: enhancedBreakout,
        marketTrend
      });
      
      // 8. إضافة التنبؤ للتقييم
      this.evaluator.addPrediction(mlAnalysis);
      
      // 9. تجميع النتائج النهائية
      const finalAnalysis = {
        status: "success",
        timeframe: imageAnalysis.timeframe,
        candles: imageAnalysis.candles,
        prediction: {
          pattern: mlAnalysis.pattern,
          direction: mlAnalysis.direction,
          confidence: mlAnalysis.confidence,
          recommendedDuration: mlAnalysis.recommendedDuration
        },
        marketAnalysis: {
          trend: marketTrend.trend,
          strength: marketTrend.strength,
          supportLevels: supportResistance.support,
          resistanceLevels: supportResistance.resistance
        },
        breakoutAnalysis: enhancedBreakout,
        tradingStrategy: {
          entryPoint: entryExitPoints.entryPoint,
          targetPoint: entryExitPoints.targetPoint,
          stopLoss: entryExitPoints.stopLoss,
          riskRewardRatio: entryExitPoints.riskRewardRatio,
          recommendedTimeframe: entryExitPoints.timeframe
        },
        predictionIndex: this.evaluator.predictions.length - 1
      };
      
      return finalAnalysis;
    } catch (error) {
      console.error('خطأ في تحليل الشارت:', error);
      return {
        status: "error",
        message: error.message
      };
    }
  }

  /**
   * تسجيل نتيجة فعلية لتنبؤ سابق
   * @param {number} predictionIndex - مؤشر التنبؤ
   * @param {string} actualDirection - الاتجاه الفعلي (UP/DOWN)
   * @returns {Object} - نتائج التقييم المحدثة
   */
  recordResult(predictionIndex, actualDirection) {
    try {
      this.evaluator.addResult(predictionIndex, actualDirection);
      
      return {
        status: "success",
        metrics: this.evaluator.getMetrics(),
        recommendations: this.evaluator.getRecommendations()
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message
      };
    }
  }

  /**
   * الحصول على مقاييس أداء النظام
   * @returns {Object} - مقاييس الأداء
   */
  getPerformanceMetrics() {
    return {
      status: "success",
      metrics: this.evaluator.getMetrics(),
      indicatorPerformance: this.evaluator.analyzeIndicatorPerformance(),
      recommendations: this.evaluator.getRecommendations()
    };
  }

  /**
   * تعديل أوزان الثقة للمصادر المختلفة
   * @param {Object} weights - أوزان جديدة للمصادر
   * @returns {Object} - حالة العملية
   */
  adjustConfidenceWeights(weights) {
    try {
      const result = this.mlIntegration.adjustConfidenceWeights(weights);
      
      return {
        status: result.success ? "success" : "error",
        message: result.message
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message
      };
    }
  }
}

/**
 * دالة مساعدة لتحليل شارت المستخدم
 * @param {ImageData|Blob} imageData - بيانات صورة الشارت
 * @returns {Promise<Object>} - نتائج التحليل المحسنة
 */
async function analyzeUserChart(imageData) {
  const analyzer = new EnhancedChartAnalyzer();
  return await analyzer.analyzeUserChart(imageData);
}

// تصدير الفئة والدوال للاستخدام في ملفات أخرى
module.exports = {
  EnhancedChartAnalyzer,
  analyzeUserChart
};