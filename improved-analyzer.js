/**
 * محلل محسن للشموع اليابانية للخيارات الثنائية
 * يدعم الإطار الزمني 1 دقيقة
 */

// تعريف فئة الشمعة
class Candle {
  constructor(open, close, high, low, timestamp = Date.now()) {
    this.open = open;
    this.close = close;
    this.high = high;
    this.low = low;
    this.timestamp = timestamp;
    this.bodySize = Math.abs(close - open);
    this.totalSize = high - low;
    this.upperShadow = this.isGreen() ? high - close : high - open;
    this.lowerShadow = this.isGreen() ? open - low : close - low;
  }

  isGreen() {
    return this.close > this.open;
  }

  isRed() {
    return this.open > this.close;
  }

  isDoji() {
    // شمعة دوجي إذا كان حجم الجسم أقل من 3% من الحجم الكلي
    return this.bodySize <= 0.03 * this.totalSize;
  }
}

/**
 * محلل أنماط الشموع المحسن
 */
class ImprovedPatternAnalyzer {
  /**
   * تحليل مجموعة من الشموع وتحديد الأنماط
   * @param {Array<Object>} candlesData - بيانات الشموع المستخرجة من الصورة
   * @param {number} timeframe - الإطار الزمني بالثواني (60 للدقيقة الواحدة)
   * @returns {Object} - نتائج التحليل والتنبؤ
   */
  static analyzeCandles(candlesData, timeframe = 60) {
    // تحويل البيانات إلى كائنات شموع
    const candles = candlesData.map(data => new Candle(
      data.open, data.close, data.high, data.low
    ));
    
    if (candles.length < 3) {
      return this.insufficientDataPrediction();
    }
    
    // تحديد الاتجاه العام
    const trend = this.detectTrend(candles);
    
    // البحث عن الأنماط المعروفة
    const patterns = this.detectPatterns(candles);
    
    // اختيار النمط الأقوى
    const strongestPattern = this.selectStrongestPattern(patterns, trend);
    
    // التنبؤ بالشمعة القادمة
    return this.predictNextCandle(candles, strongestPattern, trend, timeframe);
  }
  
  /**
   * تحديد الاتجاه العام للشموع
   */
  static detectTrend(candles) {
    // حساب المتوسط المتحرك البسيط
    const closes = candles.map(c => c.close);
    const sma5 = this.calculateSMA(closes, Math.min(5, candles.length));
    
    // حساب الاتجاه من خلال مقارنة آخر قيمتين للمتوسط المتحرك
    const lastSMA = sma5[sma5.length - 1];
    const prevSMA = sma5[sma5.length - 2] || sma5[0];
    
    // حساب قوة الاتجاه
    const trendStrength = Math.abs(lastSMA - prevSMA) / prevSMA * 100;
    
    return {
      direction: lastSMA > prevSMA ? "UP" : "DOWN",
      strength: Math.min(trendStrength * 5, 100) // تحويل إلى نسبة مئوية مع حد أقصى 100
    };
  }
  
  /**
   * حساب المتوسط المتحرك البسيط
   */
  static calculateSMA(data, period) {
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(data[i]);
        continue;
      }
      
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j];
      }
      result.push(sum / period);
    }
    
    return result;
  }
  
  /**
   * البحث عن أنماط الشموع المعروفة
   */
  static detectPatterns(candles) {
    const patterns = [];
    const n = candles.length;
    
    // الشموع الأخيرة للتحليل
    const c1 = n >= 3 ? candles[n-3] : null;
    const c2 = n >= 2 ? candles[n-2] : null;
    const c3 = candles[n-1]; // آخر شمعة
    
    // فحص نمط الدوجي
    if (c3.isDoji()) {
      patterns.push({
        name: "DOJI",
        confidence: 50 + (c3.totalSize / c3.bodySize) * 5,
        signal: "NEUTRAL"
      });
    }
    
    // فحص نمط المطرقة
    if (c3.lowerShadow >= 2 * c3.bodySize && c3.upperShadow <= 0.1 * c3.bodySize) {
      patterns.push({
        name: "HAMMER",
        confidence: 60 + (c3.lowerShadow / c3.bodySize) * 2,
        signal: "UP"
      });
    }
    
    // فحص نمط النجمة المطلقة
    if (c3.upperShadow >= 2 * c3.bodySize && c3.lowerShadow <= 0.1 * c3.bodySize) {
      patterns.push({
        name: "SHOOTING_STAR",
        confidence: 60 + (c3.upperShadow / c3.bodySize) * 2,
        signal: "DOWN"
      });
    }
    
    // فحص نمط البلع الصاعد
    if (c2 && c2.isRed() && c3.isGreen() && 
        c3.open <= c2.close && c3.close >= c2.open) {
      patterns.push({
        name: "BULLISH_ENGULFING",
        confidence: 70 + (c3.bodySize / c2.bodySize) * 10,
        signal: "UP"
      });
    }
    
    // فحص نمط البلع الهابط
    if (c2 && c2.isGreen() && c3.isRed() && 
        c3.open >= c2.close && c3.close <= c2.open) {
      patterns.push({
        name: "BEARISH_ENGULFING",
        confidence: 70 + (c3.bodySize / c2.bodySize) * 10,
        signal: "DOWN"
      });
    }
    
    // فحص نمط نجمة الصباح
    if (c1 && c2 && c1.isRed() && c3.isGreen() && 
        c2.bodySize < c1.bodySize * 0.3 && 
        c3.close > (c1.open + c1.close) / 2) {
      patterns.push({
        name: "MORNING_STAR",
        confidence: 80,
        signal: "UP"
      });
    }
    
    // فحص نمط نجمة المساء
    if (c1 && c2 && c1.isGreen() && c3.isRed() && 
        c2.bodySize < c1.bodySize * 0.3 && 
        c3.close < (c1.open + c1.close) / 2) {
      patterns.push({
        name: "EVENING_STAR",
        confidence: 80,
        signal: "DOWN"
      });
    }
    
    // إذا لم يتم العثور على أنماط، استخدم الشموع الفردية
    if (patterns.length === 0) {
      if (c3.isGreen() && c3.bodySize > c3.totalSize * 0.7) {
        patterns.push({
          name: "STRONG_BULLISH",
          confidence: 55 + (c3.bodySize / c3.totalSize) * 20,
          signal: "UP"
        });
      } else if (c3.isRed() && c3.bodySize > c3.totalSize * 0.7) {
        patterns.push({
          name: "STRONG_BEARISH",
          confidence: 55 + (c3.bodySize / c3.totalSize) * 20,
          signal: "DOWN"
        });
      }
    }
    
    return patterns;
  }
  
  /**
   * اختيار النمط الأقوى من بين الأنماط المكتشفة
   */
  static selectStrongestPattern(patterns, trend) {
    if (patterns.length === 0) {
      return {
        name: trend.direction === "UP" ? "UPTREND" : "DOWNTREND",
        confidence: trend.strength,
        signal: trend.direction
      };
    }
    
    // ترتيب الأنماط حسب الثقة
    patterns.sort((a, b) => b.confidence - a.confidence);
    
    // إذا كان النمط الأقوى يتوافق مع الاتجاه، زيادة الثقة
    const strongest = patterns[0];
    if (strongest.signal === trend.direction) {
      strongest.confidence = Math.min(strongest.confidence + 10, 100);
    } else if (strongest.signal !== "NEUTRAL") {
      // إذا كان النمط يعاكس الاتجاه، تقليل الثقة قليلاً
      strongest.confidence = Math.max(strongest.confidence - 5, 0);
    }
    
    return strongest;
  }
  
  /**
   * التنبؤ بالشمعة القادمة بناءً على النمط والاتجاه
   */
  static predictNextCandle(candles, pattern, trend, timeframe) {
    const lastCandle = candles[candles.length - 1];
    
    // تحديد المدة المقترحة للصفقة بناءً على الإطار الزمني والنمط
    let recommendedDuration;
    switch (pattern.name) {
      case "DOJI":
        recommendedDuration = timeframe * 2;
        break;
      case "HAMMER":
      case "SHOOTING_STAR":
        recommendedDuration = timeframe * 3;
        break;
      case "BULLISH_ENGULFING":
      case "BEARISH_ENGULFING":
        recommendedDuration = timeframe * 3;
        break;
      case "MORNING_STAR":
      case "EVENING_STAR":
        recommendedDuration = timeframe * 5;
        break;
      default:
        recommendedDuration = timeframe * 3;
    }
    
    // تحديد اتجاه الحركة المتوقعة
    const moveDirection = pattern.signal === "UP" ? 1 : 
                         pattern.signal === "DOWN" ? -1 : 0;
    
    // حساب حجم الحركة المتوقعة بناءً على ثقة النمط
    const volatility = this.calculateVolatility(candles);
    const moveSize = (pattern.confidence / 100) * volatility * 1.5;
    
    // حساب قيم الشمعة المتوقعة
    const predictedOpen = lastCandle.close;
    const predictedClose = predictedOpen * (1 + moveDirection * moveSize);
    
    // حساب القمة والقاع المتوقعين
    const wickFactor = 0.3; // عامل لحساب طول الفتائل
    const predictedHigh = Math.max(predictedOpen, predictedClose) * (1 + wickFactor * moveSize);
    const predictedLow = Math.min(predictedOpen, predictedClose) * (1 - wickFactor * moveSize);
    
    return {
      pattern: pattern.name,
      direction: pattern.signal,
      confidence: Math.round(pattern.confidence),
      recommendedDuration: recommendedDuration,
      open: predictedOpen,
      close: predictedClose,
      high: predictedHigh,
      low: predictedLow
    };
  }
  
  /**
   * حساب تقلب السعر
   */
  static calculateVolatility(candles) {
    if (candles.length < 2) return 0.01;
    
    // حساب متوسط التغير النسبي
    let totalChange = 0;
    for (let i = 1; i < candles.length; i++) {
      totalChange += Math.abs(candles[i].close - candles[i-1].close) / candles[i-1].close;
    }
    
    return totalChange / (candles.length - 1);
  }
  
  /**
   * إنشاء تنبؤ افتراضي عند عدم وجود بيانات كافية
   */
  static insufficientDataPrediction() {
    return {
      pattern: "INSUFFICIENT_DATA",
      direction: "NEUTRAL",
      confidence: 30,
      recommendedDuration: 60,
      open: 0,
      close: 0,
      high: 0,
      low: 0
    };
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ImprovedPatternAnalyzer, Candle };
}