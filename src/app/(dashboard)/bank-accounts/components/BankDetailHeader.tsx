"use client"

import { useIntl } from "react-intl"
import {
  PencilSquareIcon, StarIcon, CheckIcon, ArrowDownTrayIcon, TrashIcon,
} from "@heroicons/react/24/outline"
import type { BankAccount } from "@/types"
import { ActionsMenu } from "./ActionsMenu"
import styles from "../bankAccounts.module.css"

interface BankDetailHeaderProps {
  bank: BankAccount
  editingNickname: boolean
  nickDraft: string
  onNickDraftChange: (value: string) => void
  onStartEditNickname: () => void
  onNicknameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onNicknameBlur: () => void
  isSavingNickname: boolean
  onSetPrimary: () => void
  isSettingPrimary: boolean
  onEdit: () => void
  onVerify: () => void
  onDelete: () => void
}

export function BankDetailHeader({
  bank, editingNickname, nickDraft, onNickDraftChange, onStartEditNickname,
  onNicknameKeyDown, onNicknameBlur, isSavingNickname, onSetPrimary,
  isSettingPrimary, onEdit, onVerify, onDelete,
}: BankDetailHeaderProps) {
  const intl = useIntl()
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values)

  return (
    <div className={styles.detailHead}>
      <div>
        <div className={styles.nicknameRow}>
          {editingNickname ? (
            <input
              className={styles.nicknameInput}
              value={nickDraft}
              onChange={(e) => onNickDraftChange(e.target.value)}
              onKeyDown={onNicknameKeyDown}
              onBlur={onNicknameBlur}
              autoFocus
              disabled={isSavingNickname}
              maxLength={60}
              aria-label={t("bankAccount.editNickname")}
            />
          ) : (
            <h2 className={styles.detailTitle}>{bank.nickname ?? bank.bankName}</h2>
          )}
          {!editingNickname && (
            <button
              type="button"
              className={styles.nicknameEditBtn}
              onClick={onStartEditNickname}
              aria-label={t("bankAccount.editNickname")}
              title={t("bankAccount.editNickname")}
            >
              <PencilSquareIcon width={14} height={14} />
            </button>
          )}
          {bank.isPrimary && (
            <span className={`${styles.pill} ${styles.pillPrimary}`}>
              {t("bankAccount.primaryBadge")}
            </span>
          )}
        </div>
        <p className={styles.detailSub}>
          {t("bankAccount.accountEndingIn", { last4: bank.accountNumberLast4 })}
        </p>
      </div>
      <div className={styles.detailActions}>
        {!bank.isPrimary && (
          <button
            className={styles.primaryBtn}
            onClick={onSetPrimary}
            disabled={isSettingPrimary}
          >
            <StarIcon width={14} height={14} />
            {t("bankAccount.setPrimary")}
          </button>
        )}
        <ActionsMenu
          key={bank.id}
          label={t("bankAccount.actions")}
          items={[
            {
              icon: <PencilSquareIcon width={16} height={16} />,
              label: t("common.edit"),
              onClick: onEdit,
            },
            ...(!bank.verified
              ? [{
                  icon: <CheckIcon width={16} height={16} />,
                  label: t("bankAccount.verify"),
                  onClick: onVerify,
                }]
              : []),
            {
              icon: <ArrowDownTrayIcon width={16} height={16} />,
              label: t("bankAccount.downloadStatement"),
              onClick: () => {},
            },
            {
              icon: <TrashIcon width={16} height={16} />,
              label: t("common.delete"),
              onClick: onDelete,
              danger: true,
            },
          ]}
        />
      </div>
    </div>
  )
}
