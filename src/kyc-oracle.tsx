import { useState } from 'react'
import { post, get } from './io-nexus'

type KycStatus = 'none' | 'pending' | 'verified' | 'rejected'
type KycRecord = {
	playerId: string
	fullName: string
	dob: string
	country: string
	docType: string
	docNumber: string
	status: KycStatus
	riskScore: number
	updatedAt: number
	flags: string[]
}

type KycRequirements = { tier: string; requirements: string[] }
type KycDecision = {
	allowed: boolean
	requiredTier: string
	missingSteps: string[]
	actions: string[]
	riskLevel: string
}

export default function KycOracle({ playerId }: { playerId: string }) {
	const [statusText, setStatusText] = useState<
		KycStatus | 'loading' | 'verifying' | 'submitting'
	>('none')
	const [record, setRecord] = useState<KycRecord | null>(null)
	const [requirements, setRequirements] = useState<KycRequirements | null>(
		null
	)
	const [decision, setDecision] = useState<KycDecision | null>(null)
	const [badges, setBadges] = useState<string[]>([])
	const [access, setAccess] = useState<string[]>([])

	async function load() {
		setStatusText('loading')
		const rec = await get(`/compliance/kyc/${playerId}`)
		setRecord(rec as KycRecord)
		setStatusText(rec.status as KycStatus)
	}

	async function verify() {
		setStatusText('verifying')
		const res = await post('/compliance/kyc/verify', { playerId })
		setBadges(res.badges || [])
		setAccess(res.access || [])
		setStatusText('verified')
	}

	async function requirementsFor() {
		const res = await post('/compliance/kyc/requirements', { playerId })
		setRequirements(res)
	}

	async function decisionFor() {
		const res = await post('/compliance/decision', {
			playerId,
			operation: 'deposit',
			amount: 100,
		})
		setDecision(res)
	}

	async function submit() {
		setStatusText('submitting')
		await post('/compliance/kyc', {
			playerId,
			fullName: 'John Demo',
			dob: '1990-01-01',
			country: 'US',
			docType: 'passport',
			docNumber: 'P1234567',
		})
		await load()
	}

	return (
		<div className="panel">
			<div className="section-title">
				<div>KYC</div>
				<div className="actions">
					<button className="secondary" onClick={load}>
						Load
					</button>
					<button className="secondary" onClick={verify}>
						Verify
					</button>
					<button className="secondary" onClick={requirementsFor}>
						Requirements
					</button>
					<button className="secondary" onClick={decisionFor}>
						Decision
					</button>
					<button className="primary" onClick={submit}>
						Submit
					</button>
				</div>
			</div>
			<div className="list">
				<div className="kv">
					<div className="label">Status</div>
					<div className="value">{statusText}</div>
				</div>
				{record ? (
					<div className="kv" style={{ marginTop: '0.5rem' }}>
						<div className="label">Player</div>
						<div className="value">{record.playerId}</div>
						<div className="label">Name</div>
						<div className="value">{record.fullName}</div>
						<div className="label">DOC</div>
						<div className="value">
							{record.docType} / {record.docNumber}
						</div>
						<div className="label">Risk</div>
						<div className="value">{record.riskScore}</div>
					</div>
				) : (
					<div className="empty">no kyc yet</div>
				)}
				{requirements && (
					<div className="kv" style={{ marginTop: '0.5rem' }}>
						<div className="label">Tier</div>
						<div className="value">{requirements.tier}</div>
						<div className="label">Required</div>
						<div className="value">
							{requirements.requirements.join(', ') || '—'}
						</div>
					</div>
				)}
				{decision && (
					<div className="kv" style={{ marginTop: '0.5rem' }}>
						<div className="label">Allowed</div>
						<div className="value">{String(decision.allowed)}</div>
						<div className="label">Tier</div>
						<div className="value">{decision.requiredTier}</div>
						<div className="label">Missing</div>
						<div className="value">
							{decision.missingSteps.join(', ') || '—'}
						</div>
						<div className="label">Actions</div>
						<div className="value">
							{decision.actions.join(', ') || '—'}
						</div>
						<div className="label">Risk</div>
						<div className="value">{decision.riskLevel}</div>
					</div>
				)}
				{badges.length > 0 && (
					<div className="chips" style={{ marginTop: '0.5rem' }}>
						{badges.map(b => (
							<span className="chip" key={b}>
								{b}
							</span>
						))}
					</div>
				)}
				{access.length > 0 && (
					<div className="chips" style={{ marginTop: '0.3rem' }}>
						{access.map(a => (
							<span className="chip active" key={a}>
								{a}
							</span>
						))}
					</div>
				)}
				{statusText === 'loading' ||
				statusText === 'verifying' ||
				statusText === 'submitting' ? (
					<div className="spinner" />
				) : null}
			</div>
		</div>
	)
}
