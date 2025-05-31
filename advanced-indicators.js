/**
 * مؤشرات فنية متقدمة للتحليل الفني وتحسين دقة التنبؤ
 */

class AdvancedIndicators {
  /**
   * حساب المتوسط المتحرك البسيط
   * @param {Array<number>} prices - مصفوفة الأسعار
   * @param {number} period - الفترة الزمنية
   * @returns {Array<number>} - المتوسط المتحرك البسيط
   */
  static sma(prices, period) {
    const result = [];
    
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        result.push(null);
        continue;
      }
      
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += prices[i - j];
      }
      result.push(sum / period);
    }
    
    return result;
  }
  
  /**
   * حساب المتوسط المتحرك الأسي
   * @param {Array<number>} prices - مصفوفة الأسعار
   * @param {number} period - الفترة الزمنية
   * @returns {Array<number>} - المتوسط المتحرك الأسي
   */
  static ema(prices, period) {
    const result = [];
    const k = 2 / (period + 1);
    
    // أول قيمة هي نفس SMA
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(ema);
    
    // حساب باقي القيم
    for (let i = period; i < prices.length; i++) {
      ema = prices[i] * k + ema * (1 - k);
      result.push(ema);
    }
    
    return result;
  }
  
  /**
   * حساب مؤشر القوة النسبية (RSI)
   * @param {Array<number>} prices - مصفوفة الأسعار
   * @param {number} period - الفترة الزمنية (عادة 14)
   * @returns {Array<number>} - قيم مؤشر القوة النسبية
   */
  static rsi(prices, period = 14) {
    const changes = [];
    const gains = [];
    const losses = [];
    const result = [];
    
    // حساب التغيرات
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }
    
    // فصل المكاسب والخسائر
    for (let i = 0; i < changes.length; i++) {
      gains.push(changes[i] > 0 ? changes[i] : 0);
      losses.push(changes[i] < 0 ? Math.abs(changes[i]) : 0);
    }
    
    // حساب متوسط المكاسب والخسائر الأولي
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    // حساب أول قيمة RSI
    let rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // تجنب القسمة على صفر
    result.push(100 - (100 / (1 + rs)));
    
    // حساب باقي قيم RSI
    for (let i = period; i < changes.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
      avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
      
      rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss);
      result.push(100 - (100 / (1 + rs)));
    }
    
    return result;
  }
  
  /**
   * حساب مؤشر الانحراف المعياري
   * @param {Array<number>} prices - مصفوفة الأسعار
   * @param {number} period - الفترة الزمنية
   * @returns {Array<number>} - قيم الانحراف المعياري
   */
  static standardDeviation(prices, period) {
    const result = [];
    
    for (let i = 0; i < prices.length; i++) {
      if (i < period - 1) {
        result.push(null);
        continue;
      }
      
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const squaredDiffs = slice.map(price => Math.pow(price - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      result.push(Math.sqrt(variance));
    }
    
    return result;
  }
  
  /**
   * حساب مؤشر تقارب وتباعد المتوسطات المتحركة (MACD)
   * @param {Array<number>} prices - مصفوفة الأسعار
   * @param {number} fastPeriod - الفترة السريعة (عادة 12)
   * @param {number} slowPeriod - الفترة البطيئة (عادة 26)
   * @param {number} signalPeriod - فترة الإشارة (عادة 9)
   * @returns {Object} - كائن يحتوي على MACD وخط الإشارة والهيستوجرام
   */
  static macd(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    // حساب المتوسطات المتحركة الأسية
    const fastEMA = this.ema(prices, fastPeriod);
    const slowEMA = this.ema(prices, slowPeriod);
    
    // حساب خط MACD (الفرق بين المتوسطين)
    const macdLine = [];
    for (let i = 0; i < fastEMA.length; i++) {
      if (i < slowPeriod - fastPeriod) {
        macdLine.push(null);
      } else {
        macdLine.push(fastEMA[i] - slowEMA[i - (slowPeriod - fastPeriod)]);
      }
    }
    
    // حساب خط الإشارة (EMA لخط MACD)
    const validMacd = macdLine.filter(value => value !== null);
    const signalLine = this.ema(validMacd, signalPeriod);
    
    // حساب الهيستوجرام (الفرق بين MACD وخط الإشارة)
    const histogram = [];
    for (let i = 0; i < signalLine.length; i++) {
      histogram.push(validMacd[i + validMacd.length - signalLine.length] - signalLine[i]);
    }
    
    return {
      macdLine: validMacd,
      signalLine: signalLine,
      histogram: histogram
    };
  }
  
  /**
   * حساب مؤشر البولينجر باند
   * @param {Array<number>} prices - مصفوفة الأسعار
   * @param {number} period - الفترة الزمنية (عادة 20)
   * @param {number} stdDev - عدد الانحرافات المعيارية (عادة 2)
   * @returns {Object} - كائن يحتوي على الحزمة العليا والوسطى والسفلى
   */
  static bollingerBands(prices, period = 20, stdDev = 2) {
    const middle = this.sma(prices, period);
    const std = this.standardDeviation(prices, period);
    
    const upper = [];
    const lower = [];
    
    for (let i = 0; i < middle.length; i++) {
      if (middle[i] === null || std[i] === null) {
        upper.push(null);
        lower.push(null);
      } else {
        upper.push(middle[i] + (std[i] * stdDev));
        lower.push(middle[i] - (std[i] * stdDev));
      }
    }
    
    return {
      upper: upper,
      middle: middle,
      lower: lower
    };
  }
  
  /**
   * حساب مؤشر التذبذب العشوائي (Stochastic Oscillator)
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} period - الفترة الزمنية (عادة 14)
   * @param {number} smoothK - فترة تنعيم %K (عادة 3)
   * @param {number} smoothD - فترة تنعيم %D (عادة 3)
   * @returns {Object} - كائن يحتوي على %K و %D
   */
  static stochastic(candles, period = 14, smoothK = 3, smoothD = 3) {
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);
    
    const rawK = [];
    
    // حساب %K الخام
    for (let i = period - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - period + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - period + 1, i + 1));
      const close = closes[i];
      
      if (highestHigh === lowestLow) {
        rawK.push(50); // قيمة محايدة إذا كان النطاق صفر
      } else {
        rawK.push(100 * (close - lowestLow) / (highestHigh - lowestLow));
      }
    }
    
    // تنعيم %K
    const k = this.sma(rawK, smoothK);
    
    // حساب %D (متوسط متحرك لـ %K)
    const d = this.sma(k, smoothD);
    
    return {
      k: k,
      d: d
    };
  }
  
  /**
   * تحليل نمط الشموع المتقدم
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object} - نتائج تحليل النمط
   */
  static advancedPatternAnalysis(candles) {
    if (candles.length < 5) {
      return { pattern: "INSUFFICIENT_DATA", strength: 0, signal: "NEUTRAL" };
    }
    
    // استخراج البيانات الفنية
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume || 1); // استخدام 1 إذا كان الحجم غير متوفر
    
    // حساب المؤشرات
    const sma20 = this.sma(closes, 5).pop();
    const ema10 = this.ema(closes, 3).pop();
    const rsiValue = this.rsi(closes, 14).pop();
    const macdResult = this.macd(closes);
    const macdHistogram = macdResult.histogram.slice(-3);
    const bb = this.bollingerBands(closes);
    const lastClose = closes[closes.length - 1];
    const lastBB = {
      upper: bb.upper[bb.upper.length - 1],
      middle: bb.middle[bb.middle.length - 1],
      lower: bb.lower[bb.lower.length - 1]
    };
    
    // تحليل الاتجاه
    const trend = lastClose > sma20 ? "UP" : "DOWN";
    
    // تحليل قوة الاتجاه
    let strength = 50;
    
    // تحليل RSI
    if (rsiValue > 70) {
      strength += 10;
      if (trend === "UP") {
        strength += 5; // تأكيد الاتجاه الصاعد لكن مع احتمال تشبع شرائي
      } else {
        strength -= 15; // احتمال انعكاس الاتجاه
      }
    } else if (rsiValue < 30) {
      strength += 10;
      if (trend === "DOWN") {
        strength += 5; // تأكيد الاتجاه الهابط لكن مع احتمال تشبع بيعي
      } else {
        strength -= 15; // احتمال انعكاس الاتجاه
      }
    } else if (rsiValue > 50 && trend === "UP") {
      strength += 10; // اتجاه صاعد قوي
    } else if (rsiValue < 50 && trend === "DOWN") {
      strength += 10; // اتجاه هابط قوي
    }
    
    // تحليل MACD
    if (macdHistogram[2] > macdHistogram[1] && macdHistogram[1] > macdHistogram[0]) {
      if (trend === "UP") {
        strength -= 10; // احتمال تباطؤ الاتجاه الصاعد
      } else {
        strength += 15; // تأكيد الاتجاه الهابط
      }
    } else if (macdHistogram[2] < macdHistogram[1] && macdHistogram[1] < macdHistogram[0]) {
      if (trend === "DOWN") {
        strength -= 10; // احتمال تباطؤ الاتجاه الهابط
      } else {
        strength += 15; // تأكيد الاتجاه الصاعد
      }
    }
    
    // تحليل البولينجر باند
    if (lastClose > lastBB.upper) {
      if (trend === "UP") {
        strength += 10; // اختراق قوي للأعلى
      } else {
        strength -= 5; // احتمال انعكاس مؤقت
      }
    } else if (lastClose < lastBB.lower) {
      if (trend === "DOWN") {
        strength += 10; // اختراق قوي للأسفل
      } else {
        strength -= 5; // احتمال انعكاس مؤقت
      }
    }
    
    // تحديد النمط والإشارة
    let pattern = "TREND_BASED";
    let signal = trend;
    
    if (rsiValue > 70 && lastClose > lastBB.upper) {
      pattern = "OVERBOUGHT";
      signal = "DOWN";
      strength = Math.max(60, strength);
    } else if (rsiValue < 30 && lastClose < lastBB.lower) {
      pattern = "OVERSOLD";
      signal = "UP";
      strength = Math.max(60, strength);
    } else if (macdHistogram[2] < 0 && macdHistogram[1] < 0 && macdHistogram[0] > 0) {
      pattern = "MACD_CROSSOVER";
      signal = "UP";
      strength = Math.max(65, strength);
    } else if (macdHistogram[2] > 0 && macdHistogram[1] > 0 && macdHistogram[0] < 0) {
      pattern = "MACD_CROSSOVER";
      signal = "DOWN";
      strength = Math.max(65, strength);
    }
    
    // تحديد قوة الإشارة النهائية
    strength = Math.min(Math.max(strength, 30), 95);
    
    return {
      pattern: pattern,
      signal: signal,
      strength: strength,
      indicators: {
        rsi: rsiValue,
        macd: macdHistogram[0],
        bollingerPosition: (lastClose - lastBB.lower) / (lastBB.upper - lastBB.lower)
      }
    };
  }
  
  /**
   * تحليل الحجم والسعر
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object} - نتائج تحليل الحجم والسعر
   */
  static volumePriceAnalysis(candles) {
    if (candles.length < 5) {
      return { signal: "NEUTRAL", strength: 0 };
    }
    
    const volumes = candles.map(c => c.volume || 1);
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const lastVolume = volumes[volumes.length - 1];
    const volumeRatio = lastVolume / avgVolume;
    
    const lastCandle = candles[candles.length - 1];
    const prevCandle = candles[candles.length - 2];
    
    let signal = "NEUTRAL";
    let strength = 50;
    
    // تحليل الحجم والسعر
    if (lastCandle.close > lastCandle.open) { // شمعة خضراء
      if (volumeRatio > 1.5) {
        signal = "UP";
        strength += 15; // حجم مرتفع مع شمعة خضراء = إشارة صعود قوية
      } else if (volumeRatio < 0.7) {
        signal = "UP";
        strength -= 5; // حجم منخفض مع شمعة خضراء = إشارة صعود ضعيفة
      }
    } else { // شمعة حمراء
      if (volumeRatio > 1.5) {
        signal = "DOWN";
        strength += 15; // حجم مرتفع مع شمعة حمراء = إشارة هبوط قوية
      } else if (volumeRatio < 0.7) {
        signal = "DOWN";
        strength -= 5; // حجم منخفض مع شمعة حمراء = إشارة هبوط ضعيفة
      }
    }
    
    // تحليل تغير الحجم
    if (lastVolume > volumes[volumes.length - 2] * 2) {
      strength += 10; // زيادة كبيرة في الحجم = إشارة قوية
    }
    
    return {
      signal: signal,
      strength: Math.min(Math.max(strength, 30), 95),
      volumeRatio: volumeRatio
    };
  }
  
  /**
   * تحليل متكامل للشموع والمؤشرات الفنية
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} timeframe - الإطار الزمني بالثواني
   * @returns {Object} - نتائج التحليل المتكامل
   */
  static integratedAnalysis(candles, timeframe = 60) {
    // تحليل أنماط الشموع
    const patternAnalysis = this.advancedPatternAnalysis(candles);
    
    // تحليل الحجم والسعر
    const volumeAnalysis = this.volumePriceAnalysis(candles);
    
    // دمج نتائج التحليل
    let finalSignal = "NEUTRAL";
    let finalStrength = 50;
    let finalPattern = patternAnalysis.pattern;
    
    // ترجيح الإشارات
    if (patternAnalysis.signal === volumeAnalysis.signal) {
      finalSignal = patternAnalysis.signal;
      finalStrength = (patternAnalysis.strength * 0.7) + (volumeAnalysis.strength * 0.3);
    } else {
      // إذا كانت الإشارات متعارضة، اختر الأقوى
      if (patternAnalysis.strength > volumeAnalysis.strength) {
        finalSignal = patternAnalysis.signal;
        finalStrength = patternAnalysis.strength * 0.8;
      } else {
        finalSignal = volumeAnalysis.signal;
        finalStrength = volumeAnalysis.strength * 0.8;
      }
    }
    
    // تحديد المدة المقترحة للصفقة
    let recommendedDuration;
    switch (finalPattern) {
      case "OVERBOUGHT":
      case "OVERSOLD":
        recommendedDuration = timeframe * 2;
        break;
      case "MACD_CROSSOVER":
        recommendedDuration = timeframe * 3;
        break;
      default:
        recommendedDuration = timeframe * 2;
    }
    
    // حساب قيم الشمعة المتوقعة
    const lastCandle = candles[candles.length - 1];
    const volatility = this.calculateVolatility(candles);
    const moveSize = (finalStrength / 100) * volatility * 1.5;
    const moveDirection = finalSignal === "UP" ? 1 : finalSignal === "DOWN" ? -1 : 0;
    
    const predictedOpen = lastCandle.close;
    const predictedClose = predictedOpen * (1 + moveDirection * moveSize);
    const wickFactor = 0.3;
    const predictedHigh = Math.max(predictedOpen, predictedClose) * (1 + wickFactor * moveSize);
    const predictedLow = Math.min(predictedOpen, predictedClose) * (1 - wickFactor * moveSize);
    
    return {
      pattern: finalPattern,
      direction: finalSignal,
      confidence: Math.round(finalStrength),
      recommendedDuration: recommendedDuration,
      open: predictedOpen,
      close: predictedClose,
      high: predictedHigh,
      low: predictedLow,
      indicators: {
        ...patternAnalysis.indicators,
        volumeRatio: volumeAnalysis.volumeRatio
      }
    };
  }
  
  /**
   * حساب تقلب السعر
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {number} - قيمة التقلب
   */
  static calculateVolatility(candles) {
    if (candles.length < 2) return 0.01;
    
    const closes = candles.map(c => c.close);
    let totalChange = 0;
    
    for (let i = 1; i < closes.length; i++) {
      totalChange += Math.abs(closes[i] - closes[i-1]) / closes[i-1];
    }
    
    return totalChange / (closes.length - 1);
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdvancedIndicators };
}