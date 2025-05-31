/**
 * الملف الرئيسي للتطبيق
 * يقوم بتهيئة جميع المكونات وربطها معًا
 */

document.addEventListener('DOMContentLoaded', () => {
  // تهيئة مكونات التطبيق
  initializeApp();
  
  // إضافة معالجات الأحداث
  setupEventHandlers();
  
  // تحديث مؤشر حالة الاتصال
  updateConnectionStatus();
  
  // تحديث معلومات الإصدار
  updateVersionInfo();
});

/**
 * تهيئة مكونات التطبيق
 */
function initializeApp() {
  console.log('تهيئة التطبيق...');
  
  // التأكد من وجود مكونات التطبيق الأساسية
  if (!window.apiConnector) {
    console.log('إنشاء موصل API');
    window.apiConnector = new ApiConnector();
  }
  
  if (!window.apiService) {
    console.log('إنشاء خدمة API');
    window.apiService = new ApiService();
  }
  
  if (!window.chartDataExtractor) {
    console.log('إنشاء مستخرج بيانات الشارت');
    window.chartDataExtractor = new ChartDataExtractor();
  }
  
  if (!window.mlChartProcessor) {
    console.log('إنشاء معالج الشارت');
    window.mlChartProcessor = new MLChartProcessor();
  }
  
  if (!window.chartAnalyzerConnector) {
    console.log('إنشاء موصل محلل الشارت');
    window.chartAnalyzerConnector = new ChartAnalyzerConnector();
  }
  
  if (!window.chartAnalyzerUI) {
    console.log('إنشاء واجهة مستخدم محلل الشارت');
    window.chartAnalyzerUI = new ChartAnalyzerUI();
  }
  
  if (!window.connectionMonitor) {
    console.log('إنشاء مراقب الاتصال');
    window.connectionMonitor = new ConnectionMonitor();
  }
  
  if (!window.progressTracker) {
    console.log('إنشاء متتبع التقدم');
    window.progressTracker = new ProgressTracker();
  }
  
  // تعريف دالة عرض الإشعارات العالمية
  window.showNotification = function(message, type = 'success', duration = 5000) {
    // التحقق من وجود حاوية الإشعارات
    let container = document.getElementById('notification-container');
    
    if (!container) {
      // إنشاء حاوية الإشعارات إذا لم تكن موجودة
      container = document.createElement('div');
      container.id = 'notification-container';
      container.style.position = 'fixed';
      container.style.top = '10px';
      container.style.right = '10px';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
    }
    
    // إنشاء الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // إضافة الإشعار للحاوية
    container.appendChild(notification);
    
    // إزالة الإشعار بعد المدة المحددة
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-10px)';
      
      setTimeout(() => {
        if (container.contains(notification)) {
          container.removeChild(notification);
        }
      }, 300);
    }, duration);
  };
  
  // فحص الاتصال بالخادم مباشرة
  checkServerConnection();
  
  console.log('تم تهيئة التطبيق بنجاح');
}

/**
 * فحص الاتصال بالخادم مباشرة
 */
function checkServerConnection() {
  fetch('http://localhost:3000/api/health-check')
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Server responded with error');
    })
    .then(data => {
      console.log('Server health check successful:', data);
      
      // تحديث مؤشر حالة الاتصال
      const indicator = document.getElementById('connection-indicator');
      const statusText = document.getElementById('connection-text');
      const processingMode = document.getElementById('processing-mode');
      
      if (indicator && statusText) {
        indicator.className = 'indicator connected';
        statusText.textContent = 'متصل بالخادم';
        statusText.style.color = 'var(--secondary)';
        
        if (processingMode) {
          processingMode.textContent = 'وضع المعالجة: معالجة الصور';
        }
      }
      
      // تحديث حالة الاتصال في مراقب الاتصال
      if (window.connectionMonitor) {
        window.connectionMonitor.setConnectionStatus(true);
      }
      
      // عرض إشعار
      window.showNotification('تم الاتصال بالخادم بنجاح', 'success');
    })
    .catch(error => {
      console.error('Server health check failed:', error);
      
      // تحديث مؤشر حالة الاتصال
      const indicator = document.getElementById('connection-indicator');
      const statusText = document.getElementById('connection-text');
      const processingMode = document.getElementById('processing-mode');
      
      if (indicator && statusText) {
        indicator.className = 'indicator disconnected';
        statusText.textContent = 'غير متصل (وضع محلي)';
        statusText.style.color = 'var(--danger)';
        
        if (processingMode) {
          processingMode.textContent = 'وضع المعالجة: محاكاة محلية';
        }
      }
      
      // تحديث حالة الاتصال في مراقب الاتصال
      if (window.connectionMonitor) {
        window.connectionMonitor.setConnectionStatus(false);
      }
    });
}

/**
 * إعداد معالجات الأحداث
 */
function setupEventHandlers() {
  // تم تعطيل معالجات الأحداث لتجنب التعارض مع الكود الجديد
  console.log("تم تعطيل معالجات الأحداث القديمة");
}
  
  // زر تصدير PDF
  const exportPdfBtn = document.getElementById('export-pdf-btn');
  if (exportPdfBtn) {
    exportPdfBtn.addEventListener('click', () => {
      exportAnalysisToPDF();
    });
  }
  
  // علامات تبويب الرسم البياني
  const chartTabs = document.querySelectorAll('.chart-tab');
  chartTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // إزالة الفئة النشطة من جميع علامات التبويب
      chartTabs.forEach(t => t.classList.remove('active'));
      
      // إضافة الفئة النشطة للعلامة المحددة
      tab.classList.add('active');
      
      // تغيير نوع الرسم البياني
      const chartType = tab.getAttribute('data-chart');
      if (window.chartAnalyzerUI && window.chartAnalyzerUI.chart) {
        window.chartAnalyzerUI.updateChartType(chartType);
      }
    });
  });
  
  // خيار اكتشاف الإطار الزمني تلقائياً
  const autoDetectTimeframe = document.getElementById('auto-detect-timeframe');
  const timeframeSelect = document.getElementById('timeframe');
  
  if (autoDetectTimeframe && timeframeSelect) {
    autoDetectTimeframe.addEventListener('change', () => {
      timeframeSelect.disabled = autoDetectTimeframe.checked;
    });
    
    // تعيين الحالة الأولية
    timeframeSelect.disabled = autoDetectTimeframe.checked;
  }
  
  // تحديث مؤشر حالة الاتصال كل 10 ثوانٍ
  setInterval(updateConnectionStatus, 10000);
}

/**
 * تحديث مؤشر حالة الاتصال
 */
function updateConnectionStatus() {
  const indicator = document.getElementById('connection-indicator');
  const statusText = document.getElementById('connection-text');
  const processingMode = document.getElementById('processing-mode');
  
  if (!indicator || !statusText) return;
  
  // فحص الاتصال بالخادم مباشرة
  fetch('http://localhost:3000/api/health-check')
    .then(response => {
      if (response.ok) {
        // الخادم متصل
        indicator.className = 'indicator connected';
        statusText.textContent = 'متصل بالخادم';
        statusText.style.color = 'var(--secondary)';
        
        if (processingMode) {
          processingMode.textContent = 'وضع المعالجة: معالجة الصور';
        }
        
        // تحديث حالة الاتصال في مراقب الاتصال إذا كان موجودًا
        if (window.connectionMonitor) {
          window.connectionMonitor.handleConnectionSuccess();
        }
      } else {
        throw new Error('Server responded with error');
      }
    })
    .catch(error => {
      // الخادم غير متصل
      console.error('Connection check failed:', error);
      indicator.className = 'indicator disconnected';
      statusText.textContent = 'غير متصل (وضع محلي)';
      statusText.style.color = 'var(--danger)';
      
      if (processingMode) {
        processingMode.textContent = 'وضع المعالجة: محاكاة محلية';
      }
      
      // تحديث حالة الاتصال في مراقب الاتصال إذا كان موجودًا
      if (window.connectionMonitor) {
        window.connectionMonitor.handleConnectionFailure();
      }
    });
}

/**
 * تحديث معلومات الإصدار
 */
function updateVersionInfo() {
  const versionElement = document.getElementById('version');
  if (versionElement) {
    const appVersion = '2.0.0'; // يمكن تحديثه تلقائياً من package.json
    versionElement.textContent = `الإصدار: ${appVersion}`;
  }
}

/**
 * تصدير التحليل إلى ملف PDF
 */
function exportAnalysisToPDF() {
  // في التطبيق الحقيقي، هنا سيتم استخدام مكتبة لإنشاء ملف PDF
  alert('سيتم تنفيذ تصدير التحليل إلى PDF في الإصدار القادم');
}

/**
 * عرض إشعار للمستخدم
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار (success, error, warning)
 * @param {number} duration - مدة العرض بالمللي ثانية
 */
function showNotification(message, type = 'success', duration = 5000) {
  // التحقق من وجود حاوية الإشعارات
  let container = document.getElementById('notification-container');
  
  if (!container) {
    // إنشاء حاوية الإشعارات إذا لم تكن موجودة
    container = document.createElement('div');
    container.id = 'notification-container';
    document.body.appendChild(container);
  }
  
  // إنشاء الإشعار
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  // إضافة الإشعار للحاوية
  container.appendChild(notification);
  
  // إزالة الإشعار بعد المدة المحددة
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      container.removeChild(notification);
    }, 300);
  }, duration);
}