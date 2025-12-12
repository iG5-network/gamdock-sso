import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { get } from './io-nexus'
import './index.css'
import CompactApp from './CompactApp'

function Logo({ size = 18 }: { size?: number }) {
	return (
		<div className="logo" style={{ fontSize: size }}>
			<span className="open">open</span>
			<span className="cash">cash</span>
		</div>
	)
}

function HostDemo() {
	const [open, setOpen] = useState(false)
	const [presetOp, setPresetOp] = useState<'deposit' | 'withdraw'>('deposit')
	const [tab, setTab] = useState<'payment' | 'history'>('payment')
	const [playerId, setPlayerId] = useState('user-001')
	const [apiOk, setApiOk] = useState<boolean | null>(null)
	const [histTxs, setHistTxs] = useState<
		{
			id: string
			amount: number
			asset: string
			direction: string
			createdAt: number
			onchain?: boolean
			sessionId?: string
		}[]
	>([])
	const [histLoading, setHistLoading] = useState(false)
	useHistory(open, tab, playerId, setHistTxs, setHistLoading)

	useEffect(() => {
		if (!open) return
		setApiOk(null)
		get('/health')
			.then(() => setApiOk(true))
			.catch(() => setApiOk(false))
	}, [open])
	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'grid',
				placeItems: 'center',
				background:
					'linear-gradient(180deg, var(--bg-dark-0) 0%, var(--bg-dark-1) 100%)',
				color: 'var(--text)',
				fontFamily:
					"'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
			}}>
			<div style={{ display: 'grid', gap: 12, textAlign: 'center' }}>
				<div
					className="h1-gradient"
					style={{ fontSize: 32, fontWeight: 700 }}>
					Casino Host Demo
				</div>
				<div style={{ color: 'var(--muted)' }}>
					Trigger OpenCash as a secure popup
				</div>
				<div
					style={{
						display: 'flex',
						gap: 12,
						justifyContent: 'center',
					}}>
					<button
						onClick={() => {
							setPresetOp('deposit')
							setOpen(true)
						}}>
						Launch Deposit
					</button>
					<button
						onClick={() => {
							setPresetOp('withdraw')
							setOpen(true)
						}}>
						Launch Withdraw
					</button>
				</div>
			</div>
			{open && (
				<div
					style={{
						position: 'fixed',
						inset: 0,
						background: 'rgba(0,0,0,0.7)',
						display: 'grid',
						placeItems: 'center',
						zIndex: 1000,
					}}>
					<div
						style={{
							width: 380,
							maxWidth: '92vw',
							borderRadius: 0,
							overflow: 'hidden',
							boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
						}}>
						<div
							style={{
								background: 'var(--header-bg)',
								padding: 10,
								display: 'grid',
								gridTemplateColumns: '1fr auto',
								alignItems: 'center',
							}}>
							<Logo size={20} />
							<button
								onClick={() => setOpen(false)}
								style={{
									background: 'rgba(255,255,255,0.15)',
									borderRadius: 0,
									padding: '6px 10px',
								}}>
								Close
							</button>
							<div
								style={{
									gridColumn: '1 / -1',
									marginTop: 6,
									fontSize: 12,
									color: '#a7b0be',
								}}>
								{apiOk === null
									? 'Connecting…'
									: apiOk
									? 'API connected'
									: 'API unreachable'}
							</div>
						</div>
						<div
							className="panel"
							style={{ background: 'var(--panel-bg)' }}>
							<div style={{ padding: 8 }}>
								<div
									style={{
										display: 'grid',
										gridTemplateColumns: '1fr 1fr',
										gap: 8,
									}}>
									<div
										style={{
											height: 8,
											background:
												tab === 'payment'
													? 'var(--brand-grad)'
													: 'rgba(0,0,0,0.15)',
										}}
									/>
									<div
										style={{
											height: 8,
											background:
												tab === 'history'
													? 'var(--brand-grad)'
													: 'rgba(0,0,0,0.15)',
										}}
									/>
								</div>
							</div>
							<div
								style={{
									padding: 8,
									display: 'flex',
									gap: 8,
								}}>
								<button
									onClick={() => setTab('payment')}
									style={{
										flex: 1,
										padding: '10px 12px',
										fontWeight: 600,
										background:
											tab === 'payment'
												? 'var(--brand-grad)'
												: 'rgba(0,0,0,0.85)',
										color: '#fff',
									}}>
									Payment
								</button>
								<button
									onClick={() => setTab('history')}
									style={{
										flex: 1,
										padding: '10px 12px',
										fontWeight: 600,
										background:
											tab === 'history'
												? 'var(--brand-grad)'
												: 'rgba(0,0,0,0.85)',
										color: '#fff',
									}}>
									History
								</button>
							</div>
							<div
								className="compact-modal"
								style={{
									padding: 8,
									maxHeight: '85vh',
									overflow: 'auto',
								}}>
								{tab === 'payment' ? (
									<CompactApp
										defaultOp={presetOp}
										playerId={playerId}
										onPlayerIdChange={setPlayerId}
									/>
								) : (
									<div style={{ display: 'grid', gap: 8 }}>
										{histLoading ? (
											<div
												style={{
													display: 'grid',
													placeItems: 'center',
													padding: 16,
												}}>
												<div className="spinner" />
											</div>
										) : histTxs.length === 0 ? (
											<div
												style={{
													color: 'var(--muted)',
													textAlign: 'center',
													padding: 16,
												}}>
												No recent activity
											</div>
										) : (
											histTxs.slice(0, 10).map(t => (
												<div
													key={t.id}
													style={{
														display: 'grid',
														gridTemplateColumns:
															'auto 1fr auto auto auto',
														gap: 8,
													}}>
													<div>
														{new Date(
															t.createdAt
														).toLocaleTimeString()}
													</div>
													<div>{t.asset}</div>
													<div>{t.amount}</div>
													<div
														style={{
															color:
																t.direction ===
																'credit'
																	? 'var(--ok)'
																	: 'var(--danger)',
														}}>
														{t.direction}
													</div>
													<div
														style={{
															color: 'var(--muted)',
														}}>
														{t.onchain
															? 'onchain'
															: 'offchain'}
													</div>
													{t.sessionId ? (
														<div
															style={{
																display: 'flex',
																gap: 6,
															}}>
															<span title="Session ID">
																{String(
																	t.sessionId
																).slice(0, 8)}
																…
															</span>
															<button
																onClick={() =>
																	navigator.clipboard.writeText(
																		String(
																			t.sessionId
																		)
																	)
																}
																style={{
																	background:
																		'rgba(255,255,255,0.08)',
																	color: '#fff',
																}}>
																Copy
															</button>
														</div>
													) : (
														<div />
													)}
												</div>
											))
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

// simple fetch for History when tab opens
function useHistory(
	open: boolean,
	tab: 'payment' | 'history',
	playerId: string,
	setHistTxs: any,
	setHistLoading: any
) {
	useEffect(() => {
		if (!open || tab !== 'history') return
		setHistLoading(true)
		get(`/opencash/state?playerId=${encodeURIComponent(playerId)}`)
			.then(r => setHistTxs(r.txs || []))
			.catch(() => setHistTxs([]))
			.finally(() => setHistLoading(false))
	}, [open, tab, playerId])
}

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<HostDemo />
	</StrictMode>
)
