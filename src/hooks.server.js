export const handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
	// Prerendered HTML: CSP in <meta> — frame-ancestors ignored there; add HTTP header if Kit did not.
	if (!response.headers.has('content-security-policy')) {
		response.headers.set('Content-Security-Policy', "frame-ancestors 'none'");
	}
	return response;
};
