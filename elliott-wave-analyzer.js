/**
 * محلل موجات إليوت
 * يقوم بتحليل الشارت باستخدام نظرية موجات إليوت
 */

class ElliottWaveAnalyzer {
  /**
   * تحليل موجات إليوت
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} period - الفترة للتحليل
   * @returns {Object} - نتائج تحليل موجات إليوت
   */
  static analyzeWaves(candles, period = 100) {
    // تحقق من وجود بيانات كافية
    if (candles.length < period) {
      return {
        wavePattern: "INSUFFICIENT_DATA",
        currentWave: 0,
        trend: "NEUTRAL",
        confidence: 0,
        nextMove: "NEUTRAL"
      };
    }

    // تحديد النقاط المحورية (القمم والقيعان)
    const pivotPoints = this.findPivotPoints(candles);
    
    // تحديد نمط الموجة
    const wavePattern = this.identifyWavePattern(pivotPoints);
    
    // تحديد الموجة الحالية
    const currentWave = this.determineCurrentWave(wavePattern, candles);
    
    // تحديد الاتجاه المتوقع
    const { trend, confidence, nextMove } = this.predictNextMove(wavePattern, currentWave, candles);
    
    return {
      wavePattern,
      currentWave,
      trend,
      confidence,
      nextMove,
      pivotPoints
    };
  }

  /**
   * البحث عن النقاط المحورية (القمم والقيعان)
   * @private
   */
  static findPivotPoints(candles) {
    const pivots = [];
    const lookback = 5; // عدد الشموع للنظر قبل وبعد النقطة
    
    for (let i = lookback; i < candles.length - lookback; i++) {
      // التحقق من القمة
      let isHigh = true;
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && candles[j].high >= candles[i].high) {
          isHigh = false;
          break;
        }
      }
      
      // التحقق من القاع
      let isLow = true;
      for (let j = i - lookback; j <= i + lookback; j++) {
        if (j !== i && candles[j].low <= candles[i].low) {
          isLow = false;
          break;
        }
      }
      
      if (isHigh) {
        pivots.push({
          type: "HIGH",
          price: candles[i].high,
          index: i,
          timestamp: candles[i].timestamp
        });
      }
      
      if (isLow) {
        pivots.push({
          type: "LOW",
          price: candles[i].low,
          index: i,
          timestamp: candles[i].timestamp
        });
      }
    }
    
    // ترتيب النقاط المحورية حسب الزمن
    pivots.sort((a, b) => a.index - b.index);
    
    return pivots;
  }

  /**
   * تحديد نمط موجات إليوت
   * @private
   */
  static identifyWavePattern(pivotPoints) {
    if (pivotPoints.length < 9) {
      return "UNDEFINED";
    }
    
    // تحليل آخر 9 نقاط محورية للتعرف على نمط الموجة
    const lastPivots = pivotPoints.slice(-9);
    
    // التحقق من نمط الموجة الدافعة (Impulse Wave)
    if (this.checkImpulseWavePattern(lastPivots)) {
      return "IMPULSE";
    }
    
    // التحقق من نمط الموجة التصحيحية (Corrective Wave)
    if (this.checkCorrectiveWavePattern(lastPivots)) {
      return "CORRECTIVE";
    }
    
    // التحقق من نمط المثلث (Triangle)
    if (this.checkTrianglePattern(lastPivots)) {
      return "TRIANGLE";
    }
    
    return "COMPLEX";
  }

  /**
   * التحقق من نمط الموجة الدافعة
   * @private
   */
  static checkImpulseWavePattern(pivots) {
    // في الموجة الدافعة، الموجات 1، 3، 5 تكون في اتجاه الترند الرئيسي
    // والموجات 2، 4 تكون تصحيحية
    
    // تبسيط: نتحقق من أن الموجات 1، 3، 5 لها نفس الاتجاه
    // والموجات 2، 4 لها الاتجاه المعاكس
    
    if (pivots.length < 9) return false;
    
    const wave1Direction = pivots[1].price > pivots[0].price ? "UP" : "DOWN";
    const wave2Direction = pivots[2].price > pivots[1].price ? "UP" : "DOWN";
    const wave3Direction = pivots[3].price > pivots[2].price ? "UP" : "DOWN";
    const wave4Direction = pivots[4].price > pivots[3].price ? "UP" : "DOWN";
    const wave5Direction = pivots[5].price > pivots[4].price ? "UP" : "DOWN";
    
    // التحقق من أن الموجات 1، 3، 5 لها نفس الاتجاه
    const mainDirection = wave1Direction;
    if (wave3Direction !== mainDirection || wave5Direction !== mainDirection) {
      return false;
    }
    
    // التحقق من أن الموجات 2، 4 لها الاتجاه المعاكس
    const correctiveDirection = mainDirection === "UP" ? "DOWN" : "UP";
    if (wave2Direction !== correctiveDirection || wave4Direction !== correctiveDirection) {
      return false;
    }
    
    // التحقق من أن الموجة 3 هي الأطول
    const wave1Length = Math.abs(pivots[1].price - pivots[0].price);
    const wave3Length = Math.abs(pivots[3].price - pivots[2].price);
    const wave5Length = Math.abs(pivots[5].price - pivots[4].price);
    
    if (wave3Length < wave1Length || wave3Length < wave5Length) {
      return false;
    }
    
    return true;
  }

  /**
   * التحقق من نمط الموجة التصحيحية
   * @private
   */
  static checkCorrectiveWavePattern(pivots) {
    // في الموجة التصحيحية، نبحث عن نمط A-B-C
    // حيث A و C في اتجاه التصحيح، و B في الاتجاه المعاكس
    
    if (pivots.length < 5) return false;
    
    const waveADirection = pivots[1].price > pivots[0].price ? "UP" : "DOWN";
    const waveBDirection = pivots[2].price > pivots[1].price ? "UP" : "DOWN";
    const waveCDirection = pivots[3].price > pivots[2].price ? "UP" : "DOWN";
    
    // التحقق من أن A و C لهما نفس الاتجاه
    if (waveCDirection !== waveADirection) {
      return false;
    }
    
    // التحقق من أن B له الاتجاه المعاكس
    const correctiveDirection = waveADirection === "UP" ? "DOWN" : "UP";
    if (waveBDirection !== correctiveDirection) {
      return false;
    }
    
    return true;
  }

  /**
   * التحقق من نمط المثلث
   * @private
   */
  static checkTrianglePattern(pivots) {
    // في نمط المثلث، تتقارب القمم والقيعان
    
    if (pivots.length < 6) return false;
    
    // التحقق من تقارب القمم
    const highPivots = pivots.filter(p => p.type === "HIGH");
    if (highPivots.length >= 3) {
      const isConverging = highPivots[highPivots.length - 1].price < highPivots[highPivots.length - 3].price;
      if (!isConverging) return false;
    }
    
    // التحقق من تقارب القيعان
    const lowPivots = pivots.filter(p => p.type === "LOW");
    if (lowPivots.length >= 3) {
      const isConverging = lowPivots[lowPivots.length - 1].price > lowPivots[lowPivots.length - 3].price;
      if (!isConverging) return false;
    }
    
    return true;
  }

  /**
   * تحديد الموجة الحالية
   * @private
   */
  static determineCurrentWave(wavePattern, candles) {
    // تبسيط: نفترض أننا في الموجة الأخيرة من النمط
    
    switch (wavePattern) {
      case "IMPULSE":
        return 5;
      case "CORRECTIVE":
        return 3; // C wave
      case "TRIANGLE":
        return 5; // E wave
      default:
        return 0;
    }
  }

  /**
   * التنبؤ بالحركة التالية
   * @private
   */
  static predictNextMove(wavePattern, currentWave, candles) {
    const lastCandle = candles[candles.length - 1];
    const prevCandle = candles[candles.length - 2];
    
    let trend = "NEUTRAL";
    let confidence = 0;
    let nextMove = "NEUTRAL";
    
    switch (wavePattern) {
      case "IMPULSE":
        if (currentWave === 5) {
          // بعد الموجة 5، نتوقع تصحيحًا
          trend = lastCandle.close > prevCandle.close ? "DOWN" : "UP";
          confidence = 70;
          nextMove = "CORRECTIVE";
        } else if (currentWave === 4) {
          // بعد الموجة 4، نتوقع الموجة 5
          trend = lastCandle.close > prevCandle.close ? "UP" : "DOWN";
          confidence = 80;
          nextMove = "IMPULSE_5";
        }
        break;
        
      case "CORRECTIVE":
        if (currentWave === 3) { // C wave
          // بعد الموجة C، نتوقع بداية موجة دافعة جديدة
          trend = lastCandle.close > prevCandle.close ? "UP" : "DOWN";
          confidence = 65;
          nextMove = "NEW_IMPULSE";
        }
        break;
        
      case "TRIANGLE":
        if (currentWave === 5) { // E wave
          // بعد الموجة E، نتوقع اختراقًا
          trend = lastCandle.close > prevCandle.close ? "UP" : "DOWN";
          confidence = 75;
          nextMove = "BREAKOUT";
        }
        break;
        
      default:
        trend = "NEUTRAL";
        confidence = 30;
        nextMove = "UNDEFINED";
    }
    
    return { trend, confidence, nextMove };
  }

  /**
   * تحليل موجات إليوت المتقدم
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object} - نتائج التحليل المتقدم
   */
  static advancedWaveAnalysis(candles) {
    // تحليل الموجات الأساسي
    const basicAnalysis = this.analyzeWaves(candles);
    
    // تحليل نسب فيبوناتشي للموجات
    const fibRatios = this.analyzeFibonacciRatios(basicAnalysis.pivotPoints);
    
    // تحديد مستويات الهدف المحتملة
    const targets = this.calculateWaveTargets(basicAnalysis, candles);
    
    // تحديد مستويات وقف الخسارة
    const stopLoss = this.calculateStopLoss(basicAnalysis, candles);
    
    return {
      ...basicAnalysis,
      fibRatios,
      targets,
      stopLoss
    };
  }

  /**
   * تحليل نسب فيبوناتشي للموجات
   * @private
   */
  static analyzeFibonacciRatios(pivotPoints) {
    if (pivotPoints.length < 5) {
      return { valid: false };
    }
    
    const ratios = {};
    
    // حساب نسب الموجات
    for (let i = 2; i < pivotPoints.length; i += 2) {
      const wave1Length = Math.abs(pivotPoints[i-2].price - pivotPoints[i-1].price);
      const wave2Length = Math.abs(pivotPoints[i-1].price - pivotPoints[i].price);
      
      if (wave1Length > 0) {
        ratios[`wave${i/2}`] = wave2Length / wave1Length;
      }
    }
    
    // التحقق من نسب فيبوناتشي النموذجية
    const isValid = Object.values(ratios).some(ratio => 
      Math.abs(ratio - 0.618) < 0.05 || 
      Math.abs(ratio - 0.5) < 0.05 || 
      Math.abs(ratio - 0.382) < 0.05 || 
      Math.abs(ratio - 1.618) < 0.05
    );
    
    return {
      valid: isValid,
      ratios
    };
  }

  /**
   * حساب مستويات الهدف المحتملة
   * @private
   */
  static calculateWaveTargets(analysis, candles) {
    const lastCandle = candles[candles.length - 1];
    const lastPrice = lastCandle.close;
    
    const targets = {
      conservative: lastPrice,
      moderate: lastPrice,
      aggressive: lastPrice
    };
    
    // تحديد الأهداف بناءً على نمط الموجة والموجة الحالية
    switch (analysis.wavePattern) {
      case "IMPULSE":
        if (analysis.currentWave === 3) {
          // هدف الموجة 3 عادة ما يكون 1.618 من الموجة 1
          const wave1Length = Math.abs(analysis.pivotPoints[1].price - analysis.pivotPoints[0].price);
          const direction = analysis.trend === "UP" ? 1 : -1;
          
          targets.conservative = lastPrice + direction * wave1Length * 1.382;
          targets.moderate = lastPrice + direction * wave1Length * 1.618;
          targets.aggressive = lastPrice + direction * wave1Length * 2.0;
        } else if (analysis.currentWave === 5) {
          // هدف الموجة 5 عادة ما يكون 0.618 من الموجة 1
          const wave1Length = Math.abs(analysis.pivotPoints[1].price - analysis.pivotPoints[0].price);
          const direction = analysis.trend === "UP" ? 1 : -1;
          
          targets.conservative = lastPrice + direction * wave1Length * 0.5;
          targets.moderate = lastPrice + direction * wave1Length * 0.618;
          targets.aggressive = lastPrice + direction * wave1Length * 1.0;
        }
        break;
        
      case "CORRECTIVE":
        if (analysis.currentWave === 2) { // B wave
          // هدف الموجة C عادة ما يكون 1.618 من الموجة A
          const waveALength = Math.abs(analysis.pivotPoints[1].price - analysis.pivotPoints[0].price);
          const direction = analysis.trend === "UP" ? 1 : -1;
          
          targets.conservative = lastPrice + direction * waveALength * 1.0;
          targets.moderate = lastPrice + direction * waveALength * 1.618;
          targets.aggressive = lastPrice + direction * waveALength * 2.0;
        }
        break;
    }
    
    return targets;
  }

  /**
   * حساب مستويات وقف الخسارة
   * @private
   */
  static calculateStopLoss(analysis, candles) {
    const lastCandle = candles[candles.length - 1];
    const lastPrice = lastCandle.close;
    
    // تحديد مستوى وقف الخسارة بناءً على نمط الموجة والموجة الحالية
    switch (analysis.wavePattern) {
      case "IMPULSE":
        if (analysis.currentWave === 3) {
          // وقف الخسارة للموجة 3 عادة ما يكون تحت الموجة 1
          return analysis.pivotPoints[1].price;
        } else if (analysis.currentWave === 5) {
          // وقف الخسارة للموجة 5 عادة ما يكون تحت الموجة 3
          return analysis.pivotPoints[3].price;
        }
        break;
        
      case "CORRECTIVE":
        if (analysis.currentWave === 2) { // B wave
          // وقف الخسارة للموجة B عادة ما يكون تحت/فوق بداية الموجة A
          return analysis.pivotPoints[0].price;
        }
        break;
    }
    
    // وقف خسارة افتراضي
    const atr = this.calculateATR(candles, 14);
    return analysis.trend === "UP" ? lastPrice - 2 * atr : lastPrice + 2 * atr;
  }

  /**
   * حساب مؤشر ATR
   * @private
   */
  static calculateATR(candles, period = 14) {
    if (candles.length < period) {
      return 0;
    }
    
    let sum = 0;
    for (let i = candles.length - period; i < candles.length; i++) {
      const trueRange = Math.max(
        candles[i].high - candles[i].low,
        Math.abs(candles[i].high - candles[i-1].close),
        Math.abs(candles[i].low - candles[i-1].close)
      );
      sum += trueRange;
    }
    
    return sum / period;
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ElliottWaveAnalyzer };
} else {
  // إنشاء كائن عالمي للاستخدام في المتصفح
  window.ElliottWaveAnalyzer = ElliottWaveAnalyzer;
}