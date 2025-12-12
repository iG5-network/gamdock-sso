type Props = {
	payMode: 'fiat' | 'crypto'
	payHint: string
	showGateway: boolean
	gatewaySession: {
		url: string
		id: string
		op: 'deposit' | 'withdraw'
	} | null
	setPayMode: (v: 'fiat' | 'crypto') => void
	onDepositFiat: () => void
	onWithdrawFiat: () => void
	onCompleteFiat: () => void
	onDepositCrypto: () => void
	onWithdrawCrypto: () => void
	onCloseGateway: () => void
}

export default function PaymentsGateway(props: Props) {
	return (
		<div className="panel" id="payments">
			<div className="section-title">
				<div>Payments</div>
				<div className="actions">
					<button
						className={
							props.payMode === 'fiat' ? 'primary' : 'secondary'
						}
						onClick={() => props.setPayMode('fiat')}>
						Fiat
					</button>
					<button
						className={
							props.payMode === 'crypto' ? 'primary' : 'secondary'
						}
						onClick={() => props.setPayMode('crypto')}>
						Crypto
					</button>
				</div>
			</div>
			<div className="actions">
				{props.payMode === 'fiat' ? (
					<>
						<button
							className="secondary"
							onClick={props.onDepositFiat}>
							Deposit
						</button>
						<button
							className="secondary"
							onClick={props.onWithdrawFiat}>
							Withdraw
						</button>
					</>
				) : (
					<>
						<button
							className="secondary"
							onClick={props.onDepositCrypto}>
							Deposit
						</button>
						<button
							className="secondary"
							onClick={props.onWithdrawCrypto}>
							Withdraw
						</button>
					</>
				)}
			</div>
			{props.payHint && <div className="hint">{props.payHint}</div>}
			{props.showGateway && props.gatewaySession && (
				<div className="gateway">
					<div className="title">Gamdock Gateway</div>
					<div className="url">{props.gatewaySession.url}</div>
					<div className="actions">
						<button
							className="primary"
							onClick={props.onCompleteFiat}>
							Complete
						</button>
						<button
							className="secondary"
							onClick={props.onCloseGateway}>
							Cancel
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
