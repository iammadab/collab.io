let {messenger, componentsManager} = loosejs, manager = componentsManager()

let mainChannel = new messenger()

let showUserName = function(options){

	let store = {}

	function init(){
		store.userForm = dom.find(".embeded")
		options.channel.on({
			"show-panel": showPanel,
			"hide-panel": hidePanel
		})
	}

	function showPanel(){
		dom._(store.userForm).css({
			 display: "flex"
		})
	}

	function hidePanel(){
		dom._(store.userForm).css({
			display: "none"
		})
	}

	return {
		init: init
	}

}

manager.add(new showUserName({
	channel: mainChannel
}))

let addUserName = function(options){

	let store = {}

	function init(){
		store.form = dom.findAll(".embeded form")

		dom.addEvent(store.form, "submit", handleSubmit)
	}

	function handleSubmit(event){
		event.preventDefault()
		let username = dom.find(".username").value
		if(!username) return
		fetch("/new-user/" + username)
			.then(response => response.json())
			.then(data => {
				if(data.success){
					options.channel.emit("hide-panel")
					options.channel.emit("has-user-name", {
						username: username
					})
					socket.emit("message", {
						name: username,
						message: ""
					})
				}
				else
					options.channel.emit("error", {
						message: "screen name already taken"
					})
			})
			.catch(err => console.log(err))
	}

	return {
		init: init
	}

}

manager.add(new addUserName({
	channel: mainChannel
}))

let showError = function(options){

	let store = {}

	function init(){
		store.errorBar = dom.find(".message")

		options.channel.on({
			"error": handleError
		})
	}

	function handleError(data){
		store.errorBar.innerText = data.message
		dom._(store.errorBar).css({
			opacity: 1
		})
	}

	return {
		init: init
	}

}

manager.add(new showError({
	channel: mainChannel
}))

let storeUserName = function(options){

	let store = {}

	function init(){
		options.channel.on({
			"has-user-name": saveUserName
		})
	}

	function saveUserName(data){
		if(data.username && localStorage)
			localStorage.setItem("username", data.username)
	}

	return {
		init: init
	}

}

manager.add(new storeUserName({
	channel: mainChannel
}))

let chatForm = function(options){

	let store = {}

	function init(){
		store.chat = dom.find("body > form")
		store.messageBox = dom.find("body > form input")

		dom.addEvent(store.chat, "submit", handleNewMessage)

		options.channel.on({
			"clear-input": clearInput
		})
	}

	function clearInput(){
		store.messageBox.value = ""
	}

	function handleNewMessage(event){
		event.preventDefault()

		let message = store.messageBox.value, username = localStorage.getItem("username")

		if(!username) return

		console.log("sending the data")
		socket.emit("message", {
			name: username,
			message: ""
		})
		socket.emit("message", {
			name: username,
			message: message
		})
		console.log("should have received the data")
	}

	return {
		init: init
	}

}

manager.add(new chatForm({
	channel: mainChannel
}))

let messageBuilder = function(options){

	let store = {}

	function init(){

		store.chatContainer = dom.find(".chat")

		options.channel.on({
			"addMessage": createMessage
		})
	}

	function createMessage(data){
		let username = localStorage.getItem("username")
		if(!username || data.message == "" || data.message == undefined) return
		if(username == data.name) cr(data, "right")
		else cr(data, "left")
	}

	function cr(data, side){

		let block = document.createElement("div"), name = document.createElement("p"), message = document.createElement("p")
		block.className = "block " + side
		name.className = "name"
		name.innerText = data.name
		message.className = "message"
		message.innerText = data.message

		block.appendChild(name)
		block.appendChild(message)
		
		store.chatContainer.appendChild(block)

		options.channel.emit("clear-input", null)

		block.scrollIntoView()
	}

	return {
		init: init
	}

}

manager.add(new messageBuilder({
	channel: mainChannel
}))

let heightCorrector = function(options){

	function init(){
		fixHeight()
		window.onresize = function(){
			fixHeight()
		}
	}

	function fixHeight(){
		document.body.style.height = window.innerHeight + "px"
	}

	return {
		init: init
	}

}

manager.add(new heightCorrector())

let messageLoader = function(options){

	let store = {}

	function init(){
		options.channel.on({
			gotMessage: loadMessage
		})
		fetchMessages()
	}

	function fetchMessages(){
		fetch("/history")
			.then(response => response.json())
			.then(messageObjects => {
				store.messages = messageObjects
				options.channel.emit("gotMessage")
			})
	}

	function loadMessage(){
		store.messages.forEach(message => {
			options.channel.emit("addMessage", message)
		})
	}

	return {
		init: init
	}

}

manager.add(new messageLoader({
	channel: mainChannel
}))

manager.start()