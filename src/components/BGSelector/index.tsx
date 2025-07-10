import styles from './BGSelector.module.css'
import { backgrounds } from './constants';

export function BackgroundSelector({ background, setBackground }: {
  background: string,
  setBackground: (bg: string) => void
}) {
  return (
    <div className={styles.backgroundSelector}>
      <div className={styles.trafficLights}>
        {backgrounds.map((bg) => (
          <button 
            key={bg.id}
            className={`${styles.trafficLight} ${background === bg.id ? styles.active : ''}`}
            style={{ background: bg.color }}
            onClick={() => {
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
