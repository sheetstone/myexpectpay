/**
 * Seed dummy bank accounts for the first user in the database.
 * Run from backend/: npx ts-node --compiler-options '{"module":"CommonJS","types":["node"]}' scripts/seed-banks.ts
 */
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import crypto from 'crypto'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

function encrypt(plaintext: string): string {
  const ALGORITHM = 'aes-256-gcm'
  const KEY = Buffer.from(process.env.ENCRYPTION_KEY ?? '', 'hex')
  const IV_LENGTH = 12
  const TAG_LENGTH = 16
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

const SEED_ACCOUNTS = [
  {
    bankName: 'First National Bank', nickname: 'Primary Checking',
    routingNumber: '021000021', accountNumber: '123456784821',
    accountType: 'checking' as const, verified: true,
    isPrimary: true, receivePayments: true, sendPayments: true,
  },
  {
    bankName: 'Wells Fargo Bank', nickname: 'Savings',
    routingNumber: '121042882', accountNumber: '987654329012',
    accountType: 'saving' as const, verified: true,
    isPrimary: false, receivePayments: false, sendPayments: true,
  },
  {
    bankName: 'Chase Bank', nickname: 'Joint Account',
    routingNumber: '021000021', accountNumber: '555444331102',
    accountType: 'checking' as const, verified: true,
    isPrimary: false, receivePayments: true, sendPayments: false,
  },
  {
    bankName: 'Bank of America', nickname: 'New Checking',
    routingNumber: '026009593', accountNumber: '111222337733',
    accountType: 'checking' as const, verified: false,
    isPrimary: false, receivePayments: false, sendPayments: false,
  },
]

async function main() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } })
  if (!user) {
    console.error('No users found. Log in to the app first, then run this script.')
    process.exit(1)
  }
  console.log(`Seeding bank accounts for: ${user.email}`)

  const existing = await prisma.bankAccount.count({ where: { userId: user.id } })
  if (existing > 0) {
    console.log(`User already has ${existing} bank account(s). Skipping seed.`)
    process.exit(0)
  }

  for (const acct of SEED_ACCOUNTS) {
    await prisma.bankAccount.create({
      data: {
        userId: user.id,
        bankName: acct.bankName,
        nickname: acct.nickname,
        routingNumber: acct.routingNumber,
        accountNumber: encrypt(acct.accountNumber),
        accountNumberLast4: acct.accountNumber.slice(-4),
        accountType: acct.accountType,
        verified: acct.verified,
        isPrimary: acct.isPrimary,
        receivePayments: acct.receivePayments,
        sendPayments: acct.sendPayments,
      },
    })
    console.log(`  ✓ ${acct.nickname} — ${acct.bankName}`)
  }
  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
