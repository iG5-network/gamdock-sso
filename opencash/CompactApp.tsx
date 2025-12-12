import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { get, post } from './io-nexus'

export default function CompactApp({
	defaultOp,
	playerId: initialPlayerId,
	onPlayerIdChange,
}: {
	defaultOp?: 'deposit' | 'withdraw'
	playerId?: string
	onPlayerIdChange?: (p: string) => void
}) {
	const [playerId, setPlayerId] = useState(initialPlayerId || 'user-001')
	const [peerId, setPeerId] = useState('peer-777')
	const [asset, setAsset] = useState('USDC')
	const [amount, setAmount] = useState('25')
	const [country, setCountry] = useState('US')
	const [countries, setCountries] = useState<
		{ code: string; name: string; currency: string; rails: string[] }[]
	>([])
	const [mode, setMode] = useState<'fiat' | 'crypto'>('fiat')
	const [rails, setRails] = useState<string[]>([])
	const [rail, setRail] = useState<string>('')
	const [amountFiat, setAmountFiat] = useState('100')
	const [chain, setChain] = useState<'evm' | 'solana'>('evm')
	const [address, setAddress] = useState('0xYourAddress')
	const [hint, setHint] = useState('')
	const [orderId, setOrderId] = useState<string | null>(null)
	const [escrowId, setEscrowId] = useState<string | null>(null)
	const [op, setOp] = useState<'deposit' | 'withdraw'>(defaultOp || 'deposit')
	const [payoutId, setPayoutId] = useState<string | null>(null)
	const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
	const [qrPayload, setQrPayload] = useState<string | null>(null)
	const [sessionPayload, setSessionPayload] = useState<Record<
		string,
		string
	> | null>(null)
	const [qrImg, setQrImg] = useState<string | null>(null)
	const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(
		null
	)
	const [sessionStatus, setSessionStatus] = useState<string>('pending')
	const [simulateAmount, setSimulateAmount] = useState('')
	const [loading, setLoading] = useState(false)
	const [step, setStep] = useState(1)
	const [showSuccess, setShowSuccess] = useState(false)

	useEffect(() => {
		;(async () => {
			try {
				const r = await get('/opencash/countries')
				setCountries(r.countries || [])
				const info = (r.countries || []).find(
					(c: any) => c.code === country
				)
				const list = info?.rails || []
				setRails(list)
				setRail(prev => (list.includes(prev) ? prev : list[0] || ''))
			} catch {}
		})()
	}, [])

	useEffect(() => {
		if (defaultOp) setOp(defaultOp)
	}, [defaultOp])

	useEffect(() => {
		try {
			const p = localStorage.getItem('oc_playerId')
			if (p) setPlayerId(p)
			const c = localStorage.getItem('oc_country')
			if (c) setCountry(c)
			const a = localStorage.getItem('oc_amountFiat')
			if (a) setAmountFiat(a)
		} catch {}
	}, [])

	useEffect(() => {
		try {
			localStorage.setItem('oc_playerId', playerId)
			localStorage.setItem('oc_country', country)
			localStorage.setItem('oc_amountFiat', amountFiat)
		} catch {}
	}, [playerId, country, amountFiat])

	useEffect(() => {
		if (!qrPayload) return
		QRCode.toDataURL(qrPayload)
			.then(setQrImg)
			.catch(() => setQrImg(null))
	}, [qrPayload])

	async function createFiatSession() {
		setLoading(true)
		try {
			const r = await post('/opencash/country/deposit/session', {
				country,
				playerId,
				peerId,
				asset,
				amountFiat: parseFloat(amountFiat),
				rail,
			})
			setQrPayload(r.payload?.qr || null)
			setSessionPayload(r.payload || null)
			setEscrowId(r.escrowId || null)
			setOrderId(r.orderId || null)
			setSessionStartedAt(Date.now())
			setSessionStatus('pending')
			setHint('Session created')
			setStep(3)
		} catch {
			setHint('Session blocked or error')
		} finally {
			setLoading(false)
		}
	}

	function openWithdrawConfirm() {
		setShowWithdrawConfirm(true)
	}

	async function createWithdrawSessionConfirmed() {
		setShowWithdrawConfirm(false)
		setLoading(true)
		try {
			const r = await post('/opencash/country/withdraw/session', {
				country,
				playerId,
				peerId,
				asset,
				payoutId,
				rail,
			})
			setOrderId(r.orderId || null)
			setEscrowId(r.escrowId || null)
			setHint('Withdraw created')
			setStep(2)
		} catch {
			setHint('Withdraw session error')
		} finally {
			setLoading(false)
		}
	}

	async function markPayoutReceived() {
		if (!orderId) return
		setLoading(true)
		try {
			await post('/opencash/country/withdraw/callback', {
				country,
				orderId,
				status: 'success',
			})
			setHint('Funds received, release token')
			setStep(3)
		} catch {
			setHint('Callback error')
		} finally {
			setLoading(false)
		}
	}

	async function releaseToken() {
		if (!escrowId) return
		setLoading(true)
		try {
			await post('/opencash/escrow/release', { escrowId })
			setHint('Released')
			setStep(5)
			setShowSuccess(true)
		} catch {
			setHint('Release error')
		} finally {
			setLoading(false)
		}
	}

	async function depositCrypto() {
		try {
			await post('/opencash/crypto/deposit', {
				playerId,
				peerId,
				amount,
				asset,
				chain,
				address,
			})
			setHint('Deposit submitted')
		} catch {
			setHint('Deposit blocked or error')
		}
	}

	async function withdrawCrypto() {
		setLoading(true)
		try {
			await post('/opencash/crypto/withdraw', {
				playerId,
				peerId,
				amount,
				asset,
				chain,
				address,
			})
			setHint('Withdraw submitted')
		} catch {
			setHint('Withdraw blocked or error')
		} finally {
			setLoading(false)
		}
	}

	async function completeFiat() {
		if (!orderId) return
		setLoading(true)
		try {
			await post('/opencash/country/deposit/callback', {
				country,
				orderId,
				status: 'success',
			})
			setSessionStatus('success')
			setHint('Deposit completed')
			setStep(5)
			setShowSuccess(true)
		} catch {
			setHint('Deposit callback error')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div style={{ padding: 10 }}>
			<div style={{ display: 'grid', gap: 8 }}>
				<div className="steps">
					<div className={step >= 1 ? 'step active' : 'step'} />
					<div className={step >= 2 ? 'step active' : 'step'} />
					<div className={step >= 3 ? 'step active' : 'step'} />
					<div className={step >= 4 ? 'step active' : 'step'} />
					<div className={step >= 5 ? 'step active' : 'step'} />
				</div>
				<div className="progress">
					<div
						className="progress-bar"
						style={{ width: `${(step / 5) * 100}%` }}
					/>
				</div>
			</div>
			<div style={{ display: 'grid', gap: 8 }}>
				<input
					placeholder="Player ID"
					value={playerId}
					onChange={e => {
						const next = e.target.value
						setPlayerId(next)
						if (onPlayerIdChange) onPlayerIdChange(next)
					}}
				/>
				<input
					placeholder="Peer ID"
					value={peerId}
					onChange={e => setPeerId(e.target.value)}
				/>
				<input
					placeholder="Asset"
					value={asset}
					onChange={e => setAsset(e.target.value)}
				/>
				<input
					placeholder="Amount"
					value={amount}
					onChange={e => setAmount(e.target.value)}
				/>
				<select
					value={country}
					onChange={e => {
						const v = e.target.value
						setCountry(v)
						const info = countries.find(c => c.code === v)
						const list = info?.rails || []
						setRails(list)
						setRail(prev =>
							list.includes(prev) ? prev : list[0] || ''
						)
					}}>
					{countries.length === 0 ? (
						<option value={country}>{country}</option>
					) : (
						countries.map(c => (
							<option key={c.code} value={c.code}>
								{c.name} ({c.code})
							</option>
						))
					)}
				</select>
				<div style={{ display: 'flex', gap: 8 }}>
					<select
						value={op}
						onChange={e => setOp(e.target.value as any)}>
						<option value="deposit">Deposit</option>
						<option value="withdraw">Withdraw</option>
					</select>
					<select
						value={mode}
						onChange={e => setMode(e.target.value as any)}>
						<option value="fiat">Fiat</option>
						<option value="crypto">Crypto</option>
					</select>
				</div>
				{mode === 'crypto' && (
					<div style={{ display: 'grid', gap: 8 }}>
						<select
							value={chain}
							onChange={e => setChain(e.target.value as any)}>
							<option value="evm">EVM</option>
							<option value="solana">Solana</option>
						</select>
						<input
							placeholder="Wallet address"
							value={address}
							onChange={e => setAddress(e.target.value)}
						/>
						<div style={{ display: 'flex', gap: 8 }}>
							<button onClick={depositCrypto}>Deposit</button>
							<button onClick={withdrawCrypto}>Withdraw</button>
						</div>
					</div>
				)}
				{mode === 'fiat' && (
					<div style={{ display: 'grid', gap: 8 }}>
						<select
							value={rail}
							onChange={e => setRail(e.target.value)}>
							{rails.length === 0 ? (
								<option value="">Select rail</option>
							) : (
								rails.map(r => (
									<option key={r} value={r}>
										{r}
									</option>
								))
							)}
						</select>
						{op === 'deposit' && (
							<input
								placeholder={`Amount ${
									countries.find(c => c.code === country)
										?.currency || ''
								}`}
								value={amountFiat}
								onChange={e => setAmountFiat(e.target.value)}
								title="Enter the fiat amount"
							/>
						)}
						{op === 'deposit' && (
							<div style={{ display: 'flex', gap: 8 }}>
								<button
									onClick={createFiatSession}
									disabled={
										!rail ||
										isNaN(parseFloat(amountFiat)) ||
										parseFloat(amountFiat) <= 0
									}>
									Create Deposit Session
								</button>
								<button
									onClick={completeFiat}
									disabled={!orderId}>
									Simulate Callback
								</button>
							</div>
						)}
						{op === 'withdraw' && (
							<div style={{ display: 'grid', gap: 8 }}>
								<input
									placeholder="Payout destination"
									value={payoutId || ''}
									onChange={e => setPayoutId(e.target.value)}
									title="Enter destination (e.g., VPA or account)"
								/>
								<div style={{ color: '#ef4444', fontSize: 12 }}>
									{payoutId && payoutId.trim().length > 2
										? ''
										: 'Enter a valid destination'}
								</div>
								<div style={{ display: 'flex', gap: 8 }}>
									<button
										onClick={openWithdrawConfirm}
										disabled={
											!payoutId ||
											payoutId.trim().length <= 2
										}>
										Create Withdraw Session
									</button>
								</div>
							</div>
						)}
						<div style={{ display: 'flex', gap: 8 }}>
							<button
								onClick={markPayoutReceived}
								disabled={!orderId}>
								Simulate Payout Callback
							</button>
							<button onClick={releaseToken} disabled={!escrowId}>
								Release Token
							</button>
						</div>
					</div>
				)}
				{hint && (
					<div
						style={{ color: '#f59e0b' }}
						role="status"
						aria-live="polite">
						{hint}
					</div>
				)}

				{loading && (
					<div
						style={{
							display: 'grid',
							placeItems: 'center',
							padding: 12,
						}}>
						<div className="spinner" />
					</div>
				)}

				{qrPayload && (
					<div
						style={{
							border: '1px dashed #1f2937',
							borderRadius: 0,
							padding: 8,
						}}>
						<div>QR</div>
						<div
							style={{
								display: 'flex',
								gap: 8,
								alignItems: 'center',
							}}>
							{qrImg ? (
								<img
									src={qrImg}
									alt="QR"
									style={{ borderRadius: 0 }}
								/>
							) : (
								<img
									src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
										qrPayload
									)}`}
									alt="QR"
									style={{ borderRadius: 0 }}
								/>
							)}
							<div
								style={{
									color: '#9aa5b1',
									fontSize: 12,
									wordBreak: 'break-all',
								}}>
								{qrPayload}
							</div>
						</div>
					</div>
				)}

				{sessionPayload && (
					<div
						style={{
							border: '1px dashed #1f2937',
							borderRadius: 0,
							padding: 8,
						}}>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 8,
							}}>
							{sessionPayload?.method &&
							railLogos[sessionPayload.method] ? (
								<img
									src={railLogos[sessionPayload.method]}
									alt={sessionPayload.method}
									width={20}
									height={20}
									style={{ borderRadius: 4 }}
								/>
							) : null}
							<div>Payment Details</div>
						</div>
						{(() => {
							const p = sessionPayload || {}
							const rows: { label: string; value: string }[] = []
							const shown = new Set<string>()
							if (p.method) {
								rows.push({ label: 'Method', value: p.method })
								shown.add('method')
							}
							if (p.amount) {
								rows.push({ label: 'Amount', value: p.amount })
								shown.add('amount')
							}
							if (p.orderId) {
								rows.push({
									label: 'Order ID',
									value: p.orderId,
								})
								shown.add('orderId')
							}
							if (p.vpa) {
								rows.push({ label: 'VPA', value: p.vpa })
								shown.add('vpa')
							}
							if (p.iban) {
								rows.push({ label: 'IBAN', value: p.iban })
								shown.add('iban')
							}
							if (p.bic) {
								rows.push({ label: 'BIC', value: p.bic })
								shown.add('bic')
							}
							if (p.paynowId) {
								rows.push({
									label: 'PayNow UEN',
									value: p.paynowId,
								})
								shown.add('paynowId')
							}
							if (p.pixKey) {
								rows.push({ label: 'PIX Key', value: p.pixKey })
								shown.add('pixKey')
							}
							if (p.routingNumber) {
								rows.push({
									label: 'Routing Number',
									value: p.routingNumber,
								})
								shown.add('routingNumber')
							}
							if (p.accountNumber) {
								rows.push({
									label: 'Account Number',
									value: p.accountNumber,
								})
								shown.add('accountNumber')
							}
							if (p.ifsc) {
								rows.push({ label: 'IFSC', value: p.ifsc })
								shown.add('ifsc')
							}
							if (p.cashtag) {
								rows.push({
									label: 'Cashtag',
									value: p.cashtag,
								})
								shown.add('cashtag')
							}
							if (p.username) {
								rows.push({
									label: 'Username',
									value: p.username,
								})
								shown.add('username')
							}
							if (p.handle) {
								rows.push({ label: 'Handle', value: p.handle })
								shown.add('handle')
							}
							if (p.sortCode) {
								rows.push({
									label: 'Sort Code',
									value: p.sortCode,
								})
								shown.add('sortCode')
							}
							if (p.vaNumber) {
								rows.push({
									label: 'VA Number',
									value: p.vaNumber,
								})
								shown.add('vaNumber')
							}
							if (p.clabe) {
								rows.push({ label: 'CLABE', value: p.clabe })
								shown.add('clabe')
							}
							if (p.fpsId) {
								rows.push({ label: 'FPS ID', value: p.fpsId })
								shown.add('fpsId')
							}
							if (p.promptpayId) {
								rows.push({
									label: 'PromptPay ID',
									value: p.promptpayId,
								})
								shown.add('promptpayId')
							}
							if (p.paymentCode) {
								rows.push({
									label: 'Payment Code',
									value: p.paymentCode,
								})
								shown.add('paymentCode')
							}
							const extra = Object.entries(p)
								.filter(([k]) => k !== 'qr' && !shown.has(k))
								.map(([k, v]) => ({
									label: k,
									value: String(v),
								}))
							const allRows = rows.concat(extra)
							return allRows.length > 0 ? (
								<div style={{ display: 'grid', gap: 4 }}>
									{allRows.map((r, i) => (
										<div
											key={i}
											style={{
												display: 'grid',
												gridTemplateColumns:
													'120px 1fr auto',
												gap: 8,
											}}>
											<div style={{ color: '#9aa5b1' }}>
												{r.label}
											</div>
											<div
												style={{
													wordBreak: 'break-all',
												}}>
												{r.value}
											</div>
											<div>
												{copyableKeys.includes(
													r.label
												) ? (
													<button
														onClick={() =>
															navigator.clipboard.writeText(
																r.value
															)
														}>
														Copy
													</button>
												) : null}
											</div>
										</div>
									))}
								</div>
							) : null
						})()}
						<div
							style={{
								borderTop: '1px dashed #1f2937',
								marginTop: 8,
								paddingTop: 8,
							}}>
							<div style={{ fontWeight: 600, marginBottom: 6 }}>
								Webhook Simulation
							</div>
							<div style={{ display: 'grid', gap: 6 }}>
								<input
									placeholder="Reported amount"
									value={simulateAmount}
									onChange={e =>
										setSimulateAmount(e.target.value)
									}
								/>
								<div style={{ color: '#9aa5b1' }}>
									{(() => {
										const expected = parseFloat(
											sessionPayload?.amount || '0'
										)
										const reported = parseFloat(
											simulateAmount || '0'
										)
										if (
											!sessionPayload?.amount ||
											!simulateAmount
										)
											return 'Enter a reported amount to compare.'
										if (isNaN(expected) || isNaN(reported))
											return 'Invalid amounts.'
										if (reported === expected)
											return 'Amounts match: mark as success.'
										if (reported < expected)
											return 'Under-pay detected: top-up difference or reverse.'
										return 'Over-pay detected: refund excess or adjust release.'
									})()}
								</div>
								<div style={{ display: 'flex', gap: 8 }}>
									<button
										onClick={completeFiat}
										disabled={!orderId}>
										Simulate Success
									</button>
									<button
										onClick={() =>
											post('/opencash/escrow/timeout', {
												escrowId,
												ttlMs: 0,
											})
												.then(() =>
													setHint('Escrow timed out')
												)
												.catch(() =>
													setHint('Timeout error')
												)
										}
										disabled={!escrowId}>
										Simulate Timeout
									</button>
								</div>
							</div>
							{rail && (
								<div
									style={{
										color: '#9aa5b1',
										fontSize: 12,
										marginTop: 6,
									}}>
									Hint:{' '}
									{railHints[rail] ||
										'Follow the payment instructions shown.'}
									<div style={{ marginTop: 4 }}>
										{settlementExpectations[rail]
											? `Expected settlement: ${settlementExpectations[rail]}`
											: 'Settlement time varies by rail.'}
									</div>
									{sessionStartedAt && (
										<div style={{ marginTop: 4 }}>
											Started{' '}
											{Math.floor(
												(Date.now() -
													sessionStartedAt) /
													1000
											)}
											s ago • Status: {sessionStatus}
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{showWithdrawConfirm && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background: 'rgba(0,0,0,0.5)',
						display: 'grid',
						placeItems: 'center',
					}}>
					<div
						style={{
							background: '#111827',
							color: '#e6edf7',
							padding: 16,
							borderRadius: 0,
							width: 420,
						}}>
						<div style={{ fontWeight: 600, marginBottom: 8 }}>
							Confirm Withdraw
						</div>
						<div style={{ display: 'grid', gap: 6 }}>
							<div>Country: {country}</div>
							<div>Rail: {rail || '—'}</div>
							<div>
								Amount Asset: {amount} {asset}
							</div>
							<div>Payout ID: {payoutId || 'not set'}</div>
						</div>
						<div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
							<button onClick={createWithdrawSessionConfirmed}>
								Confirm
							</button>
							<button
								onClick={() => setShowWithdrawConfirm(false)}>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{showSuccess && (
				<div
					style={{
						display: 'grid',
						gap: 8,
						placeItems: 'center',
						padding: 12,
					}}>
					<img
						src="https://media.giphy.com/media/26ufnwz3wDUli7GU0/giphy.gif"
						alt="success"
						style={{
							width: 160,
							height: 160,
							objectFit: 'cover',
							borderRadius: 0,
						}}
					/>
					<div style={{ fontWeight: 600 }}>Success</div>
					<div style={{ color: '#9aa5b1', fontSize: 12 }}>
						Funds confirmed and escrow completed
					</div>
				</div>
			)}
		</div>
	)
}

const railHints: Record<string, string> = {
	ACH: 'Use ACH with provided routing and account.',
	RTP: 'Real-time payments via your bank app.',
	FedNow: 'Instant transfer via FedNow where supported.',
	Zelle: 'Send to the handle shown in details.',
	CashApp: 'Send to the cashtag provided.',
	Venmo: 'Pay the username via Venmo app.',
	PIX: 'Scan PIX QR or pay to the PIX key.',
	PayNow: 'Scan PayNow QR or use UEN.',
	FAST: 'Use FAST transfer with bank details.',
	SPEI: 'Use CLABE to send via SPEI.',
	CoDi: 'Scan CoDi QR to pay.',
	FPS: 'Use sort code and account via your bank.',
	'Open Banking': 'Follow redirect to authorize payment.',
	BACS: 'Standard bank transfer with sort code and account.',
	'SEPA SCT': 'Use IBAN/BIC to transfer.',
	'SEPA Instant': 'Instant IBAN transfer where supported.',
	Revolut: 'Send to the handle shown.',
	Wise: 'Send to the handle shown.',
	Trustly: 'Follow the provider’s flow.',
	iDEAL: 'Use iDEAL checkout or QR.',
	Bancontact: 'Use Bancontact checkout or QR.',
	AANI: 'Scan AANI QR or use IBAN.',
	UAEFTS: 'Use IBAN via UAEFTS.',
	IBAN: 'Use IBAN transfer.',
	NIP: 'Send via NIP with bank details.',
	USSD: 'Dial the USSD code to pay.',
	Opay: 'Send to wallet handle.',
	Palmpay: 'Send to wallet handle.',
	Kuda: 'Send to wallet handle.',
	InstaPay: 'Instant bank transfer.',
	PESONet: 'Batch bank transfer.',
	GCash: 'Scan QR or send to handle.',
	Maya: 'Scan QR or send to handle.',
	'EFT Instant': 'Use bank details for instant EFT.',
	Ozow: 'Follow redirect to complete payment.',
	SnapScan: 'Scan the SnapScan QR.',
	VA: 'Use the virtual account number.',
	QRIS: 'Scan the QRIS code.',
	OVO: 'Send to wallet handle.',
	Dana: 'Send to wallet handle.',
	GoPay: 'Send to wallet handle.',
}

const railLogos: Record<string, string> = {
	CashApp: 'https://cdn.simpleicons.org/cashapp/20c997',
	Venmo: 'https://cdn.simpleicons.org/venmo/3d95ce',
	Zelle: 'https://cdn.simpleicons.org/zelle/6c3cd9',
	PayNow: 'https://cdn.simpleicons.org/visa/2563eb',
	PIX: 'https://cdn.simpleicons.org/pix/00c389',
	iDEAL: 'https://cdn.simpleicons.org/ideal/cc007a',
	Bancontact: 'https://cdn.simpleicons.org/bancontact/1d1d1b',
	Giropay: 'https://cdn.simpleicons.org/giropay/004a93',
	Revolut: 'https://cdn.simpleicons.org/revolut/007aff',
	Wise: 'https://cdn.simpleicons.org/wise/00b9ff',
	ACH: 'https://cdn.simpleicons.org/nacha/2563eb',
	RTP: 'https://cdn.simpleicons.org/theclearinghouse/2563eb',
	FedNow: 'https://cdn.simpleicons.org/federalreserve/0ea5e9',
	FPS: 'https://cdn.simpleicons.org/ukgovernment/1f2937',
	BACS: 'https://cdn.simpleicons.org/bacs/1f2937',
	IBAN: 'https://cdn.simpleicons.org/bank/1f2937',
	'SEPA SCT': 'https://cdn.simpleicons.org/europeanunion/2563eb',
	UAEFTS: 'https://cdn.simpleicons.org/emirates/ef4444',
}

const copyableKeys = [
	'IBAN',
	'Routing Number',
	'Account Number',
	'CLABE',
	'PayNow UEN',
	'VPA',
]

const settlementExpectations: Record<string, string> = {
	'SEPA SCT': 'Same-day to T+1',
	FAST: 'Near real-time',
	PayNow: 'Instant',
	ACH: 'T+1 to T+3',
	RTP: 'Instant',
	FedNow: 'Instant',
	IBAN: 'T+1',
	UAEFTS: 'Same-day',
}
