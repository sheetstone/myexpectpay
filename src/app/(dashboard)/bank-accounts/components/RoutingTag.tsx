"use client"

import { useIntl } from "react-intl"
import styles from "../bankAccounts.module.css"

interface RoutingTagProps {
  receive: boolean
  send: boolean
}

export function RoutingTag({ receive, send }: RoutingTagProps) {
  const intl = useIntl()
  if (receive && send) {
    return <span className={`${styles.routingTag} ${styles.routingBoth}`}>{intl.formatMessage({ id: "bankAccount.receiveAndSend" })}</span>
  }
  if (receive) {
    return <span className={`${styles.routingTag} ${styles.routingReceive}`}>{intl.formatMessage({ id: "bankAccount.receiveOnly" })}</span>
  }
  if (send) {
    return <span className={`${styles.routingTag} ${styles.routingSend}`}>{intl.formatMessage({ id: "bankAccount.sendOnly" })}</span>
  }
  return <span className={`${styles.routingTag} ${styles.routingNone}`}>{intl.formatMessage({ id: "bankAccount.notRouted" })}</span>
}
