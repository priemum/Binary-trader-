/**
 * مؤشرات الشارت المتقدمة
 * يتضمن مؤشرات Heiken Ashi و Renko و Market Profile و Order Flow
 */

class AdvancedChartIndicators {
  /**
   * حساب شموع Heiken Ashi
   * @param {Array<Object>} candles - مصفوفة الشموع العادية
   * @returns {Array<Object>} - مصفوفة شموع Heiken Ashi
   */
  static calculateHeikenAshi(candles) {
    if (candles.length === 0) return [];
    
    const haCandles = [];
    
    // الشمعة الأولى
    const firstHA = {
      timestamp: candles[0].timestamp,
      open: (candles[0].open + candles[0].close) / 2,
      close: (candles[0].open + candles[0].high + candles[0].low + candles[0].close) / 4,
      high: candles[0].high,
      low: candles[0].low
    };
    haCandles.push(firstHA);
    
    // باقي الشموع
    for (let i = 1; i < candles.length; i++) {
      const prevHA = haCandles[i-1];
      const currentCandle = candles[i];
      
      const haOpen = (prevHA.open + prevHA.close) / 2;
      const haClose = (currentCandle.open + currentCandle.high + currentCandle.low + currentCandle.close) / 4;
      const haHigh = Math.max(currentCandle.high, haOpen, haClose);
      const haLow = Math.min(currentCandle.low, haOpen, haClose);
      
      haCandles.push({
        timestamp: currentCandle.timestamp,
        open: haOpen,
        close: haClose,
        high: haHigh,
        low: haLow
      });
    }
    
    return haCandles;
  }
  
  /**
   * تحليل اتجاه السوق باستخدام Heiken Ashi
   * @param {Array<Object>} candles - مصفوفة الشموع العادية
   * @returns {Object} - نتائج التحليل
   */
  static analyzeHeikenAshi(candles) {
    const haCandles = this.calculateHeikenAshi(candles);
    if (haCandles.length < 3) {
      return { trend: "NEUTRAL", strength: 0, signal: "NEUTRAL" };
    }
    
    // تحليل آخر 3 شموع
    const last3 = haCandles.slice(-3);
    
    // عدد الشموع الصاعدة والهابطة
    let bullishCount = 0;
    let bearishCount = 0;
    
    for (const candle of last3) {
      if (candle.close > candle.open) {
        bullishCount++;
      } else if (candle.close < candle.open) {
        bearishCount++;
      }
    }
    
    // تحديد الاتجاه
    let trend = "NEUTRAL";
    let strength = 0;
    let signal = "NEUTRAL";
    
    if (bullishCount === 3) {
      // اتجاه صاعد قوي
      trend = "UP";
      strength = 90;
      signal = "UP";
    } else if (bullishCount === 2) {
      // اتجاه صاعد
      trend = "UP";
      strength = 70;
      signal = "UP";
    } else if (bearishCount === 3) {
      // اتجاه هابط قوي
      trend = "DOWN";
      strength = 90;
      signal = "DOWN";
    } else if (bearishCount === 2) {
      // اتجاه هابط
      trend = "DOWN";
      strength = 70;
      signal = "DOWN";
    }
    
    // التحقق من حجم الظلال
    const lastCandle = last3[2];
    const hasShadows = (lastCandle.high - lastCandle.close) > 0.0005 || (lastCandle.open - lastCandle.low) > 0.0005;
    
    if (hasShadows) {
      strength -= 10; // تقليل قوة الإشارة إذا كانت هناك ظلال كبيرة
    }
    
    return { trend, strength, signal };
  }
  
  /**
   * إنشاء شموع Renko
   * @param {Array<Object>} candles - مصفوفة الشموع العادية
   * @param {number} brickSize - حجم الطوب (بالنقاط أو النسبة المئوية)
   * @param {boolean} useATR - استخدام ATR لتحديد حجم الطوب
   * @param {number} atrPeriod - فترة ATR
   * @returns {Array<Object>} - مصفوفة شموع Renko
   */
  static calculateRenko(candles, brickSize = 0.0010, useATR = false, atrPeriod = 14) {
    if (candles.length === 0) return [];
    
    // حساب حجم الطوب باستخدام ATR إذا تم تحديد ذلك
    if (useATR && candles.length >= atrPeriod) {
      brickSize = this.calculateATR(candles, atrPeriod);
    }
    
    const renkoCandles = [];
    let currentPrice = candles[0].close;
    let currentDirection = 0; // 0: محايد، 1: صاعد، -1: هابط
    
    // إنشاء أول شمعة Renko
    renkoCandles.push({
      timestamp: candles[0].timestamp,
      open: currentPrice,
      close: currentPrice,
      high: currentPrice,
      low: currentPrice,
      direction: currentDirection
    });
    
    // معالجة باقي الشموع
    for (let i = 1; i < candles.length; i++) {
      const candle = candles[i];
      
      // التحقق من وجود حركة كافية لإنشاء طوب جديد
      while (Math.abs(candle.close - currentPrice) >= brickSize) {
        const prevRenko = renkoCandles[renkoCandles.length - 1];
        
        if (candle.close > currentPrice) {
          // طوب صاعد
          currentPrice += brickSize;
          currentDirection = 1;
          
          renkoCandles.push({
            timestamp: candle.timestamp,
            open: currentPrice - brickSize,
            close: currentPrice,
            high: currentPrice,
            low: currentPrice - brickSize,
            direction: currentDirection
          });
        } else {
          // طوب هابط
          currentPrice -= brickSize;
          currentDirection = -1;
          
          renkoCandles.push({
            timestamp: candle.timestamp,
            open: currentPrice + brickSize,
            close: currentPrice,
            high: currentPrice + brickSize,
            low: currentPrice,
            direction: currentDirection
          });
        }
      }
    }
    
    return renkoCandles;
  }
  
  /**
   * تحليل اتجاه السوق باستخدام Renko
   * @param {Array<Object>} candles - مصفوفة الشموع العادية
   * @param {number} brickSize - حجم الطوب
   * @returns {Object} - نتائج التحليل
   */
  static analyzeRenko(candles, brickSize = 0.0010) {
    const renkoCandles = this.calculateRenko(candles, brickSize);
    if (renkoCandles.length < 3) {
      return { trend: "NEUTRAL", strength: 0, signal: "NEUTRAL" };
    }
    
    // تحليل آخر 5 شموع Renko
    const lastN = Math.min(5, renkoCandles.length);
    const lastRenkos = renkoCandles.slice(-lastN);
    
    // عدد الطوب الصاعدة والهابطة
    let bullishCount = 0;
    let bearishCount = 0;
    
    for (const renko of lastRenkos) {
      if (renko.direction === 1) {
        bullishCount++;
      } else if (renko.direction === -1) {
        bearishCount++;
      }
    }
    
    // تحديد الاتجاه
    let trend = "NEUTRAL";
    let strength = 0;
    let signal = "NEUTRAL";
    
    if (bullishCount === lastN) {
      // اتجاه صاعد قوي
      trend = "UP";
      strength = 95;
      signal = "UP";
    } else if (bullishCount >= lastN * 0.8) {
      // اتجاه صاعد
      trend = "UP";
      strength = 80;
      signal = "UP";
    } else if (bearishCount === lastN) {
      // اتجاه هابط قوي
      trend = "DOWN";
      strength = 95;
      signal = "DOWN";
    } else if (bearishCount >= lastN * 0.8) {
      // اتجاه هابط
      trend = "DOWN";
      strength = 80;
      signal = "DOWN";
    } else if (bullishCount > bearishCount) {
      // اتجاه صاعد ضعيف
      trend = "UP";
      strength = 60;
      signal = "UP";
    } else if (bearishCount > bullishCount) {
      // اتجاه هابط ضعيف
      trend = "DOWN";
      strength = 60;
      signal = "DOWN";
    }
    
    return { trend, strength, signal };
  }
  
  /**
   * حساب مؤشر Market Profile
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} priceIncrement - الزيادة في السعر لكل مستوى
   * @returns {Object} - بيانات Market Profile
   */
  static calculateMarketProfile(candles, priceIncrement = 0.0005) {
    if (candles.length === 0) return { levels: {}, poc: 0, valueArea: { high: 0, low: 0 } };
    
    // تحديد نطاق السعر
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    
    for (const candle of candles) {
      minPrice = Math.min(minPrice, candle.low);
      maxPrice = Math.max(maxPrice, candle.high);
    }
    
    // تقريب الحدود
    minPrice = Math.floor(minPrice / priceIncrement) * priceIncrement;
    maxPrice = Math.ceil(maxPrice / priceIncrement) * priceIncrement;
    
    // إنشاء مستويات السعر
    const levels = {};
    for (let price = minPrice; price <= maxPrice; price += priceIncrement) {
      levels[price.toFixed(5)] = {
        price: price,
        volume: 0,
        timeSpent: 0
      };
    }
    
    // حساب الحجم والوقت المستغرق عند كل مستوى سعر
    for (const candle of candles) {
      // تقدير عدد المستويات التي تم تداولها في هذه الشمعة
      const tradedLevels = [];
      for (let price = Math.floor(candle.low / priceIncrement) * priceIncrement; 
           price <= Math.ceil(candle.high / priceIncrement) * priceIncrement; 
           price += priceIncrement) {
        const priceKey = price.toFixed(5);
        if (levels[priceKey]) {
          tradedLevels.push(priceKey);
        }
      }
      
      // توزيع الحجم والوقت على المستويات المتداولة
      const volumePerLevel = candle.volume ? candle.volume / tradedLevels.length : 1;
      const timePerLevel = 1 / tradedLevels.length; // وحدة زمنية واحدة لكل شمعة
      
      for (const priceKey of tradedLevels) {
        levels[priceKey].volume += volumePerLevel;
        levels[priceKey].timeSpent += timePerLevel;
      }
    }
    
    // تحويل المستويات إلى مصفوفة وترتيبها حسب الحجم
    const levelsArray = Object.values(levels);
    levelsArray.sort((a, b) => b.volume - a.volume);
    
    // تحديد نقطة التحكم (POC) - المستوى ذو أعلى حجم
    const poc = levelsArray[0].price;
    
    // حساب منطقة القيمة (70% من الحجم الإجمالي)
    const totalVolume = levelsArray.reduce((sum, level) => sum + level.volume, 0);
    const valueAreaThreshold = totalVolume * 0.7;
    
    let cumulativeVolume = 0;
    let valueAreaLevels = [];
    
    for (const level of levelsArray) {
      cumulativeVolume += level.volume;
      valueAreaLevels.push(level.price);
      
      if (cumulativeVolume >= valueAreaThreshold) {
        break;
      }
    }
    
    // تحديد حدود منطقة القيمة
    const valueAreaHigh = Math.max(...valueAreaLevels);
    const valueAreaLow = Math.min(...valueAreaLevels);
    
    return {
      levels,
      poc,
      valueArea: {
        high: valueAreaHigh,
        low: valueAreaLow
      }
    };
  }
  
  /**
   * تحليل Market Profile
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object} - نتائج التحليل
   */
  static analyzeMarketProfile(candles) {
    const marketProfile = this.calculateMarketProfile(candles);
    if (!marketProfile.poc) {
      return { signal: "NEUTRAL", strength: 0, supportResistance: [] };
    }
    
    const lastPrice = candles[candles.length - 1].close;
    
    // تحديد الإشارة بناءً على موقع السعر الحالي من POC ومنطقة القيمة
    let signal = "NEUTRAL";
    let strength = 0;
    
    if (lastPrice > marketProfile.valueArea.high) {
      // السعر فوق منطقة القيمة - إشارة صعود
      signal = "UP";
      strength = 70;
    } else if (lastPrice < marketProfile.valueArea.low) {
      // السعر تحت منطقة القيمة - إشارة هبوط
      signal = "DOWN";
      strength = 70;
    } else if (lastPrice > marketProfile.poc) {
      // السعر فوق POC ولكن داخل منطقة القيمة
      signal = "UP";
      strength = 60;
    } else if (lastPrice < marketProfile.poc) {
      // السعر تحت POC ولكن داخل منطقة القيمة
      signal = "DOWN";
      strength = 60;
    } else {
      // السعر عند POC
      signal = "NEUTRAL";
      strength = 50;
    }
    
    // تحديد مستويات الدعم والمقاومة
    const supportResistance = [
      { price: marketProfile.valueArea.high, type: "RESISTANCE", strength: 80 },
      { price: marketProfile.poc, type: "RESISTANCE", strength: 90 },
      { price: marketProfile.valueArea.low, type: "SUPPORT", strength: 80 }
    ];
    
    return { signal, strength, supportResistance };
  }
  
  /**
   * محاكاة تحليل Order Flow
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object} - نتائج تحليل Order Flow
   */
  static analyzeOrderFlow(candles) {
    if (candles.length < 5) {
      return { buyPressure: 0, sellPressure: 0, signal: "NEUTRAL", strength: 0 };
    }
    
    // في التطبيق الحقيقي، هنا سيتم تحليل بيانات Order Flow الفعلية
    // لكن بما أن هذه البيانات غير متوفرة عادة في صور الشارت، سنقوم بمحاكاة التحليل
    
    const lastCandles = candles.slice(-5);
    
    // حساب ضغط الشراء والبيع بناءً على حجم الشموع واتجاهها
    let buyVolume = 0;
    let sellVolume = 0;
    
    for (const candle of lastCandles) {
      const volume = candle.volume || 1; // استخدام 1 إذا كان الحجم غير متوفر
      
      if (candle.close > candle.open) {
        // شمعة صاعدة
        buyVolume += volume * (candle.close - candle.open) / (candle.high - candle.low);
      } else if (candle.close < candle.open) {
        // شمعة هابطة
        sellVolume += volume * (candle.open - candle.close) / (candle.high - candle.low);
      }
    }
    
    // حساب إجمالي الحجم
    const totalVolume = buyVolume + sellVolume;
    
    // حساب ضغط الشراء والبيع كنسبة مئوية
    const buyPressure = totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50;
    const sellPressure = totalVolume > 0 ? (sellVolume / totalVolume) * 100 : 50;
    
    // تحديد الإشارة بناءً على ضغط الشراء والبيع
    let signal = "NEUTRAL";
    let strength = 0;
    
    if (buyPressure > 65) {
      signal = "UP";
      strength = buyPressure;
    } else if (sellPressure > 65) {
      signal = "DOWN";
      strength = sellPressure;
    } else {
      signal = "NEUTRAL";
      strength = 50;
    }
    
    // تحليل الدلتا (الفرق بين ضغط الشراء والبيع)
    const delta = buyPressure - sellPressure;
    
    // تحليل تدفق الأوامر في آخر شمعة
    const lastCandle = lastCandles[lastCandles.length - 1];
    const lastCandleBuyPressure = lastCandle.close > lastCandle.open ? 70 : 30;
    
    return {
      buyPressure,
      sellPressure,
      delta,
      signal,
      strength,
      lastCandleBuyPressure
    };
  }
  
  /**
   * حساب مؤشر ATR
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} period - الفترة
   * @returns {number} - قيمة ATR
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
  
  /**
   * تحليل متكامل باستخدام جميع المؤشرات المتقدمة
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Object} - نتائج التحليل المتكامل
   */
  static integratedAdvancedAnalysis(candles) {
    // تحليل Heiken Ashi
    const heikenAshiAnalysis = this.analyzeHeikenAshi(candles);
    
    // تحليل Renko
    const renkoAnalysis = this.analyzeRenko(candles);
    
    // تحليل Market Profile
    const marketProfileAnalysis = this.analyzeMarketProfile(candles);
    
    // تحليل Order Flow
    const orderFlowAnalysis = this.analyzeOrderFlow(candles);
    
    // دمج نتائج التحليل
    const signals = {
      UP: 0,
      DOWN: 0,
      NEUTRAL: 0
    };
    
    // إضافة وزن Heiken Ashi
    signals[heikenAshiAnalysis.signal] += (heikenAshiAnalysis.strength / 100) * 0.3;
    
    // إضافة وزن Renko
    signals[renkoAnalysis.signal] += (renkoAnalysis.strength / 100) * 0.3;
    
    // إضافة وزن Market Profile
    signals[marketProfileAnalysis.signal] += (marketProfileAnalysis.strength / 100) * 0.2;
    
    // إضافة وزن Order Flow
    signals[orderFlowAnalysis.signal] += (orderFlowAnalysis.strength / 100) * 0.2;
    
    // تحديد الإشارة النهائية
    let finalSignal = "NEUTRAL";
    let maxWeight = signals.NEUTRAL;
    
    if (signals.UP > maxWeight) {
      finalSignal = "UP";
      maxWeight = signals.UP;
    }
    
    if (signals.DOWN > maxWeight) {
      finalSignal = "DOWN";
      maxWeight = signals.DOWN;
    }
    
    // حساب قوة الإشارة النهائية
    const totalWeight = signals.UP + signals.DOWN + signals.NEUTRAL;
    const finalStrength = Math.round((maxWeight / totalWeight) * 100);
    
    // تحديد مستويات الدعم والمقاومة
    const supportResistance = marketProfileAnalysis.supportResistance || [];
    
    return {
      signal: finalSignal,
      strength: finalStrength,
      supportResistance,
      details: {
        heikenAshiAnalysis,
        renkoAnalysis,
        marketProfileAnalysis,
        orderFlowAnalysis
      }
    };
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdvancedChartIndicators };
} else {
  // إنشاء كائن عالمي للاستخدام في المتصفح
  window.AdvancedChartIndicators = AdvancedChartIndicators;
}