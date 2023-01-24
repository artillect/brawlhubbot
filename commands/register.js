const { EmbedBuilder, SlashCommandBuilder, time, Embed } = require('discord.js');

const { Users } = require('../dbObjects.js')

const { DateTime } = require('luxon');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Join the league.')
        .addStringOption(option => 
            option
                .setName('username')
                .setDescription('Your MTGA username (with the #discriminator).')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('timezone')
                .setDescription('Your time zone (Continent/City).')
                .setRequired(true)
                .setAutocomplete(true)),
    async autocomplete(interaction) {
        // Get list of timezones in Continent/City format
        const timeZones = await Intl.supportedValuesOf('timeZone');
        // Get value user has typed in
        const focusedValue = await interaction.options.getFocused();
        // Get list of possible time zone names
        let filtered = await timeZones.filter(timeZone => timeZone.startsWith(focusedValue));
        // Cap length to 25 items
        filtered.length = Math.min(filtered.length, 25);
        await interaction.respond(
            filtered.map(choice => ({
                name: choice.replace('_',' '),
                value: choice,
            })),
        );
    },
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
        const timeZone = await interaction.options.getString('timezone');

        if (await Users.findOne({ where: { user_id: interaction.user.id}})) {
            const user = await Users.update({
                ign: interaction.options.getString('username'),
                timezone: timeZone,},
                {where: {
                    user_id: interaction.user.id,
                }})
                console.log(user);
                
                await interaction.reply({ content: 'Updated your information.', ephemeral: true});
        } else { // Add user to database
            try {
                const user = await Users.create({
                    user_id: interaction.user.id,
                    ign: interaction.options.getString('username'),
                    timezone: timeZone,
                });
                console.log('User created.')
                console.log(user);
                await interaction.reply(`Welcome to the league, ${interaction.user}!`)
            }
            catch (error) {
                console.log(error);
            }

        }

        const offsetNum = DateTime.local().setZone(timeZone).o/60;
        const offsetString = offsetNum >= 0 ? `+${offsetNum}` : `${offsetNum}`

        const embed = new EmbedBuilder()
            .setThumbnail(interaction.user.avatarURL())
            .addFields(
                { name: `${interaction.user.username}`, value: interaction.options.getString('username')},
                { name: `${timeZone.replace('_',' ')}`, value: `GMT${offsetString}`}
            )

		await interaction.followUp({ embeds: [embed], ephemeral: true });
	},
};
