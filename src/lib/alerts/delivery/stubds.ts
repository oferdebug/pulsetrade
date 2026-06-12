type StubPayload = {
	symbol: string;
	userId: string;
	alertId: string;
};

export function createStubDeliveryAdapters(payload: StubPayload) {
	return {
		email: async () => {
			console.info('[alerts:email]', payload);
		},
		push: async () => {
			console.info('[alerts:push]', payload);
		},
		sms: async () => {
			console.info('[alerts:sms]', payload);
		},
	};
}
