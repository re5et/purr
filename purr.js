var purr = new Class({
	
	'options': {
		'mode': 'top',
		'position': 'left',
		'elements': {
			'wrapper': 'div',
			'alert': 'div',
			'button': 'button'
		},
		'elementOptions': {
			'wrapper': {
				'id': 'purr-wrapper',
				'styles': {
					'position': 'fixed',
					'z-index': '99999999'
				}
			},
			'alert': {
				'class': 'purr-alert',
				'styles': {
					'opacity': '.85'
				}
			},
			'button': {
				'class': 'purr-button'
			}
		},
		'alert': {
			'buttons': [],
			'clickDismiss': true,
			'hideAfter': 5000,
			'fx': {
				'duration': 1000
			},
			'highlight': false,
			'highlightRepeat': false,
			'highlight': {
				'start': '#FF0',
				'end': false
			}
		}
	},
	
	'Implements': [Options, Events, Chain],
	
	'initialize': function(options){
		this.setOptions(options);
		this.createWrapper();
		return this;
	},
	
	'bindAlert': function(){
		return this.alert.bind(this);
	},
	
	'createWrapper': function(){
		this.wrapper = new Element(this.options.elements.wrapper, this.options.elementOptions.wrapper);
		if(this.options.mode == 'top')
		{
			this.wrapper.setStyle('top', 0);
		}
		else
		{
			this.wrapper.setStyle('bottom', 0);
		}
		$(document.body).grab(this.wrapper);
		this.positionWrapper(this.options.position);
	},
	
	'positionWrapper': function(position){
		if(position == 'left')
		{
			this.wrapper.setStyle('left', 0);
		}
		else if(position == 'right')
		{
			this.wrapper.setStyle('right', 0);
		}
		else
		{
			this.wrapper.setStyle('visibility', 'hidden');
			var measurer = this.alert('need something in here to measure');
			this.wrapper.setStyle('left', (window.innerWidth / 2) - (this.wrapper.getWidth() / 2));
			measurer.destroy();
			this.wrapper.setStyle('visibility','');
		}
	},
	
	'alert': function(msg, options){
		
		
		var alert = new Element(this.options.elements.alert, this.options.elementOptions.alert);
		if($type(msg) == 'string')
		{
			alert.set('html', msg);
		}
		else if($type(msg) == 'element')
		{
			alert.grab(msg);
		}
		else if($type(msg) == 'array')
		{
			var alerts = [];
			msg.each(function(m){
				alerts.push(this.alert(m, options));
			}, this);
			return alerts;
		}
		options = $merge(this.options.alert, options);
		alert.store('options', options);
		
		if(options.buttons.length > 0)
		{
			options.clickDismiss = false;
			options.buttons.each(function(button){
				if($defined(button.text) && $defined(button.callback))
				{
					alert.grab(
						new Element(this.options.elements.button, this.options.elementOptions)
						.set('html', button.text)
						.addEvent('click', button.callback.pass(alert))
					);
				}
			}, this);
		}
		if($defined(options.class))
		{
			alert.addClass(options.class);
		}		
		
		this.wrapper.grab(alert, (this.options.mode == 'top') ? 'bottom' : 'top');
	
		var fx = $merge(this.options.alert.fx, options.fx);
		var alertFx = new Fx.Morph(alert, fx);
		alert.store('fx', alertFx);
		this.fadeIn(alert);
		
		if(options.highlight)
		{
			alertFx.addEvent('complete', function(){
				alert.highlight(options.highlight.start, options.highlight.end);
				if(options.highlightRepeat)
				{
					alert.highlight.periodical(options.highlightRepeat, alert, [options.highlight.start, options.highlight.end]);
				}
			});
		}
		if(options.hideAfter)
		{
			this.dismiss(alert);
		}
		
		if(options.clickDismiss)
		{
			alert.addEvent('click', function(){
				this.dismiss(alert, true);
			}.bind(this));
		}
		
		return alert;
	},
	
	'fadeIn': function(alert){
		var alertFx = alert.retrieve('fx');
		alertFx.set({
			'opacity': 0
		});
		alertFx.start({
			'opacity': $pick(this.options.elementOptions.alert.styles.opacity, .9),
		});
	},
	
	'dismiss': function(alert, now){
		now = now || false;
		var options = alert.retrieve('options');
		if(now)
		{
			this.fadeOut(alert);
		}
		else
		{
			this.fadeOut.delay(options.hideAfter, this, alert);
		}
	},
	
	'fadeOut': function(alert){
		var alertFx = alert.retrieve('fx');
		if(!alertFx)
		{
			return null;
		}
		var to = {
			'opacity': 0
		}
		if(this.options.mode == 'top')
		{
			to['margin-top'] = '-'+alert.offsetHeight+'px';
		}
		else
		{
			to['margin-bottom'] = '-'+alert.offsetHeight+'px';
		}
		alertFx.start(to);
		alertFx.addEvent('complete', function(){
			alert.destroy();
		});
	}
});