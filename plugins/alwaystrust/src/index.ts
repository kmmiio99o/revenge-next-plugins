export default plugin({
	start({ cleanup }) {
		cleanup(
			revenge.discord.flux.getStore('MaskedLinkStore', (store: any) => {
				cleanup(revenge.patcher.after(store, 'isTrustedDomain', () => true))
			}),
		)
	},
})
