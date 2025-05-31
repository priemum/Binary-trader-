/**
 * مؤشرات فنية محسنة للتحليل الفني وزيادة دقة التنبؤ
 */

class EnhancedIndicators {
  /**
   * مؤشر تدفق الأموال (Money Flow Index)
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} period - الفترة الزمنية (عادة 14)
   * @returns {Array<number>} - قيم مؤشر تدفق الأموال
   */
  static mfi(candles, period = 14) {
    const result = [];
    
    // حساب القيم النموذجية والحجم
    const typicalPrices = candles.map(c => (c.high + c.low + c.close) / 3);
    const moneyFlow = typicalPrices.map((tp, i) => tp * (candles[i].volume || 1));
    
    // حساب التغيرات في السعر النموذجي
    const positiveFlow = [];
    const negativeFlow = [];
    
    for (let i = 1; i < typicalPrices.length; i++) {
      if (typicalPrices[i] > typicalPrices[i-1]) {
        positiveFlow.push(moneyFlow[i]);
        negativeFlow.push(0);
      } else if (typicalPrices[i] < typicalPrices[i-1]) {
        positiveFlow.push(0);
        negativeFlow.push(moneyFlow[i]);
      } else {
        positiveFlow.push(0);
        negativeFlow.push(0);
      }
    }
    
    // حساب نسبة تدفق الأموال
    for (let i = period; i <= positiveFlow.length; i++) {
      const positiveSum = positiveFlow.slice(i - period, i).reduce((a, b) => a + b, 0);
      const negativeSum = negativeFlow.slice(i - period, i).reduce((a, b) => a + b, 0);
      
      if (negativeSum === 0) {
        result.push(100);
      } else {
        const moneyRatio = positiveSum / negativeSum;
        result.push(100 - (100 / (1 + moneyRatio)));
      }
    }
    
    return result;
  }
  
  /**
   * مؤشر القوة النسبية المعدل (Connors RSI)
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} rsiPeriod - فترة RSI (عادة 3)
   * @param {number} streakPeriod - فترة التتابع (عادة 2)
   * @param {number} rankPeriod - فترة الترتيب (عادة 100)
   * @returns {Array<number>} - قيم مؤشر القوة النسبية المعدل
   */
  static connorsRSI(candles, rsiPeriod = 3, streakPeriod = 2, rankPeriod = 100) {
    const closes = candles.map(c => c.close);
    
    // حساب RSI للأسعار
    const priceRSI = this.calculateRSI(closes, rsiPeriod);
    
    // حساب تتابع الصعود/الهبوط
    const streaks = this.calculateStreak(closes);
    const streakRSI = this.calculateRSI(streaks, streakPeriod);
    
    // حساب ترتيب النسبة المئوية
    const percentRank = this.calculatePercentRank(closes, rankPeriod);
    
    // دمج المكونات الثلاثة
    const result = [];
    for (let i = 0; i < priceRSI.length; i++) {
      if (priceRSI[i] === null || streakRSI[i] === null || percentRank[i] === null) {
        result.push(null);
      } else {
        result.push((priceRSI[i] + streakRSI[i] + percentRank[i]) / 3);
      }
    }
    
    return result;
  }
  
  /**
   * حساب مؤشر القوة النسبية (RSI)
   * @private
   */
  static calculateRSI(data, period) {
    const result = [];
    const changes = [];
    
    // حساب التغيرات
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i] - data[i - 1]);
    }
    
    // فصل المكاسب والخسائر
    const gains = changes.map(c => c > 0 ? c : 0);
    const losses = changes.map(c => c < 0 ? Math.abs(c) : 0);
    
    // إضافة قيم فارغة للفترات الأولى
    for (let i = 0; i < period; i++) {
      result.push(null);
    }
    
    // حساب متوسط المكاسب والخسائر الأولي
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    // حساب RSI
    for (let i = period; i < data.length; i++) {
      avgGain = ((avgGain * (period - 1)) + gains[i - 1]) / period;
      avgLoss = ((avgLoss * (period - 1)) + losses[i - 1]) / period;
      
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      result.push(100 - (100 / (1 + rs)));
    }
    
    return result;
  }
  
  /**
   * حساب تتابع الصعود/الهبوط
   * @private
   */
  static calculateStreak(data) {
    const result = [0];
    
    for (let i = 1; i < data.length; i++) {
      if (data[i] > data[i - 1]) {
        result.push(result[i - 1] >= 0 ? result[i - 1] + 1 : 1);
      } else if (data[i] < data[i - 1]) {
        result.push(result[i - 1] <= 0 ? result[i - 1] - 1 : -1);
      } else {
        result.push(0);
      }
    }
    
    return result;
  }
  
  /**
   * حساب ترتيب النسبة المئوية
   * @private
   */
  static calculatePercentRank(data, period) {
    const result = [];
    
    // إضافة قيم فارغة للفترات الأولى
    for (let i = 0; i < period - 1; i++) {
      result.push(null);
    }
    
    // حساب ترتيب النسبة المئوية
    for (let i = period - 1; i < data.length; i++) {
      const windowData = data.slice(i - period + 1, i + 1);
      let count = 0;
      
      for (let j = 0; j < windowData.length; j++) {
        if (windowData[j] < data[i]) {
          count++;
        }
      }
      
      result.push(count / period * 100);
    }
    
    return result;
  }
  
  /**
   * مؤشر تقارب/تباعد المتوسط المتحرك المعدل (MACD) مع إشارات محسنة
   * @param {Array<number>} prices - مصفوفة الأسعار
   * @param {Object} options - خيارات المؤشر
   * @returns {Object} - كائن يحتوي على MACD وخط الإشارة والهيستوجرام والإشارات
   */
  static enhancedMACD(prices, options = {}) {
    const fastPeriod = options.fastPeriod || 12;
    const slowPeriod = options.slowPeriod || 26;
    const signalPeriod = options.signalPeriod || 9;
    const threshold = options.threshold || 0;
    
    // حساب MACD الأساسي
    const ema12 = this.calculateEMA(prices, fastPeriod);
    const ema26 = this.calculateEMA(prices, slowPeriod);
    
    const macdLine = [];
    for (let i = 0; i < prices.length; i++) {
      if (i < slowPeriod - 1) {
        macdLine.push(null);
      } else {
        macdLine.push(ema12[i] - ema26[i]);
      }
    }
    
    // حساب خط الإشارة
    const signalLine = this.calculateEMA(
      macdLine.filter(v => v !== null),
      signalPeriod
    );
    
    // حساب الهيستوجرام
    const histogram = [];
    let signalIndex = 0;
    
    for (let i = 0; i < macdLine.length; i++) {
      if (macdLine[i] === null) {
        histogram.push(null);
      } else {
        if (signalIndex < signalLine.length) {
          histogram.push(macdLine[i] - signalLine[signalIndex]);
          signalIndex++;
        } else {
          histogram.push(null);
        }
      }
    }
    
    // تحديد الإشارات
    const signals = [];
    for (let i = 1; i < histogram.length; i++) {
      if (histogram[i] === null || histogram[i-1] === null) {
        signals.push(null);
        continue;
      }
      
      // تقاطع صعودي
      if (histogram[i] > threshold && histogram[i-1] <= threshold) {
        signals.push("BUY");
      }
      // تقاطع هبوطي
      else if (histogram[i] < -threshold && histogram[i-1] >= -threshold) {
        signals.push("SELL");
      }
      // لا إشارة
      else {
        signals.push(null);
      }
    }
    
    return {
      macdLine,
      signalLine,
      histogram,
      signals
    };
  }
  
  /**
   * حساب المتوسط المتحرك الأسي
   * @private
   */
  static calculateEMA(data, period) {
    const result = [];
    const k = 2 / (period + 1);
    
    // حساب SMA الأول
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[i];
      result.push(null);
    }
    result[period - 1] = sum / period;
    
    // حساب باقي قيم EMA
    for (let i = period; i < data.length; i++) {
      result.push(data[i] * k + result[i - 1] * (1 - k));
    }
    
    return result;
  }
  
  /**
   * مؤشر تحليل الاتجاه المتقدم
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object} - نتائج تحليل الاتجاه
   */
  static advancedTrendAnalysis(candles) {
    if (candles.length < 10) {
      return { trend: "NEUTRAL", strength: 0, signal: "NEUTRAL" };
    }
    
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume || 1);
    
    // حساب المتوسطات المتحركة
    const sma5 = this.calculateSMA(closes, 5);
    const sma10 = this.calculateSMA(closes, 10);
    
    // حساب مؤشر القوة النسبية
    const rsi = this.calculateRSI(closes, 14);
    
    // حساب مؤشر تدفق الأموال
    const mfi = this.mfi(candles, 14);
    
    // تحليل الاتجاه
    let trend = "NEUTRAL";
    let strength = 50;
    let signal = "NEUTRAL";
    
    // تحليل المتوسطات المتحركة
    if (sma5[sma5.length - 1] > sma10[sma10.length - 1]) {
      trend = "UP";
      strength += 10;
    } else if (sma5[sma5.length - 1] < sma10[sma10.length - 1]) {
      trend = "DOWN";
      strength -= 10;
    }
    
    // تحليل RSI
    const lastRSI = rsi[rsi.length - 1];
    if (lastRSI > 70) {
      if (trend === "UP") {
        strength -= 5; // تشبع شرائي
        signal = "SELL";
      }
    } else if (lastRSI < 30) {
      if (trend === "DOWN") {
        strength += 5; // تشبع بيعي
        signal = "BUY";
      }
    } else if (lastRSI > 50 && trend === "UP") {
      strength += 5;
      signal = "BUY";
    } else if (lastRSI < 50 && trend === "DOWN") {
      strength += 5;
      signal = "SELL";
    }
    
    // تحليل MFI
    const lastMFI = mfi[mfi.length - 1];
    if (lastMFI > 80) {
      if (trend === "UP") {
        strength -= 5; // تشبع شرائي
      }
    } else if (lastMFI < 20) {
      if (trend === "DOWN") {
        strength += 5; // تشبع بيعي
      }
    }
    
    // تحليل تباعد RSI/MFI
    if (lastRSI > 70 && lastMFI < 50) {
      signal = "SELL"; // تباعد سلبي
      strength -= 10;
    } else if (lastRSI < 30 && lastMFI > 50) {
      signal = "BUY"; // تباعد إيجابي
      strength += 10;
    }
    
    // تحليل الحجم
    const avgVolume = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const lastVolume = volumes[volumes.length - 1];
    
    if (trend === "UP" && lastVolume > avgVolume * 1.5) {
      strength += 10; // حجم مرتفع في اتجاه صاعد
    } else if (trend === "DOWN" && lastVolume > avgVolume * 1.5) {
      strength -= 10; // حجم مرتفع في اتجاه هابط
    }
    
    // تعديل قوة الاتجاه
    strength = Math.min(Math.max(strength, 0), 100);
    
    return {
      trend,
      strength,
      signal,
      indicators: {
        rsi: lastRSI,
        mfi: lastMFI,
        sma5: sma5[sma5.length - 1],
        sma10: sma10[sma10.length - 1]
      }
    };
  }
  
  /**
   * حساب المتوسط المتحرك البسيط
   * @private
   */
  static calculateSMA(data, period) {
    const result = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(null);
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
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EnhancedIndicators };
}