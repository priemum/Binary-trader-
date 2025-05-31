/**
 * متتبع تقدم التحليل
 * يعرض تقدم عملية تحليل الشارت
 */

class ProgressTracker {
  constructor() {
    this.progressBar = document.getElementById('analysis-progress-bar');
    this.progressText = document.getElementById('analysis-progress-text');
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.animationFrame = null;
    this.analysisSteps = [
      { name: 'تهيئة التحليل', progress: 5 },
      { name: 'معالجة الصورة', progress: 15 },
      { name: 'استخراج الشموع', progress: 25 },
      { name: 'تحليل الشموع الأخيرة', progress: 35 },
      { name: 'تحليل المؤشرات الفنية', progress: 50 },
      { name: 'تحليل الدعم والمقاومة', progress: 65 },
      { name: 'تحليل الاتجاه', progress: 75 },
      { name: 'دمج نتائج التحليل', progress: 85 },
      { name: 'التحقق من دقة النتائج', progress: 95 },
      { name: 'اكتمال التحليل', progress: 100 }
    ];
  }
  
  /**
   * بدء تتبع التقدم
   */
  start() {
    this.reset();
    this.updateProgress(1); // بدء من 1%
    this.autoAdvance();
  }
  
  /**
   * إعادة تعيين التقدم
   */
  reset() {
    this.stopAnimation();
    this.currentProgress = 0;
    this.targetProgress = 0;
    this.updateProgressBar(0);
  }
  
  /**
   * تحديث التقدم إلى قيمة محددة
   * @param {number} progress - نسبة التقدم (0-100)
   */
  updateProgress(progress) {
    this.targetProgress = Math.min(Math.max(progress, 0), 100);
    this.animateProgress();
  }
  
  /**
   * تحريك التقدم إلى الخطوة التالية
   * @param {number} stepIndex - مؤشر الخطوة
   */
  advanceToStep(stepIndex) {
    if (stepIndex >= 0 && stepIndex < this.analysisSteps.length) {
      const step = this.analysisSteps[stepIndex];
      this.updateProgress(step.progress);
      
      // تحديث نص الخطوة
      if (this.progressText) {
        this.progressText.textContent = `${step.progress}% - ${step.name}`;
      }
    }
  }
  
  /**
   * تقدم تلقائي للتقدم
   */
  autoAdvance() {
    let currentStep = 0;
    
    // تقدم للخطوة الأولى فورًا
    this.advanceToStep(currentStep);
    currentStep++;
    
    // جدولة الخطوات التالية
    const stepInterval = setInterval(() => {
      if (currentStep < this.analysisSteps.length) {
        this.advanceToStep(currentStep);
        currentStep++;
      } else {
        clearInterval(stepInterval);
      }
    }, 2500); // كل خطوة تستغرق 2.5 ثانية
    
    // تخزين المؤقت للتنظيف لاحقًا
    this.stepInterval = stepInterval;
  }
  
  /**
   * تحريك التقدم بسلاسة
   * @private
   */
  animateProgress() {
    this.stopAnimation();
    
    const animate = () => {
      // تحريك التقدم الحالي نحو الهدف
      if (Math.abs(this.currentProgress - this.targetProgress) < 0.5) {
        this.currentProgress = this.targetProgress;
      } else {
        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.1;
      }
      
      // تحديث شريط التقدم
      this.updateProgressBar(this.currentProgress);
      
      // الاستمرار في التحريك إذا لم نصل إلى الهدف بعد
      if (this.currentProgress !== this.targetProgress) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  /**
   * إيقاف التحريك
   * @private
   */
  stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.stepInterval) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
  }
  
  /**
   * تحديث شريط التقدم
   * @param {number} progress - نسبة التقدم (0-100)
   * @private
   */
  updateProgressBar(progress) {
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
    }
    
    if (this.progressText) {
      this.progressText.textContent = `${Math.round(progress)}%`;
    }
  }
  
  /**
   * إكمال التقدم
   */
  complete() {
    this.stopAnimation();
    this.updateProgress(100);
    
    if (this.progressText) {
      this.progressText.textContent = '100% - اكتمل التحليل';
    }
    
    // إخفاء شريط التقدم بعد فترة قصيرة
    setTimeout(() => {
      if (this.progressBar && this.progressBar.parentElement) {
        this.progressBar.parentElement.style.opacity = '0';
        
        setTimeout(() => {
          if (this.progressBar && this.progressBar.parentElement) {
            this.progressBar.parentElement.style.display = 'none';
          }
        }, 500);
      }
    }, 1000);
  }
}

// إنشاء كائن عالمي لمتتبع التقدم
document.addEventListener('DOMContentLoaded', function() {
  window.progressTracker = new ProgressTracker();
});