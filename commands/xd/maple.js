const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('maple')
		.setDescription('Replies with algo!'),
	category: 'fun',
	async execute(interaction) {
		return interaction.reply('¡Te quiero mucho!');
	},	
};
