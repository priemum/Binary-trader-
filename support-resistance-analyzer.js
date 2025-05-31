/**
 * محلل خطوط الدعم والمقاومة واتجاه السوق
 */

class SupportResistanceAnalyzer {
  /**
   * تحديد خطوط الدعم والمقاومة من بيانات الشموع
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} sensitivity - حساسية الكشف (1-10)
   * @returns {Object} - خطوط الدعم والمقاومة
   */
  static findSupportResistanceLevels(candles, sensitivity = 3) {
    if (candles.length < 10) {
      return { support: [], resistance: [] };
    }
    
    // استخراج القمم والقيعان
    const pivotPoints = this.findPivotPoints(candles, sensitivity);
    
    // تحديد مستويات الدعم والمقاومة
    const levels = this.identifyLevels(pivotPoints, candles);
    
    // تصفية المستويات المتكررة
    const filteredLevels = this.filterLevels(levels, candles[candles.length - 1].close);
    
    return filteredLevels;
  }
  
  /**
   * تحديد نقاط الارتكاز (القمم والقيعان)
   * @private
   */
  static findPivotPoints(candles, sensitivity) {
    const pivotHighs = [];
    const pivotLows = [];
    const windowSize = Math.max(2, Math.min(5, Math.floor(sensitivity / 2)));
    
    for (let i = windowSize; i < candles.length - windowSize; i++) {
      let isPivotHigh = true;
      let isPivotLow = true;
      
      for (let j = i - windowSize; j <= i + windowSize; j++) {
        if (j === i) continue;
        
        if (candles[j].high >= candles[i].high) {
          isPivotHigh = false;
        }
        
        if (candles[j].low <= candles[i].low) {
          isPivotLow = false;
        }
      }
      
      if (isPivotHigh) {
        pivotHighs.push({ price: candles[i].high, index: i });
      }
      
      if (isPivotLow) {
        pivotLows.push({ price: candles[i].low, index: i });
      }
    }
    
    return { highs: pivotHighs, lows: pivotLows };
  }
  
  /**
   * تحديد مستويات الدعم والمقاومة من نقاط الارتكاز
   * @private
   */
  static identifyLevels(pivotPoints, candles) {
    const priceRange = this.getPriceRange(candles);
    const tolerance = priceRange * 0.005; // 0.5% من نطاق السعر
    
    // تجميع القمم المتقاربة
    const resistanceLevels = this.clusterLevels(pivotPoints.highs, tolerance);
    
    // تجميع القيعان المتقاربة
    const supportLevels = this.clusterLevels(pivotPoints.lows, tolerance);
    
    return {
      support: supportLevels,
      resistance: resistanceLevels
    };
  }
  
  /**
   * تجميع المستويات المتقاربة
   * @private
   */
  static clusterLevels(points, tolerance) {
    if (points.length === 0) return [];
    
    // ترتيب النقاط حسب السعر
    points.sort((a, b) => a.price - b.price);
    
    const clusters = [];
    let currentCluster = [points[0]];
    
    for (let i = 1; i < points.length; i++) {
      const lastPoint = currentCluster[currentCluster.length - 1];
      
      if (Math.abs(points[i].price - lastPoint.price) <= tolerance) {
        // إضافة النقطة للمجموعة الحالية
        currentCluster.push(points[i]);
      } else {
        // إنشاء مجموعة جديدة
        const avgPrice = currentCluster.reduce((sum, p) => sum + p.price, 0) / currentCluster.length;
        const strength = currentCluster.length;
        clusters.push({ price: avgPrice, strength });
        
        currentCluster = [points[i]];
      }
    }
    
    // إضافة المجموعة الأخيرة
    if (currentCluster.length > 0) {
      const avgPrice = currentCluster.reduce((sum, p) => sum + p.price, 0) / currentCluster.length;
      const strength = currentCluster.length;
      clusters.push({ price: avgPrice, strength });
    }
    
    // ترتيب المستويات حسب القوة
    return clusters.sort((a, b) => b.strength - a.strength);
  }
  
  /**
   * تصفية المستويات المتكررة والبعيدة عن السعر الحالي
   * @private
   */
  static filterLevels(levels, currentPrice) {
    // الاحتفاظ بأقوى 3 مستويات دعم وأقوى 3 مستويات مقاومة
    const topSupport = levels.support
      .filter(level => level.price < currentPrice)
      .slice(0, 3);
    
    const topResistance = levels.resistance
      .filter(level => level.price > currentPrice)
      .slice(0, 3);
    
    return {
      support: topSupport,
      resistance: topResistance
    };
  }
  
  /**
   * الحصول على نطاق السعر
   * @private
   */
  static getPriceRange(candles) {
    let min = Infinity;
    let max = -Infinity;
    
    for (const candle of candles) {
      min = Math.min(min, candle.low);
      max = Math.max(max, candle.high);
    }
    
    return max - min;
  }
  
  /**
   * تحديد اتجاه السوق
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object} - معلومات اتجاه السوق
   */
  static determineTrend(candles) {
    if (candles.length < 10) {
      return { trend: "NEUTRAL", strength: 0, description: "بيانات غير كافية" };
    }
    
    // حساب المتوسطات المتحركة
    const closes = candles.map(c => c.close);
    const sma20 = this.calculateSMA(closes, 20);
    const sma50 = this.calculateSMA(closes, 50);
    
    // حساب اتجاه السعر
    const lastClose = closes[closes.length - 1];
    const lastSMA20 = sma20[sma20.length - 1] || lastClose;
    const lastSMA50 = sma50[sma50.length - 1] || lastClose;
    
    // تحديد الاتجاه بناءً على المتوسطات المتحركة
    let trend = "NEUTRAL";
    let strength = 50;
    let description = "اتجاه محايد";
    
    if (lastClose > lastSMA20 && lastSMA20 > lastSMA50) {
      trend = "UP";
      strength = 80;
      description = "اتجاه صاعد قوي";
    } else if (lastClose > lastSMA20) {
      trend = "UP";
      strength = 60;
      description = "اتجاه صاعد";
    } else if (lastClose < lastSMA20 && lastSMA20 < lastSMA50) {
      trend = "DOWN";
      strength = 80;
      description = "اتجاه هابط قوي";
    } else if (lastClose < lastSMA20) {
      trend = "DOWN";
      strength = 60;
      description = "اتجاه هابط";
    }
    
    // تحليل الزخم
    const momentum = this.calculateMomentum(closes, 10);
    if (momentum > 0.02 && trend === "UP") {
      strength += 10;
      description = "اتجاه صاعد قوي مع زخم إيجابي";
    } else if (momentum < -0.02 && trend === "DOWN") {
      strength += 10;
      description = "اتجاه هابط قوي مع زخم سلبي";
    }
    
    return { trend, strength, description };
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
  
  /**
   * حساب الزخم
   * @private
   */
  static calculateMomentum(data, period) {
    if (data.length < period) return 0;
    
    const current = data[data.length - 1];
    const past = data[data.length - period];
    
    return (current - past) / past;
  }
  
  /**
   * تحليل احتمالية اختراق مستويات الدعم والمقاومة
   * @param {Object} levels - مستويات الدعم والمقاومة
   * @param {Object} prediction - التنبؤ بالشمعة القادمة
   * @returns {Object} - تحليل الاختراق
   */
  static analyzeBreakout(levels, prediction) {
    if (!levels || !prediction) {
      return { breakout: "NONE", probability: 0, target: null };
    }
    
    const currentPrice = prediction.open;
    const predictedHigh = prediction.high;
    const predictedLow = prediction.low;
    
    // البحث عن أقرب مستوى دعم ومقاومة
    const closestResistance = levels.resistance.length > 0 ? 
      levels.resistance.reduce((prev, curr) => 
        Math.abs(curr.price - currentPrice) < Math.abs(prev.price - currentPrice) ? curr : prev
      ) : null;
    
    const closestSupport = levels.support.length > 0 ? 
      levels.support.reduce((prev, curr) => 
        Math.abs(curr.price - currentPrice) < Math.abs(prev.price - currentPrice) ? curr : prev
      ) : null;
    
    // تحليل احتمالية الاختراق
    let breakout = "NONE";
    let probability = 0;
    let target = null;
    
    if (closestResistance && predictedHigh > closestResistance.price) {
      // احتمالية اختراق المقاومة
      const distancePercent = (closestResistance.price - currentPrice) / currentPrice;
      probability = Math.min(90, 50 + (1 - distancePercent * 100) * 5);
      
      // تحديد الهدف بعد الاختراق
      const nextResistance = levels.resistance.find(r => r.price > closestResistance.price);
      target = nextResistance ? nextResistance.price : closestResistance.price * 1.01;
      
      breakout = "RESISTANCE";
    } else if (closestSupport && predictedLow < closestSupport.price) {
      // احتمالية اختراق الدعم
      const distancePercent = (currentPrice - closestSupport.price) / currentPrice;
      probability = Math.min(90, 50 + (1 - distancePercent * 100) * 5);
      
      // تحديد الهدف بعد الاختراق
      const nextSupport = levels.support.find(s => s.price < closestSupport.price);
      target = nextSupport ? nextSupport.price : closestSupport.price * 0.99;
      
      breakout = "SUPPORT";
    }
    
    return {
      breakout,
      probability: Math.round(probability),
      target: target ? parseFloat(target.toFixed(2)) : null,
      level: breakout === "RESISTANCE" ? closestResistance.price : 
             breakout === "SUPPORT" ? closestSupport.price : null
    };
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SupportResistanceAnalyzer };
}