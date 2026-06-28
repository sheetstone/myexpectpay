import { redirect } from "next/navigation"
import { getSession } from "@/lib/session"
import { BrandPanel } from "@/components/auth/BrandPanel"
import styles from "./layout.module.css"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (session) redirect("/")

  return (
    <div className={styles.root}>
      <BrandPanel />
      <div className={styles.formPane}>
        <div className={styles.formInner}>{children}</div>
      </div>
    </div>
  )
}
