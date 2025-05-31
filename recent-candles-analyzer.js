/**
 * محلل الشموع الأخيرة
 * يركز على تحليل الشموع الثلاث الأخيرة مع الاحتفاظ بتحليل باقي الشموع
 */

class RecentCandlesAnalyzer {
  /**
   * تحليل الشموع مع التركيز على الشموع الأخيرة
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} recentCount - عدد الشموع الأخيرة للتركيز عليها (افتراضيًا 3)
   * @returns {Object} - نتائج التحليل
   */
  static analyzeWithFocusOnRecent(candles, recentCount = 3) {
    if (!candles || candles.length === 0) {
      return {
        direction: "NEUTRAL",
        confidence: 50,
        pattern: "INSUFFICIENT_DATA"
      };
    }

    // تقسيم الشموع إلى مجموعتين: الأخيرة والسابقة
    const totalCandles = candles.length;
    const recentCandles = candles.slice(Math.max(0, totalCandles - recentCount));
    const previousCandles = candles.slice(0, Math.max(0, totalCandles - recentCount));
    
    // تحليل الشموع الأخيرة (وزن أكبر)
    const recentAnalysis = this.analyzeRecentCandles(recentCandles);
    
    // تحليل الشموع السابقة (وزن أقل)
    const previousAnalysis = this.analyzePreviousCandles(previousCandles);
    
    // دمج نتائج التحليل مع إعطاء وزن أكبر للشموع الأخيرة
    return this.mergeAnalysisResults(recentAnalysis, previousAnalysis);
  }
  
  /**
   * تحليل الشموع الأخيرة
   * @private
   */
  static analyzeRecentCandles(candles) {
    if (candles.length === 0) {
      return { direction: "NEUTRAL", confidence: 0, weight: 0 };
    }
    
    // تحليل اتجاه الشموع الأخيرة
    let upCount = 0;
    let downCount = 0;
    let neutralCount = 0;
    
    for (const candle of candles) {
      if (candle.close > candle.open) {
        upCount++;
      } else if (candle.close < candle.open) {
        downCount++;
      } else {
        neutralCount++;
      }
    }
    
    // تحديد الاتجاه بناءً على الشموع الأخيرة
    let direction = "NEUTRAL";
    let confidence = 50;
    
    if (upCount > downCount) {
      direction = "UP";
      confidence = Math.min(100, 50 + (upCount / candles.length) * 50);
    } else if (downCount > upCount) {
      direction = "DOWN";
      confidence = Math.min(100, 50 + (downCount / candles.length) * 50);
    }
    
    // تحليل أنماط الشموع الأخيرة
    const pattern = this.detectCandlePattern(candles);
    if (pattern) {
      // تعديل الاتجاه والثقة بناءً على النمط
      if (pattern.direction !== "NEUTRAL") {
        direction = pattern.direction;
        confidence = Math.min(100, confidence + pattern.confidence * 0.3);
      }
    }
    
    // تحليل قوة الشموع الأخيرة
    const strength = this.analyzeCandleStrength(candles);
    confidence = Math.min(100, confidence + strength * 0.2);
    
    return {
      direction,
      confidence,
      pattern: pattern ? pattern.name : "NO_SPECIFIC_PATTERN",
      weight: 0.7 // وزن الشموع الأخيرة (70%)
    };
  }
  
  /**
   * تحليل الشموع السابقة
   * @private
   */
  static analyzePreviousCandles(candles) {
    if (candles.length === 0) {
      return { direction: "NEUTRAL", confidence: 0, weight: 0 };
    }
    
    // تحليل الاتجاه العام للشموع السابقة
    const firstPrice = candles[0].close;
    const lastPrice = candles[candles.length - 1].close;
    
    let direction = "NEUTRAL";
    let confidence = 50;
    
    if (lastPrice > firstPrice) {
      direction = "UP";
      confidence = Math.min(100, 50 + (lastPrice - firstPrice) / firstPrice * 100);
    } else if (lastPrice < firstPrice) {
      direction = "DOWN";
      confidence = Math.min(100, 50 + (firstPrice - lastPrice) / firstPrice * 100);
    }
    
    // تحليل التذبذب في الشموع السابقة
    const volatility = this.calculateVolatility(candles);
    
    // تعديل الثقة بناءً على التذبذب
    confidence = Math.max(30, confidence - volatility * 10);
    
    return {
      direction,
      confidence,
      weight: 0.3 // وزن الشموع السابقة (30%)
    };
  }
  
  /**
   * دمج نتائج التحليل
   * @private
   */
  static mergeAnalysisResults(recentAnalysis, previousAnalysis) {
    // حساب الاتجاه المرجح
    const directions = {
      UP: 0,
      DOWN: 0,
      NEUTRAL: 0
    };
    
    // إضافة وزن الشموع الأخيرة
    directions[recentAnalysis.direction] += (recentAnalysis.confidence / 100) * recentAnalysis.weight;
    
    // إضافة وزن الشموع السابقة
    directions[previousAnalysis.direction] += (previousAnalysis.confidence / 100) * previousAnalysis.weight;
    
    // تحديد الاتجاه النهائي
    let finalDirection = "NEUTRAL";
    let maxWeight = directions.NEUTRAL;
    
    if (directions.UP > maxWeight) {
      finalDirection = "UP";
      maxWeight = directions.UP;
    }
    
    if (directions.DOWN > maxWeight) {
      finalDirection = "DOWN";
      maxWeight = directions.DOWN;
    }
    
    // حساب مستوى الثقة النهائي
    const totalWeight = directions.UP + directions.DOWN + directions.NEUTRAL;
    const finalConfidence = Math.round((maxWeight / totalWeight) * 100);
    
    return {
      direction: finalDirection,
      confidence: finalConfidence,
      pattern: recentAnalysis.pattern,
      recentAnalysis,
      previousAnalysis
    };
  }
  
  /**
   * اكتشاف نمط الشموع
   * @private
   */
  static detectCandlePattern(candles) {
    if (candles.length < 2) {
      return null;
    }
    
    // الشموع الأخيرة
    const last = candles[candles.length - 1];
    const prev = candles[candles.length - 2];
    const prevPrev = candles.length > 2 ? candles[candles.length - 3] : null;
    
    // نمط البلع الصاعد
    if (prev.close < prev.open && last.close > last.open && 
        last.open <= prev.close && last.close > prev.open) {
      return { name: "BULLISH_ENGULFING", direction: "UP", confidence: 80 };
    }
    
    // نمط البلع الهابط
    if (prev.close > prev.open && last.close < last.open && 
        last.open >= prev.close && last.close < prev.open) {
      return { name: "BEARISH_ENGULFING", direction: "DOWN", confidence: 80 };
    }
    
    // نمط الدوجي
    if (Math.abs(last.close - last.open) / (last.high - last.low) < 0.1) {
      if (prevPrev && prev.close > prev.open && prevPrev.close > prevPrev.open) {
        return { name: "DOJI_AFTER_UPTREND", direction: "DOWN", confidence: 70 };
      } else if (prevPrev && prev.close < prev.open && prevPrev.close < prevPrev.open) {
        return { name: "DOJI_AFTER_DOWNTREND", direction: "UP", confidence: 70 };
      } else {
        return { name: "DOJI", direction: "NEUTRAL", confidence: 50 };
      }
    }
    
    // نمط المطرقة (في اتجاه هابط)
    if (last.close > last.open && 
        (last.high - last.close) / (last.high - last.low) < 0.2 && 
        (last.open - last.low) / (last.high - last.low) > 0.6 &&
        prev.close < prev.open) {
      return { name: "HAMMER", direction: "UP", confidence: 75 };
    }
    
    // نمط النجمة المطلقة (في اتجاه صاعد)
    if (last.close < last.open && 
        (last.high - last.open) / (last.high - last.low) > 0.6 && 
        (last.close - last.low) / (last.high - last.low) < 0.2 &&
        prev.close > prev.open) {
      return { name: "SHOOTING_STAR", direction: "DOWN", confidence: 75 };
    }
    
    // نمط نجمة الصباح
    if (prevPrev && prevPrev.close < prevPrev.open && 
        Math.abs(prev.close - prev.open) / (prev.high - prev.low) < 0.3 &&
        last.close > last.open && last.close > prev.high) {
      return { name: "MORNING_STAR", direction: "UP", confidence: 85 };
    }
    
    // نمط نجمة المساء
    if (prevPrev && prevPrev.close > prevPrev.open && 
        Math.abs(prev.close - prev.open) / (prev.high - prev.low) < 0.3 &&
        last.close < last.open && last.close < prev.low) {
      return { name: "EVENING_STAR", direction: "DOWN", confidence: 85 };
    }
    
    return null;
  }
  
  /**
   * تحليل قوة الشموع
   * @private
   */
  static analyzeCandleStrength(candles) {
    if (candles.length === 0) {
      return 0;
    }
    
    // الشمعة الأخيرة
    const last = candles[candles.length - 1];
    
    // حساب طول جسم الشمعة نسبة إلى الطول الكلي
    const bodyLength = Math.abs(last.close - last.open);
    const totalLength = last.high - last.low;
    
    if (totalLength === 0) {
      return 0;
    }
    
    const bodyRatio = bodyLength / totalLength;
    
    // حساب قوة الشمعة
    let strength = bodyRatio * 50; // 0-50 بناءً على نسبة الجسم
    
    // إضافة قوة إضافية بناءً على حجم الشمعة مقارنة بالشموع السابقة
    if (candles.length > 1) {
      const prevCandle = candles[candles.length - 2];
      const prevBodyLength = Math.abs(prevCandle.close - prevCandle.open);
      
      if (bodyLength > prevBodyLength * 1.5) {
        strength += 20; // شمعة أكبر بكثير من السابقة
      } else if (bodyLength > prevBodyLength * 1.2) {
        strength += 10; // شمعة أكبر من السابقة
      }
    }
    
    return Math.min(50, strength);
  }
  
  /**
   * حساب التذبذب
   * @private
   */
  static calculateVolatility(candles) {
    if (candles.length < 2) {
      return 0;
    }
    
    let sumChanges = 0;
    
    for (let i = 1; i < candles.length; i++) {
      const prevClose = candles[i - 1].close;
      const currentClose = candles[i].close;
      
      sumChanges += Math.abs(currentClose - prevClose) / prevClose;
    }
    
    return sumChanges / (candles.length - 1);
  }
}

// إضافة محلل الشموع الأخيرة للنافذة
window.RecentCandlesAnalyzer = RecentCandlesAnalyzer;