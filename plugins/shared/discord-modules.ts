// Shared Discord module ID store for plugins. Module IDs shift between Discord
// builds; they're refreshed here by scripts/update-discord-module-ids.mjs from
// lvwmwm/decord's data branch (https://github.com/lvwmwm/decord/tree/data) on the
// latest build. Module paths are stable across builds; you can add/remove entries
// here and the script only updates the IDs.

export const discordBuild = 344200

export const discordModules = {
	'modules/main_tabs_v2/native/tabs/you/utils/showYouAccountActionSheet.tsx': 15697,
	'modules/main_tabs_v2/native/tabs/you/YouAccountActionSheet.tsx': 15699,
	'modules/user_profile/native/showUserProfileActionSheet.tsx': 8966,
} as const
