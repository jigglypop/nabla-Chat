import styles from './BGSelector.module.css'
import { backgrounds } from './constants';
import type { BGSelector } from './types';

export function BackgroundSelector({ background, setBackground }: BGSelector) {
  return (
    <div className={styles.backgroundSelector}>
         <div className={styles.trafficLights}>
        {backgrounds.map((bg) => (
          <button 
            key={bg.id}
            className={`${styles.trafficLight} ${background === bg.id ? styles.active : ''}`}
            style={{ background: bg.color }}
            onClick={(e) => {
              e.stopPropagation();
              setBackground(bg.id);
              localStorage.setItem('lovebug-background', bg.id);
            }}
            title={bg.name}
          />
        ))}
      </div>
    </div>
  );
}
