const express = require('express');
const bodyParser = require('body-parser');
const packageInfo = require('./package.json');

const app = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.json({ version: packageInfo.version });
});

var server = app.listen(process.env.PORT, "0.0.0.0", () => {
	const host = server.address().address;
	const port = server.address().port;
	console.log('Web server started at http://%s:%s', host, port);
});

module.exports = (bot) => {
	app.post('/' + bot.token, (req, res) => {
		bot.processUpdate(req.body);
		res.sendStatus(200);
	});
	if (process.env.NODE_ENV == 'development') {
		bot.startPolling();
	} else {
		bot.telegram.setWebhook(`${process.env.HEROKU_URL}/bot${process.env.TOKEN}`);
		app.use(bot.webhookCallback(`/bot${process.env.TOKEN}`));
	}
};