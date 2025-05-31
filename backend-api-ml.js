/**
 * واجهة برمجة التطبيقات للواجهة الخلفية للنظام مع دعم التعلم الآلي
 */

// استيراد المكتبات المطلوبة
const { MLIntegration } = require('./ml-integration');
const { PredictionEvaluator } = require('./prediction-evaluator');
const { SupportResistanceAnalyzer } = require('./support-resistance-analyzer');

// إنشاء كائنات المحلل والمقيم
const mlIntegration = new MLIntegration();
const evaluator = new PredictionEvaluator();

// تهيئة نماذج التعلم الآلي
(async () => {
  await mlIntegration.initialize();
  console.log('تم تهيئة نماذج التعلم الآلي');
})();

/**
 * تحليل بيانات الشموع وإنتاج تنبؤ باستخدام التعلم الآلي
 * @param {Array<Object>} candles - مصفوفة الشموع
 * @param {number} timeframe - الإطار الزمني بالثواني
 * @returns {Promise<Object>} - نتائج التحليل والتنبؤ
 */
async function analyzeCandles(candles, timeframe = 60) {
  try {
    // تحليل الشموع باستخدام التعلم الآلي
    const analysis = await mlIntegration.analyzeWithML(candles, timeframe);
    
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
 * تحليل صورة الشارت باستخدام التعلم الآلي
 * @param {ImageData|Blob} imageData - بيانات الصورة
 * @returns {Promise<Object>} - نتائج التحليل
 */
async function analyzeChartImage(imageData) {
  try {
    // استيراد محلل الصور
    const { analyzeChartImage: imageAnalyzer } = require('./chart-analyzer');
    
    // تحليل الصورة واستخراج الشموع
    const imageAnalysis = await imageAnalyzer(imageData);
    
    // التحقق من استخراج الشموع بنجاح
    if (!imageAnalysis.candles || imageAnalysis.candles.length < 5) {
      return {
        status: "error",
        message: "لم يتم استخراج عدد كافٍ من الشموع من الصورة"
      };
    }
    
    // تحليل الصورة والشموع باستخدام التعلم الآلي
    const enhancedAnalysis = await mlIntegration.analyzeImageWithML(
      imageData,
      imageAnalysis.candles,
      imageAnalysis.timeframe
    );
    
    // تحديد خطوط الدعم والمقاومة
    const supportResistance = SupportResistanceAnalyzer.findSupportResistanceLevels(
      imageAnalysis.candles, 
      5 // حساسية متوسطة
    );
    
    // تحديد اتجاه السوق
    const marketTrend = SupportResistanceAnalyzer.determineTrend(imageAnalysis.candles);
    
    // تحليل احتمالية اختراق مستويات الدعم والمقاومة
    const breakoutAnalysis = SupportResistanceAnalyzer.analyzeBreakout(
      supportResistance, 
      enhancedAnalysis
    );
    
    // إضافة التنبؤ للتقييم
    evaluator.addPrediction(enhancedAnalysis);
    
    return {
      status: "success",
      imageAnalysis: {
        timeframe: imageAnalysis.timeframe,
        candles: imageAnalysis.candles
      },
      enhancedAnalysis: enhancedAnalysis,
      marketTrend: marketTrend,
      supportResistance: supportResistance,
      breakoutAnalysis: breakoutAnalysis,
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
 * تعديل أوزان الثقة للمصادر المختلفة
 * @param {Object} weights - أوزان جديدة للمصادر
 * @returns {Object} - حالة العملية
 */
function adjustConfidenceWeights(weights) {
  try {
    const result = mlIntegration.adjustConfidenceWeights(weights);
    
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

// تصدير الدوال للاستخدام في ملفات أخرى
module.exports = {
  analyzeCandles,
  analyzeChartImage,
  recordResult,
  getPerformanceMetrics,
  adjustConfidenceWeights,
  exportEvaluationData,
  importEvaluationData
};