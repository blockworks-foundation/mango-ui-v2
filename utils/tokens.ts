import { ACCOUNT_LAYOUT } from '@blockworks-foundation/mango-client'
import { Connection, PublicKey } from '@solana/web3.js'
import { TokenInstructions } from '@project-serum/serum'
import { WRAPPED_SOL_MINT } from '@project-serum/serum/lib/token-instructions'

export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
)

export type ProgramAccount<T> = {
  publicKey: PublicKey
  account: T
}

export function parseTokenAccountData(data: Buffer): {
  mint: PublicKey
  owner: PublicKey
  amount: number
} {
  const { mint, owner, amount } = ACCOUNT_LAYOUT.decode(data)
  return {
    mint: new PublicKey(mint),
    owner: new PublicKey(owner),
    amount,
  }
}

function parseTokenResponse(r): ProgramAccount<{
  mint: PublicKey
  owner: PublicKey
  amount: number
}>[] {
  return r.value.map(({ pubkey, account }) => ({
    publicKey: pubkey,
    account: parseTokenAccountData(account.data),
  }))
}

export async function getWalletTokenInfo(
  connection: Connection,
  ownerPublicKey: PublicKey
) {
  const splAccounts = await getOwnedTokenAccounts(connection, ownerPublicKey)
  const account = await connection.getAccountInfo(ownerPublicKey)
  if (!account) return splAccounts
  return [
    {
      publicKey: ownerPublicKey,
      account: {
        mint: WRAPPED_SOL_MINT,
        owner: ownerPublicKey,
        amount: account.lamports,
      },
    },
  ].concat(splAccounts)
}

export async function getOwnedTokenAccounts(
  connection: Connection,
  publicKey: PublicKey
): Promise<any[]> {
  const resp = await connection.getTokenAccountsByOwner(publicKey, {
    programId: TokenInstructions.TOKEN_PROGRAM_ID,
  })
  return parseTokenResponse(resp)
}

export function getOwnedAccountsFilters(publicKey: PublicKey) {
  return [
    {
      memcmp: {
        offset: ACCOUNT_LAYOUT.offsetOf('owner'),
        bytes: publicKey.toBase58(),
      },
    },
    {
      dataSize: ACCOUNT_LAYOUT.span,
    },
  ]
}
