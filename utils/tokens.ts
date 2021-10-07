import { ACCOUNT_LAYOUT } from '@blockworks-foundation/mango-client'
import { Connection, PublicKey } from '@solana/web3.js'
import { TokenInstructions } from '@project-serum/serum'
import { TokenAccount } from '../@types/types'

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

function parseTokenResponse(r): ProgramAccount<TokenAccount>[] {
  return r.value.map(({ pubkey, account }) => ({
    publicKey: pubkey,
    account: parseTokenAccountData(account.data),
  }))
}

export async function getOwnedTokenAccounts(
  connection: Connection,
  publicKey: PublicKey
): Promise<ProgramAccount<TokenAccount>[]> {
  const resp = await connection.getTokenAccountsByOwner(publicKey, {
    programId: TokenInstructions.TOKEN_PROGRAM_ID,
  })
  return parseTokenResponse(resp)
}
