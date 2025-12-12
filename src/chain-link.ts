import bs58 from 'bs58'

type EthRequestAccountsArgs = { method: 'eth_requestAccounts' }
type EthPersonalSignArgs = { method: 'personal_sign'; params: [string, string] }
type EthereumProvider = {
  request(args: EthRequestAccountsArgs): Promise<string[]>
  request(args: EthPersonalSignArgs): Promise<string>
}

type PhantomProvider = {
  connect(): Promise<void>
  publicKey: { toBase58(): string }
  signMessage(data: Uint8Array, encoding: 'utf8'): Promise<{ signature: Uint8Array }>
}

type WindowWithProviders = Window & { ethereum?: EthereumProvider; solana?: PhantomProvider }

export async function connectEvm(message: string) {
  const eth = (window as WindowWithProviders).ethereum
  if (!eth) throw new Error('no_ethereum')
  const accounts = await eth.request({ method: 'eth_requestAccounts' })
  const address = accounts[0]
  const signature = await eth.request({ method: 'personal_sign', params: [message, address] })
  return { provider: 'metamask' as const, address, message, signature }
}

export async function connectPhantom(message: string) {
  const sol = (window as WindowWithProviders).solana
  if (!sol) throw new Error('no_phantom')
  await sol.connect()
  const address = sol.publicKey.toBase58()
  const encoded = new TextEncoder().encode(message)
  const signed = await sol.signMessage(encoded, 'utf8')
  const signature = bs58.encode(signed.signature)
  return { provider: 'phantom' as const, address, message, signature }
}
