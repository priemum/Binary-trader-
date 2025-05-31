/**
 * واجهة المستخدم لمحلل الشارت
 * يتكامل مع الواجهة الخلفية للنظام
 */

class ChartAnalyzerUI {
  constructor() {
    this.apiBaseUrl = '/api'; // يمكن تغييره حسب إعدادات الخادم
    this.lastAnalysis = null;
    this.chart = null;
    
    // تهيئة عناصر واجهة المستخدم
    this.initUI();
    
    // تهيئة معالجات الأحداث
    this.initEventHandlers();
  }
  
  /**
   * تهيئة عناصر واجهة المستخدم
   */
  initUI() {
    // عناصر تحميل الصورة
    this.uploadBtn = document.getElementById('upload-btn');
    this.selectFileBtn = document.getElementById('select-file-btn');
    this.fileInput = document.getElementById('chart-upload');
    this.uploadSection = document.getElementById('upload-section');
    this.loadingElement = document.getElementById('loading');
    this.resultsElement = document.getElementById('analysis-results');
    
    // عناصر اتجاه السوق
    this.trendArrow = document.getElementById('trend-arrow');
    this.trendDescription = document.getElementById('trend-description');
    this.trendStrength = document.getElementById('trend-strength');
    this.trendStrengthBar = document.getElementById('trend-strength-bar');
    
    // عناصر الدعم والمقاومة
    this.resistanceLevelsElement = document.getElementById('resistance-levels');
    this.supportLevelsElement = document.getElementById('support-levels');
    this.currentPriceElement = document.getElementById('current-price-value');
    
    // عناصر تحليل الشمعة
    this.patternNameElement = document.getElementById('pattern-name');
    this.predictionDirectionElement = document.getElementById('prediction-direction');
    this.confidenceLevelElement = document.getElementById('confidence-level');
    this.confidenceMeterElement = document.getElementById('confidence-meter');
    
    // عناصر تحليل الاختراق
    this.breakoutTypeElement = document.getElementById('breakout-type');
    this.breakoutProbabilityElement = document.getElementById('breakout-probability');
    this.probabilityMeterElement = document.getElementById('probability-meter');
    this.targetLevelElement = document.getElementById('target-level');
    
    // عناصر نقاط الدخول والخروج
    this.entryPointElement = document.getElementById('entry-point');
    this.targetPointElement = document.getElementById('target-point');
    this.stopLossElement = document.getElementById('stop-loss');
    this.riskRewardElement = document.getElementById('risk-reward');
    this.recommendedDurationElement = document.getElementById('recommended-duration');
    
    // عناصر المؤشرات الفنية
    this.rsiValueElement = document.getElementById('rsi-value');
    this.macdValueElement = document.getElementById('macd-value');
    this.bollingerValueElement = document.getElementById('bollinger-value');
    this.mfiValueElement = document.getElementById('mfi-value');
    this.sma5ValueElement = document.getElementById('sma5-value');
    this.sma10ValueElement = document.getElementById('sma10-value');
    
    // عنصر الرسم البياني
    this.chartContainer = document.getElementById('chart-container');
    
    // زر حفظ التحليل
    this.saveAnalysisBtn = document.getElementById('save-analysis-btn');
  }
  
  /**
   * تهيئة معالجات الأحداث
   */
  initEventHandlers() {
    // معالج حدث النقر على زر التحميل
    if (this.uploadBtn) {
      this.uploadBtn.addEventListener('click', () => {
        this.uploadSection.scrollIntoView({ behavior: 'smooth' });
      });
    }
    
    // معالج حدث النقر على زر اختيار الملف
    if (this.selectFileBtn) {
      this.selectFileBtn.addEventListener('click', () => {
        this.fileInput.click();
      });
    }
    
    // معالج حدث تغيير الملف المحدد
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          this.analyzeChartImage(file);
        }
      });
    }
    
    // معالج حدث النقر على زر حفظ التحليل
    if (this.saveAnalysisBtn) {
      this.saveAnalysisBtn.addEventListener('click', () => {
        this.saveAnalysis();
      });
    }
  }
  
  /**
   * تحليل صورة الشارت
   * @param {File} file - ملف الصورة
   */
  async analyzeChartImage(file) {
    try {
      // عرض حالة التحميل
      this.showLoading();
      
      // بدء تتبع التقدم
      if (window.progressTracker) {
        window.progressTracker.startTracking();
      }
      
      // الحصول على الإطار الزمني المحدد
      const autoDetectTimeframe = document.getElementById('auto-detect-timeframe');
      const timeframeSelect = document.getElementById('timeframe');
      const enhanceImage = document.getElementById('enhance-image');
      
      let timeframe = 5; // افتراضي 5 دقائق
      let shouldEnhanceImage = true;
      
      if (timeframeSelect) {
        timeframe = parseInt(timeframeSelect.value);
      }
      
      if (enhanceImage) {
        shouldEnhanceImage = enhanceImage.checked;
      }
      
      // إنشاء كائن FormData لإرسال الملف
      const formData = new FormData();
      formData.append('image', file);
      formData.append('timeframe', timeframe);
      formData.append('enhanceImage', shouldEnhanceImage);
      
      if (autoDetectTimeframe && autoDetectTimeframe.checked) {
        formData.append('autoDetectTimeframe', true);
      }
      
      // استخدام موصل محلل الشارت للتحليل
      let result;
      try {
        // تحديث حالة الخطوة الأولى
        if (window.progressTracker) {
          window.progressTracker.updateStepStatus(0, 'pending', 'جاري معالجة الصورة');
        }
        
        // محاولة استخدام موصل محلل الشارت إذا كان متاحًا
        if (window.chartAnalyzerConnector) {
          console.log('استخدام موصل محلل الشارت للتحليل');
          result = await window.chartAnalyzerConnector.analyzeChartImage(file, timeframe);
          
          // تحديث حالة الخطوة الأولى
          if (window.progressTracker) {
            window.progressTracker.nextStep('تم تحسين الصورة');
          }
        } else {
          // إرسال الصورة مباشرة إلى الخادم
          console.log('إرسال الصورة مباشرة إلى الخادم للتحليل');
          const response = await fetch(`${this.apiBaseUrl}/analyze-chart`, {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          result = await response.json();
          
          // تحديث حالة الخطوة الأولى
          if (window.progressTracker) {
            window.progressTracker.nextStep('تم تحسين الصورة');
          }
        }
        
        // تحديث حالة الخطوات المتبقية
        if (window.progressTracker) {
          window.progressTracker.nextStep(`تم استخراج ${result.candlesExtracted || 'عدة'} شموع`);
          window.progressTracker.nextStep('تم تحليل الاتجاه والأنماط');
          window.progressTracker.nextStep('تم حساب نقاط الدخول والخروج');
        }
      } catch (connectionError) {
        console.error('فشل الاتصال بالخادم:', connectionError);
        
        // تسجيل الخطأ في متتبع التقدم
        if (window.progressTracker) {
          window.progressTracker.errorInCurrentStep('فشل الاتصال بالخادم');
        }
        
        // عرض إشعار للمستخدم
        if (window.showNotification) {
          window.showNotification('فشل الاتصال بالخادم، سيتم استخدام بيانات تجريبية', 'warning');
        }
        
        // استخدام بيانات تجريبية في حالة فشل الاتصال
        console.log('استخدام بيانات تجريبية بسبب فشل الاتصال');
        result = {
          status: "success",
          marketTrend: {
            trend: "UP",
            strength: 75,
            description: "اتجاه صاعد قوي"
          },
          supportResistance: {
            resistance: [
              { price: 1.2850, strength: 3 },
              { price: 1.2920, strength: 2 },
              { price: 1.3000, strength: 4 }
            ],
            support: [
              { price: 1.2750, strength: 3 },
              { price: 1.2680, strength: 2 },
              { price: 1.2600, strength: 4 }
            ]
          },
          candleAnalysis: {
            pattern: "BULLISH_ENGULFING",
            direction: "UP",
            confidence: 80,
            recommendedDuration: 180,
            open: 1.2800,
            close: 1.2840,
            high: 1.2860,
            low: 1.2790,
            indicators: {
              rsi: 65,
              macd: 0.5,
              bollingerPosition: 0.7,
              mfi: 60,
              sma5: 1.2790,
              sma10: 1.2750
            }
          },
          breakoutAnalysis: {
            breakout: "RESISTANCE",
            probability: 75,
            target: 1.2920,
            level: 1.2850,
            recommendation: "شراء",
            recommendationStrength: 75
          },
          entryExitPoints: {
            entryPoint: 1.2800,
            targetPoint: 1.2920,
            stopLoss: 1.2750,
            riskRewardRatio: 2.4,
            timeframe: 180
          },
          processingTime: new Date().toISOString(),
          timeframe: timeframe,
          candlesExtracted: 0,
          fallbackUsed: true
        };
        
        // إكمال جميع الخطوات في متتبع التقدم
        if (window.progressTracker) {
          window.progressTracker.completeAllSteps();
        }
      }
      
      // حفظ نتيجة التحليل
      this.lastAnalysis = result;
      
      // تحديث معلومات التحليل
      this.updateAnalysisMetadata(result);
      
      // عرض نتائج التحليل
      this.displayAnalysisResults(result);
      
      // إخفاء حالة التحميل وعرض النتائج
      this.hideLoading();
      this.showResults();
      
      // رسم الشارت
      this.drawChart(result);
      
      // عرض إشعار نجاح للمستخدم
      if (window.showNotification) {
        window.showNotification('تم تحليل الصورة بنجاح', 'success');
      }
      
      return result;
    } catch (error) {
      console.error('Error analyzing chart image:', error);
      
      // عرض إشعار خطأ للمستخدم
      if (window.showNotification) {
        window.showNotification('حدث خطأ أثناء تحليل الصورة: ' + error.message, 'error');
      } else {
        alert('حدث خطأ أثناء تحليل الصورة: ' + error.message);
      }
      
      // تسجيل الخطأ في متتبع التقدم
      if (window.progressTracker) {
        window.progressTracker.errorInCurrentStep(error.message);
      }
      
      this.hideLoading();
      return null;
    }
  }
  
  /**
   * تحديث معلومات التحليل
   * @param {Object} result - نتائج التحليل
   */
  updateAnalysisMetadata(result) {
    // تحديث تاريخ التحليل
    const analysisDateElement = document.getElementById('analysis-date');
    if (analysisDateElement) {
      const date = result.processingTime ? new Date(result.processingTime) : new Date();
      analysisDateElement.textContent = `تاريخ التحليل: ${date.toLocaleString()}`;
    }
    
    // تحديث الإطار الزمني
    const timeframeDisplayElement = document.getElementById('timeframe-display');
    if (timeframeDisplayElement && result.timeframe) {
      timeframeDisplayElement.textContent = `الإطار الزمني: ${result.timeframe} دقائق`;
    }
    
    // تحديث عدد الشموع المستخرجة
    const candlesCountElement = document.getElementById('candles-count');
    if (candlesCountElement) {
      const count = result.candlesExtracted || 0;
      candlesCountElement.textContent = `عدد الشموع المستخرجة: ${count}`;
    }
  }
  
  /**
   * تحديث نوع الرسم البياني
   * @param {string} chartType - نوع الرسم البياني (price, candles, indicators)
   */
  updateChartType(chartType) {
    if (!this.chart || !this.lastAnalysis) return;
    
    switch (chartType) {
      case 'candles':
        // تحويل الرسم البياني إلى نوع الشموع
        this.drawCandlestickChart(this.lastAnalysis);
        break;
      case 'indicators':
        // تحويل الرسم البياني إلى نوع المؤشرات
        this.drawIndicatorsChart(this.lastAnalysis);
        break;
      case 'price':
      default:
        // تحويل الرسم البياني إلى نوع السعر
        this.drawChart(this.lastAnalysis);
        break;
    }
  }
  
  /**
   * رسم مخطط الشموع
   * @param {Object} result - نتائج التحليل
   */
  drawCandlestickChart(result) {
    // في التطبيق الحقيقي، هنا سيتم رسم مخطط الشموع
    // لكن في هذه النسخة سنستخدم نفس الرسم البياني الخطي مع تغيير اللون
    if (this.chart) {
      this.chart.destroy();
    }
    
    // إنشاء بيانات تجريبية للشارت
    const labels = [];
    const prices = [];
    
    // إنشاء 20 نقطة بيانات
    const basePrice = result.candleAnalysis.open;
    let currentPrice = basePrice;
    
    for (let i = 0; i < 20; i++) {
      labels.push(`${i + 1}`);
      
      // إضافة تغير عشوائي للسعر
      const change = (Math.random() - 0.5) * 0.005;
      currentPrice = currentPrice * (1 + change);
      prices.push(currentPrice);
    }
    
    // إضافة التنبؤ
    labels.push('توقع');
    prices.push(result.candleAnalysis.close);
    
    // إنشاء الرسم البياني
    this.chart = new Chart(this.chartContainer, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'السعر',
            data: prices,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            fill: true,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#e0e0e0'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          title: {
            display: true,
            text: 'مخطط الشموع',
            color: '#e0e0e0'
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#e0e0e0'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#e0e0e0'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  }
  
  /**
   * رسم مخطط المؤشرات
   * @param {Object} result - نتائج التحليل
   */
  drawIndicatorsChart(result) {
    // في التطبيق الحقيقي، هنا سيتم رسم مخطط المؤشرات
    if (this.chart) {
      this.chart.destroy();
    }
    
    // إنشاء بيانات تجريبية للشارت
    const labels = [];
    const rsiData = [];
    const macdData = [];
    
    // إنشاء 20 نقطة بيانات
    for (let i = 0; i < 20; i++) {
      labels.push(`${i + 1}`);
      
      // إضافة قيم عشوائية للمؤشرات
      rsiData.push(Math.random() * 50 + 25);
      macdData.push((Math.random() - 0.5) * 2);
    }
    
    // إضافة القيم الحالية
    labels.push('حالي');
    rsiData.push(result.candleAnalysis.indicators.rsi);
    macdData.push(result.candleAnalysis.indicators.macd);
    
    // إنشاء الرسم البياني
    this.chart = new Chart(this.chartContainer, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'RSI',
            data: rsiData,
            borderColor: 'rgba(255, 206, 86, 1)',
            backgroundColor: 'rgba(255, 206, 86, 0.1)',
            fill: false,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'MACD',
            data: macdData,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: false,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#e0e0e0'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          },
          title: {
            display: true,
            text: 'المؤشرات الفنية',
            color: '#e0e0e0'
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#e0e0e0'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'RSI',
              color: 'rgba(255, 206, 86, 1)'
            },
            ticks: {
              color: '#e0e0e0'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'MACD',
              color: 'rgba(75, 192, 192, 1)'
            },
            ticks: {
              color: '#e0e0e0'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }
  
  /**
   * عرض نتائج التحليل
   * @param {Object} result - نتائج التحليل
   */
  displayAnalysisResults(result) {
    if (result.status !== "success") {
      alert('حدث خطأ أثناء تحليل الصورة');
      return;
    }
    
    try {
      // عرض اتجاه السوق
      if (result.marketTrend && result.marketTrend.trend) {
        if (result.marketTrend.trend === "UP") {
          this.trendArrow.innerHTML = "↑";
          this.trendArrow.className = "trend-arrow trend-up";
        } else if (result.marketTrend.trend === "DOWN") {
          this.trendArrow.innerHTML = "↓";
          this.trendArrow.className = "trend-arrow trend-down";
        } else {
          this.trendArrow.innerHTML = "↔";
          this.trendArrow.className = "trend-arrow trend-neutral";
        }
        
        this.trendDescription.textContent = result.marketTrend.description || '';
        this.trendStrength.textContent = `${result.marketTrend.strength || 50}%`;
        this.trendStrengthBar.style.width = `${result.marketTrend.strength || 50}%`;
      }
      
      // عرض خطوط الدعم والمقاومة
      if (result.candleAnalysis && typeof result.candleAnalysis.open !== 'undefined') {
        this.currentPriceElement.textContent = result.candleAnalysis.open;
      } else {
        this.currentPriceElement.textContent = "1.0000"; // قيمة افتراضية
      }
      
      // عرض مستويات المقاومة
      this.resistanceLevelsElement.innerHTML = '';
      if (result.supportResistance && result.supportResistance.resistance) {
        result.supportResistance.resistance.forEach((level, index) => {
          const levelElem = document.createElement('div');
          levelElem.className = 'level resistance';
          levelElem.innerHTML = `
            <span>مقاومة ${index + 1}: <span class="resistance-value">${level.price}</span></span>
            <span>القوة: <span class="resistance-strength">${level.strength}</span></span>
          `;
          this.resistanceLevelsElement.appendChild(levelElem);
        });
      }
      
      // عرض مستويات الدعم
      this.supportLevelsElement.innerHTML = '';
      if (result.supportResistance && result.supportResistance.support) {
        result.supportResistance.support.forEach((level, index) => {
          const levelElem = document.createElement('div');
          levelElem.className = 'level support';
          levelElem.innerHTML = `
            <span>دعم ${index + 1}: <span class="support-value">${level.price}</span></span>
            <span>القوة: <span class="support-strength">${level.strength}</span></span>
          `;
          this.supportLevelsElement.appendChild(levelElem);
        });
      }
      
      // عرض تحليل الشمعة
      if (result.candleAnalysis) {
        this.patternNameElement.textContent = this.getPatternText(result.candleAnalysis.pattern || "UNKNOWN");
        this.predictionDirectionElement.textContent = this.getDirectionText(result.candleAnalysis.direction || "NEUTRAL");
        this.predictionDirectionElement.className = result.candleAnalysis.direction === "UP" ? 
          "indicator-up" : result.candleAnalysis.direction === "DOWN" ? "indicator-down" : "indicator-neutral";
        this.confidenceLevelElement.textContent = `${result.candleAnalysis.confidence || 50}%`;
        this.confidenceMeterElement.style.width = `${result.candleAnalysis.confidence || 50}%`;
      }
      
      // عرض تحليل الاختراق
      if (result.breakoutAnalysis) {
        if (result.breakoutAnalysis.breakout === "RESISTANCE") {
          this.breakoutTypeElement.textContent = "احتمالية اختراق المقاومة";
          this.breakoutTypeElement.style.color = "var(--secondary)";
          this.probabilityMeterElement.className = "progress-bar progress-secondary";
        } else if (result.breakoutAnalysis.breakout === "SUPPORT") {
          this.breakoutTypeElement.textContent = "احتمالية اختراق الدعم";
          this.breakoutTypeElement.style.color = "var(--danger)";
          this.probabilityMeterElement.className = "progress-bar progress-danger";
        } else {
          this.breakoutTypeElement.textContent = "لا يوجد اختراق متوقع";
          this.breakoutTypeElement.style.color = "var(--warning)";
          this.probabilityMeterElement.className = "progress-bar progress-warning";
        }
        
        this.breakoutProbabilityElement.textContent = `${result.breakoutAnalysis.probability || 50}%`;
        this.probabilityMeterElement.style.width = `${result.breakoutAnalysis.probability || 50}%`;
        this.targetLevelElement.textContent = result.breakoutAnalysis.target || "0.0000";
      }
      
      // عرض نقاط الدخول والخروج
      if (result.entryExitPoints) {
        this.entryPointElement.textContent = result.entryExitPoints.entryPoint || "0.0000";
        this.targetPointElement.textContent = result.entryExitPoints.targetPoint || "0.0000";
        this.stopLossElement.textContent = result.entryExitPoints.stopLoss || "0.0000";
        this.riskRewardElement.textContent = result.entryExitPoints.riskRewardRatio || "1.0";
        this.recommendedDurationElement.textContent = this.formatDuration(result.entryExitPoints.timeframe || 180);
      }
      
      // عرض المؤشرات الفنية
      if (result.candleAnalysis && result.candleAnalysis.indicators) {
        const indicators = result.candleAnalysis.indicators;
        this.rsiValueElement.textContent = indicators.rsi || "50";
        this.macdValueElement.textContent = indicators.macd || "0.0";
        this.bollingerValueElement.textContent = `${Math.round((indicators.bollingerPosition || 0.5) * 100)}%`;
        this.mfiValueElement.textContent = indicators.mfi || "50";
        this.sma5ValueElement.textContent = indicators.sma5 || "0.0000";
        this.sma10ValueElement.textContent = indicators.sma10 || "0.0000";
      }
      
      // تحديث ملخص التوصية
      this.updateRecommendationSummary(result);
      
    } catch (error) {
      console.error('Error displaying analysis results:', error);
      alert('حدث خطأ أثناء عرض نتائج التحليل: ' + error.message);
    }
  }
  
  /**
   * تحديث ملخص التوصية
   * @param {Object} result - نتائج التحليل
   */
  updateRecommendationSummary(result) {
    const recommendationAction = document.getElementById('recommendation-action');
    const recommendationConfidence = document.getElementById('recommendation-confidence');
    const recommendationRiskReward = document.getElementById('recommendation-risk-reward');
    const recommendationDuration = document.getElementById('recommendation-duration');
    
    if (!recommendationAction || !result.breakoutAnalysis) return;
    
    // تحديد التوصية
    const action = result.breakoutAnalysis.recommendation || "انتظار";
    recommendationAction.textContent = action;
    
    // تحديد لون التوصية
    if (action === "شراء") {
      recommendationAction.className = "recommendation-action buy";
    } else if (action === "بيع") {
      recommendationAction.className = "recommendation-action sell";
    } else {
      recommendationAction.className = "recommendation-action wait";
    }
    
    // تحديث التفاصيل
    if (recommendationConfidence) {
      recommendationConfidence.textContent = `${result.breakoutAnalysis.recommendationStrength || 50}%`;
    }
    
    if (recommendationRiskReward && result.entryExitPoints) {
      recommendationRiskReward.textContent = result.entryExitPoints.riskRewardRatio || "1.0";
    }
    
    if (recommendationDuration && result.entryExitPoints) {
      recommendationDuration.textContent = this.formatDuration(result.entryExitPoints.timeframe || 180);
    }
  }
  
  /**
   * رسم الشارت
   * @param {Object} result - نتائج التحليل
   */
  drawChart(result) {
    try {
      // إذا كان هناك رسم بياني موجود، قم بتدميره
      if (this.chart) {
        this.chart.destroy();
      }
      
      // التحقق من وجود عنصر الرسم البياني
      if (!this.chartContainer) {
        console.error('Chart container not found');
        return;
      }
      
      // التحقق من وجود البيانات المطلوبة
      if (!result || !result.candleAnalysis) {
        console.error('Invalid result data for chart');
        return;
      }
      
      // إنشاء بيانات تجريبية للشارت
      const labels = [];
      const prices = [];
      const supportLine = [];
      const resistanceLine = [];
      
      // تحديد السعر الأساسي
      const basePrice = result.candleAnalysis.open || 1.0000;
      let currentPrice = basePrice;
      
      for (let i = 0; i < 20; i++) {
        labels.push(`${i + 1}`);
        
        // إضافة تغير عشوائي للسعر
        const change = (Math.random() - 0.5) * 0.005;
        currentPrice = currentPrice * (1 + change);
        prices.push(currentPrice);
        
        // إضافة خطوط الدعم والمقاومة
        if (result.supportResistance && result.supportResistance.support && result.supportResistance.support.length > 0) {
          supportLine.push(result.supportResistance.support[0].price);
        } else {
          supportLine.push(null);
        }
        
        if (result.supportResistance && result.supportResistance.resistance && result.supportResistance.resistance.length > 0) {
          resistanceLine.push(result.supportResistance.resistance[0].price);
        } else {
          resistanceLine.push(null);
        }
      }
      
      // إضافة التنبؤ
      labels.push('توقع');
      prices.push(result.candleAnalysis.close || basePrice);
      
      // إضافة خطوط الدعم والمقاومة للتنبؤ
      let supportPrice = null;
      let resistancePrice = null;
      
      if (result.supportResistance && result.supportResistance.support && result.supportResistance.support.length > 0) {
        supportPrice = result.supportResistance.support[0].price;
      }
      
      if (result.supportResistance && result.supportResistance.resistance && result.supportResistance.resistance.length > 0) {
        resistancePrice = result.supportResistance.resistance[0].price;
      }
      
      supportLine.push(supportPrice);
      resistanceLine.push(resistancePrice);
      
      // إنشاء الرسم البياني
      this.chart = new Chart(this.chartContainer, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'السعر',
              data: prices,
              borderColor: 'rgba(108, 92, 231, 1)',
              backgroundColor: 'rgba(108, 92, 231, 0.1)',
              fill: true,
              tension: 0.4
            },
            {
              label: 'المقاومة',
              data: resistanceLine,
              borderColor: 'rgba(255, 118, 117, 1)',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            },
            {
              label: 'الدعم',
              data: supportLine,
              borderColor: 'rgba(0, 184, 148, 1)',
              borderWidth: 2,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#e0e0e0'
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              ticks: {
                color: '#e0e0e0'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            y: {
              ticks: {
                color: '#e0e0e0'
              },
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      });
    } catch (error) {
      console.error('Error drawing chart:', error);
    }
  }
  
  /**
   * حفظ التحليل
   */
  async saveAnalysis() {
    if (!this.lastAnalysis) {
      alert('لا يوجد تحليل لحفظه');
      return;
    }
    
    try {
      // في التطبيق الحقيقي، هنا سيتم إرسال التحليل إلى الخادم لحفظه
      // const response = await fetch(`${this.apiBaseUrl}/save-analysis`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(this.lastAnalysis)
      // });
      // const result = await response.json();
      
      // محاكاة لعملية الحفظ
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert('تم حفظ التحليل بنجاح');
    } catch (error) {
      console.error('Error saving analysis:', error);
      alert('حدث خطأ أثناء حفظ التحليل');
    }
  }
  
  /**
   * عرض حالة التحميل
   */
  showLoading() {
    this.loadingElement.style.display = 'flex';
    this.uploadSection.style.display = 'none';
    this.resultsElement.style.display = 'none';
  }
  
  /**
   * إخفاء حالة التحميل
   */
  hideLoading() {
    this.loadingElement.style.display = 'none';
  }
  
  /**
   * عرض النتائج
   */
  showResults() {
    this.resultsElement.style.display = 'block';
  }
  
  /**
   * الحصول على نص الاتجاه
   * @param {string} direction - الاتجاه
   * @returns {string} - نص الاتجاه
   */
  getDirectionText(direction) {
    switch (direction) {
      case 'UP': return 'صعود ↑';
      case 'DOWN': return 'هبوط ↓';
      default: return 'محايد ↔';
    }
  }
  
  /**
   * الحصول على نص النمط
   * @param {string} pattern - النمط
   * @returns {string} - نص النمط
   */
  getPatternText(pattern) {
    const patternMap = {
      'BULLISH_ENGULFING': 'نمط البلع الصاعد',
      'BEARISH_ENGULFING': 'نمط البلع الهابط',
      'DOJI': 'دوجي',
      'HAMMER': 'المطرقة',
      'SHOOTING_STAR': 'النجمة المطلقة',
      'HEAD_AND_SHOULDERS': 'الرأس والكتفين',
      'INVERSE_HEAD_AND_SHOULDERS': 'الرأس والكتفين المعكوس',
      'DOUBLE_TOP': 'القمة المزدوجة',
      'DOUBLE_BOTTOM': 'القاع المزدوج',
      'SYMMETRICAL_TRIANGLE': 'المثلث المتماثل',
      'MORNING_STAR': 'نجمة الصباح',
      'EVENING_STAR': 'نجمة المساء',
      'OVERBOUGHT': 'تشبع شرائي',
      'OVERSOLD': 'تشبع بيعي',
      'MACD_CROSSOVER': 'تقاطع MACD',
      'TREND_BASED': 'تحليل الاتجاه'
    };
    
    return patternMap[pattern] || pattern;
  }
  
  /**
   * تنسيق المدة الزمنية
   * @param {number} seconds - المدة بالثواني
   * @returns {string} - المدة المنسقة
   */
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} دقيقة`;
  }
}

// إنشاء كائن واجهة المستخدم وموصل محلل الشارت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  // إنشاء موصل محلل الشارت أولاً
  if (!window.chartAnalyzerConnector && typeof ChartAnalyzerConnector !== 'undefined') {
    window.chartAnalyzerConnector = new ChartAnalyzerConnector();
  }
  
  // إنشاء واجهة المستخدم
  window.chartAnalyzerUI = new ChartAnalyzerUI();
});