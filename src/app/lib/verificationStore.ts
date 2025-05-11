const verificationCodes = new Map<
	string,
	{ code: string; expires: number; data: any }
>()

export function getVerificationMap() {
	return verificationCodes
}
