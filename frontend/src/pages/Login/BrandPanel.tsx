import styles from './LoginPage.module.css'

export function BrandPanel() {
  return (
    <div className={styles.brandSide} aria-hidden="true">
      <div className={styles.brandMark}>
        <div className={styles.brandMarkIcon}>M</div>
        MyExpertPay
      </div>

      <div className={styles.brandContent}>
        <p className={styles.brandHeadline}>
          Manage child support payments with <strong>clarity</strong>.
        </p>
        <p className={styles.brandSub}>
          One secure portal for sending, receiving, and reconciling support payments across cases.
          Bank-grade security, on-time transfers, no surprises.
        </p>

        <div className={styles.stats}>
          <div>
            <div className={styles.statValue}>$248M</div>
            <div className={styles.statLabel}>Processed in 2025</div>
          </div>
          <div>
            <div className={styles.statValue}>12k+</div>
            <div className={styles.statLabel}>Active families</div>
          </div>
          <div>
            <div className={styles.statValue}>38</div>
            <div className={styles.statLabel}>States supported</div>
          </div>
        </div>
      </div>

      <div className={styles.brandFoot}>
        <a href="#">Help</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <span className={styles.brandFootCopy}>© 2026 MyExpertPay</span>
      </div>
    </div>
  )
}
