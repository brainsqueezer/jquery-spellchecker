/*
 * jquery.spellchecker.js - a simple jQuery Spell Checker
 * Copyright (c) 2009 Richard Willis
 * MIT license  : http://www.opensource.org/licenses/mit-license.php
 * Project      : http://jquery-spellchecker.googlecode.com
 * Contact      : willis.rh@gmail.com
 */

(function( $, undefined ){

	$.fn.extend({
		
		spellchecker : function(options){

			return this.each(function(){
			
				if ( !$( this ).data( 'spellchecker' ) ) {

					$( this ).data( 'spellchecker', new spellchecker( this, options ) );
				}
			});
		}
	});

	var spellchecker = function(element, options) {

		this.options = $.extend({
			url: 'checkspelling.php',	// default spellcheck url
			lang: 'en',			// default language 
			engine: 'pspell',		// pspell or google
			addToDictionary: false,		// display option to add word to dictionary (pspell only)
			wordlist: {
				action: 'after',	// which jquery dom insert action
				element: element		// which object to apply above method
			},
			suggestBoxPosition: 'below'	// position of suggest box; above or below the highlighted word
		}, options);

		this.element = $( element );

		this.init();
	};

	spellchecker.prototype = {

		init : function(){

			var self = this;
			
			this.element.addClass( 'spellcheck-container' );

			this._createElements();

			this._bindHandlers();
		},
		
		_createElements : function(){

			var self = this;

			this.elements = {
				suggestWords: 
					$( '<div>' ).addClass('spellcheck-suggestbox-words'),
				ignoreWord: 
					$( '<a href="#">Ignore Word</a>' ),
				ignoreAllWords: 
					$( '<a href="#">Ignore all</a>' ),
				ignoreWordsForever: 
					$( '<a href="#" title="ignore word forever (add to dictionary)">Ignore forever</a>' ),
				suggestFoot: 
					$( '<div>' ).addClass( 'spellcheck-suggestbox-foot' ),
				badwords: 
					$( '<div>' ).addClass( 'spellcheck-badwords spellcheck-badwords-hidden' ),
				suggestBox: 
					$( '<div>' ).addClass( 'spellcheck-suggestbox' )
			};

			this.elements.suggestFoot
				.append( this.elements.ignoreWord )
				.append( this.elements.ignoreAllWords )
				.append( this.options.engine == "pspell" && self.options.addToDictionary ? this.elements.ignoreWordsForever : false );
							
			this.elements.suggestBox
				.append( this.elements.suggestWords )
				.append( this.elements.suggestFoot )
				.prependTo( 'body' );
			
			$( this.options.wordlist.element )[ this.options.wordlist.action ]( this.elements.badwords );
		},

		_bindHandlers: function(){

			var self = this;
			
			this.elements.ignoreWord
				.bind( 'click.spellchecker', function(){

					self.ignore();

					self.hideBox();

					return false;
				});

			this.elements.ignoreAllWords
				.bind( 'click.spellchecker', function(){

					self.ignoreAll();

					self.hideBox();

					return false;
				});

			this.elements.ignoreWordsForever
				.bind( 'click.spellchecker', function(){

					self.addToDictionary();

					self.hideBox();

					return false;
				});
			
			$( document )
				.bind( 'click.spellchecker', function(e){

					if ( 
						!$( e.target ).hasClass( 'spellcheck-word-highlight' ) && 
						!$( e.target ).parents().filter( '.spellcheck-suggestbox' ).length
					) {
						self.hideBox();
					}
				});
		},
		
		check : function( text ){

			var self = this, 
				tags = '<[^>]+>',
				punctuation = '^[^a-zA-Z\\u00A1-\\uFFFF]|[^a-zA-Z\\u00A1-\\uFFFF]+[^a-zA-Z\\u00A1-\\uFFFF]|[^a-zA-Z\\u00A1-\\uFFFF]$|\\n|\\t|\\s{2,}';

			var text = text ||
				encodeURIComponent(
					$.trim(
						this.element.val()
						.replace( new RegExp( tags, 'g' ), '' )
						.replace( new RegExp( punctuation, 'g' ), ' ' )
					)
				).replace(/%20/g, '+');
				
			self._trigger( this, 'onBeforeCheck', [ text ] );

			this.postJson( this.options.url, { text: text }, function( json ){

				self._trigger( this, 'onCheck', [ !json.length, text ] );

				if ( !json.length ) return;

				self.buildBadwordsBox( json ); 
			});
		},

		buildBadwordsBox : function(json){

			var self = this, words = [];


			// empty the badwords container
			this.elements.badwords.empty()

			// append incorrectly spelt words
			$.each(json, function(key, badword) {

				if ($.inArray(badword, words) === -1) {

					$( '<span />' )
						.addClass( 'spellcheck-word-highlight' )
						.text( badword )
						.click(function(){

							self.suggest( this ); 
						})
						.appendTo( self.elements.badwords )
						.after( '<span class="spellcheck-sep">,</span> ' );

					words.push( badword );
				}
			});

			this.elements.badwords
				.find( '.spellcheck-sep:last' )
					.addClass( 'spellcheck-sep-last' )
					.end()
				.removeClass( 'spellcheck-badwords-hidden' );
		},

		suggest : function(word){

			var self = this, 
				word = $( word ), 
				offset = word.offset();

			this.curWord = word;

			this.elements.suggestFoot.hide();

			this.elements.suggestBox
				.stop()
				.hide()
				.css({
					opacity: 1,
					width: "auto",
					left: offset.left + "px",
					top: ( 	
						this.options.suggestBoxPosition == 'above' ?
						( offset.top - ( word.outerHeight() + 10 ) ) + 'px' :
						( offset.top + word.outerHeight()) + 'px'
					)
				})
				.fadeIn( 200 );
			
			this.elements.suggestWords
				.html('<em>Loading..</em>');

			var encodedWord = encodeURIComponent( $.trim( word.text() ) );

			this.postJson(this.options.url, { suggest: encodedWord }, function(json){

				self.buildSuggestBox( json, offset );
			});
		},

		buildSuggestBox : function(json, offset){

			var self = this;

			this.elements.suggestWords.empty();

			for(var i=0; i < (json.length < 5 ? json.length : 5); i++) {

				this.elements.suggestWords.append(
					$('<a href="#">'+json[i]+'</a>')
					.addClass((!i?'first':''))
					.click(function(){ return false; })
					.mousedown(function(e){

						e.preventDefault();

						self.replace( this.innerHTML );

						self.hideBox();
					})
				);
			}								

			// no word suggestions
			if (!i) {
				this.elements.suggestWords.append('<em>(no suggestions)</em>');
			}

			// get browser viewport height
			var viewportHeight = 
				window.innerHeight ? window.innerHeight : $( window ).height();
			
			this.elements.suggestFoot.show();
						
			// position the suggest box
			self.elements.suggestBox
			.css({
				top : ( this.options.suggestBoxPosition == 'above' ) ||
					( offset.top + this.curWord.outerHeight() + this.elements.suggestBox.outerHeight() > viewportHeight + 10) ?
					( offset.top - (this.elements.suggestBox.height()+5)) + "px" : 
					( offset.top + this.curWord.outerHeight() + "px"),
				width : 'auto',
				left :	(
					this.elements.suggestBox.outerWidth() + offset.left > $( 'body' ).width() ? 
					(offset.left - this.elements.suggestBox.width()) + this.curWord.outerWidth() + 'px' : 
					offset.left + 'px'
				)
			});
			
		},

		hideBox : function(callback) {

			var self = this;

			this.elements.suggestBox.fadeOut(250, function(){

				self._trigger( this, callback, arguments );
			});				
		},
	
		replace : function(replace) {

			this.removeBadword( this.curWord );

			var newVal = 
				this.element.val()
				.replace(
					new RegExp("([^a-zA-Z\\u00A1-\\uFFFF]?)(" + this.curWord.text() + ")([^a-zA-Z\\u00A1-\\uFFFF]?)", "g"),
					'$1' + replace + '$3'
				)
				.replace(
					new RegExp("^(" + this.curWord.text() + ")([^a-zA-Z\\u00A1-\\uFFFF])", "g"),
					replace + '$2'
				)
				.replace(
					new RegExp("([^a-zA-Z\\u00A1-\\uFFFF])(" + this.curWord.text() + ")$", "g"),
					'$1' + replace
				);

			this.element.val( newVal );
		},

		// remove spelling formatting from word to ignore in original element
		ignore : function() {

			this.removeBadword( this.curWord );
		},
		
		// remove spelling formatting from all words to ignore in original element
		ignoreAll : function() {

			this.removeBadword( this.curWord );
		},

		removeBadword : function(element){

			if ( element.next().hasClass( 'spellcheck-sep' ) ) {
				
				element.next().remove();
			}

			element.remove();

			if (!$('.spellcheck-sep', this.elements.badwords).length){

				this.elements.badwords
					.addClass('spellcheck-badwords-hidden');
			} else {

				this.elements.badwords
					.find( '.spellcheck-sep:last')
					.addClass('spellcheck-sep-last');
			}
		},
		
		// add word to personal dictionary (pspell only)
		addToDictionary : function() {

			var self= this;

			this.hideBox(function(){

				confirm('Are you sure you want to add the word "'+self.curWord.text()+'" to the dictionary?') &&
					self.postJson(self.options.url, { addtodictionary: self.curWord.text() }, function(){
						self.ignoreAll();
						self.check();
					});			
			});
		},
		
		postJson : function(url, data, callback){

			var self = this;

			data = $.extend(true, data, {
				engine: this.options.engine,
				lang: this.options.lang
			});

			return $.ajax({
				type: 'POST',
				url: url,
				data: data,
				dataType : 'json',
				cache : false,
				error : function(XHR, status, error) {

					alert('Sorry, there was an error processing the request.');
				},
				success : function(){

					self._trigger( this, callback, arguments );
				}
			});
		},

		_trigger: function(scope, callback, arg){

			var type = typeof callback;

			if ( type === 'string' && this.options[ callback ] ) {

				this.options[ callback ].apply( scope, arg );

			} else if ( type === 'function' ) {

				callback.apply( scope, arg );
			}
		},

		destroy : function() {

			this.elements.badwords.remove();

                        this.elements.suggestBox.remove();

			this.element.removeClass('spellcheck-container');

			$( this.element ).data( 'spellchecker', null );
		}
		
	};	

})( window.jQuery );
