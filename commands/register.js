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
        let filtered = await timeZones.filter(timeZone => timeZone.toLowerCase().startsWith(focusedValue.toLowerCase()));
        // Cap length to 25 items
        filtered.length = Math.min(filtered.length, 25);
        await interaction.respond(
            filtered.map(choice => ({
                name: choice.replaceAll('_',' '),
                value: choice,
            })),
        );
    },
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
        // Get list of timezones in Continent/City format       
        const timeZones = await Intl.supportedValuesOf('timeZone');

        const timeZone = await interaction.options.getString('timezone');

        if (!timeZone.includes('/')) return await interaction.reply({content: 'Please enter your time zone in the format `Continent/Major City`.', ephemeral: true})

        if (!timeZones.includes(timeZone)) return await interaction.reply({content: 'Please select a time zone from the list.', ephemeral: true});

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

        // Get offset 
        const offsetNum = DateTime.local().setZone(timeZone).o;
        const offsetString = offsetNum >= 0 ? `+${offsetNum/60}:${String(offsetNum % 60).padStart(2,'0')}` : `${offsetNum/60}:${String(offsetNum % 60).padStart(2,'0')}`

        const embed = new EmbedBuilder()
            .setThumbnail(interaction.user.avatarURL())
            .addFields(
                { name: `${interaction.user.username}`, value: interaction.options.getString('username')},
                { name: `${timeZone.replaceAll('_',' ')}`, value: `GMT${offsetString}`}
            )

		await interaction.followUp({ embeds: [embed], ephemeral: true });
	},
};
