/**
 * سجل المكونات
 * يحتفظ بمعلومات عن جميع المكونات ويوفر واجهة موحدة للوصول إليها
 */

class ComponentRegistry {
  constructor() {
    // سجل المكونات
    this.components = {};
    
    // حالة تهيئة المكونات
    this.initialized = false;
  }

  /**
   * تسجيل مكون
   * @param {string} name - اسم المكون
   * @param {Object} instance - نسخة المكون
   */
  register(name, instance) {
    console.log(`تسجيل المكون: ${name}`);
    this.components[name] = instance;
  }

  /**
   * الحصول على مكون
   * @param {string} name - اسم المكون
   * @returns {Object|null} - نسخة المكون أو null إذا لم يكن موجودًا
   */
  get(name) {
    return this.components[name] || null;
  }

  /**
   * التحقق من وجود مكون
   * @param {string} name - اسم المكون
   * @returns {boolean} - هل المكون موجود
   */
  has(name) {
    return this.components[name] !== undefined;
  }

  /**
   * تسجيل المكونات العالمية
   */
  registerGlobalComponents() {
    console.log("تسجيل المكونات العالمية...");
    
    // تسجيل المكونات الأساسية
    if (window.apiConnector) {
      this.register('apiConnector', window.apiConnector);
    }
    
    if (window.apiService) {
      this.register('apiService', window.apiService);
    }
    
    if (window.chartDataExtractor) {
      this.register('chartDataExtractor', window.chartDataExtractor);
    }
    
    if (window.mlChartProcessor) {
      this.register('mlChartProcessor', window.mlChartProcessor);
    }
    
    if (window.chartAnalyzerConnector) {
      this.register('chartAnalyzerConnector', window.chartAnalyzerConnector);
    }
    
    if (window.backendIntegration) {
      this.register('backendIntegration', window.backendIntegration);
    }
    
    // تسجيل المكونات المتقدمة
    const advancedComponents = [
      'ColorPreservingAnalyzer',
      'AdvancedChartIndicators',
      'ElliottWaveAnalyzer',
      'FallbackAnalyzer',
      'DebugHelper'
    ];
    
    for (const name of advancedComponents) {
      if (window[name]) {
        this.register(name, window[name]);
      }
    }
    
    this.initialized = true;
  }

  /**
   * إنشاء المكونات المفقودة
   */
  createMissingComponents() {
    console.log("إنشاء المكونات المفقودة...");
    
    // إنشاء المكونات الأساسية إذا كانت مفقودة
    if (!this.has('apiConnector') && typeof ApiConnector !== 'undefined') {
      this.register('apiConnector', new ApiConnector());
      window.apiConnector = this.get('apiConnector');
    }
    
    if (!this.has('apiService') && typeof ApiService !== 'undefined') {
      this.register('apiService', new ApiService());
      window.apiService = this.get('apiService');
    }
    
    if (!this.has('chartDataExtractor') && typeof ChartDataExtractor !== 'undefined') {
      this.register('chartDataExtractor', new ChartDataExtractor());
      window.chartDataExtractor = this.get('chartDataExtractor');
    }
    
    if (!this.has('mlChartProcessor') && typeof MLChartProcessor !== 'undefined') {
      this.register('mlChartProcessor', new MLChartProcessor());
      window.mlChartProcessor = this.get('mlChartProcessor');
    }
    
    if (!this.has('chartAnalyzerConnector') && typeof ChartAnalyzerConnector !== 'undefined') {
      this.register('chartAnalyzerConnector', new ChartAnalyzerConnector());
      window.chartAnalyzerConnector = this.get('chartAnalyzerConnector');
    }
  }

  /**
   * الحصول على حالة المكونات
   * @returns {Object} - حالة المكونات
   */
  getStatus() {
    const coreComponents = [
      'apiConnector',
      'apiService',
      'chartAnalyzerConnector'
    ];
    
    const analysisComponents = [
      'chartDataExtractor',
      'mlChartProcessor',
      'backendIntegration'
    ];
    
    const coreReady = coreComponents.every(name => this.has(name));
    const analysisReady = analysisComponents.some(name => this.has(name));
    
    return {
      initialized: this.initialized,
      coreReady,
      analysisReady,
      componentCount: Object.keys(this.components).length
    };
  }
}

// إنشاء كائن عالمي لسجل المكونات
window.componentRegistry = new ComponentRegistry();

// تسجيل المكونات العالمية عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(() => {
    window.componentRegistry.registerGlobalComponents();
    window.componentRegistry.createMissingComponents();
    
    // إطلاق حدث اكتمال تسجيل المكونات
    const event = new CustomEvent('componentsRegistered');
    document.dispatchEvent(event);
  }, 1000);
});