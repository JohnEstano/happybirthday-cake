import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Cake.module.scss';

export interface CakeProps {
  candles: boolean[];
  isBlowing: boolean;
}

const Cake: React.FC<CakeProps> = ({ candles, isBlowing }) => (
  <div className={styles.cake}>
    <div className={styles.plate} />
    <div className={`${styles.layer} ${styles['layer-bottom']}`} />
    <div className={`${styles.layer} ${styles['layer-middle']}`} />
    <div className={`${styles.layer} ${styles['layer-top']}`} />
    <div className={styles.icing} />
    <div className={`${styles.drip} ${styles['drip1']}`} />
    <div className={`${styles.drip} ${styles['drip2']}`} />
    <div className={`${styles.drip} ${styles['drip3']}`} />

    {/* Candles */}
    <div className={styles.candlesContainer}>
      {candles.map((isLit, idx) => (
        <div key={idx} className={styles.candle}>
          <div className={styles.candleBody} />
          <AnimatePresence>
            {isLit && (
              <motion.div
                className={styles.flame}
                initial={{ scale: 0 }}
                animate={{
                  scale: [1, 0.9, 1],
                  y: [0, -5, 0],
                  transition: { repeat: Infinity, duration: 0.8 },
                }}
                exit={{ scale: 0 }}
              >
                {isBlowing && (
                  <motion.div
                    className={styles.flameInner}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  </div>
);

export default Cake;
