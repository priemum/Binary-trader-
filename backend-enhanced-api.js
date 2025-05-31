/**
 * واجهة برمجة التطبيقات المحسنة للواجهة الخلفية للنظام
 * تستخدم محلل الشارت المحسن لتحليل شارت المستخدم بدقة عالية
 */

// استيراد المكتبات المطلوبة
const { EnhancedChartAnalyzer, analyzeUserChart } = require('./enhanced-chart-analyzer');
const { PredictionEvaluator } = require('./prediction-evaluator');
const { SupportResistanceAnalyzer } = require('./support-resistance-analyzer');

// إنشاء كائن المحلل المحسن
const enhancedAnalyzer = new EnhancedChartAnalyzer();
const evaluator = new PredictionEvaluator();

/**
 * تحليل شارت المستخدم من خلال الصورة
 * @param {ImageData|Blob} imageData - بيانات صورة الشارت
 * @returns {Promise<Object>} - نتائج التحليل المحسنة
 */
async function analyzeUserChartImage(imageData) {
  try {
    // استخدام المحلل المحسن لتحليل الشارت
    const analysis = await enhancedAnalyzer.analyzeUserChart(imageData);
    
    return analysis;
  } catch (error) {
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
function recordResult(predictionIndex, actualDirection) {
  return enhancedAnalyzer.recordResult(predictionIndex, actualDirection);
}

/**
 * الحصول على مقاييس أداء النظام
 * @returns {Object} - مقاييس الأداء
 */
function getPerformanceMetrics() {
  return enhancedAnalyzer.getPerformanceMetrics();
}

/**
 * تعديل أوزان الثقة للمصادر المختلفة
 * @param {Object} weights - أوزان جديدة للمصادر
 * @returns {Object} - حالة العملية
 */
function adjustConfidenceWeights(weights) {
  return enhancedAnalyzer.adjustConfidenceWeights(weights);
}

/**
 * تحليل متقدم للشارت مع توصيات محددة للتداول
 * @param {ImageData|Blob} imageData - بيانات صورة الشارت
 * @returns {Promise<Object>} - نتائج التحليل مع توصيات التداول
 */
async function analyzeChartWithTradingRecommendations(imageData) {
  try {
    // تحليل الشارت باستخدام المحلل المحسن
    const analysis = await enhancedAnalyzer.analyzeUserChart(imageData);
    
    if (analysis.status !== "success") {
      return analysis;
    }
    
    // إنشاء توصيات محددة للتداول
    const tradingRecommendations = createTradingRecommendations(analysis);
    
    return {
      ...analysis,
      tradingRecommendations
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message
    };
  }
}

/**
 * إنشاء توصيات محددة للتداول بناءً على نتائج التحليل
 * @private
 */
function createTradingRecommendations(analysis) {
  // التحقق من وجود بيانات التحليل
  if (!analysis || !analysis.prediction || !analysis.marketAnalysis || !analysis.tradingStrategy) {
    return null;
  }
  
  const { prediction, marketAnalysis, breakoutAnalysis, tradingStrategy } = analysis;
  
  // تحديد نوع الصفقة (شراء/بيع)
  let tradeType = "انتظار";
  if (prediction.direction === "UP" && prediction.confidence > 65) {
    tradeType = "شراء";
  } else if (prediction.direction === "DOWN" && prediction.confidence > 65) {
    tradeType = "بيع";
  }
  
  // تحديد مستوى الثقة الإجمالي
  let overallConfidence = prediction.confidence;
  
  // تعديل مستوى الثقة بناءً على اتجاه السوق
  if (prediction.direction === "UP" && marketAnalysis.trend === "UP") {
    overallConfidence = Math.min(overallConfidence + 10, 99);
  } else if (prediction.direction === "DOWN" && marketAnalysis.trend === "DOWN") {
    overallConfidence = Math.min(overallConfidence + 10, 99);
  } else if (prediction.direction !== "NEUTRAL" && prediction.direction !== marketAnalysis.trend) {
    overallConfidence = Math.max(overallConfidence - 10, 30);
  }
  
  // تحديد المدة المقترحة للصفقة
  const recommendedDuration = prediction.recommendedDuration;
  
  // إنشاء نص التوصية
  let recommendationText = "";
  if (tradeType === "شراء") {
    recommendationText = `يُنصح بفتح صفقة شراء عند السعر ${tradingStrategy.entryPoint} مع تحديد هدف عند ${tradingStrategy.targetPoint} ووقف خسارة عند ${tradingStrategy.stopLoss}. المدة المقترحة للصفقة: ${recommendedDuration} ثانية.`;
  } else if (tradeType === "بيع") {
    recommendationText = `يُنصح بفتح صفقة بيع عند السعر ${tradingStrategy.entryPoint} مع تحديد هدف عند ${tradingStrategy.targetPoint} ووقف خسارة عند ${tradingStrategy.stopLoss}. المدة المقترحة للصفقة: ${recommendedDuration} ثانية.`;
  } else {
    recommendationText = "يُنصح بالانتظار حتى ظهور إشارة أكثر وضوحًا.";
  }
  
  // إضافة معلومات إضافية عن اتجاه السوق
  let marketTrendInfo = "";
  if (marketAnalysis.trend === "UP") {
    marketTrendInfo = `السوق في اتجاه صاعد بقوة ${marketAnalysis.strength}%.`;
  } else if (marketAnalysis.trend === "DOWN") {
    marketTrendInfo = `السوق في اتجاه هابط بقوة ${marketAnalysis.strength}%.`;
  } else {
    marketTrendInfo = "السوق في حالة تذبذب بدون اتجاه واضح.";
  }
  
  // إضافة معلومات عن احتمالية اختراق مستويات الدعم والمقاومة
  let breakoutInfo = "";
  if (breakoutAnalysis && breakoutAnalysis.breakout) {
    if (breakoutAnalysis.breakout === "RESISTANCE") {
      breakoutInfo = `هناك احتمالية ${breakoutAnalysis.probability}% لاختراق مستوى المقاومة عند ${breakoutAnalysis.level}.`;
    } else if (breakoutAnalysis.breakout === "SUPPORT") {
      breakoutInfo = `هناك احتمالية ${breakoutAnalysis.probability}% لاختراق مستوى الدعم عند ${breakoutAnalysis.level}.`;
    }
  }
  
  return {
    tradeType,
    overallConfidence,
    recommendedDuration,
    recommendationText,
    marketTrendInfo,
    breakoutInfo,
    riskRewardRatio: tradingStrategy.riskRewardRatio
  };
}

// تصدير الدوال للاستخدام في ملفات أخرى
module.exports = {
  analyzeUserChartImage,
  recordResult,
  getPerformanceMetrics,
  adjustConfidenceWeights,
  analyzeChartWithTradingRecommendations
};