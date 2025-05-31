/**
 * مؤشرات فنية متقدمة إضافية
 * يتضمن مؤشرات Ichimoku Cloud و Fibonacci وغيرها
 */

class AdvancedIndicatorsExtended {
  /**
   * حساب مؤشر Ichimoku Cloud
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object} - مكونات مؤشر Ichimoku
   */
  static calculateIchimoku(candles) {
    // تحقق من وجود بيانات كافية
    if (candles.length < 52) {
      return {
        tenkan: [],
        kijun: [],
        senkouA: [],
        senkouB: [],
        chikou: []
      };
    }

    const tenkan = this.calculateIchimokuLine(candles, 9);
    const kijun = this.calculateIchimokuLine(candles, 26);
    const senkouA = this.calculateSenkouA(tenkan, kijun);
    const senkouB = this.calculateIchimokuLine(candles, 52);
    const chikou = this.calculateChikou(candles);

    return {
      tenkan,
      kijun,
      senkouA,
      senkouB,
      chikou
    };
  }

  /**
   * حساب خط Ichimoku (Tenkan-sen أو Kijun-sen)
   * @private
   */
  static calculateIchimokuLine(candles, period) {
    const result = [];

    for (let i = 0; i < candles.length; i++) {
      if (i < period - 1) {
        result.push(null);
        continue;
      }

      let highestHigh = -Infinity;
      let lowestLow = Infinity;

      for (let j = 0; j < period; j++) {
        const candle = candles[i - j];
        highestHigh = Math.max(highestHigh, candle.high);
        lowestLow = Math.min(lowestLow, candle.low);
      }

      result.push((highestHigh + lowestLow) / 2);
    }

    return result;
  }

  /**
   * حساب خط Senkou Span A
   * @private
   */
  static calculateSenkouA(tenkan, kijun) {
    const result = [];

    for (let i = 0; i < tenkan.length; i++) {
      if (tenkan[i] === null || kijun[i] === null) {
        result.push(null);
      } else {
        result.push((tenkan[i] + kijun[i]) / 2);
      }
    }

    return result;
  }

  /**
   * حساب خط Chikou Span
   * @private
   */
  static calculateChikou(candles) {
    const result = [];
    const offset = 26;

    for (let i = 0; i < candles.length; i++) {
      if (i < offset) {
        result.push(null);
      } else {
        result.push(candles[i - offset].close);
      }
    }

    return result;
  }

  /**
   * تحليل إشارات Ichimoku
   * @param {Object} ichimoku - مكونات مؤشر Ichimoku
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object} - تحليل إشارات Ichimoku
   */
  static analyzeIchimoku(ichimoku, candles) {
    const lastIndex = candles.length - 1;
    const currentPrice = candles[lastIndex].close;

    // تحقق من وجود بيانات كافية
    if (ichimoku.tenkan[lastIndex] === null || ichimoku.kijun[lastIndex] === null) {
      return {
        signal: "NEUTRAL",
        strength: 0,
        cloud: "NEUTRAL"
      };
    }

    const tenkan = ichimoku.tenkan[lastIndex];
    const kijun = ichimoku.kijun[lastIndex];
    const senkouA = ichimoku.senkouA[lastIndex - 26] || 0;
    const senkouB = ichimoku.senkouB[lastIndex - 26] || 0;

    // تحديد حالة السحابة
    let cloudStatus = "NEUTRAL";
    if (senkouA > senkouB) {
      cloudStatus = "BULLISH";
    } else if (senkouA < senkouB) {
      cloudStatus = "BEARISH";
    }

    // تحديد الإشارة
    let signal = "NEUTRAL";
    let strength = 0;

    // تقاطع Tenkan و Kijun
    if (tenkan > kijun && ichimoku.tenkan[lastIndex - 1] <= ichimoku.kijun[lastIndex - 1]) {
      signal = "UP";
      strength += 30;
    } else if (tenkan < kijun && ichimoku.tenkan[lastIndex - 1] >= ichimoku.kijun[lastIndex - 1]) {
      signal = "DOWN";
      strength += 30;
    }

    // موقع السعر بالنسبة للسحابة
    if (currentPrice > Math.max(senkouA, senkouB)) {
      if (signal === "UP") strength += 20;
      else if (signal === "NEUTRAL") {
        signal = "UP";
        strength += 20;
      }
    } else if (currentPrice < Math.min(senkouA, senkouB)) {
      if (signal === "DOWN") strength += 20;
      else if (signal === "NEUTRAL") {
        signal = "DOWN";
        strength += 20;
      }
    }

    // موقع السعر بالنسبة لخط Kijun
    if (currentPrice > kijun) {
      if (signal === "UP") strength += 10;
      else if (signal === "NEUTRAL") {
        signal = "UP";
        strength += 10;
      }
    } else if (currentPrice < kijun) {
      if (signal === "DOWN") strength += 10;
      else if (signal === "NEUTRAL") {
        signal = "DOWN";
        strength += 10;
      }
    }

    return {
      signal,
      strength,
      cloud: cloudStatus
    };
  }

  /**
   * حساب مستويات فيبوناتشي
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} period - الفترة للبحث عن القمة والقاع
   * @returns {Object} - مستويات فيبوناتشي
   */
  static calculateFibonacciLevels(candles, period = 20) {
    // تحقق من وجود بيانات كافية
    if (candles.length < period) {
      return {
        trend: "NEUTRAL",
        levels: {}
      };
    }

    // البحث عن القمة والقاع في الفترة المحددة
    let highestPrice = -Infinity;
    let lowestPrice = Infinity;
    let highestIndex = 0;
    let lowestIndex = 0;

    for (let i = candles.length - period; i < candles.length; i++) {
      if (candles[i].high > highestPrice) {
        highestPrice = candles[i].high;
        highestIndex = i;
      }
      if (candles[i].low < lowestPrice) {
        lowestPrice = candles[i].low;
        lowestIndex = i;
      }
    }

    // تحديد الاتجاه
    const trend = highestIndex > lowestIndex ? "UP" : "DOWN";

    // حساب مستويات فيبوناتشي
    const range = Math.abs(highestPrice - lowestPrice);
    const levels = {};

    if (trend === "UP") {
      levels["0.0"] = highestPrice;
      levels["0.236"] = highestPrice - 0.236 * range;
      levels["0.382"] = highestPrice - 0.382 * range;
      levels["0.5"] = highestPrice - 0.5 * range;
      levels["0.618"] = highestPrice - 0.618 * range;
      levels["0.786"] = highestPrice - 0.786 * range;
      levels["1.0"] = lowestPrice;
    } else {
      levels["0.0"] = lowestPrice;
      levels["0.236"] = lowestPrice + 0.236 * range;
      levels["0.382"] = lowestPrice + 0.382 * range;
      levels["0.5"] = lowestPrice + 0.5 * range;
      levels["0.618"] = lowestPrice + 0.618 * range;
      levels["0.786"] = lowestPrice + 0.786 * range;
      levels["1.0"] = highestPrice;
    }

    return {
      trend,
      levels
    };
  }

  /**
   * تحليل مستويات فيبوناتشي
   * @param {Object} fibLevels - مستويات فيبوناتشي
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object} - تحليل مستويات فيبوناتشي
   */
  static analyzeFibonacciLevels(fibLevels, candles) {
    const lastCandle = candles[candles.length - 1];
    const currentPrice = lastCandle.close;
    
    // تحديد أقرب مستوى فيبوناتشي
    let closestLevel = null;
    let closestDistance = Infinity;
    let nextLevel = null;

    for (const [level, price] of Object.entries(fibLevels.levels)) {
      const distance = Math.abs(currentPrice - price);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestLevel = level;
      }
    }

    // تحديد المستوى التالي
    const levelKeys = Object.keys(fibLevels.levels).sort((a, b) => parseFloat(a) - parseFloat(b));
    const closestLevelIndex = levelKeys.indexOf(closestLevel);
    
    if (fibLevels.trend === "UP") {
      if (closestLevelIndex < levelKeys.length - 1) {
        nextLevel = levelKeys[closestLevelIndex + 1];
      }
    } else {
      if (closestLevelIndex > 0) {
        nextLevel = levelKeys[closestLevelIndex - 1];
      }
    }

    // تحديد الإشارة
    let signal = "NEUTRAL";
    let strength = 0;

    // إذا كان السعر قريبًا من مستوى فيبوناتشي
    if (closestDistance / currentPrice < 0.002) { // أقل من 0.2%
      if (fibLevels.trend === "UP") {
        if (parseFloat(closestLevel) <= 0.382) {
          signal = "UP";
          strength = 70;
        } else if (parseFloat(closestLevel) >= 0.618) {
          signal = "DOWN";
          strength = 60;
        }
      } else {
        if (parseFloat(closestLevel) <= 0.382) {
          signal = "DOWN";
          strength = 70;
        } else if (parseFloat(closestLevel) >= 0.618) {
          signal = "UP";
          strength = 60;
        }
      }
    }

    return {
      signal,
      strength,
      closestLevel,
      nextLevel,
      currentPrice
    };
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdvancedIndicatorsExtended };
} else {
  // إنشاء كائن عالمي للاستخدام في المتصفح
  window.AdvancedIndicatorsExtended = AdvancedIndicatorsExtended;
}