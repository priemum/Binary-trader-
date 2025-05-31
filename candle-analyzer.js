/**
 * محلل الشموع
 * يقوم بتحليل الشموع المستخرجة من صور الشارت
 */

/**
 * تحليل اتجاه السوق من الشموع
 * @param {Array} candles - مصفوفة الشموع
 * @returns {Object} - معلومات الاتجاه
 */
function analyzeTrend(candles) {
  if (!candles || candles.length < 2) {
    return { direction: "NEUTRAL", strength: 50, confidence: 50 };
  }
  
  // حساب متوسط التغير
  let totalChange = 0;
  for (let i = 1; i < candles.length; i++) {
    totalChange += (candles[i].close - candles[i].open) / candles[i].open;
  }
  
  const avgChange = totalChange / (candles.length - 1);
  const direction = avgChange > 0 ? "UP" : avgChange < 0 ? "DOWN" : "NEUTRAL";
  
  // حساب قوة الاتجاه
  const changes = [];
  for (let i = 1; i < candles.length; i++) {
    changes.push((candles[i].close - candles[i].open) / candles[i].open);
  }
  
  // حساب الانحراف المعياري للتغيرات
  const mean = changes.reduce((a, b) => a + b, 0) / changes.length;
  const variance = changes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / changes.length;
  const stdDev = Math.sqrt(variance);
  
  // حساب قوة الاتجاه والثقة
  const strength = Math.min(Math.round(Math.abs(avgChange) * 5000 + 50), 95);
  const confidence = Math.min(Math.round(strength * (1 - stdDev * 10)), 95);
  
  // تحديد وصف الاتجاه
  let description;
  if (direction === "UP") {
    description = strength > 80 ? "اتجاه صاعد قوي" : strength > 60 ? "اتجاه صاعد" : "اتجاه صاعد ضعيف";
  } else if (direction === "DOWN") {
    description = strength > 80 ? "اتجاه هابط قوي" : strength > 60 ? "اتجاه هابط" : "اتجاه هابط ضعيف";
  } else {
    description = "اتجاه محايد";
  }
  
  return {
    direction,
    strength,
    confidence,
    description
  };
}

/**
 * البحث عن مستويات الدعم والمقاومة
 * @param {Array} candles - مصفوفة الشموع
 * @param {number} levels - عدد المستويات المطلوبة
 * @returns {Object} - مستويات الدعم والمقاومة
 */
function findSupportResistanceLevels(candles, levels = 3) {
  if (!candles || candles.length < 5) {
    return { resistance: [], support: [] };
  }
  
  // استخراج جميع الأسعار
  const prices = [];
  candles.forEach(candle => {
    prices.push(candle.high);
    prices.push(candle.low);
  });
  
  // ترتيب الأسعار تصاعديًا
  prices.sort((a, b) => a - b);
  
  // تقسيم النطاق إلى مناطق
  const min = prices[0];
  const max = prices[prices.length - 1];
  const range = max - min;
  const step = range / (levels * 2);
  
  // البحث عن تجمعات الأسعار
  const clusters = [];
  for (let i = 0; i < levels * 2; i++) {
    const lowerBound = min + i * step;
    const upperBound = lowerBound + step;
    
    // عدد الأسعار في هذا النطاق
    const count = prices.filter(p => p >= lowerBound && p < upperBound).length;
    
    clusters.push({
      price: (lowerBound + upperBound) / 2,
      count: count,
      strength: Math.min(Math.round(count / prices.length * 10), 5)
    });
  }
  
  // ترتيب التجمعات حسب عدد الأسعار
  clusters.sort((a, b) => b.count - a.count);
  
  // تحديد آخر سعر
  const lastPrice = candles[candles.length - 1].close;
  
  // تقسيم المستويات إلى دعم ومقاومة
  const resistance = [];
  const support = [];
  
  clusters.forEach(cluster => {
    if (cluster.price > lastPrice) {
      resistance.push({
        price: parseFloat(cluster.price.toFixed(4)),
        strength: cluster.strength
      });
    } else {
      support.push({
        price: parseFloat(cluster.price.toFixed(4)),
        strength: cluster.strength
      });
    }
  });
  
  // ترتيب المستويات حسب المسافة من السعر الحالي
  resistance.sort((a, b) => a.price - b.price);
  support.sort((a, b) => b.price - a.price);
  
  // اختيار أفضل المستويات
  return {
    resistance: resistance.slice(0, levels),
    support: support.slice(0, levels)
  };
}

/**
 * اكتشاف نمط الشموع
 * @param {Array} candles - مصفوفة الشموع
 * @returns {string} - نمط الشموع
 */
function detectCandlePattern(candles) {
  if (!candles || candles.length < 2) {
    return "UNKNOWN";
  }
  
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  
  // نمط البلع الصاعد
  if (last.close > last.open && prev.close < prev.open &&
      last.open < prev.close && last.close > prev.open) {
    return "BULLISH_ENGULFING";
  }
  
  // نمط البلع الهابط
  if (last.close < last.open && prev.close > prev.open &&
      last.open > prev.close && last.close < prev.open) {
    return "BEARISH_ENGULFING";
  }
  
  // نمط الدوجي
  if (Math.abs(last.close - last.open) < (last.high - last.low) * 0.1) {
    return "DOJI";
  }
  
  // نمط المطرقة
  if (last.close > last.open && 
      (last.high - last.close) < (last.open - last.low) * 0.3 &&
      (last.open - last.low) > (last.close - last.open) * 2) {
    return "HAMMER";
  }
  
  // نمط النجمة المطلقة
  if (last.close < last.open && 
      (last.high - last.open) > (last.close - last.low) * 2 &&
      (last.close - last.low) < (last.open - last.close) * 0.3) {
    return "SHOOTING_STAR";
  }
  
  // نمط نجمة الصباح
  if (candles.length >= 3) {
    const prevPrev = candles[candles.length - 3];
    if (prevPrev.close < prevPrev.open && // شمعة هابطة
        Math.abs(prev.close - prev.open) < (prev.high - prev.low) * 0.3 && // دوجي
        last.close > last.open && // شمعة صاعدة
        last.close > prevPrev.open) {
      return "MORNING_STAR";
    }
  }
  
  // نمط نجمة المساء
  if (candles.length >= 3) {
    const prevPrev = candles[candles.length - 3];
    if (prevPrev.close > prevPrev.open && // شمعة صاعدة
        Math.abs(prev.close - prev.open) < (prev.high - prev.low) * 0.3 && // دوجي
        last.close < last.open && // شمعة هابطة
        last.close < prevPrev.open) {
      return "EVENING_STAR";
    }
  }
  
  // نمط مبني على الاتجاه
  return "TREND_BASED";
}

/**
 * حساب المؤشرات الفنية
 * @param {Array} candles - مصفوفة الشموع
 * @returns {Object} - المؤشرات الفنية
 */
function calculateIndicators(candles) {
  if (!candles || candles.length < 10) {
    return {
      rsi: 50,
      macd: 0,
      bollingerPosition: 0.5,
      mfi: 50,
      sma5: 0,
      sma10: 0
    };
  }
  
  // استخراج أسعار الإغلاق
  const closes = candles.map(c => c.close);
  
  // حساب المتوسطات المتحركة
  const sma5 = calculateSMA(closes, 5);
  const sma10 = calculateSMA(closes, 10);
  
  // حساب مؤشر القوة النسبية (RSI)
  const rsi = calculateRSI(closes, 14);
  
  // حساب مؤشر تقارب وتباعد المتوسطات المتحركة (MACD)
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macd = ema12 - ema26;
  
  // حساب موقع السعر من نطاق بولينجر
  const stdDev = calculateStdDev(closes, 20);
  const sma20 = calculateSMA(closes, 20);
  const upperBand = sma20 + stdDev * 2;
  const lowerBand = sma20 - stdDev * 2;
  const lastClose = closes[closes.length - 1];
  const bollingerPosition = (lastClose - lowerBand) / (upperBand - lowerBand);
  
  // حساب مؤشر تدفق الأموال (MFI)
  const mfi = calculateMFI(candles, 14);
  
  return {
    rsi: Math.round(rsi),
    macd: parseFloat(macd.toFixed(4)),
    bollingerPosition: parseFloat(bollingerPosition.toFixed(2)),
    mfi: Math.round(mfi),
    sma5: parseFloat(sma5.toFixed(4)),
    sma10: parseFloat(sma10.toFixed(4))
  };
}

/**
 * تحليل احتمالية الاختراق
 * @param {Array} candles - مصفوفة الشموع
 * @param {Object} supportResistance - مستويات الدعم والمقاومة
 * @param {Object} trend - معلومات الاتجاه
 * @returns {Object} - تحليل الاختراق
 */
function analyzeBreakout(candles, supportResistance, trend) {
  if (!candles || candles.length < 2 || !supportResistance || !trend) {
    return {
      breakout: "NONE",
      probability: 50,
      target: 0,
      level: 0,
      recommendation: "انتظار",
      recommendationStrength: 50
    };
  }
  
  const last = candles[candles.length - 1];
  
  // تحديد نوع الاختراق المحتمل
  if (trend.direction === "UP" && supportResistance.resistance.length > 0) {
    const resistance = supportResistance.resistance[0].price;
    const distancePercent = (resistance - last.close) / last.close * 100;
    
    // حساب احتمالية الاختراق
    let probability;
    if (distancePercent < 0.1) {
      probability = Math.min(95, trend.strength + 10);
    } else if (distancePercent < 0.5) {
      probability = Math.min(90, trend.strength);
    } else {
      probability = Math.min(85, trend.strength - 10);
    }
    
    // تحديد الهدف
    const target = resistance * 1.01;
    
    return {
      breakout: "RESISTANCE",
      probability: Math.round(probability),
      target: parseFloat(target.toFixed(4)),
      level: parseFloat(resistance.toFixed(4)),
      recommendation: "شراء",
      recommendationStrength: Math.round(probability * 0.9)
    };
  } else if (trend.direction === "DOWN" && supportResistance.support.length > 0) {
    const support = supportResistance.support[0].price;
    const distancePercent = (last.close - support) / last.close * 100;
    
    // حساب احتمالية الاختراق
    let probability;
    if (distancePercent < 0.1) {
      probability = Math.min(95, trend.strength + 10);
    } else if (distancePercent < 0.5) {
      probability = Math.min(90, trend.strength);
    } else {
      probability = Math.min(85, trend.strength - 10);
    }
    
    // تحديد الهدف
    const target = support * 0.99;
    
    return {
      breakout: "SUPPORT",
      probability: Math.round(probability),
      target: parseFloat(target.toFixed(4)),
      level: parseFloat(support.toFixed(4)),
      recommendation: "بيع",
      recommendationStrength: Math.round(probability * 0.9)
    };
  } else {
    return {
      breakout: "NONE",
      probability: 50,
      target: parseFloat(last.close.toFixed(4)),
      level: parseFloat(last.close.toFixed(4)),
      recommendation: "انتظار",
      recommendationStrength: 50
    };
  }
}

/**
 * حساب نقاط الدخول والخروج
 * @param {Array} candles - مصفوفة الشموع
 * @param {Object} supportResistance - مستويات الدعم والمقاومة
 * @param {Object} trend - معلومات الاتجاه
 * @returns {Object} - نقاط الدخول والخروج
 */
function calculateEntryExitPoints(candles, supportResistance, trend) {
  if (!candles || candles.length < 2 || !supportResistance || !trend) {
    return {
      entryPoint: 0,
      targetPoint: 0,
      stopLoss: 0,
      riskRewardRatio: 0,
      timeframe: 180
    };
  }
  
  const last = candles[candles.length - 1];
  
  if (trend.direction === "UP") {
    // نقطة الدخول هي سعر الإغلاق الحالي
    const entry = last.close;
    
    // نقطة الهدف هي مستوى المقاومة الأول أو نسبة من السعر الحالي
    const target = supportResistance.resistance.length > 0 ? 
      supportResistance.resistance[0].price : entry * 1.01;
    
    // نقطة وقف الخسارة هي مستوى الدعم الأول أو نسبة من السعر الحالي
    const stopLoss = supportResistance.support.length > 0 ? 
      supportResistance.support[0].price : entry * 0.995;
    
    // حساب نسبة المخاطرة/العائد
    const risk = entry - stopLoss;
    const reward = target - entry;
    const riskReward = risk > 0 ? reward / risk : 0;
    
    // تقدير المدة الزمنية المطلوبة
    const timeframe = Math.round(180 * (1 + (target - entry) / entry * 100));
    
    return {
      entryPoint: parseFloat(entry.toFixed(4)),
      targetPoint: parseFloat(target.toFixed(4)),
      stopLoss: parseFloat(stopLoss.toFixed(4)),
      riskRewardRatio: parseFloat(riskReward.toFixed(2)),
      timeframe: timeframe
    };
  } else if (trend.direction === "DOWN") {
    // نقطة الدخول هي سعر الإغلاق الحالي
    const entry = last.close;
    
    // نقطة الهدف هي مستوى الدعم الأول أو نسبة من السعر الحالي
    const target = supportResistance.support.length > 0 ? 
      supportResistance.support[0].price : entry * 0.99;
    
    // نقطة وقف الخسارة هي مستوى المقاومة الأول أو نسبة من السعر الحالي
    const stopLoss = supportResistance.resistance.length > 0 ? 
      supportResistance.resistance[0].price : entry * 1.005;
    
    // حساب نسبة المخاطرة/العائد
    const risk = stopLoss - entry;
    const reward = entry - target;
    const riskReward = risk > 0 ? reward / risk : 0;
    
    // تقدير المدة الزمنية المطلوبة
    const timeframe = Math.round(180 * (1 + (entry - target) / entry * 100));
    
    return {
      entryPoint: parseFloat(entry.toFixed(4)),
      targetPoint: parseFloat(target.toFixed(4)),
      stopLoss: parseFloat(stopLoss.toFixed(4)),
      riskRewardRatio: parseFloat(riskReward.toFixed(2)),
      timeframe: timeframe
    };
  } else {
    // في حالة الاتجاه المحايد
    return {
      entryPoint: parseFloat(last.close.toFixed(4)),
      targetPoint: parseFloat((last.close * 1.005).toFixed(4)),
      stopLoss: parseFloat((last.close * 0.995).toFixed(4)),
      riskRewardRatio: 1.0,
      timeframe: 180
    };
  }
}

// دوال مساعدة

/**
 * حساب المتوسط المتحرك البسيط
 * @param {Array} data - مصفوفة البيانات
 * @param {number} period - الفترة
 * @returns {number} - المتوسط المتحرك
 */
function calculateSMA(data, period) {
  if (data.length < period) {
    return data.reduce((a, b) => a + b, 0) / data.length;
  }
  
  const slice = data.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * حساب المتوسط المتحرك الأسي
 * @param {Array} data - مصفوفة البيانات
 * @param {number} period - الفترة
 * @returns {number} - المتوسط المتحرك الأسي
 */
function calculateEMA(data, period) {
  if (data.length < period) {
    return calculateSMA(data, data.length);
  }
  
  const k = 2 / (period + 1);
  const emaData = [calculateSMA(data.slice(0, period), period)];
  
  for (let i = period; i < data.length; i++) {
    emaData.push(data[i] * k + emaData[emaData.length - 1] * (1 - k));
  }
  
  return emaData[emaData.length - 1];
}

/**
 * حساب الانحراف المعياري
 * @param {Array} data - مصفوفة البيانات
 * @param {number} period - الفترة
 * @returns {number} - الانحراف المعياري
 */
function calculateStdDev(data, period) {
  if (data.length < period) {
    return 0;
  }
  
  const slice = data.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
  
  return Math.sqrt(variance);
}

/**
 * حساب مؤشر القوة النسبية
 * @param {Array} data - مصفوفة البيانات
 * @param {number} period - الفترة
 * @returns {number} - مؤشر القوة النسبية
 */
function calculateRSI(data, period) {
  if (data.length < period + 1) {
    return 50;
  }
  
  const changes = [];
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }
  
  const gains = changes.map(c => c > 0 ? c : 0);
  const losses = changes.map(c => c < 0 ? -c : 0);
  
  const avgGain = calculateSMA(gains.slice(-period), period);
  const avgLoss = calculateSMA(losses.slice(-period), period);
  
  if (avgLoss === 0) {
    return 100;
  }
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

/**
 * حساب مؤشر تدفق الأموال
 * @param {Array} candles - مصفوفة الشموع
 * @param {number} period - الفترة
 * @returns {number} - مؤشر تدفق الأموال
 */
function calculateMFI(candles, period) {
  if (candles.length < period + 1) {
    return 50;
  }
  
  const typicalPrices = candles.map(c => (c.high + c.low + c.close) / 3);
  const moneyFlow = typicalPrices.map((tp, i) => tp * candles[i].volume);
  
  const positiveFlow = [];
  const negativeFlow = [];
  
  for (let i = 1; i < typicalPrices.length; i++) {
    if (typicalPrices[i] > typicalPrices[i - 1]) {
      positiveFlow.push(moneyFlow[i]);
      negativeFlow.push(0);
    } else if (typicalPrices[i] < typicalPrices[i - 1]) {
      positiveFlow.push(0);
      negativeFlow.push(moneyFlow[i]);
    } else {
      positiveFlow.push(0);
      negativeFlow.push(0);
    }
  }
  
  const posSum = positiveFlow.slice(-period).reduce((a, b) => a + b, 0);
  const negSum = negativeFlow.slice(-period).reduce((a, b) => a + b, 0);
  
  if (negSum === 0) {
    return 100;
  }
  
  const moneyRatio = posSum / negSum;
  return 100 - (100 / (1 + moneyRatio));
}

module.exports = {
  analyzeTrend,
  findSupportResistanceLevels,
  detectCandlePattern,
  calculateIndicators,
  analyzeBreakout,
  calculateEntryExitPoints
};