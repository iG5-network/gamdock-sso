import { useEffect, useState } from 'react'
import './styles/aether-core.css'
import './styles/grid-matrix.css'
import './styles/panel-chassis.css'
import './styles/nav-spire.css'
import './styles/modal-veil.css'
import './styles/hud-overlay.css'
import './styles/ui-atoms.css'
import './styles/form-syntax.css'
import './styles/ribbon-header.css'
import { post, get } from './io-nexus'
import KycOracle from './kyc-oracle'
import { connectEvm, connectPhantom } from './chain-link'
import NavSpire from './components/panels/nav-spire'
import CommandRibbon from './components/panels/command-ribbon'
import WalletConsole from './components/panels/wallet-console'
import IdentityMatrix from './components/panels/identity-matrix'
import LedgerHub from './components/panels/ledger-hub'
import RelayNode from './components/panels/relay-node'
import ActivityStream from './components/panels/activity-stream'
import PaymentsGateway from './components/panels/payments-gateway'
import type {
	IProfile,
	ITxRecord,
	IRelayResult,
	IActivityRecord,
} from './schema-core'

function App() {
	const [status, setStatus] = useState('idle')
	const [sessionHandle, setSessionHandle] = useState<string | null>(null)
	const [address, setAddress] = useState<string | null>(null)
	const [network, setNetwork] = useState<'evm' | 'solana' | null>(null)
	const [token, setToken] = useState<string | null>(null)
	const [showToken, setShowToken] = useState(false)
	const [minimized, setMinimized] = useState(false)
	const [fullscreen, setFullscreen] = useState(true)
	const [showMini, setShowMini] = useState(true)
	const [playerId, setPlayerId] = useState('player-123')
	const [profile, setProfile] = useState<IProfile | null>(null)
	const [nickname, setNickname] = useState('')
	const [email, setEmail] = useState('')
	const [country, setCountry] = useState('')
	const [txs, setTxs] = useState<ITxRecord[]>([])
	const [balance, setBalance] = useState<number>(0)
	const [asset, setAsset] = useState('USDC')
	const [amount, setAmount] = useState('10')
	const [direction, setDirection] = useState<'debit' | 'credit'>('credit')
	const [onchain, setOnchain] = useState(false)
	const [relayResult, setRelayResult] = useState<IRelayResult | null>(null)
	const [invItem, setInvItem] = useState('')
	const [activityType, setActivityType] = useState('event')
	const [activities, setActivities] = useState<IActivityRecord[]>([])
	const [profileLoading, setProfileLoading] = useState(false)
	const [txLoading, setTxLoading] = useState(false)

	const [payMode, setPayMode] = useState<'fiat' | 'crypto'>('crypto')
	const [showGateway, setShowGateway] = useState(false)
	const [gatewaySession, setGatewaySession] = useState<{
		url: string
		id: string
		op: 'deposit' | 'withdraw'
	} | null>(null)
	const [payHint, setPayHint] = useState('')

	async function connect(provider: 'evm' | 'phantom') {
		try {
			setStatus('connecting')
			const message = 'Login to Gamdock'
			const payload =
				provider === 'evm'
					? await connectEvm(message)
					: await connectPhantom(message)
			const res = await post('/wallet/connect', payload)
			setSessionHandle(res.sessionHandle)
			setAddress(res.address)
			setNetwork(res.chain as 'evm' | 'solana')
			setStatus('connected')
		} catch (e) {
			setStatus(e instanceof Error ? e.message : 'error')
		}
	}

	async function login() {
		if (!sessionHandle) return
		const res = await post('/sso/login', { playerId, sessionHandle })
		setToken(res.token)
	}

	async function upsertProfile() {
		setProfileLoading(true)
		const res = await post('/profiler', {
			playerId,
			nickname,
			email,
			country,
		})
		setProfile(res)
		setProfileLoading(false)
	}

	async function loadProfile() {
		setProfileLoading(true)
		const res = await get(`/profiler/${playerId}`)
		setProfile(res)
		setProfileLoading(false)
	}

	async function addTx() {
		setTxLoading(true)
		await post('/ledger/tx', {
			playerId,
			amount,
			asset,
			direction,
			onchain,
		})
		const list = (await get(`/ledger/${playerId}`)) as ITxRecord[]
		setTxs(list)
		setTxLoading(false)
	}

	async function relay() {
		const res = await post('/ledger/relay', {
			playerId,
			data: { event: 'demo', ts: Date.now() },
		})
		setRelayResult(res as IRelayResult)
	}

	async function depositFiat() {
		if ((profile?.kycLevel || 'none') !== 'verified') {
			alert('KYC is required for fiat deposits.')
			return
		}
		try {
			const res = await post('/ledger/payments/fiat/session', {
				playerId,
				amount,
				asset,
				operation: 'deposit',
			})
			setGatewaySession({
				url: res.url,
				id: res.sessionId,
				op: 'deposit',
			})
			setShowGateway(true)
			setPayHint('')
		} catch {
			try {
				const d = await post('/compliance/decision', {
					playerId,
					operation: 'deposit',
					amount: parseFloat(amount),
				})
				setPayHint(
					`Blocked: ${d.requiredTier} ${d.missingSteps.join(', ')}`
				)
			} catch {
				setPayHint('Blocked')
			}
		}
	}

	async function withdrawFiat() {
		if ((profile?.kycLevel || 'none') !== 'verified') {
			alert('KYC is required for fiat withdrawals.')
			return
		}
		try {
			const res = await post('/ledger/payments/fiat/session', {
				playerId,
				amount,
				asset,
				operation: 'withdraw',
			})
			setGatewaySession({
				url: res.url,
				id: res.sessionId,
				op: 'withdraw',
			})
			setShowGateway(true)
			setPayHint('')
		} catch {
			try {
				const d = await post('/compliance/decision', {
					playerId,
					operation: 'withdraw',
					amount: parseFloat(amount),
				})
				setPayHint(
					`Blocked: ${d.requiredTier} ${d.missingSteps.join(', ')}`
				)
			} catch {
				setPayHint('Blocked')
			}
		}
	}

	async function completeFiat() {
		if (!gatewaySession) return
		await post('/ledger/payments/fiat/complete', {
			playerId,
			amount,
			asset,
			operation: gatewaySession.op,
			sessionId: gatewaySession.id,
		})
		const list = (await get(`/ledger/${playerId}`)) as ITxRecord[]
		setTxs(list)
		setShowGateway(false)
		setGatewaySession(null)
		await refreshBalance()
	}

	async function depositCrypto() {
		if (!address || !network) {
			alert('Connect a wallet to deposit in crypto.')
			return
		}
		try {
			await post('/ledger/payments/crypto/deposit', {
				playerId,
				amount,
				asset,
				chain: network,
				address,
			})
			const list = (await get(`/ledger/${playerId}`)) as ITxRecord[]
			setTxs(list)
			await refreshBalance()
			setPayHint('')
		} catch {
			try {
				const d = await post('/compliance/decision', {
					playerId,
					operation: 'deposit',
					amount: parseFloat(amount),
				})
				setPayHint(
					`Blocked: ${d.requiredTier} ${d.missingSteps.join(', ')}`
				)
			} catch {
				setPayHint('Blocked')
			}
		}
	}

	async function withdrawCrypto() {
		if (!address || !network) {
			alert('Connect a wallet to withdraw in crypto.')
			return
		}
		try {
			await post('/ledger/payments/crypto/withdraw', {
				playerId,
				amount,
				asset,
				chain: network,
				address,
			})
			const list = (await get(`/ledger/${playerId}`)) as ITxRecord[]
			setTxs(list)
			await refreshBalance()
			setPayHint('')
		} catch {
			try {
				const d = await post('/compliance/decision', {
					playerId,
					operation: 'withdraw',
					amount: parseFloat(amount),
				})
				setPayHint(
					`Blocked: ${d.requiredTier} ${d.missingSteps.join(', ')}`
				)
			} catch {
				setPayHint('Blocked')
			}
		}
	}

	async function linkWallet() {
		if (!address) return
		const res = await post('/profiler/wallet/link', { playerId, address })
		setProfile(res as IProfile)
	}

	async function incReputation() {
		const res = await post('/profiler/reputation', { playerId, delta: 1 })
		setProfile(res as IProfile)
	}

	async function addInventory() {
		if (!invItem) return
		const res = await post('/profiler/inventory/add', {
			playerId,
			item: invItem,
		})
		setProfile(res as IProfile)
		setInvItem('')
	}

	async function removeInventory() {
		if (!invItem) return
		const res = await post('/profiler/inventory/remove', {
			playerId,
			item: invItem,
		})
		setProfile(res as IProfile)
		setInvItem('')
	}

	async function addActivity() {
		const res = await post('/ledger/activity', {
			playerId,
			type: activityType,
		})
		await loadActivities()
		return res
	}

	async function loadActivities() {
		const list = (await get(
			`/ledger/activity/${playerId}`
		)) as IActivityRecord[]
		setActivities(list)
	}

	async function refreshBalance() {
		const res = await get(`/ledger/balance/${playerId}?asset=${asset}`)
		setBalance(res.balance as number)
	}

	useEffect(() => {
		;(async () => {
			const res = await get(`/ledger/balance/${playerId}?asset=${asset}`)
			setBalance(res.balance as number)
		})().catch(() => {})
	}, [playerId, asset, minimized])

	const short = (v?: string | null) =>
		v ? `${v.slice(0, 6)}…${v.slice(-4)}` : ''

	return (
		<>
			{minimized ? (
				showMini ? (
					<div className="mini">
						<div className="mini-bar">
							<div
								className={`dot ${
									status === 'connected'
										? 'connected'
										: 'idle'
								}`}
							/>
							<div className="mini-label">NET</div>
							<div className="mini-value">{network ?? '—'}</div>
							<div className="sep"></div>
							<div className="mini-label">ADDR</div>
							<div className="mini-value">{short(address)}</div>
							<div className="sep"></div>
							<div className="mini-label">BAL</div>
							<div className="mini-value">
								{balance.toFixed(2)} {asset}
							</div>
							<div className="sep"></div>
							<div className="mini-btns">
								<button
									className="secondary"
									onClick={() => {
										setMinimized(false)
										setFullscreen(true)
									}}>
									Expand
								</button>
								<button
									className="secondary"
									onClick={() => setShowMini(false)}>
									Hide
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className="dock">
						<button
							className="dock-btn"
							onClick={() => {
								setMinimized(false)
								setFullscreen(true)
								setShowMini(true)
							}}>
							Open iG5 SSO
						</button>
					</div>
				)
			) : (
				<div className={'overlay' + (fullscreen ? ' full' : '')}>
					<div className="topbar">
						<button
							className="icon"
							onClick={() => setFullscreen(v => !v)}>
							⤢
						</button>
						<button
							className="icon primary"
							onClick={() => setMinimized(true)}>
							—
						</button>
					</div>
					<div className="app">
						<CommandRibbon
							nickname={nickname}
							email={email}
							country={country}
							asset={asset}
							amount={amount}
							direction={direction}
							onchain={onchain}
							playerId={playerId}
							setNickname={setNickname}
							setEmail={setEmail}
							setCountry={setCountry}
							setAsset={setAsset}
							setAmount={setAmount}
							setDirection={v => setDirection(v)}
							setOnchain={v => setOnchain(v)}
							setPlayerId={setPlayerId}
						/>
						<div className="layout">
							<NavSpire />
							<div className="content">
								<div className="grid">
									<WalletConsole
										status={status}
										address={address}
										sessionHandle={sessionHandle}
										network={network}
										token={token}
										showToken={showToken}
										onConnect={connect}
										onLogin={login}
										onLinkWallet={linkWallet}
										onIncReputation={incReputation}
										onToggleToken={() =>
											setShowToken(v => !v)
										}
										short={short}
									/>

									<IdentityMatrix
										profile={profile}
										invItem={invItem}
										profileLoading={profileLoading}
										onUpsert={upsertProfile}
										onLoad={loadProfile}
										onAddInventory={addInventory}
										onRemoveInventory={removeInventory}
										setInvItem={setInvItem}
									/>
								</div>
								<KycOracle playerId={playerId} />

								<div className="grid">
									<LedgerHub
										txs={txs}
										txLoading={txLoading}
										onAddTx={addTx}
									/>

									<RelayNode
										relayResult={relayResult}
										onRelay={relay}
									/>

									<ActivityStream
										activities={activities}
										activityType={activityType}
										setActivityType={setActivityType}
										onAddActivity={addActivity}
									/>
								</div>
								<PaymentsGateway
									payMode={payMode}
									payHint={payHint}
									showGateway={showGateway}
									gatewaySession={gatewaySession}
									setPayMode={setPayMode}
									onDepositFiat={depositFiat}
									onWithdrawFiat={withdrawFiat}
									onCompleteFiat={completeFiat}
									onDepositCrypto={depositCrypto}
									onWithdrawCrypto={withdrawCrypto}
									onCloseGateway={() => {
										setShowGateway(false)
										setGatewaySession(null)
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			)}

			{showGateway && gatewaySession && (
				<div className="modal">
					<div className="modal-content">
						<div className="modal-header">
						<div>Gamdock Gateway</div>
							<button
								className="secondary"
								onClick={() => {
									setShowGateway(false)
									setGatewaySession(null)
								}}>
								✕
							</button>
						</div>
						<div className="modal-body">
							<div className="kv">
								<div className="label">Operation</div>
								<div className="value">{gatewaySession.op}</div>
								<div className="label">Player</div>
								<div className="value">{playerId}</div>
								<div className="label">Asset</div>
								<div className="value">{asset}</div>
								<div className="label">Amount</div>
								<div className="value">{amount}</div>
								<div className="label">Session</div>
								<div className="value">{gatewaySession.id}</div>
							</div>
							<div className="hint">
								Secure checkout simulated. Confirm to finalize
								transaction.
							</div>
						</div>
						<div className="modal-actions">
							<button className="primary" onClick={completeFiat}>
								Confirm
							</button>
							<button
								className="secondary"
								onClick={() => {
									setShowGateway(false)
									setGatewaySession(null)
								}}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}

export default App
