import styles from "./Spinner.module.css"

interface SpinnerProps {
  fullScreen?: boolean
}

export function Spinner({ fullScreen = false }: SpinnerProps) {
  if (fullScreen) {
    return (
      <div className={styles.overlay} role="status" aria-label="Loading">
        <div className={styles.bricks}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.brick} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <span className={styles.inline} role="status" aria-label="Loading">
      <span className={styles.inlineBricks}>
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className={styles.inlineBrick} />
        ))}
      </span>
    </span>
  )
}
