/**
 * نظام تقييم دقة التنبؤات
 */

class PredictionEvaluator {
  /**
   * تهيئة المقيم
   */
  constructor() {
    this.predictions = [];
    this.results = [];
    this.metrics = {
      totalPredictions: 0,
      correctPredictions: 0,
      accuracy: 0,
      avgConfidence: 0,
      calibrationScore: 0
    };
  }
  
  /**
   * إضافة تنبؤ جديد للتقييم
   * @param {Object} prediction - التنبؤ
   * @param {string} prediction.direction - اتجاه التنبؤ (UP/DOWN/NEUTRAL)
   * @param {number} prediction.confidence - مستوى الثقة (0-100)
   * @param {Object} prediction.indicators - مؤشرات إضافية
   */
  addPrediction(prediction) {
    this.predictions.push({
      timestamp: Date.now(),
      direction: prediction.direction,
      confidence: prediction.confidence,
      indicators: prediction.indicators || {}
    });
  }
  
  /**
   * إضافة نتيجة فعلية لتنبؤ سابق
   * @param {number} predictionIndex - مؤشر التنبؤ
   * @param {string} actualDirection - الاتجاه الفعلي (UP/DOWN)
   */
  addResult(predictionIndex, actualDirection) {
    if (predictionIndex >= 0 && predictionIndex < this.predictions.length) {
      const prediction = this.predictions[predictionIndex];
      const isCorrect = prediction.direction === actualDirection;
      
      this.results.push({
        predictionIndex,
        predictedDirection: prediction.direction,
        actualDirection,
        confidence: prediction.confidence,
        isCorrect
      });
      
      this.updateMetrics();
    }
  }
  
  /**
   * تحديث مقاييس الأداء
   * @private
   */
  updateMetrics() {
    this.metrics.totalPredictions = this.results.length;
    this.metrics.correctPredictions = this.results.filter(r => r.isCorrect).length;
    this.metrics.accuracy = this.metrics.totalPredictions > 0 ? 
      this.metrics.correctPredictions / this.metrics.totalPredictions : 0;
    
    // حساب متوسط الثقة
    const totalConfidence = this.results.reduce((sum, r) => sum + r.confidence, 0);
    this.metrics.avgConfidence = this.metrics.totalPredictions > 0 ? 
      totalConfidence / this.metrics.totalPredictions / 100 : 0;
    
    // حساب درجة المعايرة (الفرق بين الدقة ومتوسط الثقة)
    this.metrics.calibrationScore = Math.abs(this.metrics.accuracy - this.metrics.avgConfidence);
  }
  
  /**
   * الحصول على مقاييس الأداء
   * @returns {Object} - مقاييس الأداء
   */
  getMetrics() {
    return {
      ...this.metrics,
      accuracy: Math.round(this.metrics.accuracy * 100),
      avgConfidence: Math.round(this.metrics.avgConfidence * 100),
      calibrationScore: Math.round((1 - this.metrics.calibrationScore) * 100)
    };
  }
  
  /**
   * تحليل أداء المؤشرات المختلفة
   * @returns {Object} - تحليل أداء المؤشرات
   */
  analyzeIndicatorPerformance() {
    if (this.results.length === 0) {
      return { indicators: {} };
    }
    
    // تجميع البيانات حسب المؤشرات
    const indicatorStats = {};
    
    for (const result of this.results) {
      const prediction = this.predictions[result.predictionIndex];
      const indicators = prediction.indicators;
      
      for (const indicator in indicators) {
        if (!indicatorStats[indicator]) {
          indicatorStats[indicator] = {
            total: 0,
            correct: 0,
            accuracy: 0,
            values: []
          };
        }
        
        indicatorStats[indicator].total++;
        if (result.isCorrect) {
          indicatorStats[indicator].correct++;
        }
        indicatorStats[indicator].values.push({
          value: indicators[indicator],
          isCorrect: result.isCorrect
        });
      }
    }
    
    // حساب الدقة لكل مؤشر
    for (const indicator in indicatorStats) {
      indicatorStats[indicator].accuracy = 
        Math.round((indicatorStats[indicator].correct / indicatorStats[indicator].total) * 100);
      
      // تحليل القيم المثلى
      indicatorStats[indicator].optimalRange = this.findOptimalRange(indicatorStats[indicator].values);
    }
    
    return { indicators: indicatorStats };
  }
  
  /**
   * البحث عن النطاق الأمثل لقيم المؤشر
   * @private
   */
  findOptimalRange(values) {
    if (values.length < 5) return { min: null, max: null, accuracy: 0 };
    
    // ترتيب القيم
    values.sort((a, b) => a.value - b.value);
    
    // البحث عن أفضل نطاق
    let bestMin = values[0].value;
    let bestMax = values[values.length - 1].value;
    let bestAccuracy = 0;
    
    // تقسيم القيم إلى مجموعات وحساب الدقة لكل مجموعة
    const step = Math.floor(values.length / 5);
    for (let i = 0; i < values.length - step; i += step) {
      const rangeValues = values.slice(i, i + step);
      const correct = rangeValues.filter(v => v.isCorrect).length;
      const accuracy = correct / rangeValues.length;
      
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestMin = rangeValues[0].value;
        bestMax = rangeValues[rangeValues.length - 1].value;
      }
    }
    
    return {
      min: bestMin,
      max: bestMax,
      accuracy: Math.round(bestAccuracy * 100)
    };
  }
  
  /**
   * الحصول على توصيات لتحسين الأداء
   * @returns {Array<string>} - قائمة التوصيات
   */
  getRecommendations() {
    const recommendations = [];
    
    // التحقق من عدد التنبؤات
    if (this.metrics.totalPredictions < 10) {
      recommendations.push("جمع المزيد من البيانات لتحسين دقة التقييم");
      return recommendations;
    }
    
    // تحليل الدقة
    if (this.metrics.accuracy < 0.6) {
      recommendations.push("تحسين خوارزمية التنبؤ الأساسية");
    }
    
    // تحليل المعايرة
    if (this.metrics.calibrationScore > 0.2) {
      if (this.metrics.avgConfidence > this.metrics.accuracy) {
        recommendations.push("خفض مستويات الثقة في التنبؤات");
      } else {
        recommendations.push("زيادة مستويات الثقة في التنبؤات");
      }
    }
    
    // تحليل أداء المؤشرات
    const indicatorPerformance = this.analyzeIndicatorPerformance().indicators;
    for (const indicator in indicatorPerformance) {
      if (indicatorPerformance[indicator].accuracy < 55) {
        recommendations.push(`إعادة تقييم استخدام مؤشر ${indicator}`);
      }
    }
    
    return recommendations;
  }
  
  /**
   * حفظ بيانات التقييم
   * @returns {Object} - بيانات التقييم للحفظ
   */
  exportData() {
    return {
      predictions: this.predictions,
      results: this.results,
      metrics: this.metrics,
      timestamp: Date.now()
    };
  }
  
  /**
   * استيراد بيانات التقييم
   * @param {Object} data - بيانات التقييم المستوردة
   */
  importData(data) {
    if (data && data.predictions && data.results && data.metrics) {
      this.predictions = data.predictions;
      this.results = data.results;
      this.metrics = data.metrics;
    }
  }
}

// تصدير الفئة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PredictionEvaluator };
}