/**
 * نموذج للشموع اليابانية وأنماطها المختلفة مع إمكانية التعرف عليها
 */
public class JapaneseCandlesticks {

    /**
     * تمثيل الشمعة اليابانية الأساسية
     */
    public static class Candle {
        private double open;
        private double close;
        private double high;
        private double low;
        private long volume;
        private long timestamp;

        public Candle(double open, double close, double high, double low, long volume, long timestamp) {
            this.open = open;
            this.close = close;
            this.high = high;
            this.low = low;
            this.volume = volume;
            this.timestamp = timestamp;
        }

        // الدوال الأساسية للحصول على خصائص الشمعة
        public double getOpen() { return open; }
        public double getClose() { return close; }
        public double getHigh() { return high; }
        public double getLow() { return low; }
        public long getVolume() { return volume; }
        public long getTimestamp() { return timestamp; }

        // حساب طول جسم الشمعة
        public double getBodyLength() {
            return Math.abs(close - open);
        }

        // حساب طول الظل العلوي
        public double getUpperShadow() {
            return isGreen() ? high - close : high - open;
        }

        // حساب طول الظل السفلي
        public double getLowerShadow() {
            return isGreen() ? open - low : close - low;
        }

        // تحديد ما إذا كانت الشمعة خضراء (صاعدة)
        public boolean isGreen() {
            return close > open;
        }

        // تحديد ما إذا كانت الشمعة حمراء (هابطة)
        public boolean isRed() {
            return open > close;
        }

        // تحديد ما إذا كانت الشمعة دوجي (فتح وإغلاق متساويان تقريبًا)
        public boolean isDoji() {
            // نسبة صغيرة للسماح بفرق طفيف بين الفتح والإغلاق
            return getBodyLength() <= 0.05 * (high - low);
        }
    }

    /**
     * محلل أنماط الشموع اليابانية
     */
    public static class CandlePatternRecognizer {
        
        /**
         * التعرف على نمط الدوجي (Doji)
         * شمعة جسمها صغير جدًا مع ظلال علوية وسفلية
         */
        public static boolean isDoji(Candle candle) {
            return candle.isDoji();
        }
        
        /**
         * التعرف على نمط المطرقة (Hammer)
         * شمعة لها ظل سفلي طويل وجسم صغير في الأعلى
         */
        public static boolean isHammer(Candle candle) {
            double bodySize = candle.getBodyLength();
            double lowerShadow = candle.getLowerShadow();
            double upperShadow = candle.getUpperShadow();
            
            return lowerShadow >= 2 * bodySize && 
                   upperShadow <= 0.1 * bodySize &&
                   bodySize > 0;
        }
        
        /**
         * التعرف على نمط المطرقة المقلوبة (Inverted Hammer)
         * شمعة لها ظل علوي طويل وجسم صغير في الأسفل
         */
        public static boolean isInvertedHammer(Candle candle) {
            double bodySize = candle.getBodyLength();
            double lowerShadow = candle.getLowerShadow();
            double upperShadow = candle.getUpperShadow();
            
            return upperShadow >= 2 * bodySize && 
                   lowerShadow <= 0.1 * bodySize &&
                   bodySize > 0;
        }
        
        /**
         * التعرف على نمط النجمة المطلقة (Shooting Star)
         * شمعة لها ظل علوي طويل وجسم صغير في الأسفل، تظهر في اتجاه صاعد
         */
        public static boolean isShootingStar(Candle candle, Candle[] previousCandles) {
            if (previousCandles.length < 3) return false;
            
            boolean uptrend = isUptrend(previousCandles);
            double bodySize = candle.getBodyLength();
            double upperShadow = candle.getUpperShadow();
            
            return uptrend && 
                   upperShadow >= 2 * bodySize && 
                   candle.getLowerShadow() <= 0.1 * bodySize;
        }
        
        /**
         * التعرف على نمط البلع (Engulfing)
         */
        public static boolean isBullishEngulfing(Candle current, Candle previous) {
            return previous.isRed() && 
                   current.isGreen() && 
                   current.getOpen() < previous.getClose() && 
                   current.getClose() > previous.getOpen();
        }
        
        public static boolean isBearishEngulfing(Candle current, Candle previous) {
            return previous.isGreen() && 
                   current.isRed() && 
                   current.getOpen() > previous.getClose() && 
                   current.getClose() < previous.getOpen();
        }
        
        /**
         * التعرف على نمط الابتلاع (Harami)
         */
        public static boolean isBullishHarami(Candle current, Candle previous) {
            return previous.isRed() && 
                   current.isGreen() && 
                   current.getOpen() > previous.getClose() && 
                   current.getClose() < previous.getOpen();
        }
        
        public static boolean isBearishHarami(Candle current, Candle previous) {
            return previous.isGreen() && 
                   current.isRed() && 
                   current.getOpen() < previous.getClose() && 
                   current.getClose() > previous.getOpen();
        }
        
        /**
         * التعرف على نمط نجمة المساء (Evening Star)
         */
        public static boolean isEveningStar(Candle c1, Candle c2, Candle c3) {
            return c1.isGreen() && 
                   c1.getBodyLength() > 0 && 
                   c2.getBodyLength() < c1.getBodyLength() * 0.3 && 
                   c3.isRed() && 
                   c3.getClose() < (c1.getOpen() + c1.getClose()) / 2;
        }
        
        /**
         * التعرف على نمط نجمة الصباح (Morning Star)
         */
        public static boolean isMorningStar(Candle c1, Candle c2, Candle c3) {
            return c1.isRed() && 
                   c1.getBodyLength() > 0 && 
                   c2.getBodyLength() < c1.getBodyLength() * 0.3 && 
                   c3.isGreen() && 
                   c3.getClose() > (c1.getOpen() + c1.getClose()) / 2;
        }
        
        /**
         * التعرف على نمط الرجل المشنوق (Hanging Man)
         * مشابه للمطرقة لكن يظهر في اتجاه صاعد
         */
        public static boolean isHangingMan(Candle candle, Candle[] previousCandles) {
            if (previousCandles.length < 3) return false;
            
            boolean uptrend = isUptrend(previousCandles);
            double bodySize = candle.getBodyLength();
            double lowerShadow = candle.getLowerShadow();
            
            return uptrend && 
                   lowerShadow >= 2 * bodySize && 
                   candle.getUpperShadow() <= 0.1 * bodySize;
        }
        
        /**
         * التعرف على نمط ثلاث جنود بيض (Three White Soldiers)
         */
        public static boolean isThreeWhiteSoldiers(Candle c1, Candle c2, Candle c3) {
            return c1.isGreen() && c2.isGreen() && c3.isGreen() && 
                   c2.getClose() > c1.getClose() && 
                   c3.getClose() > c2.getClose() && 
                   c2.getOpen() > c1.getOpen() && 
                   c3.getOpen() > c2.getOpen();
        }
        
        /**
         * التعرف على نمط ثلاث غربان سود (Three Black Crows)
         */
        public static boolean isThreeBlackCrows(Candle c1, Candle c2, Candle c3) {
            return c1.isRed() && c2.isRed() && c3.isRed() && 
                   c2.getClose() < c1.getClose() && 
                   c3.getClose() < c2.getClose() && 
                   c2.getOpen() < c1.getOpen() && 
                   c3.getOpen() < c2.getOpen();
        }
        
        /**
         * التعرف على نمط النجمة (Spinning Top)
         * شمعة ذات جسم صغير وظلال علوية وسفلية
         */
        public static boolean isSpinningTop(Candle candle) {
            double bodySize = candle.getBodyLength();
            double totalLength = candle.getHigh() - candle.getLow();
            
            return bodySize <= 0.3 * totalLength && 
                   candle.getUpperShadow() > 0 && 
                   candle.getLowerShadow() > 0;
        }
        
        /**
         * التعرف على نمط الماروبوزو (Marubozu)
         * شمعة بدون ظلال (أو ظلال صغيرة جدًا)
         */
        public static boolean isMarubozu(Candle candle) {
            double upperShadow = candle.getUpperShadow();
            double lowerShadow = candle.getLowerShadow();
            double bodySize = candle.getBodyLength();
            
            return upperShadow <= 0.05 * bodySize && 
                   lowerShadow <= 0.05 * bodySize && 
                   bodySize > 0;
        }
        
        /**
         * التعرف على نمط الطفل المتروك (Abandoned Baby)
         */
        public static boolean isBullishAbandonedBaby(Candle c1, Candle c2, Candle c3) {
            return c1.isRed() && 
                   isDoji(c2) && 
                   c2.getLow() > c1.getHigh() && 
                   c3.isGreen() && 
                   c3.getLow() > c2.getHigh();
        }
        
        public static boolean isBearishAbandonedBaby(Candle c1, Candle c2, Candle c3) {
            return c1.isGreen() && 
                   isDoji(c2) && 
                   c2.getHigh() < c1.getLow() && 
                   c3.isRed() && 
                   c3.getHigh() < c2.getLow();
        }
        
        /**
         * التعرف على نمط الغطاء السحابي (Dark Cloud Cover)
         */
        public static boolean isDarkCloudCover(Candle c1, Candle c2) {
            return c1.isGreen() && 
                   c2.isRed() && 
                   c2.getOpen() > c1.getHigh() && 
                   c2.getClose() < (c1.getOpen() + c1.getClose()) / 2 && 
                   c2.getClose() > c1.getOpen();
        }
        
        /**
         * التعرف على نمط خط الاختراق (Piercing Line)
         */
        public static boolean isPiercingLine(Candle c1, Candle c2) {
            return c1.isRed() && 
                   c2.isGreen() && 
                   c2.getOpen() < c1.getLow() && 
                   c2.getClose() > (c1.getOpen() + c1.getClose()) / 2 && 
                   c2.getClose() < c1.getOpen();
        }
        
        /**
         * التعرف على نمط النجمة المتتالية (Tweezer)
         */
        public static boolean isTweezerTop(Candle c1, Candle c2) {
            return c1.isGreen() && 
                   c2.isRed() && 
                   Math.abs(c1.getHigh() - c2.getHigh()) <= 0.1 * c1.getBodyLength();
        }
        
        public static boolean isTweezerBottom(Candle c1, Candle c2) {
            return c1.isRed() && 
                   c2.isGreen() && 
                   Math.abs(c1.getLow() - c2.getLow()) <= 0.1 * c1.getBodyLength();
        }
        
        /**
         * تحديد ما إذا كان هناك اتجاه صاعد
         */
        private static boolean isUptrend(Candle[] candles) {
            if (candles.length < 3) return false;
            
            double sum = 0;
            for (int i = 0; i < candles.length - 1; i++) {
                sum += candles[i + 1].getClose() - candles[i].getClose();
            }
            
            return sum > 0;
        }
        
        /**
         * تحديد ما إذا كان هناك اتجاه هابط
         */
        private static boolean isDowntrend(Candle[] candles) {
            if (candles.length < 3) return false;
            
            double sum = 0;
            for (int i = 0; i < candles.length - 1; i++) {
                sum += candles[i + 1].getClose() - candles[i].getClose();
            }
            
            return sum < 0;
        }
    }
    
    /**
     * مثال على استخدام المكتبة
     */
    public static void main(String[] args) {
        // إنشاء بعض الشموع للاختبار
        Candle c1 = new Candle(100, 105, 107, 98, 1000, System.currentTimeMillis() - 3000);
        Candle c2 = new Candle(106, 104, 108, 102, 1200, System.currentTimeMillis() - 2000);
        Candle c3 = new Candle(104, 110, 112, 103, 1500, System.currentTimeMillis() - 1000);
        
        // اختبار بعض الأنماط
        System.out.println("هل الشمعة الأولى دوجي؟ " + CandlePatternRecognizer.isDoji(c1));
        System.out.println("هل الشمعة الثانية مطرقة؟ " + CandlePatternRecognizer.isHammer(c2));
        
        // اختبار نمط البلع الصاعد
        System.out.println("هل يوجد نمط البلع الصاعد بين الشمعة الثانية والثالثة؟ " + 
                          CandlePatternRecognizer.isBullishEngulfing(c3, c2));
        
        // اختبار نمط ثلاث جنود بيض
        System.out.println("هل يوجد نمط ثلاث جنود بيض؟ " + 
                          CandlePatternRecognizer.isThreeWhiteSoldiers(c1, c2, c3));
    }
}