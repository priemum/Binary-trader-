/**
 * سجل التحليلات
 * يحتفظ بسجل التحليلات السابقة ويستخدمها لتحسين التحليلات المستقبلية
 */

class AnalysisHistory {
  constructor() {
    this.history = [];
    this.maxHistorySize = 50;
    this.loadHistory();
  }
  
  /**
   * تحميل سجل التحليلات من التخزين المحلي
   * @private
   */
  loadHistory() {
    try {
      const savedHistory = localStorage.getItem('analysisHistory');
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error('خطأ في تحميل سجل التحليلات:', error);
      this.history = [];
    }
  }
  
  /**
   * حفظ سجل التحليلات في التخزين المحلي
   * @private
   */
  saveHistory() {
    try {
      localStorage.setItem('analysisHistory', JSON.stringify(this.history));
    } catch (error) {
      console.error('خطأ في حفظ سجل التحليلات:', error);
    }
  }
  
  /**
   * إضافة تحليل جديد إلى السجل
   * @param {Object} analysis - نتائج التحليل
   * @param {string} imageHash - بصمة الصورة
   */
  addAnalysis(analysis, imageHash = null) {
    // إنشاء بصمة للصورة إذا لم يتم توفيرها
    if (!imageHash && analysis.imageData) {
      imageHash = this.generateImageHash(analysis.imageData);
    }
    
    // إنشاء سجل التحليل
    const analysisRecord = {
      timestamp: Date.now(),
      imageHash,
      direction: analysis.direction,
      confidence: analysis.confidence,
      pattern: analysis.pattern,
      timeframe: analysis.timeframe,
      result: null // سيتم تحديثه لاحقًا
    };
    
    // إضافة السجل إلى التاريخ
    this.history.unshift(analysisRecord);
    
    // تقليص السجل إذا تجاوز الحد الأقصى
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(0, this.maxHistorySize);
    }
    
    // حفظ السجل
    this.saveHistory();
    
    return analysisRecord;
  }
  
  /**
   * تحديث نتيجة تحليل سابق
   * @param {number} index - مؤشر التحليل في السجل
   * @param {string} result - نتيجة التحليل (SUCCESS/FAILURE)
   */
  updateAnalysisResult(index, result) {
    if (index >= 0 && index < this.history.length) {
      this.history[index].result = result;
      this.saveHistory();
    }
  }
  
  /**
   * البحث عن تحليلات مشابهة
   * @param {string} imageHash - بصمة الصورة
   * @returns {Array<Object>} - التحليلات المشابهة
   */
  findSimilarAnalyses(imageHash) {
    return this.history.filter(record => record.imageHash === imageHash);
  }
  
  /**
   * البحث عن تحليلات مشابهة بناءً على النمط
   * @param {string} pattern - نمط الشموع
   * @returns {Array<Object>} - التحليلات المشابهة
   */
  findAnalysesByPattern(pattern) {
    return this.history.filter(record => record.pattern === pattern);
  }
  
  /**
   * الحصول على إحصائيات الأداء
   * @returns {Object} - إحصائيات الأداء
   */
  getPerformanceStats() {
    const completedAnalyses = this.history.filter(record => record.result !== null);
    
    if (completedAnalyses.length === 0) {
      return {
        totalAnalyses: 0,
        successRate: 0,
        averageConfidence: 0,
        patternStats: {}
      };
    }
    
    // حساب معدل النجاح
    const successfulAnalyses = completedAnalyses.filter(record => record.result === 'SUCCESS');
    const successRate = (successfulAnalyses.length / completedAnalyses.length) * 100;
    
    // حساب متوسط الثقة
    const totalConfidence = completedAnalyses.reduce((sum, record) => sum + record.confidence, 0);
    const averageConfidence = totalConfidence / completedAnalyses.length;
    
    // حساب إحصائيات الأنماط
    const patternStats = {};
    completedAnalyses.forEach(record => {
      if (!patternStats[record.pattern]) {
        patternStats[record.pattern] = {
          total: 0,
          successful: 0,
          successRate: 0
        };
      }
      
      patternStats[record.pattern].total++;
      if (record.result === 'SUCCESS') {
        patternStats[record.pattern].successful++;
      }
    });
    
    // حساب معدل النجاح لكل نمط
    Object.keys(patternStats).forEach(pattern => {
      patternStats[pattern].successRate = (patternStats[pattern].successful / patternStats[pattern].total) * 100;
    });
    
    return {
      totalAnalyses: completedAnalyses.length,
      successRate,
      averageConfidence,
      patternStats
    };
  }
  
  /**
   * الحصول على توصيات لتحسين التحليل
   * @returns {Array<string>} - التوصيات
   */
  getRecommendations() {
    const stats = this.getPerformanceStats();
    const recommendations = [];
    
    if (stats.totalAnalyses < 5) {
      recommendations.push('قم بإجراء المزيد من التحليلات لتحسين الدقة');
      return recommendations;
    }
    
    // توصيات بناءً على معدل النجاح
    if (stats.successRate < 50) {
      recommendations.push('معدل النجاح منخفض، حاول استخدام إطار زمني أطول');
    }
    
    // توصيات بناءً على متوسط الثقة
    if (stats.averageConfidence < 70) {
      recommendations.push('متوسط الثقة منخفض، حاول التركيز على الأنماط ذات الثقة العالية');
    }
    
    // توصيات بناءً على إحصائيات الأنماط
    const patternEntries = Object.entries(stats.patternStats);
    if (patternEntries.length > 0) {
      // البحث عن الأنماط ذات معدل النجاح العالي
      const successfulPatterns = patternEntries
        .filter(([_, stats]) => stats.total >= 3 && stats.successRate >= 70)
        .map(([pattern, _]) => pattern);
      
      if (successfulPatterns.length > 0) {
        recommendations.push(`الأنماط الأكثر نجاحًا: ${successfulPatterns.join(', ')}`);
      }
      
      // البحث عن الأنماط ذات معدل النجاح المنخفض
      const unsuccessfulPatterns = patternEntries
        .filter(([_, stats]) => stats.total >= 3 && stats.successRate <= 30)
        .map(([pattern, _]) => pattern);
      
      if (unsuccessfulPatterns.length > 0) {
        recommendations.push(`تجنب الأنماط التالية: ${unsuccessfulPatterns.join(', ')}`);
      }
    }
    
    return recommendations;
  }
  
  /**
   * إنشاء بصمة للصورة
   * @param {ImageData} imageData - بيانات الصورة
   * @returns {string} - بصمة الصورة
   * @private
   */
  generateImageHash(imageData) {
    // في التطبيق الحقيقي، هنا سيتم استخدام خوارزمية تجزئة مناسبة
    // لإنشاء بصمة فريدة للصورة
    
    // محاكاة لإنشاء بصمة عشوائية
    return Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * مسح سجل التحليلات
   */
  clearHistory() {
    this.history = [];
    this.saveHistory();
  }
  
  /**
   * الحصول على سجل التحليلات
   * @returns {Array<Object>} - سجل التحليلات
   */
  getHistory() {
    return this.history;
  }
}

// إنشاء كائن عالمي لسجل التحليلات
window.analysisHistory = new AnalysisHistory();