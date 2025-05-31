/**
 * مراقب الاتصال بالخادم
 * يقوم بمراقبة حالة الاتصال بالخادم وتوفير آلية للتبديل التلقائي بين الخادم والتحليل المحلي
 */

class ConnectionMonitor {
  constructor() {
    this.serverUrl = 'http://localhost:3000/api';
    this.isConnected = false;
    this.checkInterval = 10000; // 10 ثوانٍ
    this.retryCount = 0;
    this.maxRetries = 2;
    this.intervalId = null;
    
    // بدء المراقبة
    this.startMonitoring();
  }
  
  /**
   * بدء مراقبة الاتصال بالخادم
   */
  startMonitoring() {
    // فحص الاتصال مباشرة
    this.checkConnection();
    
    // بدء الفحص الدوري
    this.intervalId = setInterval(() => {
      this.checkConnection();
    }, this.checkInterval);
    
    console.log('بدء مراقبة الاتصال بالخادم');
  }
  
  /**
   * إيقاف مراقبة الاتصال بالخادم
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('تم إيقاف مراقبة الاتصال بالخادم');
    }
  }
  
  /**
   * فحص الاتصال بالخادم
   * @returns {Promise<boolean>} - حالة الاتصال
   */
  async checkConnection() {
    try {
      console.log('فحص الاتصال بالخادم...');
      
      // محاولة الاتصال بالخادم
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${this.serverUrl}/health-check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // التحقق من حالة الاستجابة
      if (response.ok) {
        this.handleConnectionSuccess();
        return true;
      } else {
        this.handleConnectionFailure();
        return false;
      }
    } catch (error) {
      console.error('Connection check error:', error);
      this.handleConnectionFailure();
      return false;
    }
  }
  
  /**
   * معالجة نجاح الاتصال
   */
  handleConnectionSuccess() {
    const wasConnected = this.isConnected;
    this.isConnected = true;
    this.retryCount = 0;
    
    // تحديث مؤشر حالة الاتصال مباشرة
    this.updateConnectionIndicator(true);
    
    // إذا كان هناك تغيير في حالة الاتصال
    if (!wasConnected) {
      console.log('تم استعادة الاتصال بالخادم');
      this.notifyConnectionChange(true);
    }
  }
  
  /**
   * معالجة فشل الاتصال
   */
  handleConnectionFailure() {
    const wasConnected = this.isConnected;
    this.retryCount++;
    
    // تحديث مؤشر حالة الاتصال مباشرة
    this.updateConnectionIndicator(false);
    
    if (this.retryCount >= this.maxRetries) {
      this.isConnected = false;
      
      // إذا كان هناك تغيير في حالة الاتصال
      if (wasConnected) {
        console.log('فقدان الاتصال بالخادم بعد عدة محاولات');
        this.notifyConnectionChange(false);
      }
    } else {
      console.log(`فشل الاتصال بالخادم (محاولة ${this.retryCount} من ${this.maxRetries})`);
    }
  }
  
  /**
   * تحديث مؤشر حالة الاتصال
   * @param {boolean} isConnected - حالة الاتصال
   */
  updateConnectionIndicator(isConnected) {
    const indicator = document.getElementById('connection-indicator');
    const statusText = document.getElementById('connection-text');
    const processingMode = document.getElementById('processing-mode');
    
    if (!indicator || !statusText) return;
    
    // تحديث مؤشر الاتصال
    indicator.className = isConnected ? 'indicator connected' : 'indicator disconnected';
    statusText.textContent = isConnected ? 'متصل بالخادم' : 'غير متصل (وضع محلي)';
    statusText.style.color = isConnected ? 'var(--secondary)' : 'var(--danger)';
    
    // تحديث وضع المعالجة
    if (processingMode) {
      processingMode.textContent = `وضع المعالجة: ${isConnected ? 'معالجة الصور' : 'محاكاة محلية'}`;
    }
  }
  
  /**
   * إشعار بتغيير حالة الاتصال
   * @param {boolean} isConnected - حالة الاتصال الجديدة
   */
  notifyConnectionChange(isConnected) {
    // تحديث وضع التحليل في موصل الواجهة الخلفية
    if (window.apiConnector) {
      window.apiConnector.toggleServerMode(isConnected);
    }
    
    // تحديث وضع التحليل في موصل محلل الشارت
    if (window.chartAnalyzerConnector) {
      window.chartAnalyzerConnector.toggleAnalysisMode(!isConnected);
    }
    
    // إظهار إشعار للمستخدم
    this.showConnectionNotification(isConnected);
  }
  
  /**
   * إظهار إشعار للمستخدم بحالة الاتصال
   * @param {boolean} isConnected - حالة الاتصال
   */
  showConnectionNotification(isConnected) {
    // التحقق من وجود دالة showNotification العالمية
    if (window.showNotification) {
      window.showNotification(
        isConnected ? 'تم الاتصال بالخادم بنجاح' : 'فقدان الاتصال بالخادم، تم التبديل إلى التحليل المحلي',
        isConnected ? 'success' : 'error'
      );
      return;
    }
    
    // إنشاء إشعار بسيط إذا لم تكن دالة showNotification متاحة
    const notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
      // إنشاء حاوية الإشعارات إذا لم تكن موجودة
      const container = document.createElement('div');
      container.id = 'notification-container';
      container.style.position = 'fixed';
      container.style.top = '10px';
      container.style.right = '10px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    
    // إنشاء الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${isConnected ? 'success' : 'error'}`;
    notification.style.padding = '10px 15px';
    notification.style.margin = '5px';
    notification.style.borderRadius = '5px';
    notification.style.backgroundColor = isConnected ? '#4CAF50' : '#F44336';
    notification.style.color = 'white';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    notification.textContent = isConnected ? 
      'تم الاتصال بالخادم بنجاح' : 
      'فقدان الاتصال بالخادم، تم التبديل إلى التحليل المحلي';
    
    // إضافة الإشعار للحاوية
    const container = document.getElementById('notification-container');
    container.appendChild(notification);
    
    // إزالة الإشعار بعد 5 ثوانٍ
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transition = 'opacity 0.5s';
      
      setTimeout(() => {
        if (container.contains(notification)) {
          container.removeChild(notification);
        }
      }, 500);
    }, 5000);
  }
  
  /**
   * الحصول على حالة الاتصال الحالية
   * @returns {boolean} - حالة الاتصال
   */
  isServerConnected() {
    return this.isConnected;
  }
  
  /**
   * تعيين حالة الاتصال
   * @param {boolean} connected - حالة الاتصال
   */
  setConnectionStatus(connected) {
    if (connected) {
      this.handleConnectionSuccess();
    } else {
      this.handleConnectionFailure();
    }
  }
}

// إنشاء كائن مراقب الاتصال عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  window.connectionMonitor = new ConnectionMonitor();
  
  // فحص الاتصال مباشرة
  fetch('http://localhost:3000/api/health-check')
    .then(response => {
      if (response.ok) {
        window.connectionMonitor.setConnectionStatus(true);
      }
    })
    .catch(error => {
      console.error('Initial connection check failed:', error);
      window.connectionMonitor.setConnectionStatus(false);
    });
});