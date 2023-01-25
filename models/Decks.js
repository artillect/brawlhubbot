module.exports = (sequelize, DataTypes) => {
	return sequelize.define('decks', {
		user_id: {
			type: DataTypes.STRING,
		},
		season: DataTypes.INTEGER,
        week: DataTypes.INTEGER,
        commander: DataTypes.STRING,
        moxfield_link: DataTypes.STRING,
        decklist: DataTypes.STRING,
	}, {
		timestamps: false,
	});
};
