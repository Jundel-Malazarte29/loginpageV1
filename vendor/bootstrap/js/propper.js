(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global.Popper = factory());
}(this, (function() {
    'use strict';
    var nativeHints = ['native code', '[object MutationObserverConstructor]'];
    var isNative = (function(fn) {
        return nativeHints.some(function(hint) {
            return (fn || '').toString().indexOf(hint) > -1;
        });
    }
    );
    var isBrowser = typeof window !== 'undefined';
    var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
    var timeoutDuration = 0;
    for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
        if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
            timeoutDuration = 1;
            break;
        }
    }
    function microtaskDebounce(fn) {
        var scheduled = false;
        var i = 0;
        var elem = document.createElement('span');
        var observer = new MutationObserver(function() {
            fn();
            scheduled = false;
        }
        );
        observer.observe(elem, {
            attributes: true
        });
        return function() {
            if (!scheduled) {
                scheduled = true;
                elem.setAttribute('x-index', i);
                i = i + 1;
            }
        }
        ;
    }
    function taskDebounce(fn) {
        var scheduled = false;
        return function() {
            if (!scheduled) {
                scheduled = true;
                setTimeout(function() {
                    scheduled = false;
                    fn();
                }, timeoutDuration);
            }
        }
        ;
    }
    var supportsNativeMutationObserver = isBrowser && isNative(window.MutationObserver);
    var debounce = supportsNativeMutationObserver ? microtaskDebounce : taskDebounce;
    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }
    function getStyleComputedProperty(element, property) {
        if (element.nodeType !== 1) {
            return [];
        }
        var css = window.getComputedStyle(element, null);
        return property ? css[property] : css;
    }
    function getParentNode(element) {
        if (element.nodeName === 'HTML') {
            return element;
        }
        return element.parentNode || element.host;
    }
    function getScrollParent(element) {
        if (!element || ['HTML', 'BODY', '#document'].indexOf(element.nodeName) !== -1) {
            return window.document.body;
        }
        var _getStyleComputedProp = getStyleComputedProperty(element)
          , overflow = _getStyleComputedProp.overflow
          , overflowX = _getStyleComputedProp.overflowX
          , overflowY = _getStyleComputedProp.overflowY;
        if (/(auto|scroll)/.test(overflow + overflowY + overflowX)) {
            return element;
        }
        return getScrollParent(getParentNode(element));
    }
    function getOffsetParent(element) {
        var offsetParent = element && element.offsetParent;
        var nodeName = offsetParent && offsetParent.nodeName;
        if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
            return window.document.documentElement;
        }
        if (['TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
            return getOffsetParent(offsetParent);
        }
        return offsetParent;
    }
    function isOffsetContainer(element) {
        var nodeName = element.nodeName;
        if (nodeName === 'BODY') {
            return false;
        }
        return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
    }
    function getRoot(node) {
        if (node.parentNode !== null) {
            return getRoot(node.parentNode);
        }
        return node;
    }
    function findCommonOffsetParent(element1, element2) {
        if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
            return window.document.documentElement;
        }
        var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
        var start = order ? element1 : element2;
        var end = order ? element2 : element1;
        var range = document.createRange();
        range.setStart(start, 0);
        range.setEnd(end, 0);
        var commonAncestorContainer = range.commonAncestorContainer;
        if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
            if (isOffsetContainer(commonAncestorContainer)) {
                return commonAncestorContainer;
            }
            return getOffsetParent(commonAncestorContainer);
        }
        var element1root = getRoot(element1);
        if (element1root.host) {
            return findCommonOffsetParent(element1root.host, element2);
        } else {
            return findCommonOffsetParent(element1, getRoot(element2).host);
        }
    }
    function getScroll(element) {
        var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';
        var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
        var nodeName = element.nodeName;
        if (nodeName === 'BODY' || nodeName === 'HTML') {
            var html = window.document.documentElement;
            var scrollingElement = window.document.scrollingElement || html;
            return scrollingElement[upperSide];
        }
        return element[upperSide];
    }
    function includeScroll(rect, element) {
        var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var scrollTop = getScroll(element, 'top');
        var scrollLeft = getScroll(element, 'left');
        var modifier = subtract ? -1 : 1;
        rect.top += scrollTop * modifier;
        rect.bottom += scrollTop * modifier;
        rect.left += scrollLeft * modifier;
        rect.right += scrollLeft * modifier;
        return rect;
    }
    function getBordersSize(styles, axis) {
        var sideA = axis === 'x' ? 'Left' : 'Top';
        var sideB = sideA === 'Left' ? 'Right' : 'Bottom';
        return +styles['border' + sideA + 'Width'].split('px')[0] + +styles['border' + sideB + 'Width'].split('px')[0];
    }
    var isIE10 = undefined;
    var isIE10$1 = function() {
        if (isIE10 === undefined) {
            isIE10 = navigator.appVersion.indexOf('MSIE 10') !== -1;
        }
        return isIE10;
    };
    function getSize(axis, body, html, computedStyle) {
        return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE10$1() ? html['offset' + axis] + computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')] + computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')] : 0);
    }
    function getWindowSizes() {
        var body = window.document.body;
        var html = window.document.documentElement;
        var computedStyle = isIE10$1() && window.getComputedStyle(html);
        return {
            height: getSize('Height', body, html, computedStyle),
            width: getSize('Width', body, html, computedStyle)
        };
    }
    var classCallCheck = function(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    };
    var createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value"in descriptor)
                    descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            if (protoProps)
                defineProperties(Constructor.prototype, protoProps);
            if (staticProps)
                defineProperties(Constructor, staticProps);
            return Constructor;
        }
        ;
    }();
    var defineProperty = function(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }
        return obj;
    };
    var _extends = Object.assign || function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }
    ;
    function getClientRect(offsets) {
        return _extends({}, offsets, {
            right: offsets.left + offsets.width,
            bottom: offsets.top + offsets.height
        });
    }
    function getBoundingClientRect(element) {
        var rect = {};
        if (isIE10$1()) {
            try {
                rect = element.getBoundingClientRect();
                var scrollTop = getScroll(element, 'top');
                var scrollLeft = getScroll(element, 'left');
                rect.top += scrollTop;
                rect.left += scrollLeft;
                rect.bottom += scrollTop;
                rect.right += scrollLeft;
            } catch (err) {}
        } else {
            rect = element.getBoundingClientRect();
        }
        var result = {
            left: rect.left,
            top: rect.top,
            width: rect.right - rect.left,
            height: rect.bottom - rect.top
        };
        var sizes = element.nodeName === 'HTML' ? getWindowSizes() : {};
        var width = sizes.width || element.clientWidth || result.right - result.left;
        var height = sizes.height || element.clientHeight || result.bottom - result.top;
        var horizScrollbar = element.offsetWidth - width;
        var vertScrollbar = element.offsetHeight - height;
        if (horizScrollbar || vertScrollbar) {
            var styles = getStyleComputedProperty(element);
            horizScrollbar -= getBordersSize(styles, 'x');
            vertScrollbar -= getBordersSize(styles, 'y');
            result.width -= horizScrollbar;
            result.height -= vertScrollbar;
        }
        return getClientRect(result);
    }
    function getOffsetRectRelativeToArbitraryNode(children, parent) {
        var isIE10 = isIE10$1();
        var isHTML = parent.nodeName === 'HTML';
        var childrenRect = getBoundingClientRect(children);
        var parentRect = getBoundingClientRect(parent);
        var scrollParent = getScrollParent(children);
        var styles = getStyleComputedProperty(parent);
        var borderTopWidth = +styles.borderTopWidth.split('px')[0];
        var borderLeftWidth = +styles.borderLeftWidth.split('px')[0];
        var offsets = getClientRect({
            top: childrenRect.top - parentRect.top - borderTopWidth,
            left: childrenRect.left - parentRect.left - borderLeftWidth,
            width: childrenRect.width,
            height: childrenRect.height
        });
        offsets.marginTop = 0;
        offsets.marginLeft = 0;
        if (!isIE10 && isHTML) {
            var marginTop = +styles.marginTop.split('px')[0];
            var marginLeft = +styles.marginLeft.split('px')[0];
            offsets.top -= borderTopWidth - marginTop;
            offsets.bottom -= borderTopWidth - marginTop;
            offsets.left -= borderLeftWidth - marginLeft;
            offsets.right -= borderLeftWidth - marginLeft;
            offsets.marginTop = marginTop;
            offsets.marginLeft = marginLeft;
        }
        if (isIE10 ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
            offsets = includeScroll(offsets, parent);
        }
        return offsets;
    }
    function getViewportOffsetRectRelativeToArtbitraryNode(element) {
        var html = window.document.documentElement;
        var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
        var width = Math.max(html.clientWidth, window.innerWidth || 0);
        var height = Math.max(html.clientHeight, window.innerHeight || 0);
        var scrollTop = getScroll(html);
        var scrollLeft = getScroll(html, 'left');
        var offset = {
            top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
            left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
            width: width,
            height: height
        };
        return getClientRect(offset);
    }
    function isFixed(element) {
        var nodeName = element.nodeName;
        if (nodeName === 'BODY' || nodeName === 'HTML') {
            return false;
        }
        if (getStyleComputedProperty(element, 'position') === 'fixed') {
            return true;
        }
        return isFixed(getParentNode(element));
    }
    function getBoundaries(popper, reference, padding, boundariesElement) {
        var boundaries = {
            top: 0,
            left: 0
        };
        var offsetParent = findCommonOffsetParent(popper, reference);
        if (boundariesElement === 'viewport') {
            boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent);
        } else {
            var boundariesNode = void 0;
            if (boundariesElement === 'scrollParent') {
                boundariesNode = getScrollParent(getParentNode(popper));
                if (boundariesNode.nodeName === 'BODY') {
                    boundariesNode = window.document.documentElement;
                }
            } else if (boundariesElement === 'window') {
                boundariesNode = window.document.documentElement;
            } else {
                boundariesNode = boundariesElement;
            }
            var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent);
            if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
                var _getWindowSizes = getWindowSizes()
                  , height = _getWindowSizes.height
                  , width = _getWindowSizes.width;
                boundaries.top += offsets.top - offsets.marginTop;
                boundaries.bottom = height + offsets.top;
                boundaries.left += offsets.left - offsets.marginLeft;
                boundaries.right = width + offsets.left;
            } else {
                boundaries = offsets;
            }
        }
        boundaries.left += padding;
        boundaries.top += padding;
        boundaries.right -= padding;
        boundaries.bottom -= padding;
        return boundaries;
    }
    function getArea(_ref) {
        var width = _ref.width
          , height = _ref.height;
        return width * height;
    }
    function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
        var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
        if (placement.indexOf('auto') === -1) {
            return placement;
        }
        var boundaries = getBoundaries(popper, reference, padding, boundariesElement);
        var rects = {
            top: {
                width: boundaries.width,
                height: refRect.top - boundaries.top
            },
            right: {
                width: boundaries.right - refRect.right,
                height: boundaries.height
            },
            bottom: {
                width: boundaries.width,
                height: boundaries.bottom - refRect.bottom
            },
            left: {
                width: refRect.left - boundaries.left,
                height: boundaries.height
            }
        };
        var sortedAreas = Object.keys(rects).map(function(key) {
            return _extends({
                key: key
            }, rects[key], {
                area: getArea(rects[key])
            });
        }).sort(function(a, b) {
            return b.area - a.area;
        });
        var filteredAreas = sortedAreas.filter(function(_ref2) {
            var width = _ref2.width
              , height = _ref2.height;
            return width >= popper.clientWidth && height >= popper.clientHeight;
        });
        var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;
        var variation = placement.split('-')[1];
        return computedPlacement + (variation ? '-' + variation : '');
    }
    function getReferenceOffsets(state, popper, reference) {
        var commonOffsetParent = findCommonOffsetParent(popper, reference);
        return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent);
    }
    function getOuterSizes(element) {
        var styles = window.getComputedStyle(element);
        var x = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
        var y = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
        var result = {
            width: element.offsetWidth + y,
            height: element.offsetHeight + x
        };
        return result;
    }
    function getOppositePlacement(placement) {
        var hash = {
            left: 'right',
            right: 'left',
            bottom: 'top',
            top: 'bottom'
        };
        return placement.replace(/left|right|bottom|top/g, function(matched) {
            return hash[matched];
        });
    }
    function getPopperOffsets(popper, referenceOffsets, placement) {
        placement = placement.split('-')[0];
        var popperRect = getOuterSizes(popper);
        var popperOffsets = {
            width: popperRect.width,
            height: popperRect.height
        };
        var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
        var mainSide = isHoriz ? 'top' : 'left';
        var secondarySide = isHoriz ? 'left' : 'top';
        var measurement = isHoriz ? 'height' : 'width';
        var secondaryMeasurement = !isHoriz ? 'height' : 'width';
        popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
        if (placement === secondarySide) {
            popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
        } else {
            popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
        }
        return popperOffsets;
    }
    function find(arr, check) {
        if (Array.prototype.find) {
            return arr.find(check);
        }
        return arr.filter(check)[0];
    }
    function findIndex(arr, prop, value) {
        if (Array.prototype.findIndex) {
            return arr.findIndex(function(cur) {
                return cur[prop] === value;
            });
        }
        var match = find(arr, function(obj) {
            return obj[prop] === value;
        });
        return arr.indexOf(match);
    }
    function runModifiers(modifiers, data, ends) {
        var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));
        modifiersToRun.forEach(function(modifier) {
            if (modifier.function) {
                console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
            }
            var fn = modifier.function || modifier.fn;
            if (modifier.enabled && isFunction(fn)) {
                data.offsets.popper = getClientRect(data.offsets.popper);
                data.offsets.reference = getClientRect(data.offsets.reference);
                data = fn(data, modifier);
            }
        });
        return data;
    }
    function update() {
        if (this.state.isDestroyed) {
            return;
        }
        var data = {
            instance: this,
            styles: {},
            arrowStyles: {},
            attributes: {},
            flipped: false,
            offsets: {}
        };
        data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference);
        data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);
        data.originalPlacement = data.placement;
        data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);
        data.offsets.popper.position = 'absolute';
        data = runModifiers(this.modifiers, data);
        if (!this.state.isCreated) {
            this.state.isCreated = true;
            this.options.onCreate(data);
        } else {
            this.options.onUpdate(data);
        }
    }
    function isModifierEnabled(modifiers, modifierName) {
        return modifiers.some(function(_ref) {
            var name = _ref.name
              , enabled = _ref.enabled;
            return enabled && name === modifierName;
        });
    }
    function getSupportedPropertyName(property) {
        var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
        var upperProp = property.charAt(0).toUpperCase() + property.slice(1);
        for (var i = 0; i < prefixes.length - 1; i++) {
            var prefix = prefixes[i];
            var toCheck = prefix ? '' + prefix + upperProp : property;
            if (typeof window.document.body.style[toCheck] !== 'undefined') {
                return toCheck;
            }
        }
        return null;
    }
    function destroy() {
        this.state.isDestroyed = true;
        if (isModifierEnabled(this.modifiers, 'applyStyle')) {
            this.popper.removeAttribute('x-placement');
            this.popper.style.left = '';
            this.popper.style.position = '';
            this.popper.style.top = '';
            this.popper.style[getSupportedPropertyName('transform')] = '';
        }
        this.disableEventListeners();
        if (this.options.removeOnDestroy) {
            this.popper.parentNode.removeChild(this.popper);
        }
        return this;
    }
    function attachToScrollParents(scrollParent, event, callback, scrollParents) {
        var isBody = scrollParent.nodeName === 'BODY';
        var target = isBody ? window : scrollParent;
        target.addEventListener(event, callback, {
            passive: true
        });
        if (!isBody) {
            attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
        }
        scrollParents.push(target);
    }
    function setupEventListeners(reference, options, state, updateBound) {
        state.updateBound = updateBound;
        window.addEventListener('resize', state.updateBound, {
            passive: true
        });
        var scrollElement = getScrollParent(reference);
        attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
        state.scrollElement = scrollElement;
        state.eventsEnabled = true;
        return state;
    }
    function enableEventListeners() {
        if (!this.state.eventsEnabled) {
            this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
        }
    }
    function removeEventListeners(reference, state) {
        window.removeEventListener('resize', state.updateBound);
        state.scrollParents.forEach(function(target) {
            target.removeEventListener('scroll', state.updateBound);
        });
        state.updateBound = null;
        state.scrollParents = [];
        state.scrollElement = null;
        state.eventsEnabled = false;
        return state;
    }
    function disableEventListeners() {
        if (this.state.eventsEnabled) {
            window.cancelAnimationFrame(this.scheduleUpdate);
            this.state = removeEventListeners(this.reference, this.state);
        }
    }
    function isNumeric(n) {
        return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
    }
    function setStyles(element, styles) {
        Object.keys(styles).forEach(function(prop) {
            var unit = '';
            if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
                unit = 'px';
            }
            element.style[prop] = styles[prop] + unit;
        });
    }
    function setAttributes(element, attributes) {
        Object.keys(attributes).forEach(function(prop) {
            var value = attributes[prop];
            if (value !== false) {
                element.setAttribute(prop, attributes[prop]);
            } else {
                element.removeAttribute(prop);
            }
        });
    }
    function applyStyle(data) {
        setStyles(data.instance.popper, data.styles);
        setAttributes(data.instance.popper, data.attributes);
        if (data.arrowElement && Object.keys(data.arrowStyles).length) {
            setStyles(data.arrowElement, data.arrowStyles);
        }
        return data;
    }
    function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
        var referenceOffsets = getReferenceOffsets(state, popper, reference);
        var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);
        popper.setAttribute('x-placement', placement);
        setStyles(popper, {
            position: 'absolute'
        });
        return options;
    }
    function computeStyle(data, options) {
        var x = options.x
          , y = options.y;
        var popper = data.offsets.popper;
        var legacyGpuAccelerationOption = find(data.instance.modifiers, function(modifier) {
            return modifier.name === 'applyStyle';
        }).gpuAcceleration;
        if (legacyGpuAccelerationOption !== undefined) {
            console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
        }
        var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;
        var offsetParent = getOffsetParent(data.instance.popper);
        var offsetParentRect = getBoundingClientRect(offsetParent);
        var styles = {
            position: popper.position
        };
        var offsets = {
            left: Math.floor(popper.left),
            top: Math.floor(popper.top),
            bottom: Math.floor(popper.bottom),
            right: Math.floor(popper.right)
        };
        var sideA = x === 'bottom' ? 'top' : 'bottom';
        var sideB = y === 'right' ? 'left' : 'right';
        var prefixedProperty = getSupportedPropertyName('transform');
        var left = void 0
          , top = void 0;
        if (sideA === 'bottom') {
            top = -offsetParentRect.height + offsets.bottom;
        } else {
            top = offsets.top;
        }
        if (sideB === 'right') {
            left = -offsetParentRect.width + offsets.right;
        } else {
            left = offsets.left;
        }
        if (gpuAcceleration && prefixedProperty) {
            styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
            styles[sideA] = 0;
            styles[sideB] = 0;
            styles.willChange = 'transform';
        } else {
            var invertTop = sideA === 'bottom' ? -1 : 1;
            var invertLeft = sideB === 'right' ? -1 : 1;
            styles[sideA] = top * invertTop;
            styles[sideB] = left * invertLeft;
            styles.willChange = sideA + ', ' + sideB;
        }
        var attributes = {
            'x-placement': data.placement
        };
        data.attributes = _extends({}, attributes, data.attributes);
        data.styles = _extends({}, styles, data.styles);
        data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);
        return data;
    }
    function isModifierRequired(modifiers, requestingName, requestedName) {
        var requesting = find(modifiers, function(_ref) {
            var name = _ref.name;
            return name === requestingName;
        });
        var isRequired = !!requesting && modifiers.some(function(modifier) {
            return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
        });
        if (!isRequired) {
            var _requesting = '`' + requestingName + '`';
            var requested = '`' + requestedName + '`';
            console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
        }
        return isRequired;
    }
    function arrow(data, options) {
        if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
            return data;
        }
        var arrowElement = options.element;
        if (typeof arrowElement === 'string') {
            arrowElement = data.instance.popper.querySelector(arrowElement);
            if (!arrowElement) {
                return data;
            }
        } else {
            if (!data.instance.popper.contains(arrowElement)) {
                console.warn('WARNING: `arrow.element` must be child of its popper element!');
                return data;
            }
        }
        var placement = data.placement.split('-')[0];
        var _data$offsets = data.offsets
          , popper = _data$offsets.popper
          , reference = _data$offsets.reference;
        var isVertical = ['left', 'right'].indexOf(placement) !== -1;
        var len = isVertical ? 'height' : 'width';
        var sideCapitalized = isVertical ? 'Top' : 'Left';
        var side = sideCapitalized.toLowerCase();
        var altSide = isVertical ? 'left' : 'top';
        var opSide = isVertical ? 'bottom' : 'right';
        var arrowElementSize = getOuterSizes(arrowElement)[len];
        if (reference[opSide] - arrowElementSize < popper[side]) {
            data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
        }
        if (reference[side] + arrowElementSize > popper[opSide]) {
            data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
        }
        var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;
        var popperMarginSide = getStyleComputedProperty(data.instance.popper, 'margin' + sideCapitalized).replace('px', '');
        var sideValue = center - getClientRect(data.offsets.popper)[side] - popperMarginSide;
        sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);
        data.arrowElement = arrowElement;
        data.offsets.arrow = {};
        data.offsets.arrow[side] = Math.round(sideValue);
        data.offsets.arrow[altSide] = '';
        return data;
    }
    function getOppositeVariation(variation) {
        if (variation === 'end') {
            return 'start';
        } else if (variation === 'start') {
            return 'end';
        }
        return variation;
    }
    var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];
    var validPlacements = placements.slice(3);
    function clockwise(placement) {
        var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        var index = validPlacements.indexOf(placement);
        var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
        return counter ? arr.reverse() : arr;
    }
    var BEHAVIORS = {
        FLIP: 'flip',
        CLOCKWISE: 'clockwise',
        COUNTERCLOCKWISE: 'counterclockwise'
    };
    function flip(data, options) {
        if (isModifierEnabled(data.instance.modifiers, 'inner')) {
            return data;
        }
        if (data.flipped && data.placement === data.originalPlacement) {
            return data;
        }
        var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement);
        var placement = data.placement.split('-')[0];
        var placementOpposite = getOppositePlacement(placement);
        var variation = data.placement.split('-')[1] || '';
        var flipOrder = [];
        switch (options.behavior) {
        case BEHAVIORS.FLIP:
            flipOrder = [placement, placementOpposite];
            break;
        case BEHAVIORS.CLOCKWISE:
            flipOrder = clockwise(placement);
            break;
        case BEHAVIORS.COUNTERCLOCKWISE:
            flipOrder = clockwise(placement, true);
            break;
        default:
            flipOrder = options.behavior;
        }
        flipOrder.forEach(function(step, index) {
            if (placement !== step || flipOrder.length === index + 1) {
                return data;
            }
            placement = data.placement.split('-')[0];
            placementOpposite = getOppositePlacement(placement);
            var popperOffsets = data.offsets.popper;
            var refOffsets = data.offsets.reference;
            var floor = Math.floor;
            var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);
            var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
            var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
            var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
            var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);
            var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;
            var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
            var flippedVariation = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);
            if (overlapsRef || overflowsBoundaries || flippedVariation) {
                data.flipped = true;
                if (overlapsRef || overflowsBoundaries) {
                    placement = flipOrder[index + 1];
                }
                if (flippedVariation) {
                    variation = getOppositeVariation(variation);
                }
                data.placement = placement + (variation ? '-' + variation : '');
                data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));
                data = runModifiers(data.instance.modifiers, data, 'flip');
            }
        });
        return data;
    }
    function keepTogether(data) {
        var _data$offsets = data.offsets
          , popper = _data$offsets.popper
          , reference = _data$offsets.reference;
        var placement = data.placement.split('-')[0];
        var floor = Math.floor;
        var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
        var side = isVertical ? 'right' : 'bottom';
        var opSide = isVertical ? 'left' : 'top';
        var measurement = isVertical ? 'width' : 'height';
        if (popper[side] < floor(reference[opSide])) {
            data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
        }
        if (popper[opSide] > floor(reference[side])) {
            data.offsets.popper[opSide] = floor(reference[side]);
        }
        return data;
    }
    function toValue(str, measurement, popperOffsets, referenceOffsets) {
        var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
        var value = +split[1];
        var unit = split[2];
        if (!value) {
            return str;
        }
        if (unit.indexOf('%') === 0) {
            var element = void 0;
            switch (unit) {
            case '%p':
                element = popperOffsets;
                break;
            case '%':
            case '%r':
            default:
                element = referenceOffsets;
            }
            var rect = getClientRect(element);
            return rect[measurement] / 100 * value;
        } else if (unit === 'vh' || unit === 'vw') {
            var size = void 0;
            if (unit === 'vh') {
                size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            } else {
                size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            }
            return size / 100 * value;
        } else {
            return value;
        }
    }
    function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
        var offsets = [0, 0];
        var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;
        var fragments = offset.split(/(\+|\-)/).map(function(frag) {
            return frag.trim();
        });
        var divider = fragments.indexOf(find(fragments, function(frag) {
            return frag.search(/,|\s/) !== -1;
        }));
        if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
            console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
        }
        var splitRegex = /\s*,\s*|\s+/;
        var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];
        ops = ops.map(function(op, index) {
            var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
            var mergeWithPrevious = false;
            return op.reduce(function(a, b) {
                if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
                    a[a.length - 1] = b;
                    mergeWithPrevious = true;
                    return a;
                } else if (mergeWithPrevious) {
                    a[a.length - 1] += b;
                    mergeWithPrevious = false;
                    return a;
                } else {
                    return a.concat(b);
                }
            }, []).map(function(str) {
                return toValue(str, measurement, popperOffsets, referenceOffsets);
            });
        });
        ops.forEach(function(op, index) {
            op.forEach(function(frag, index2) {
                if (isNumeric(frag)) {
                    offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
                }
            });
        });
        return offsets;
    }
    function offset(data, _ref) {
        var offset = _ref.offset;
        var placement = data.placement
          , _data$offsets = data.offsets
          , popper = _data$offsets.popper
          , reference = _data$offsets.reference;
        var basePlacement = placement.split('-')[0];
        var offsets = void 0;
        if (isNumeric(+offset)) {
            offsets = [+offset, 0];
        } else {
            offsets = parseOffset(offset, popper, reference, basePlacement);
        }
        if (basePlacement === 'left') {
            popper.top += offsets[0];
            popper.left -= offsets[1];
        } else if (basePlacement === 'right') {
            popper.top += offsets[0];
            popper.left += offsets[1];
        } else if (basePlacement === 'top') {
            popper.left += offsets[0];
            popper.top -= offsets[1];
        } else if (basePlacement === 'bottom') {
            popper.left += offsets[0];
            popper.top += offsets[1];
        }
        data.popper = popper;
        return data;
    }
    function preventOverflow(data, options) {
        var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);
        if (data.instance.reference === boundariesElement) {
            boundariesElement = getOffsetParent(boundariesElement);
        }
        var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement);
        options.boundaries = boundaries;
        var order = options.priority;
        var popper = data.offsets.popper;
        var check = {
            primary: function primary(placement) {
                var value = popper[placement];
                if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
                    value = Math.max(popper[placement], boundaries[placement]);
                }
                return defineProperty({}, placement, value);
            },
            secondary: function secondary(placement) {
                var mainSide = placement === 'right' ? 'left' : 'top';
                var value = popper[mainSide];
                if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
                    value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
                }
                return defineProperty({}, mainSide, value);
            }
        };
        order.forEach(function(placement) {
            var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
            popper = _extends({}, popper, check[side](placement));
        });
        data.offsets.popper = popper;
        return data;
    }
    function shift(data) {
        var placement = data.placement;
        var basePlacement = placement.split('-')[0];
        var shiftvariation = placement.split('-')[1];
        if (shiftvariation) {
            var _data$offsets = data.offsets
              , reference = _data$offsets.reference
              , popper = _data$offsets.popper;
            var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
            var side = isVertical ? 'left' : 'top';
            var measurement = isVertical ? 'width' : 'height';
            var shiftOffsets = {
                start: defineProperty({}, side, reference[side]),
                end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
            };
            data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
        }
        return data;
    }
    function hide(data) {
        if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
            return data;
        }
        var refRect = data.offsets.reference;
        var bound = find(data.instance.modifiers, function(modifier) {
            return modifier.name === 'preventOverflow';
        }).boundaries;
        if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
            if (data.hide === true) {
                return data;
            }
            data.hide = true;
            data.attributes['x-out-of-boundaries'] = '';
        } else {
            if (data.hide === false) {
                return data;
            }
            data.hide = false;
            data.attributes['x-out-of-boundaries'] = false;
        }
        return data;
    }
    function inner(data) {
        var placement = data.placement;
        var basePlacement = placement.split('-')[0];
        var _data$offsets = data.offsets
          , popper = _data$offsets.popper
          , reference = _data$offsets.reference;
        var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;
        var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;
        popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);
        data.placement = getOppositePlacement(placement);
        data.offsets.popper = getClientRect(popper);
        return data;
    }
    var modifiers = {
        shift: {
            order: 100,
            enabled: true,
            fn: shift
        },
        offset: {
            order: 200,
            enabled: true,
            fn: offset,
            offset: 0
        },
        preventOverflow: {
            order: 300,
            enabled: true,
            fn: preventOverflow,
            priority: ['left', 'right', 'top', 'bottom'],
            padding: 5,
            boundariesElement: 'scrollParent'
        },
        keepTogether: {
            order: 400,
            enabled: true,
            fn: keepTogether
        },
        arrow: {
            order: 500,
            enabled: true,
            fn: arrow,
            element: '[x-arrow]'
        },
        flip: {
            order: 600,
            enabled: true,
            fn: flip,
            behavior: 'flip',
            padding: 5,
            boundariesElement: 'viewport'
        },
        inner: {
            order: 700,
            enabled: false,
            fn: inner
        },
        hide: {
            order: 800,
            enabled: true,
            fn: hide
        },
        computeStyle: {
            order: 850,
            enabled: true,
            fn: computeStyle,
            gpuAcceleration: true,
            x: 'bottom',
            y: 'right'
        },
        applyStyle: {
            order: 900,
            enabled: true,
            fn: applyStyle,
            onLoad: applyStyleOnLoad,
            gpuAcceleration: undefined
        }
    };
    var Defaults = {
        placement: 'bottom',
        eventsEnabled: true,
        removeOnDestroy: false,
        onCreate: function onCreate() {},
        onUpdate: function onUpdate() {},
        modifiers: modifiers
    };
    var Popper = function() {
        function Popper(reference, popper) {
            var _this = this;
            var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            classCallCheck(this, Popper);
            this.scheduleUpdate = function() {
                return requestAnimationFrame(_this.update);
            }
            ;
            this.update = debounce(this.update.bind(this));
            this.options = _extends({}, Popper.Defaults, options);
            this.state = {
                isDestroyed: false,
                isCreated: false,
                scrollParents: []
            };
            this.reference = reference.jquery ? reference[0] : reference;
            this.popper = popper.jquery ? popper[0] : popper;
            this.options.modifiers = {};
            Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function(name) {
                _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
            });
            this.modifiers = Object.keys(this.options.modifiers).map(function(name) {
                return _extends({
                    name: name
                }, _this.options.modifiers[name]);
            }).sort(function(a, b) {
                return a.order - b.order;
            });
            this.modifiers.forEach(function(modifierOptions) {
                if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
                    modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
                }
            });
            this.update();
            var eventsEnabled = this.options.eventsEnabled;
            if (eventsEnabled) {
                this.enableEventListeners();
            }
            this.state.eventsEnabled = eventsEnabled;
        }
        createClass(Popper, [{
            key: 'update',
            value: function update$$1() {
                return update.call(this);
            }
        }, {
            key: 'destroy',
            value: function destroy$$1() {
                return destroy.call(this);
            }
        }, {
            key: 'enableEventListeners',
            value: function enableEventListeners$$1() {
                return enableEventListeners.call(this);
            }
        }, {
            key: 'disableEventListeners',
            value: function disableEventListeners$$1() {
                return disableEventListeners.call(this);
            }
        }]);
        return Popper;
    }();
    Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
    Popper.placements = placements;
    Popper.Defaults = Defaults;
    return Popper;
}
)));
