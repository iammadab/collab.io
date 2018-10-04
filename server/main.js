let path = require("path"), fs = require("fs")
let express = require("express") 
let app = express()
let http = require("http").Server(app) 
let io = require("socket.io")(http)
let users = []

app.use(express.static(path.resolve(__dirname, "../", "client")))

app.get("/new-user/:user", function(req, res){
	let user = req.params.user.toLowerCase()
	if(users.indexOf(user) >= 0)
		res.json({success: false})
	else{
		users.push(user)
		res.json({success: true})
	}
})

app.get("/history", async function(req, res){
	let historyFile = await readFile(path.resolve(__dirname, "history.txt"), "utf-8")
	res.json(limit(parseContent(historyFile), 100))
})

io.on("connection", function(socket){
	socket.on("message", function(data){
		if(!socket.name) socket.name = data.name
		io.emit("new-message", data)
		log(data)
	})

	socket.on("disconnect", function(){
		if(!socket.name) return
		users = remove(users, socket.name)
	})
})

http.listen(3000, function(){
	console.log("Application listening at port 3000")
})

function log(data){
	let input = data.name + ":" + data.message + "\n"
	fs.appendFile(path.resolve(__dirname, "history.txt"), input, function(err){
		if(err) console.log(err)
	})
}

function promisify(fn){
	return function(){
		let args = [].slice.call(arguments, 0)
		return new Promise(function(resolve, reject){
			args.push(function(err, data){
				if(err)
					reject(err)
				resolve(data)
			})
			fn.apply(null, args)
		})
	}
}

let readFile = promisify(fs.readFile)

function limit(arr, n){
	let output = [], end = n > arr.length ? arr.length : n
	console.log(end)
	for(let i = arr.length - 1; i > arr.length - end - 1; i--){
		output.unshift(arr[i])
	}
	return output
}

function parseContent(historyText){
	console.log(historyText)
	let eachLine = historyText.split("\n")
	let messageObjects = eachLine.map(line => {
		line = line.split(":")
		return {
			name: line[0],
			message: line[1]
		}
	})
	return messageObjects
}

function remove(arr, data){
	return arr.filter(function(el){
		return el != data
	})
}