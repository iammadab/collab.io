
// Combination of the messaging lib and the components manager to create a lightweight architecture

let loosejs = (function(){

	let messenger = function(){

		let event_tree = {}

		function on(options){
			if(!typeof options == "object") return
			for(property in options){
				if(!options.hasOwnProperty(property)) return
				if(!event_tree[property]) event_tree[property] = []
				if(typeof options[property] !== "function") return
				event_tree[property].push(options[property])
			}
		}

		function emit(event, data){
			if(!event_tree[event]) return log(`Error: No ${event} event`, new Error("undefined event"))
			event_tree[event].forEach(fn => {
				fn(data)
			})
		}

		function log(message, error){
			console.log(message)
		}

		return {
			on: on,
			emit: emit,
			log: log
		}

	}

	let componentsManager = function(){

		let components = []

		function add(component){
			if(!component.init) return log(`Error: No init function in ${component.name}`)
			components.push(component)
		}

		function start(){
			components.forEach(component => component.init())
		}

		return {
			add: add,
			start: start
		}

	}

	return {
		messenger: messenger,
		componentsManager: componentsManager
	}

})()

if(module)
	module.exports = loosejs