const express = require('express');
const morgan = require('morgan');
const app = express();
app.use(express.json());

const transactions = require('./data/points-data');

app.use(morgan('dev'));

app.get('/transactions', (req, res) => {
	res.json({ data: transactions });
});

app.post('/transactions', (req, res, next) => {
	let date = new Date();
	const { data: { payer, points } = {} } = req.body; //returns empty object by default
	if (typeof payer !== 'string') {
		next({
			status: 400,
			message: `${payer} is not valid.`,
		});
	}
	if (typeof points !== 'number') {
		next({
			status: 400,
			message: `${points} is not valid.`,
		});
	} else {
		const newPoints = {
			payer,
			points,
			timestamp: date.toISOString(),
		};
		transactions.push(newPoints);
		res.status(201).json({ data: newPoints });
	}
});

app.post('/spend', (req, res, next) => {
	const { data: { points } = {} } = req.body;
	if (typeof points !== 'number') {
		next({
			status: 400,
			message: `${points} is not valid.`,
		});
	} else {
		transactions.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

		// let result = [];
		// let count = points;
		// transactions.forEach((item) => {
		// 	if (count > 0) {
		// 		if (item.points > count) {
		// 			result.push({
		// 				payer: item.payer,
		// 				points: -count,
		// 			});
		// 			count = 0;
		// 		} else {
		// 			result.push({ payer: item.payer, points: -item.points });
		// 			count = count - item.points;
		// 		}
		// 	}
		// });

		let pointMap = new Map();
		let count = points;
		transactions.forEach((item) => {
			if (count > 0) {
				if (item.points > count) {
					if (!pointMap.has(item.payer)) {
						pointMap.set(item.payer, -count);
					} else {
						let itemPoints = pointMap.get(item.payer);
						pointMap.set(item.payer, itemPoints + count);
					}
					count = 0;
				} else {
					if (!pointMap.has(item.payer)) {
						pointMap.set(item.payer, -item.points);
					} else {
						let itemPoints = pointMap.get(item.payer);
						pointMap.set(item.payer, itemPoints - item.points);
					}
					count = count - item.points;
				}
			}
		});
		let result = [];
		let date = new Date();
		for (let [key, value] of pointMap.entries()) {
			result.push({ payer: key, points: value });
			transactions.push({
				payer: key,
				points: value,
				timestamp: date.toISOString(),
			});
		}
		res.status(201).json({ data: result });
	}
});

app.get('/balances', (req, res, next) => {
	let balances = transactions.reduce((acc, item) => {
		acc[item.payer] = (acc[item.payer] || 0) + item.points;
		return acc;
	}, {});
	res.json({ data: balances });
});

// Not-found handler
app.use((req, res, next) => {
	res.send(`The route ${req.path} does not exist!`);
});
// Error handler
app.use((error, req, res, next) => {
	console.error(error);
	const { status = 500, message = 'Something went wrong!' } = error;
	res.status(status).json({ error: message });
});

module.exports = app;
