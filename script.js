(function($angular, _, Hammer) {
	'use strict';
	
	$angular
	.module('app', [])
	.controller('appController', ['$scope', '$document', 'ColorService', 'UiHelpers', function($scope, $document, colors, ui) {

		$scope.colorSteps = 6;
		$scope.defaultColor = '#0ebeff';
		$scope.hash = window.location.hash ? window.location.hash.replace('/', '') : $scope.defaultColor;

		window.addEventListener('hashchange', function(e){
			var color = '#' + e.newURL.split('#')[1];
			if(color !== $scope.color) {
				doIt(color);
			}
		});

		var _notInRunLoop = function _notInRunLoop() {
			return !$scope.$root.$$phase;
		};

		var doIt = function(color){
			if(!color || color === '#') {
				color = colors.randomHex();
			}
			color = colors.toHex(color).toLowerCase();

			var cb = colors.brightness(color);
			var darker = [];
			_.times(50, function(n){
				if(n % $scope.colorSteps === 0) {
					var dn = colors.darken(color, n);
					if(dn !== '#000000') {
						if(cb < $scope.colorSteps) {
							darker.push(dn);
						} else {
							if(cb - colors.brightness(dn) > $scope.colorSteps) {
								darker.push(dn);
							}
						}
					}
				}
			});

			var lighter = [];
			_.times(50, function(n){
				if(n % $scope.colorSteps === 0) {
					var c = 50 - n;
					var ln = colors.lighten(color, c);
					if(ln !== '#ffffff') {
						lighter.push(ln);
					}
				}
			});

			$scope.darker = _.unique(darker);
			$scope.lighter = _.unique(lighter);

			// edges
			$scope.lightest = _.first($scope.lighter);
			$scope.darkest = _.last($scope.darker);
			// middles
			$scope.lightish = $scope.lighter.length > 2 ? $scope.lighter[$scope.lighter.length-3] : color;
			$scope.darkish = $scope.darker.length > 2 ? $scope.darker[2] : color;

			$scope.shades = _.unique($scope.lighter.concat([color]).concat($scope.darker));

			// inject a duplicate last item for overlap hackery in tanuki mode: flower
			if(!$scope.darkest) {
				$scope.darkest = color;
			}
			$scope.shades.push($scope.darkest);

			$scope.controlBg = _.first($scope.darker);
			$scope.controlFg = _.last($scope.lighter);

			$scope.deg = (360/($scope.shades.length-1));
			$scope.size = Math.floor((100/($scope.shades.length-2) + Math.PI)/2);

			$scope.color = color;
			$scope.tuner = {
				r: colors.red(color),
				g: colors.green(color),
				b: colors.blue(color),
				hex: color,
				brightness: cb
			};

			$scope.rotateFactor = _.findIndex($scope.shades, function(item){
				return item === $scope.color;
			});

			$scope.ringDeg = $scope.deg*($scope.rotateFactor+1);

			window.location.hash = color; //.replace('#', '#/');

			 if (_notInRunLoop()) {
				try {
					// Sometimes we're outside of the Angular run-loop,
					// and therefore need to manually invoke the `apply` method
					$scope.$apply();
				} catch(e) {}
			}
		};
		
		$scope.doIt = function(color){
			doIt(color);
		};
		
		$scope.setRingRotation = function(){
			return {
				transform: 'rotate(-'+$scope.ringDeg+'deg) translateZ(0)'
			};
		};

		$scope.setRotation = function(index){
			var i = index+1;
			var d = $scope.deg*(i);
			var m = '0 -'+$scope.size+'em';
			var z = $scope.shades.length - i;
			var t = (i * 0.08);
			var r = 	'';
			var s = '';
			var f = '';
			var n;

			// hackery
			if(i === $scope.shades.length) {
				d = 360; //$scope.deg;
				m = '0 -'+$scope.size+'em 0 0';
				z = $scope.shades.length;
			}

			r = 'rotate('+d+'deg)';

			return {
				transform: r + s,
				fontSize: f,
				margin: m,
				transitionDelay: t+'s',
				zIndex: z
			};
		};

		$scope.setClasses = function(color, test, affectText){
			if(color) {
				var classes = [];
				if(affectText) {
					var text = colors.brightness(color) < 155 ? 'fg-light' : 'fg-dark';
					classes.push(text);
				}

				if(color === test) {
						classes.push('current');
				}

				return classes.join(' ');
			}
		};

		$scope.loadColor = function(color){
				window.location.hash = color; //.toLowerCase().replace('#', '#/');
		};

		var _updateColorByDeg = function(l, d, n){
			var m = n/2;
			var i = l - Math.floor(Math.abs(d - m)/n);
			var k = l - i;
			k = (k < 0 ? 0 : (k > l ? l : k));
			c = $scope.shades[k];
			$scope.tuner = {
				r: colors.red(c),
				g: colors.green(c),
				b: colors.blue(c),
				hex: c,
				brightness: colors.brightness(c)
			};
			$scope.color = c;
			return k;
		};

		var dial = $angular.element(window.document.querySelector('.canvas'));
		var ring = $angular.element(window.document.querySelector('.color-ring'));

		var input, l, n, k, c;
		var d, deg = 0, lastDeg = 0, pointerDeg, relativeDeg, rotationDeg;
		var hammerDial = new Hammer(dial[0], {});
		hammerDial.get('pan').set({
			direction: Hammer.DIRECTION_ALL,
			threshold: 0
		});
		hammerDial
		.on('panstart', function(e) {
			l = $scope.shades.length-1;
			n = 360/l;
			input = e.srcEvent && e.srcEvent.changedTouches ? e.srcEvent.changedTouches : e.pointers;
			deg = -ui.getDegrees(input[0], dial[0]);
			lastDeg = $scope.ringDeg;
		})
		.on('pan panmove', function(e) {
			input = e.srcEvent && e.srcEvent.changedTouches ? e.srcEvent.changedTouches : e.pointers;
			pointerDeg = -ui.getDegrees(input[0], dial[0]);
			relativeDeg = pointerDeg - deg;
			rotationDeg = lastDeg + relativeDeg;
			if(isNaN(rotationDeg)) {rotationDeg = lastDeg;}
			if(rotationDeg < 0) {rotationDeg = ui.maxDegrees - Math.abs(rotationDeg);}
			if(rotationDeg >= ui.maxDegrees) {rotationDeg = rotationDeg - ui.maxDegrees;}
			deg = pointerDeg;
			ring.css({
				transform: 'rotate(-'+ rotationDeg +'deg) translateZ(0)',
				transitionDuration: '0s'
			});
			k = _updateColorByDeg(l, rotationDeg, n);
			lastDeg = rotationDeg;
			$scope.$apply();
		})
		.on('panend pancancel', function() {
			d = n*(k+1);
			$scope.ringDeg = d;
			ring.css({
				transitionDuration: ''
			});
			$scope.$apply();
		});


		var hotkey = function(e){
			if(e.which === 32){ // spacebar
					doIt();
			}
		};

		$document.on('keyup', hotkey);
		// remove the listener on the document when this directive's scope is destroyed. Else LEAK!
		$scope.$on('$destroy', function() {
				$document.off('keyup', hotkey);
		});

		$scope.$watch('hash', function (color) {
			doIt(color);
		}, true);

		$scope.$watch('tuner', function(n, o){
			if(n && n !== o) {
				n.hex = colors.rgbObjToHex(n, true);
				n.brightness = colors.brightness(n.hex);
				return n.hex;
			}
		}, true);

		$scope.$watch('colorSteps', function (n, o) {
			if(n && n !== o) {
				doIt($scope.color);
			}
		});
		
	}])
	.directive('tap', [function() {
		return function(scope, element, attr) {
			var hammerTap = new Hammer(element[0], {});
			hammerTap.on('tap', function() {
				scope.$apply(function() {
					scope.$eval(attr.tap);
				});
			});
		};
	}])
	.factory('UiHelpers', [function(){
		var maxDegrees = 360;
		var maxRadians = 6.283185307179586;
		// helpers
		var _getNumbers = function(target){
			var numbers = {};
			if(target) {
				numbers = {
					t: target.offsetTop,
					r: target.offsetLeft + target.offsetWidth,
					b: target.offsetTop + target.offsetHeight,
					l: target.offsetLeft,
					w: target.offsetWidth,
					h: target.offsetHeight,
				};
				// find x|y center
				numbers.cx = (numbers.l + (numbers.w/2));
				numbers.cy = (numbers.t + (numbers.h/2));
			}
			return numbers;
		};

		var _getRadians = function(input, el){
			var metrics = _getNumbers(el);
			var radians = Math.atan2((input.clientY - metrics.cy), (input.clientX - metrics.cx));
			radians += maxRadians/4;
			if(radians < 0) {
				radians += maxRadians;
			}
			return radians;
		};

		var _getDegrees = function(input, el){
			var radians = _getRadians(input, el);
			var degree = radians * 180/Math.PI;
			return degree;
		};

		return {
			maxRadians: maxRadians,
			maxDegrees: maxDegrees,
			getNumbers: _getNumbers,
			getRadians: _getRadians,
			getDegrees: _getDegrees
		};
	}])
	.factory('ColorService', [function(){

    var _hexChars = '0123456789ABCDEF';
    /*
     Use a singleton cache of all color strings we see.
     Each key points to a structure, which can have hex, rgb, etc. values in it.
     */
    var _immutableCache = {};

    // returns (or creates) the cached color structure
    var _cache = function(c) {
        if (!_immutableCache[c]) {
            _immutableCache[c] = {};
        }
        return _immutableCache[c];
    };

    var _h2rgb = function(v1, v2, vH) {
      if (vH < 0) {
        vH += 1;
      }
      if (vH > 1) {
        vH -= 1;
      }
      if (( 6 * vH ) < 1) {
        return ( v1 + ( v2 - v1 ) * 6 * vH );
      }
      if (( 2 * vH ) < 1) {
        return ( v2 );
      }
      if (( 3 * vH ) < 2) {
        return ( v1 + ( v2 - v1 ) * ( ( 2 / 3 ) - vH ) * 6 );
      }

      return ( v1 );
    };

    var rgbObjToHex = function(colorObj, useHash){
      /*jslint bitwise: true */
      var c = colorObj.b | (colorObj.g << 8) | (colorObj.r << 16) | (1 << 24);
      /*jslint bitwise: false */
      return (useHash ? '#':'') + c.toString(16).substring(1,8);
    };

    var toHex = function(color) {
      var colorObj = _cache(color);
      if (colorObj.hex) {
        return colorObj.hex;
      }

      if (color.substr(0, 1) === '#' && color.length === 7) {
        colorObj.hex = '' + color;
      } else if (color.substr(0, 1) === '#' && color.length === 4) {
        colorObj.hex = '#' +
            color.substr(1, 1) + color.substr(1, 1) +
            color.substr(2, 1) + color.substr(2, 1) +
            color.substr(3, 1) + color.substr(3, 1);
      }

      return colorObj.hex;
    };

    var toRGB = function(color) {
      var colorObj = _cache(color);
      if (colorObj.rgb) {
        return colorObj.rgb;
      }
      var h = toHex(color);

      colorObj.rgb = [
        parseInt(h.substr(1, 2), 16),
        parseInt(h.substr(3, 2), 16),
        parseInt(h.substr(5, 2), 16)
      ];

      return colorObj.rgb;
    };

    var red = function(color) {
        return toRGB(color)[0];
    };
    var green = function(color) {
        return toRGB(color)[1];
    };
    var blue = function(color) {
        return toRGB(color)[2];
    };

    var toHSL = function(color) {
      var r = red(color) / 255,
          g = green(color) / 255,
          b = blue(color) / 255;

      var max = Math.max(r, g, b),
          min = Math.min(r, g, b);

      var d = max - min; // Delta RGB value

      var h,
          s,
          l = (max + min) / 2;

      if (d === 0) {
        // gray?, no chroma...
        h = 0;
        s = 0;
      } else {
        // Chromatic data...
        s = d / ( l < 0.5 ? ( max + min ) : ( 2 - max - min ));

        var delR = ( ( ( max - r ) / 6 ) + ( d / 2 ) ) / d;
        var delG = ( ( ( max - g ) / 6 ) + ( d / 2 ) ) / d;
        var delB = ( ( ( max - b ) / 6 ) + ( d / 2 ) ) / d;

        if (r === max) {
            h = delB - delG;
        } else if (g === max) {
            h = ( 1 / 3 ) + delR - delB;
        } else if (b === max) {
            h = ( 2 / 3 ) + delG - delR;
        }

        if (h < 0) {
            h += 1;
        }
        if (h > 0) {
            h -= 1;
        }
      }

      h = Math.round(h * 360);
      if (h < 0) {
        h += 360;
      }

      var colorObj = _cache(color);

      colorObj.hsl = [h, Math.round(s * 100), Math.round(l * 100)];

      return colorObj.hsl;
    };

    var hslToRGB = function(h, s, l) {
      // HSL 0 to 1; RGB results from 0 to 255
      var r,g,b;

      if (s === 0) {
        r = l * 255;
        g = l * 255;
        b = l * 255;
      } else {
        var v2 = (l < 0.5) ? l * ( 1 + s ) : (( l + s ) - ( s * l ));
        var v1 = 2 * l - v2;

        r = 255 * _h2rgb(v1, v2, h + ( 1 / 3 ));
        g = 255 * _h2rgb(v1, v2, h);
        b = 255 * _h2rgb(v1, v2, h - ( 1 / 3 ));
      }
      return [r,g,b];
    };

    var _hex2 = function(n) {
      var h = Math.round(n).toString(16);
      if (h.length === 1) {
        h = '0' + h;
      }
      return h.substr(0, 1) + h.substr(1, 1);
    };

    var hslToHex = function(h, s, l) {
      if (Array.isArray(h)) {
        h = h[0] || 0;
        l = h[2] || 0;
        s = h[1] || 0;
      }

      // HSL from 0 to 1
      h = ((h + 360) % 360.0) / 360;
      s = s / 100.0;
      l = l / 100.0;

      var rgb = hslToRGB(h, s, l);
      return '#' + _hex2(rgb[0]) + _hex2(rgb[1]) + _hex2(rgb[2]);
    };

    var lighten = function(color, percent) {
      var hsl = toHSL(color);
      var h = hsl[0],
          s = hsl[1],
          l = Math.min(100, hsl[2] + percent);

      return hslToHex(h, s, l);
    };

    var darken = function(color, percent) {
      var hsl = toHSL(color);
      var h = hsl[0],
          s = hsl[1],
          l = Math.max(0, hsl[2] - percent);

      return hslToHex(h, s, l);
    };

    var saturate = function(color, percent) {
      var hsl = toHSL(color);
      var h = hsl[0],
          s = Math.min(100, Math.max(0, hsl[1] + percent)),
          l = hsl[2];

      return hslToHex(h, s, l);
    };

    var brightness = function(color){
      var r, g, b, brightness;

      if (color.match(/^rgb/)) {
        color = color.match(/rgb\(([^)]+)\)/)[1];
        color = color.split(/ *, */).map(Number);
        r = color[0];
        g = color[1];
        b = color[2];
      } else if ('#' === color[0] && 7 === color.length) {
        r = parseInt(color.slice(1, 3), 16);
        g = parseInt(color.slice(3, 5), 16);
        b = parseInt(color.slice(5, 7), 16);
      } else if ('#' === color[0] && 4 === color.length) {
        r = parseInt(color[1] + color[1], 16);
        g = parseInt(color[2] + color[2], 16);
        b = parseInt(color[3] + color[3], 16);
      }

      brightness = (r * 299 + g * 587 + b * 114) / 1000;

      return brightness;
    };

    var randomHex = function() {
      var hex = '#';
      for (var i = 0; i < 6; i++ ) {
        hex += _hexChars.charAt(Math.floor(Math.random() * _hexChars.length));
      }
      return hex;
    };

    return {
      rgbObjToHex: rgbObjToHex,
      toHex: toHex,
      toRGB: toRGB,
      toHSL: toHSL,
      hslToHex: hslToHex,
      hslToRGB: hslToRGB,
      red: red,
      green: green,
      blue: blue,
      lighten: lighten,
      darken: darken,
      saturate: saturate,
      brightness: brightness,
      randomHex: randomHex
    };

  }]);

})(window.angular, window._, window.Hammer);