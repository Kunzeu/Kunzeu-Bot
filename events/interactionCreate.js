/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const { cooldowns } = client;

// eslint-disable-next-line no-undef
if (!cooldowns.has(command.data.name)) {
	// eslint-disable-next-line no-undef
	cooldowns.set(command.data.name, new Collection());
}

// eslint-disable-next-line no-unused-vars
const now = Date.now();
const timestamps = cooldowns.get(command.data.name);
const defaultCooldownDuration = 3;
const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

if (timestamps.has(interaction.user.id)) {
	// ...
}

try {
	// ...
}
catch (error) {
	// ...
}