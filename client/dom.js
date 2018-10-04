let dom = (function(){

	function find(selector){
		return document.querySelector(selector)
	}

	function findAll(selector){
		return [].slice.call(document.querySelectorAll(selector))
	}

	function addEvent(elem, event, cb){
		if(Array.isArray(elem)){
			elem.forEach(function(element){
				element.addEventListener(event, cb)
			})
		}
		else elem.addEventListener(event, cb)
	}

	function wrap(elt){

		let element = elt

		function css(styles){
			if(typeof styles != "object") return wrap(element)
			for(style in styles){
				if(styles.hasOwnProperty(style)){
					element.style[style] = styles[style]
				}
			}
			return wrap(element)
		}

		function attr(attribs){
			if(typeof attribs != "object") return wrap(element)
			for(attrib in attribs){
				if(attribs.hasOwnProperty(attrib))
					element.setAttribute(attrib, attribs[attrib])
			}
			return wrap(element)
		}

		function add(elt){
			if(element.appendChild)
				element.appendChild(elt)
			return wrap(element)
		}

		function into(parent){
			if(parent.appendChild)
				parent.appendChild(element)
			return wrap(element)
		}

		function changeClass(classname){
			element.className = classname
			return wrap(element)
		}

		function addClass(classname){
			element.classList.add(classname)
			return wrap(element)
		}

		function removeClass(classname){
			element.classList.remove(classname)
			return wrap(element)
		}

		function empty(){
			let children = Array.prototype.slice.call(this.getElement().children, 0)
			children.forEach(function(child){
				this.getElement().removeChild(child)
			})
		}

		return {
			css: css,
			attr: attr,
			add: add,
			into: into,
			changeClass: changeClass,
			empty: empty,
			addClass: addClass,
			removeClass: removeClass,
			getElement: function(){
				return element
			}
		}

	}

	return {
		find: find,
		findAll: findAll,
		addEvent: addEvent,
		_: wrap
	}

})()

if(module)
	module.exports = dom