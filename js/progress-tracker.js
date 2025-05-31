/**
 * متتبع تقدم المعالجة
 * يقوم بتتبع وعرض حالة خطوات معالجة الصورة
 */

class ProgressTracker {
  constructor() {
    this.steps = [
      { id: 'step-1', name: 'تحسين جودة الصورة' },
      { id: 'step-2', name: 'استخراج الشموع' },
      { id: 'step-3', name: 'تحليل الاتجاه والأنماط' },
      { id: 'step-4', name: 'حساب نقاط الدخول والخروج' }
    ];
    
    this.currentStep = 0;
    this.isProcessing = false;
  }
  
  /**
   * بدء تتبع التقدم
   */
  startTracking() {
    this.isProcessing = true;
    this.currentStep = 0;
    this.resetSteps();
    this.updateStepStatus(0, 'pending');
  }
  
  /**
   * إعادة تعيين حالة جميع الخطوات
   */
  resetSteps() {
    this.steps.forEach((step, index) => {
      const stepElement = document.getElementById(step.id);
      if (stepElement) {
        const statusElement = stepElement.querySelector('.step-status');
        if (statusElement) {
          statusElement.textContent = 'انتظار...';
          statusElement.className = 'step-status';
        }
      }
    });
  }
  
  /**
   * تحديث حالة خطوة معينة
   * @param {number} stepIndex - مؤشر الخطوة
   * @param {string} status - الحالة (pending, completed, error)
   * @param {string} message - رسالة إضافية (اختيارية)
   */
  updateStepStatus(stepIndex, status, message = '') {
    if (stepIndex < 0 || stepIndex >= this.steps.length) return;
    
    const stepElement = document.getElementById(this.steps[stepIndex].id);
    if (!stepElement) return;
    
    const statusElement = stepElement.querySelector('.step-status');
    if (!statusElement) return;
    
    let statusText = '';
    switch (status) {
      case 'pending':
        statusText = 'جاري...';
        break;
      case 'completed':
        statusText = 'تم ✓';
        break;
      case 'error':
        statusText = 'خطأ ✗';
        break;
      default:
        statusText = status;
    }
    
    if (message) {
      statusText += ` (${message})`;
    }
    
    statusElement.textContent = statusText;
    statusElement.className = `step-status ${status}`;
  }
  
  /**
   * الانتقال إلى الخطوة التالية
   * @param {string} message - رسالة إضافية (اختيارية)
   */
  nextStep(message = '') {
    if (!this.isProcessing) return;
    
    // إكمال الخطوة الحالية
    this.updateStepStatus(this.currentStep, 'completed', message);
    
    // الانتقال إلى الخطوة التالية
    this.currentStep++;
    
    // التحقق من انتهاء جميع الخطوات
    if (this.currentStep >= this.steps.length) {
      this.isProcessing = false;
      return;
    }
    
    // تحديث حالة الخطوة التالية
    this.updateStepStatus(this.currentStep, 'pending');
  }
  
  /**
   * تسجيل خطأ في الخطوة الحالية
   * @param {string} errorMessage - رسالة الخطأ
   */
  errorInCurrentStep(errorMessage = '') {
    if (!this.isProcessing) return;
    
    this.updateStepStatus(this.currentStep, 'error', errorMessage);
    this.isProcessing = false;
  }
  
  /**
   * إكمال جميع الخطوات
   */
  completeAllSteps() {
    if (!this.isProcessing) return;
    
    // إكمال الخطوة الحالية
    this.updateStepStatus(this.currentStep, 'completed');
    
    // إكمال جميع الخطوات المتبقية
    for (let i = this.currentStep + 1; i < this.steps.length; i++) {
      this.updateStepStatus(i, 'completed');
    }
    
    this.isProcessing = false;
  }
}

// إنشاء كائن عالمي لمتتبع التقدم
window.progressTracker = new ProgressTracker();