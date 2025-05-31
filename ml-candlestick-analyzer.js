/**
 * محلل الشموع اليابانية باستخدام التعلم الآلي المبسط
 */

class MLCandlestickAnalyzer {
  /**
   * تهيئة المحلل
   */
  constructor() {
    // مصفوفة الأوزان للأنماط المختلفة
    this.patternWeights = {
      doji: [0.2, 0.05, 0.7, 0.05],
      hammer: [0.6, 0.1, 0.2, 0.8],
      engulfing: [0.7, 0.8, 0.2, 0.1],
      shootingStar: [0.2, 0.7, 0.8, 0.1],
      morningstar: [0.9, 0.2, 0.1, 0.7],
      eveningstar: [0.1, 0.8, 0.9, 0.2]
    };
    
    // عتبات الثقة
    this.confidenceThresholds = {
      veryHigh: 0.85,
      high: 0.7,
      medium: 0.5,
      low: 0.3
    };
  }
  
  /**
   * استخراج الميزات من الشموع
   * @param {Array} candles - مصفوفة الشموع
   * @returns {Array} - مصفوفة الميزات
   */
  extractFeatures(candles) {
    if (candles.length < 5) {
      return null;
    }
    
    // استخدام آخر 5 شموع للتحليل
    const recentCandles = candles.slice(-5);
    
    // حساب نسب الجسم إلى الظل
    const bodyToShadowRatios = recentCandles.map(candle => {
      const bodySize = Math.abs(candle.close - candle.open);
      const totalSize = candle.high - candle.low;
      const upperShadow = candle.isGreen ? candle.high - candle.close : candle.high - candle.open;
      const lowerShadow = candle.isGreen ? candle.open - candle.low : candle.close - candle.low;
      
      return {
        bodyRatio: bodySize / totalSize,
        upperShadowRatio: upperShadow / totalSize,
        lowerShadowRatio: lowerShadow / totalSize,
        isGreen: candle.isGreen ? 1 : 0
      };
    });
    
    // حساب اتجاه السعر
    const priceDirection = recentCandles[4].close > recentCandles[0].close ? 1 : -1;
    
    // حساب تقلب السعر
    let volatility = 0;
    for (let i = 1; i < recentCandles.length; i++) {
      volatility += Math.abs(recentCandles[i].close - recentCandles[i-1].close) / recentCandles[i-1].close;
    }
    volatility /= (recentCandles.length - 1);
    
    // حساب متوسط حجم الجسم
    const avgBodySize = bodyToShadowRatios.reduce((sum, ratio) => sum + ratio.bodyRatio, 0) / bodyToShadowRatios.length;
    
    // حساب عدد الشموع الخضراء والحمراء
    const greenCount = bodyToShadowRatios.filter(ratio => ratio.isGreen === 1).length;
    const redCount = bodyToShadowRatios.length - greenCount;
    
    // تجميع الميزات
    return [
      bodyToShadowRatios[4].bodyRatio,
      bodyToShadowRatios[4].upperShadowRatio,
      bodyToShadowRatios[4].lowerShadowRatio,
      bodyToShadowRatios[4].isGreen,
      priceDirection,
      volatility,
      avgBodySize,
      greenCount / 5,
      redCount / 5
    ];
  }
  
  /**
   * حساب درجة الثقة للنمط
   * @param {Array} features - ميزات الشموع
   * @param {Array} weights - أوزان النمط
   * @returns {number} - درجة الثقة (0-1)
   */
  calculateConfidence(features, weights) {
    if (!features || !weights) return 0;
    
    // استخدام أول 4 ميزات فقط للمقارنة مع الأوزان
    let similarity = 0;
    for (let i = 0; i < 4; i++) {
      similarity += (1 - Math.abs(features[i] - weights[i]));
    }
    
    return similarity / 4;
  }
  
  /**
   * تحليل الشموع وتحديد النمط
   * @param {Array} candles - مصفوفة الشموع
   * @returns {Object} - نتائج التحليل
   */
  analyzeCandles(candles) {
    const features = this.extractFeatures(candles);
    
    if (!features) {
      return {
        pattern: "INSUFFICIENT_DATA",
        direction: "NEUTRAL",
        confidence: 30,
        recommendedDuration: 60
      };
    }
    
    // حساب درجة الثقة لكل نمط
    const confidenceScores = {};
    for (const pattern in this.patternWeights) {
      confidenceScores[pattern] = this.calculateConfidence(features, this.patternWeights[pattern]);
    }
    
    // تحديد النمط ذو أعلى درجة ثقة
    let bestPattern = "TREND_BASED";
    let highestConfidence = 0;
    
    for (const pattern in confidenceScores) {
      if (confidenceScores[pattern] > highestConfidence) {
        highestConfidence = confidenceScores[pattern];
        bestPattern = pattern;
      }
    }
    
    // تحديد الاتجاه بناءً على النمط
    let direction = "NEUTRAL";
    if (bestPattern === "hammer" || bestPattern === "engulfing" && features[3] === 1 || bestPattern === "morningstar") {
      direction = "UP";
    } else if (bestPattern === "shootingStar" || bestPattern === "engulfing" && features[3] === 0 || bestPattern === "eveningstar") {
      direction = "DOWN";
    } else {
      // استخدام اتجاه السعر إذا كان النمط محايدًا
      direction = features[4] > 0 ? "UP" : "DOWN";
    }
    
    // تحديد المدة المقترحة للصفقة
    let recommendedDuration = 60; // الافتراضي: دقيقة واحدة
    
    if (highestConfidence > this.confidenceThresholds.high) {
      recommendedDuration = 180; // 3 دقائق
    } else if (highestConfidence > this.confidenceThresholds.medium) {
      recommendedDuration = 120; // دقيقتان
    }
    
    // تحويل النمط إلى الصيغة المطلوبة
    const patternMap = {
      "doji": "DOJI",
      "hammer": "HAMMER",
      "engulfing": features[3] === 1 ? "BULLISH_ENGULFING" : "BEARISH_ENGULFING",
      "shootingStar": "SHOOTING_STAR",
      "morningstar": "MORNING_STAR",
      "eveningstar": "EVENING_STAR",
      "TREND_BASED": "TREND_BASED"
    };
    
    // حساب قيم الشمعة المتوقعة
    const lastCandle = candles[candles.length - 1];
    const volatility = features[5];
    const moveSize = highestConfidence * volatility * 2;
    const moveDirection = direction === "UP" ? 1 : -1;
    
    const predictedOpen = lastCandle.close;
    const predictedClose = predictedOpen * (1 + moveDirection * moveSize);
    const wickFactor = 0.3;
    const predictedHigh = Math.max(predictedOpen, predictedClose) * (1 + wickFactor * moveSize);
    const predictedLow = Math.min(predictedOpen, predictedClose) * (1 - wickFactor * moveSize);
    
    return {
      pattern: patternMap[bestPattern],
      direction: direction,
      confidence: Math.round(highestConfidence * 100),
      recommendedDuration: recommendedDuration,
      open: predictedOpen,
      close: predictedClose,
      high: predictedHigh,
      low: predictedLow
    };
  }
  
  /**
   * تحسين الأوزان بناءً على نتائج سابقة
   * @param {Array} trainingData - بيانات التدريب
   */
  train(trainingData) {
    // هذه دالة مبسطة للتدريب، في التطبيق الحقيقي ستكون أكثر تعقيدًا
    for (const data of trainingData) {
      const features = this.extractFeatures(data.candles);
      if (!features) continue;
      
      // تحديث أوزان النمط
      if (this.patternWeights[data.pattern]) {
        for (let i = 0; i < 4; i++) {
          // تحريك الأوزان نحو الميزات بمعدل تعلم 0.1
          this.patternWeights[data.pattern][i] = 
            0.9 * this.patternWeights[data.pattern][i] + 0.1 * features[i];
        }
      }
    }
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MLCandlestickAnalyzer };
}