"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline"
import styles from "../bankAccounts.module.css"

export interface ActionsMenuItem {
  icon: ReactNode
  label: string
  onClick: () => void
  danger?: boolean
}

interface ActionsMenuProps {
  label: string
  items: ActionsMenuItem[]
}

export function ActionsMenu({ label, items }: ActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  return (
    <div className={styles.actionsMenuWrap} ref={ref}>
      <button
        className={styles.actionsBtn}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <EllipsisVerticalIcon width={16} height={16} />
        {label}
      </button>
      {open && (
        <div className={styles.actionsMenu} role="menu">
          {items.map((item) => (
            <button
              key={item.label}
              className={`${styles.actionsMenuItem}${item.danger ? ` ${styles.actionsMenuItemDanger}` : ""}`}
              role="menuitem"
              onClick={() => { setOpen(false); item.onClick() }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
