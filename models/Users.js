module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		ign: DataTypes.STRING,
        timezone: DataTypes.STRING,
	}, {
		timestamps: false,
	});
};
