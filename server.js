const http = require('http');
const { v4: uuidv4 } = require('uuid');

const errHandle = require('./errorHandle');

const todos = [];

const headers = {
	'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
	'Content-Type': 'application/json'
}

const requestListener = (req, res) => {
	let body = '';
	req.on('data', (chunk) => {
		body += chunk;
	});

	const urlData = req.url.split('/');
	console.log('urlData', urlData);

	if (req.url === "/todos" && req.method == "GET") {
		res.writeHead(200, headers);
		res.write(JSON.stringify({
			"status": "success",
			"data": todos,
		}));
		res.end();
	} else if (req.url === "/todos" && req.method === "POST") {
		// 先註冊，只會執行一次，在資料傳送結束的時候觸發
		req.on('end', () => {
			try {
				const title = JSON.parse(body).title;
				if ( title !== undefined) {
					const todo = {
						id: uuidv4(),
						title: title,
						completed: false
					};
					todos.push(todo);
					console.log('end', title);
					res.writeHead(200, headers);
					res.write(JSON.stringify({
						"status": "success",
						"data": todos,
					}));
					res.end();
				} else {
					errHandle(res);
				}
				
			} catch (error) {
				errHandle(res);
			}
			
		});

	} else if (req.url.startsWith('/todos/') && req.method === "DELETE") {
		console.log('delete with id');
		req.on('end', () => {
			const id = urlData[2];
			const index = todos.findIndex((todo) => todo.id === id);
			if (index !== -1) {
				todos.splice(index, 1);
				res.writeHead(200, headers);
				res.write(JSON.stringify({
					"status": "success",
					"data": todos,
				}));
				res.end();
			} else {
				errHandle(res);
			}
			
		})
	} else if (req.url === "/todos" && req.method === "DELETE") {
		console.log('delete all todos');
		todos.length = 0;
		res.writeHead(200, headers);
		res.write(JSON.stringify({
			"status": "success",
			"data": todos,
		}));
		res.end();
		
	} else if (req.url.startsWith('/todos/') && req.method === "PATCH") {
		req.on('end', () => {
			try {
				const title = JSON.parse(body).title;
				const id = req.url.split('/').pop();
				const index = todos.findIndex((todo) => todo.id === id);
				if ( title !== undefined && index !== -1) {
					todos[index].title = title;
					res.writeHead(200, headers);
					res.write(JSON.stringify({
						"status": "success",
						"data": todos,
					}));
					res.end();
				} else {
					errHandle(res);
				}
				
			} catch (error) {
				console.log('error', error);
				errHandle(res);
			}
		})
	} else if (req.method === "OPTIONS") {
		res.writeHead(200, headers);
		res.end();
	} else {
		res.writeHead(404, headers);
		res.write(JSON.stringify({
			"status": "error",
			"message": "not found"
		}));
		res.end();
	}
	
};

const server = http.createServer(requestListener);

server.listen(process.env.PORT || 3005);