/**
 * أداة فحص المكونات
 * تتحقق من تحميل وتهيئة جميع المكونات المطلوبة
 */

class ComponentCheck {
  /**
   * فحص جميع المكونات المطلوبة
   * @returns {Object} - نتائج الفحص
   */
  static checkAllComponents() {
    console.log("فحص المكونات المطلوبة...");
    
    const components = {
      // مكونات واجهة المستخدم
      apiConnector: this.checkComponent('apiConnector'),
      apiService: this.checkComponent('apiService'),
      chartAnalyzerConnector: this.checkComponent('chartAnalyzerConnector'),
      chartDataExtractor: this.checkComponent('chartDataExtractor'),
      mlChartProcessor: this.checkComponent('mlChartProcessor'),
      
      // مكونات الواجهة الخلفية
      backendIntegration: this.checkComponent('backendIntegration'),
      ColorPreservingAnalyzer: this.checkComponent('ColorPreservingAnalyzer'),
      AdvancedChartIndicators: this.checkComponent('AdvancedChartIndicators'),
      ElliottWaveAnalyzer: this.checkComponent('ElliottWaveAnalyzer'),
      FallbackAnalyzer: this.checkComponent('FallbackAnalyzer'),
      DebugHelper: this.checkComponent('DebugHelper')
    };
    
    // التحقق من وجود المكونات الأساسية
    const coreComponentsAvailable = components.apiConnector && 
                                   components.apiService && 
                                   components.chartAnalyzerConnector;
    
    // التحقق من وجود مكونات التحليل
    const analysisComponentsAvailable = components.chartDataExtractor || 
                                       components.backendIntegration || 
                                       components.FallbackAnalyzer;
    
    // التحقق من وجود مكونات التصحيح
    const debugComponentsAvailable = components.DebugHelper;
    
    // تحديد حالة النظام
    const systemStatus = coreComponentsAvailable && analysisComponentsAvailable ? 
                        "READY" : 
                        coreComponentsAvailable ? "PARTIAL" : "FAILED";
    
    return {
      components,
      coreComponentsAvailable,
      analysisComponentsAvailable,
      debugComponentsAvailable,
      systemStatus
    };
  }
  
  /**
   * التحقق من وجود مكون محدد
   * @param {string} componentName - اسم المكون
   * @returns {boolean} - هل المكون موجود
   */
  static checkComponent(componentName) {
    return window[componentName] !== undefined;
  }
  
  /**
   * إصلاح المكونات المفقودة
   * @returns {Promise<boolean>} - نجاح الإصلاح
   */
  static async fixMissingComponents() {
    console.log("إصلاح المكونات المفقودة...");
    
    const checkResult = this.checkAllComponents();
    
    if (checkResult.systemStatus === "READY") {
      console.log("جميع المكونات متاحة، لا حاجة للإصلاح");
      return true;
    }
    
    try {
      // إعادة تحميل المكونات إذا كان نظام التحميل متاحًا
      if (window.componentLoader) {
        console.log("إعادة تحميل المكونات...");
        await window.componentLoader.loadAllComponents();
        window.componentLoader.initializeComponents();
      } else {
        console.log("إنشاء المكونات الأساسية...");
        
        // إنشاء المكونات الأساسية
        if (!window.apiConnector && typeof ApiConnector !== 'undefined') {
          window.apiConnector = new ApiConnector();
        }
        
        if (!window.apiService && typeof ApiService !== 'undefined') {
          window.apiService = new ApiService();
        }
        
        if (!window.chartAnalyzerConnector && typeof ChartAnalyzerConnector !== 'undefined') {
          window.chartAnalyzerConnector = new ChartAnalyzerConnector();
        }
        
        if (!window.chartDataExtractor && typeof ChartDataExtractor !== 'undefined') {
          window.chartDataExtractor = new ChartDataExtractor();
        }
        
        if (!window.mlChartProcessor && typeof MLChartProcessor !== 'undefined') {
          window.mlChartProcessor = new MLChartProcessor();
        }
      }
      
      // التحقق من نجاح الإصلاح
      const newCheckResult = this.checkAllComponents();
      return newCheckResult.systemStatus === "READY" || newCheckResult.systemStatus === "PARTIAL";
    } catch (error) {
      console.error("فشل إصلاح المكونات:", error);
      return false;
    }
  }
  
  /**
   * عرض حالة المكونات في وحدة التحكم
   */
  static logComponentStatus() {
    const checkResult = this.checkAllComponents();
    
    console.log("=== حالة المكونات ===");
    console.log(`حالة النظام: ${checkResult.systemStatus}`);
    console.log(`المكونات الأساسية: ${checkResult.coreComponentsAvailable ? "متاحة ✓" : "غير متاحة ✗"}`);
    console.log(`مكونات التحليل: ${checkResult.analysisComponentsAvailable ? "متاحة ✓" : "غير متاحة ✗"}`);
    console.log(`مكونات التصحيح: ${checkResult.debugComponentsAvailable ? "متاحة ✓" : "غير متاحة ✗"}`);
    
    console.log("تفاصيل المكونات:");
    for (const [name, available] of Object.entries(checkResult.components)) {
      console.log(`- ${name}: ${available ? "متاح ✓" : "غير متاح ✗"}`);
    }
  }
}

// إضافة أداة فحص المكونات للنافذة
window.ComponentCheck = ComponentCheck;

// فحص المكونات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  // فحص المكونات بعد تحميل الصفحة
  setTimeout(() => {
    ComponentCheck.logComponentStatus();
    
    // إصلاح المكونات المفقودة إذا لزم الأمر
    if (ComponentCheck.checkAllComponents().systemStatus !== "READY") {
      ComponentCheck.fixMissingComponents().then(success => {
        if (success) {
          console.log("تم إصلاح المكونات بنجاح");
          ComponentCheck.logComponentStatus();
        } else {
          console.error("فشل إصلاح المكونات");
        }
      });
    }
  }, 1000);
});