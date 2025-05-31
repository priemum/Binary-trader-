/**
 * خدمة واجهة برمجة التطبيقات
 * تتعامل مع الواجهة الخلفية للنظام
 */

class ApiService {
  constructor() {
    this.baseUrl = '/api'; // يمكن تغييره حسب إعدادات الخادم
  }
  
  /**
   * تحليل صورة الشارت
   * @param {File} imageFile - ملف الصورة
   * @returns {Promise<Object>} - نتائج التحليل
   */
  async analyzeChartImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch(`${this.baseUrl}/analyze-chart`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing chart image:', error);
      throw error;
    }
  }
  
  /**
   * تحليل الشموع
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @param {number} timeframe - الإطار الزمني
   * @returns {Promise<Object>} - نتائج التحليل
   */
  async analyzeCandles(candles, timeframe = 60) {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-candles-ml`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ candles, timeframe })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing candles:', error);
      throw error;
    }
  }
  
  /**
   * تحليل خطوط الدعم والمقاومة
   * @param {Array<Object>} candles - مصفوفة الشموع
   * @returns {Promise<Object>} - نتائج التحليل
   */
  async analyzeSupportResistance(candles) {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-support-resistance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ candles })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing support and resistance:', error);
      throw error;
    }
  }
  
  /**
   * تحليل احتمالية الاختراق
   * @param {Object} supportResistance - خطوط الدعم والمقاومة
   * @param {Object} prediction - التنبؤ بالشمعة القادمة
   * @returns {Promise<Object>} - نتائج تحليل الاختراق
   */
  async analyzeBreakout(supportResistance, prediction) {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-breakout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ supportResistance, prediction })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error analyzing breakout:', error);
      throw error;
    }
  }
  
  /**
   * تسجيل نتيجة التنبؤ
   * @param {number} predictionIndex - مؤشر التنبؤ
   * @param {string} actualDirection - الاتجاه الفعلي
   * @returns {Promise<Object>} - نتائج التقييم المحدثة
   */
  async recordResult(predictionIndex, actualDirection) {
    try {
      const response = await fetch(`${this.baseUrl}/record-result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ predictionIndex, actualDirection })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error recording result:', error);
      throw error;
    }
  }
  
  /**
   * الحصول على مقاييس الأداء
   * @returns {Promise<Object>} - مقاييس الأداء
   */
  async getPerformanceMetrics() {
    try {
      const response = await fetch(`${this.baseUrl}/performance-metrics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      throw error;
    }
  }
  
  /**
   * تعديل أوزان الثقة
   * @param {Object} weights - أوزان جديدة للمصادر
   * @returns {Promise<Object>} - حالة العملية
   */
  async adjustConfidenceWeights(weights) {
    try {
      const response = await fetch(`${this.baseUrl}/adjust-confidence-weights`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ weights })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adjusting confidence weights:', error);
      throw error;
    }
  }
  
  /**
   * حفظ التحليل
   * @param {Object} analysis - نتائج التحليل
   * @returns {Promise<Object>} - حالة العملية
   */
  async saveAnalysis(analysis) {
    try {
      const response = await fetch(`${this.baseUrl}/save-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(analysis)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving analysis:', error);
      throw error;
    }
  }
  
  /**
   * محاكاة استجابة الخادم (للاختبار فقط)
   * @param {Object} data - البيانات المطلوبة
   * @param {number} delay - التأخير بالمللي ثانية
   * @returns {Promise<Object>} - البيانات المحاكاة
   */
  async mockResponse(data, delay = 500) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(data);
      }, delay);
    });
  }
}

// تصدير الخدمة للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiService };
} else {
  // إنشاء كائن عالمي للخدمة
  window.apiService = new ApiService();
}