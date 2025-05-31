/**
 * نظام التعرف على أنماط الشموع المتقدم
 */

class PatternRecognition {
  /**
   * التعرف على نمط الرأس والكتفين
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object|null} - معلومات النمط أو null إذا لم يتم العثور عليه
   */
  static headAndShoulders(candles) {
    if (candles.length < 7) return null;
    
    // استخراج القمم والقيعان
    const peaks = this.findPeaksAndTroughs(candles);
    
    // البحث عن نمط الرأس والكتفين
    for (let i = 0; i < peaks.peaks.length - 4; i++) {
      const leftShoulder = peaks.peaks[i];
      const head = peaks.peaks[i + 2];
      const rightShoulder = peaks.peaks[i + 4];
      const neckline = Math.min(peaks.troughs[i + 1], peaks.troughs[i + 3]);
      
      // التحقق من شروط النمط
      if (head > leftShoulder && head > rightShoulder && 
          Math.abs(leftShoulder - rightShoulder) / leftShoulder < 0.1) {
        
        return {
          pattern: "HEAD_AND_SHOULDERS",
          signal: "DOWN",
          confidence: 80,
          neckline: neckline,
          target: neckline - (head - neckline)
        };
      }
    }
    
    return null;
  }
  
  /**
   * التعرف على نمط الرأس والكتفين المقلوب
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object|null} - معلومات النمط أو null إذا لم يتم العثور عليه
   */
  static inverseHeadAndShoulders(candles) {
    if (candles.length < 7) return null;
    
    // استخراج القمم والقيعان
    const peaks = this.findPeaksAndTroughs(candles);
    
    // البحث عن نمط الرأس والكتفين المقلوب
    for (let i = 0; i < peaks.troughs.length - 4; i++) {
      const leftShoulder = peaks.troughs[i];
      const head = peaks.troughs[i + 2];
      const rightShoulder = peaks.troughs[i + 4];
      const neckline = Math.max(peaks.peaks[i + 1], peaks.peaks[i + 3]);
      
      // التحقق من شروط النمط
      if (head < leftShoulder && head < rightShoulder && 
          Math.abs(leftShoulder - rightShoulder) / leftShoulder < 0.1) {
        
        return {
          pattern: "INVERSE_HEAD_AND_SHOULDERS",
          signal: "UP",
          confidence: 80,
          neckline: neckline,
          target: neckline + (neckline - head)
        };
      }
    }
    
    return null;
  }
  
  /**
   * التعرف على نمط المثلث المتماثل
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object|null} - معلومات النمط أو null إذا لم يتم العثور عليه
   */
  static symmetricalTriangle(candles) {
    if (candles.length < 6) return null;
    
    // استخراج القمم والقيعان
    const peaks = this.findPeaksAndTroughs(candles);
    
    // التحقق من وجود قمم متناقصة وقيعان متزايدة
    if (peaks.peaks.length < 3 || peaks.troughs.length < 3) return null;
    
    const descendingPeaks = this.isDescending(peaks.peaks.slice(-3));
    const ascendingTroughs = this.isAscending(peaks.troughs.slice(-3));
    
    if (descendingPeaks && ascendingTroughs) {
      // حساب نقطة التقاء خطي الاتجاه
      const peakSlope = (peaks.peaks[peaks.peaks.length - 1] - peaks.peaks[peaks.peaks.length - 3]) / 2;
      const troughSlope = (peaks.troughs[peaks.troughs.length - 1] - peaks.troughs[peaks.troughs.length - 3]) / 2;
      
      // تحديد الاتجاه المتوقع بناءً على حجم التداول
      const volumes = candles.slice(-5).map(c => c.volume || 1);
      const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
      const lastVolume = volumes[volumes.length - 1];
      
      const signal = lastVolume > avgVolume * 1.2 ? 
                    (candles[candles.length - 1].close > candles[candles.length - 2].close ? "UP" : "DOWN") : 
                    "NEUTRAL";
      
      return {
        pattern: "SYMMETRICAL_TRIANGLE",
        signal: signal,
        confidence: 70,
        breakoutPoint: (peaks.peaks[peaks.peaks.length - 1] + peaks.troughs[peaks.troughs.length - 1]) / 2
      };
    }
    
    return null;
  }
  
  /**
   * التعرف على نمط القمة المزدوجة
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object|null} - معلومات النمط أو null إذا لم يتم العثور عليه
   */
  static doubleTop(candles) {
    if (candles.length < 5) return null;
    
    // استخراج القمم
    const peaks = this.findPeaksAndTroughs(candles);
    
    // البحث عن قمتين متقاربتين في القيمة
    if (peaks.peaks.length < 2) return null;
    
    const peak1 = peaks.peaks[peaks.peaks.length - 2];
    const peak2 = peaks.peaks[peaks.peaks.length - 1];
    const trough = peaks.troughs[peaks.troughs.length - 1];
    
    // التحقق من شروط النمط
    if (Math.abs(peak1 - peak2) / peak1 < 0.03 && 
        trough < Math.min(peak1, peak2) * 0.97) {
      
      return {
        pattern: "DOUBLE_TOP",
        signal: "DOWN",
        confidence: 75,
        neckline: trough,
        target: trough - (Math.max(peak1, peak2) - trough)
      };
    }
    
    return null;
  }
  
  /**
   * التعرف على نمط القاع المزدوج
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object|null} - معلومات النمط أو null إذا لم يتم العثور عليه
   */
  static doubleBottom(candles) {
    if (candles.length < 5) return null;
    
    // استخراج القيعان
    const peaks = this.findPeaksAndTroughs(candles);
    
    // البحث عن قاعين متقاربين في القيمة
    if (peaks.troughs.length < 2) return null;
    
    const trough1 = peaks.troughs[peaks.troughs.length - 2];
    const trough2 = peaks.troughs[peaks.troughs.length - 1];
    const peak = peaks.peaks[peaks.peaks.length - 1];
    
    // التحقق من شروط النمط
    if (Math.abs(trough1 - trough2) / trough1 < 0.03 && 
        peak > Math.max(trough1, trough2) * 1.03) {
      
      return {
        pattern: "DOUBLE_BOTTOM",
        signal: "UP",
        confidence: 75,
        neckline: peak,
        target: peak + (peak - Math.min(trough1, trough2))
      };
    }
    
    return null;
  }
  
  /**
   * البحث عن القمم والقيعان في مجموعة من الشموع
   * @private
   */
  static findPeaksAndTroughs(candles) {
    const peaks = [];
    const troughs = [];
    
    // استخدام أسعار الإغلاق للتبسيط
    const prices = candles.map(c => c.close);
    
    // البحث عن القمم والقيعان
    for (let i = 2; i < prices.length - 2; i++) {
      // القمة: السعر أعلى من السعرين السابقين واللاحقين
      if (prices[i] > prices[i-1] && prices[i] > prices[i-2] && 
          prices[i] > prices[i+1] && prices[i] > prices[i+2]) {
        peaks.push(prices[i]);
      }
      
      // القاع: السعر أقل من السعرين السابقين واللاحقين
      if (prices[i] < prices[i-1] && prices[i] < prices[i-2] && 
          prices[i] < prices[i+1] && prices[i] < prices[i+2]) {
        troughs.push(prices[i]);
      }
    }
    
    return { peaks, troughs };
  }
  
  /**
   * التحقق مما إذا كانت المصفوفة تنازلية
   * @private
   */
  static isDescending(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] >= arr[i-1]) return false;
    }
    return true;
  }
  
  /**
   * التحقق مما إذا كانت المصفوفة تصاعدية
   * @private
   */
  static isAscending(arr) {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] <= arr[i-1]) return false;
    }
    return true;
  }
  
  /**
   * تحليل جميع الأنماط المعروفة في مجموعة من الشموع
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Array<Object>} - مصفوفة من الأنماط المكتشفة
   */
  static analyzeAllPatterns(candles) {
    const patterns = [];
    
    // البحث عن جميع الأنماط المعروفة
    const headAndShoulders = this.headAndShoulders(candles);
    const inverseHeadAndShoulders = this.inverseHeadAndShoulders(candles);
    const symmetricalTriangle = this.symmetricalTriangle(candles);
    const doubleTop = this.doubleTop(candles);
    const doubleBottom = this.doubleBottom(candles);
    
    // إضافة الأنماط المكتشفة إلى المصفوفة
    if (headAndShoulders) patterns.push(headAndShoulders);
    if (inverseHeadAndShoulders) patterns.push(inverseHeadAndShoulders);
    if (symmetricalTriangle) patterns.push(symmetricalTriangle);
    if (doubleTop) patterns.push(doubleTop);
    if (doubleBottom) patterns.push(doubleBottom);
    
    // ترتيب الأنماط حسب الثقة
    patterns.sort((a, b) => b.confidence - a.confidence);
    
    return patterns;
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PatternRecognition };
}