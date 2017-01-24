var Sequelize = require('sequelize');

var connection = new Sequelize('testingDatabase', 'postgres', 'silverback', {
	dialect: 'postgres',
	dialectOptions: {
		// ssl: {
		// 	require: true
		// }
	}
});

module.exports = connection;