/**
 * محلل صور الشارت المتقدم مع تحديد اتجاه السوق وخطوط الدعم والمقاومة
 */

// استيراد المكتبات المطلوبة
const { SupportResistanceAnalyzer } = require('./support-resistance-analyzer');
const { IntegratedAnalyzer } = require('./integrated-analyzer');

class ImageMarketAnalyzer {
  /**
   * تحليل صورة الشارت
   * @param {ImageData|Blob} imageData - بيانات الصورة
   * @returns {Promise<Object>} - نتائج التحليل الشامل
   */
  static async analyzeChartImage(imageData) {
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
      
      // تحليل الشموع باستخدام المحلل المتكامل
      const analyzer = new IntegratedAnalyzer();
      const candleAnalysis = analyzer.analyze(imageAnalysis.candles, imageAnalysis.timeframe);
      
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
        candleAnalysis
      );
      
      // دمج نتائج التحليل
      return {
        status: "success",
        imageAnalysis: {
          timeframe: imageAnalysis.timeframe,
          candles: imageAnalysis.candles
        },
        candleAnalysis: candleAnalysis,
        marketTrend: marketTrend,
        supportResistance: supportResistance,
        breakoutAnalysis: breakoutAnalysis
      };
    } catch (error) {
      return {
        status: "error",
        message: error.message
      };
    }
  }
  
  /**
   * تحليل احتمالية اختراق الشمعة القادمة لمستويات الدعم والمقاومة
   * @param {Object} analysis - نتائج التحليل
   * @returns {Object} - تحليل الاختراق المحسن
   */
  static enhanceBreakoutAnalysis(analysis) {
    if (!analysis || !analysis.candleAnalysis || !analysis.supportResistance) {
      return null;
    }
    
    const { candleAnalysis, supportResistance, marketTrend } = analysis;
    
    // تعديل احتمالية الاختراق بناءً على اتجاه السوق
    let breakoutAnalysis = SupportResistanceAnalyzer.analyzeBreakout(
      supportResistance, 
      candleAnalysis
    );
    
    // تعزيز الاحتمالية بناءً على اتجاه السوق
    if (breakoutAnalysis.breakout === "RESISTANCE" && marketTrend.trend === "UP") {
      breakoutAnalysis.probability = Math.min(95, breakoutAnalysis.probability + 10);
    } else if (breakoutAnalysis.breakout === "SUPPORT" && marketTrend.trend === "DOWN") {
      breakoutAnalysis.probability = Math.min(95, breakoutAnalysis.probability + 10);
    }
    
    // تعزيز الاحتمالية بناءً على ثقة التنبؤ
    if (candleAnalysis.confidence > 75) {
      breakoutAnalysis.probability = Math.min(95, breakoutAnalysis.probability + 5);
    }
    
    // إضافة توصية للتداول
    let recommendation = "انتظار";
    let recommendationStrength = 0;
    
    if (breakoutAnalysis.breakout === "RESISTANCE" && breakoutAnalysis.probability > 70) {
      recommendation = "شراء";
      recommendationStrength = breakoutAnalysis.probability;
    } else if (breakoutAnalysis.breakout === "SUPPORT" && breakoutAnalysis.probability > 70) {
      recommendation = "بيع";
      recommendationStrength = breakoutAnalysis.probability;
    }
    
    return {
      ...breakoutAnalysis,
      recommendation,
      recommendationStrength
    };
  }
  
  /**
   * تحديد نقاط الدخول والخروج المثالية
   * @param {Object} analysis - نتائج التحليل
   * @returns {Object} - نقاط الدخول والخروج
   */
  static determineEntryExitPoints(analysis) {
    if (!analysis || !analysis.candleAnalysis || !analysis.breakoutAnalysis) {
      return null;
    }
    
    const { candleAnalysis, breakoutAnalysis, marketTrend } = analysis;
    
    // تحديد نقطة الدخول
    let entryPoint = candleAnalysis.open;
    
    // تحديد نقطة الخروج (الهدف)
    let targetPoint = breakoutAnalysis.target || 
                     (breakoutAnalysis.breakout === "RESISTANCE" ? 
                      candleAnalysis.high * 1.01 : 
                      candleAnalysis.low * 0.99);
    
    // تحديد نقطة وقف الخسارة
    let stopLoss = breakoutAnalysis.breakout === "RESISTANCE" ? 
                  breakoutAnalysis.level * 0.997 : 
                  breakoutAnalysis.level * 1.003;
    
    // حساب نسبة المخاطرة/المكافأة
    const riskRewardRatio = Math.abs(targetPoint - entryPoint) / Math.abs(entryPoint - stopLoss);
    
    return {
      entryPoint: parseFloat(entryPoint.toFixed(2)),
      targetPoint: parseFloat(targetPoint.toFixed(2)),
      stopLoss: parseFloat(stopLoss.toFixed(2)),
      riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
      timeframe: candleAnalysis.recommendedDuration
    };
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ImageMarketAnalyzer };
}