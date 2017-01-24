var Sequelize = require('sequelize');

var connection = new Sequelize('testingDatabase', 'postgres', 'password', {
	dialect: 'postgres',
	dialectOptions: {
		// ssl: {
		// 	require: true
		// }
	}
});

module.exports = connection;