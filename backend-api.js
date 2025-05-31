/**
 * واجهة برمجة التطبيقات للواجهة الخلفية للنظام
 */

// استيراد المكتبات المطلوبة
const { IntegratedAnalyzer } = require('./integrated-analyzer');
const { PredictionEvaluator } = require('./prediction-evaluator');
const { SupportResistanceAnalyzer } = require('./support-resistance-analyzer');
const { ImageMarketAnalyzer } = require('./image-market-analyzer');
const { analyzeChartImageAdvanced, formatAnalysisForDisplay } = require('./chart-analyzer-advanced');

// إنشاء كائنات المحلل والمقيم
const analyzer = new IntegratedAnalyzer();
const evaluator = new PredictionEvaluator();

/**
 * تحليل بيانات الشموع وإنتاج تنبؤ
 * @param {Array<Object>} candles - مصفوفة الشموع
 * @param {number} timeframe - الإطار الزمني بالثواني
 * @returns {Object} - نتائج التحليل والتنبؤ
 */
function analyzeCandles(candles, timeframe = 60) {
  try {
    // تحليل الشموع
    const analysis = analyzer.analyze(candles, timeframe);
    
    // إضافة التنبؤ للتقييم
    evaluator.addPrediction(analysis);
    
    return {
      status: "success",
      analysis: analysis,
      predictionIndex: evaluator.predictions.length - 1
    };
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
  try {
    evaluator.addResult(predictionIndex, actualDirection);
    
    return {
      status: "success",
      metrics: evaluator.getMetrics(),
      recommendations: evaluator.getRecommendations()
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
function getPerformanceMetrics() {
  return {
    status: "success",
    metrics: evaluator.getMetrics(),
    indicatorPerformance: evaluator.analyzeIndicatorPerformance(),
    recommendations: evaluator.getRecommendations()
  };
}

/**
 * تعديل أوزان الخوارزميات المختلفة
 * @param {Object} weights - أوزان جديدة للخوارزميات
 * @returns {Object} - حالة العملية
 */
function adjustAnalyzerWeights(weights) {
  try {
    analyzer.adjustWeights(weights);
    
    return {
      status: "success",
      message: "تم تعديل الأوزان بنجاح"
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message
    };
  }
}

/**
 * تصدير بيانات التقييم
 * @returns {Object} - بيانات التقييم
 */
function exportEvaluationData() {
  return {
    status: "success",
    data: evaluator.exportData()
  };
}

/**
 * استيراد بيانات التقييم
 * @param {Object} data - بيانات التقييم المستوردة
 * @returns {Object} - حالة العملية
 */
function importEvaluationData(data) {
  try {
    evaluator.importData(data);
    
    return {
      status: "success",
      message: "تم استيراد البيانات بنجاح",
      metrics: evaluator.getMetrics()
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message
    };
  }
}

/**
 * تحليل صورة الشارت
 * @param {ImageData|Blob|Buffer} imageData - بيانات الصورة
 * @param {number} timeframe - الإطار الزمني (اختياري)
 * @returns {Promise<Object>} - نتائج التحليل
 */
async function analyzeChartImage(imageData, timeframe = 5) {
  try {
    // استيراد محلل الصور المتقدم
    const { analyzeChartImageAdvanced, formatAnalysisForDisplay } = require('./chart-analyzer-advanced');
    
    // تحليل الصورة بشكل متقدم (يشمل الدعم والمقاومة واتجاه السوق)
    const advancedAnalysis = await analyzeChartImageAdvanced(imageData, timeframe);
    
    // تنسيق النتائج للعرض
    const formattedResults = formatAnalysisForDisplay(advancedAnalysis);
    
    // إضافة معلومات الإطار الزمني للنتائج
    formattedResults.timeframe = timeframe;
    
    return {
      status: "success",
      analysis: formattedResults
    };
  } catch (error) {
    console.error('Error analyzing chart image:', error);
    return {
      status: "error",
      message: error.message
    };
  }
}

/**
 * تحليل خطوط الدعم والمقاومة
 * @param {Array<Object>} candles - مصفوفة الشموع
 * @returns {Object} - خطوط الدعم والمقاومة واتجاه السوق
 */
function analyzeSupportResistance(candles) {
  try {
    // تحديد خطوط الدعم والمقاومة
    const supportResistance = SupportResistanceAnalyzer.findSupportResistanceLevels(candles, 5);
    
    // تحديد اتجاه السوق
    const marketTrend = SupportResistanceAnalyzer.determineTrend(candles);
    
    return {
      status: "success",
      supportResistance,
      marketTrend
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message
    };
  }
}

/**
 * تحليل احتمالية اختراق مستويات الدعم والمقاومة
 * @param {Object} supportResistance - خطوط الدعم والمقاومة
 * @param {Object} prediction - التنبؤ بالشمعة القادمة
 * @returns {Object} - تحليل الاختراق
 */
function analyzeBreakout(supportResistance, prediction) {
  try {
    const breakoutAnalysis = SupportResistanceAnalyzer.analyzeBreakout(supportResistance, prediction);
    
    return {
      status: "success",
      breakoutAnalysis
    };
  } catch (error) {
    return {
      status: "error",
      message: error.message
    };
  }
}

// تصدير الدوال للاستخدام في ملفات أخرى
module.exports = {
  analyzeCandles,
  recordResult,
  getPerformanceMetrics,
  adjustAnalyzerWeights,
  exportEvaluationData,
  importEvaluationData,
  analyzeChartImage,
  analyzeSupportResistance,
  analyzeBreakout
};