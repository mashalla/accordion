/*
---
script: Fx.Accordion.js
description: An Fx.Elements extension which allows you to easily create accordion type controls.
license: MIT-style license
authors:
  - Eva Lösch
  - Valerio Proietti
requires:
  - core:1.2.4/Element.Event
  - /Fx.Elements
provides: [Fx.Accordion]
...
 */
Fx.Accordion = Class
		.refactor(
				Fx.Accordion,
				{

					options : {

						// ########## START: CHANGE ##########
						// alwaysHide: false,
						alwaysHide : true,
						// ########## END: CHANGE ##########
						// ########## START: EXTEND ##########
						// additional variables
						// prefix used for IDs
						prefix : 'acc_tab_',
						// a flag, that shows if CTRL is pressed or not
						ctrl : false,
						// the current index of added sections
						index : 0,
						// the class name of the accordion headers
						className : '',
						// the current element with the focus
						elementWithFocus : null,
						// the index of the currently selected element
						currentIndex : 0
					// ########## END: EXTEND ##########

					},

					initialize : function() {

						this.previous.apply(this, arguments);

						// set focus on first accordion header
						this.togglers[0].setProperty('tabindex', 0);
						this.className = this.togglers[0].getProperty("class");

						// element, which has currently focus:
						this.options.elementWithFocus = null;

						this.togglers.each(function(el) {

							el.addEvents({
								focus : function() {
									this.options.elementWithFocus = el;
									el.setProperty('aria-selected', 'true');
								}.bind(this),
								blur : function() {
									this.options.elementWithFocus = null;
									el.setProperty('aria-selected', 'false');
								}.bind(this)
							});
						}.bind(this));

						// add Role and State for ARIA
						$(document.body).getElements('#accordion').setProperty(
								'role', 'tablist');
						$(document.body).getElements('#accordion').setProperty(
								'aria-multiselectable', 'true');

					},

					addSection : function(toggler, element) {

						this.previous(toggler, element);

						if (toggler.getProperty('tabindex') != 0)
							toggler.setProperty('tabindex', -1);
						// set ARIA Roles and Properties
						toggler.setProperty('aria-expanded', 'false');
						toggler.setProperty('role', 'tab');
						// set id
						toggler.setProperty('id', this.options.prefix
								+ this.options.index);
						// add Key-Eventlistener
						toggler.addEvent('keydown', this.onKeyDown
								.bindWithEvent(this));
						toggler.addEvent('keyup', this.onKeyUp
								.bindWithEvent(this));

						// set ARIA Roles and Properties
						element.setProperty('aria-labelledby',
								this.options.prefix + this.options.index);
						element.setProperty('aria-hidden', 'true');
						element.setProperty('role', 'tabpanel');
						// set tabindex to panel EVA
						element.setProperty('tabindex', -1);
						// set visibility
						element.style.visibility = 'hidden';
						// add Key-Eventlistener
						element.addEvent('keydown', this.onKeyDown
								.bindWithEvent(this));
						element.addEvent('keyup', this.onKeyUp
								.bindWithEvent(this));
						// increment index
						this.options.index++;
						// allocate new IDs to each Accordion header and adjust
						// the aria-labelledby attribute in the corresponding
						// panel
						$$('.' + this.className).each(
								function(element, index) {
									element.setProperty('id',
											this.options.prefix + index);
									var panel = element
											.getNext('div[role=tabpanel]');
									if (panel != null)
										panel.setProperty('aria-labelledby',
												this.options.prefix + index);
								}.bind(this));
						return this;
					},

					display : function(index, useFx) {

						this.previous(index, useFx);

						var obj = {};
						this.elements
								.each(
										function(el, i) {
											obj[i] = {};
											var hide;
											if (i != index) {
												hide = true;
											} else if (this.options.alwaysHide
													&& ((el.offsetHeight > 0 && this.options.height) || el.offsetWidth > 0
															&& this.options.width)) {
												hide = true;
												this.selfHidden = true;
											}
											this.fireEvent(hide ? 'background'
													: 'active', [
													this.togglers[i], el ]);
											for ( var fx in this.effects)
												obj[i][fx] = hide ? 0
														: el[this.effects[fx]];
										}, this);

						// change attributes when panel gets expanded/collapsed
						var from = {}, to = {};
						for ( var i in obj) {
							var iProps = obj[i], iFrom = from[i] = {}, iTo = to[i] = {};
							for ( var p in iProps) {
								if (p == 'height') {
									if (iProps[p] == 0) {
										this.togglers[i].setProperty(
												'aria-expanded', false);
										this.elements[i].style.visibility = 'hidden';
										this.elements[i].setProperty(
												'aria-hidden', true);
										this.elements[i].setProperty(
												'tabindex', -1);
									} else if (iProps[p] > 0) {
										this.togglers[i].setProperty(
												'aria-expanded', true);
										this.togglers[i].setProperty(
												'tabindex', 0);
										this.elements[i].style.visibility = 'visible';
										this.elements[i].setProperty(
												'aria-hidden', false);
										this.elements[i].setProperty(
												'tabindex', 0);
									}
								}
							}
						}
						// ########## END: EXTEND ##########
						return useFx ? this.start(obj) : this.set(obj);
					},

					keys : {
						KEY_ENTER : 13,
						KEY_CTRL : 17,
						KEY_SPACE : 32,
						KEY_PAGEUP : 33,
						KEY_PAGEDOWN : 34,
						KEY_END : 35,
						KEY_HOME : 36,
						KEY_LEFT : 37,
						KEY_UP : 38,
						KEY_RIGHT : 39,
						KEY_DOWN : 40
					},

					getKeyCode : function(event) {
						var keyCode;
						// works in IE 8 and FF 3
						if (window.event) {
							keyCode = window.event.keyCode;
						} else {
							keyCode = event.code;
						}
						return keyCode;
					},

					onKeyDown : function(event) {
						var keyCode = this.getKeyCode(event);
						if (this.options.elementWithFocus != null) {
							this.options.currentIndex = parseInt(event.target.id
									.replace(this.options.prefix, ''));
						}

						var first = this.togglers[0];
						var last = this.togglers[this.togglers.length - 1];
						var next = this.togglers[this.options.currentIndex + 1];
						var previous = this.togglers[this.options.currentIndex - 1];
						var thiz = this.togglers[this.options.currentIndex];

						// NOTE: use the setTimeout-method to call the
						// focus()-method slightly later due to a
						// known IE-bug where focus is not rendered correctly.
						// NOTE: Use 'break' to prevent the code from running
						// into
						// the next case automatically.

						switch (keyCode) {
						case this.keys.KEY_LEFT:

							if (this.options.elementWithFocus != null) {
								if (this.options.ctrl)
									break;
								else {
									event.stop();
									if (previous == null) {
										setTimeout(function() {
											last.focus();
										}, 0);
										next.setProperty('tabindex', 0);
									} else {
										setTimeout(function() {
											previous.focus();
										}, 0);
										previous.setProperty('tabindex', 0);
									}

									if (thiz != null) {
										thiz.setProperty('tabindex', -1);
									}

									break;
								}
							}
							break;
						case this.keys.KEY_UP:
							if (this.options.ctrl) {
								if (thiz != null) {
									setTimeout(function() {
										thiz.focus();
									}.bind(this), 0);
								}
								break;
							} else {
								if (this.options.elementWithFocus != null) {
									event.stop();
									if (previous == null) {
										setTimeout(function() {
											last.focus();
										}, 0);
										next.setProperty('tabindex', 0);
									} else {
										setTimeout(function() {
											previous.focus();
										}, 0);
										previous.setProperty('tabindex', 0);
									}
									if (thiz != null) {
										thiz.setProperty('tabindex', -1);
									}
									break;
								}
							}
							break;
						case this.keys.KEY_DOWN:
						case this.keys.KEY_RIGHT:

							if (this.options.elementWithFocus != null) {
								if (this.options.ctrl) {
									break;
								} else {
									event.stop();
									if (next == null) {
										setTimeout(function() {
											first.focus();
										}, 0);
										first.setProperty('tabindex', 0);
									} else {
										setTimeout(function() {
											next.focus();
										}, 0);
										next.setProperty('tabindex', 0);
									}
									if (thiz != null) {
										thiz.setProperty('tabindex', -1);
									}
									break;
								}
							}
							break;

						case this.keys.KEY_SPACE:

						case this.keys.KEY_ENTER:

							if (this.options.elementWithFocus != null) {
								if (this.options.ctrl) {
									break;
								}
								event.target.fireEvent('click');
								break;
							}
							break;
						case this.keys.KEY_HOME:

							if (this.options.elementWithFocus != null) {
								if (this.options.ctrl) {
									break;
								}
								if (first != null) {
									event.stop();
									setTimeout(function() {
										first.focus();
									}, 0);
									first.setProperty('tabindex', 0);
								}
								if (thiz != null)
									thiz.setProperty('tabindex', -1);
								break;
							}
							break;
						case this.keys.KEY_END:

							if (this.options.elementWithFocus != null) {
								if (this.options.ctrl) {
									break;
								}
								if (last != null) {
									event.stop();
									setTimeout(function() {
										last.focus();
									}, 0);
									last.setProperty('tabindex', 0);
								}
								if (thiz != null) {
									thiz.setProperty('tabindex', -1);
								}
								break;
							}
							break;
						case this.keys.KEY_PAGEUP:
							if (this.options.ctrl) {
								if (previous == null) {
									setTimeout(function() {
										last.focus();
									}, 0);
									last.setProperty('tabindex', 0);
								} else {
									setTimeout(function() {
										previous.focus();
									}, 0);
									previous.setProperty('tabindex', 0);
								}
								if (thiz != null)
									thiz.setProperty('tabindex', -1);
							}
							break;

						case this.keys.KEY_PAGEDOWN:
							if (this.options.ctrl) {
								if (next == null) {
									setTimeout(function() {
										first.focus();
									}, 0);
									first.setProperty('tabindex', 0);
								} else {
									setTimeout(function() {
										next.focus();
									}, 0);
									next.setProperty('tabindex', 0);
								}
								if (thiz != null)
									thiz.setProperty('tabindex', -1);

							}
							break;

						case this.keys.KEY_CTRL:
							this.options.ctrl = true;
							break;
						}
					},

					onKeyUp : function(event) {
						var keyCode = this.getKeyCode(event);

						if (keyCode == this.keys.KEY_CTRL) {
							this.options.ctrl = false;
							return;
						}
					},
					setObjects : function(event) {
						if (this.options.elementWithFocus != null) {
							this.options.currentIndex = parseInt(event.target.id
									.replace(this.options.prefix, ''));
						}
					}

				});
