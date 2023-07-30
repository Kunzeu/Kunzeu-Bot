const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('katty')
		.setDescription('Replies with algo!'),
	category: 'fun',
	async execute(interaction) {
		return interaction.reply('Manca te extrañábamos');
	},	
};
