'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var DEFAULT_NODE_SELECTOR = 'tr';
var DIRECTIONS = {
  TOP: 1,
  BOTTOM: 3
};
var UNIT_PX = 'px';
var DRAG_LIND_STYLE = 'position:fixed;z-index:9999;height:0;' + 'margin-top:-1px;border-bottom:dashed 2px red;display:none;';

var ReactDragListView = function (_Component) {
  (0, _inherits3['default'])(ReactDragListView, _Component);

  function ReactDragListView(props) {
    (0, _classCallCheck3['default'])(this, ReactDragListView);

    var _this = (0, _possibleConstructorReturn3['default'])(this, (ReactDragListView.__proto__ || Object.getPrototypeOf(ReactDragListView)).call(this, props));

    _this.onMouseDown = _this.onMouseDown.bind(_this);
    _this.onDragStart = _this.onDragStart.bind(_this);
    _this.onDragEnter = _this.onDragEnter.bind(_this);
    _this.onDragEnd = _this.onDragEnd.bind(_this);
    _this.autoScroll = _this.autoScroll.bind(_this);

    _this.state = {
      fromIndex: -1,
      toIndex: -1
    };

    _this.scrollElement = null;
    _this.scrollTimerId = -1;
    _this.direction = DIRECTIONS.BOTTOM;
    return _this;
  }

  (0, _createClass3['default'])(ReactDragListView, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.dragLine && this.dragLine.parentNode) {
        this.dragLine.parentNode.removeChild(this.dragLine);
        this.dragLine = null;
        this.cacheDragTarget = null;
      }
    }
  }, {
    key: 'onMouseDown',
    value: function onMouseDown(e) {
      var handle = this.getHandleNode(e.target);
      if (handle) {
        var target = !this.props.handleSelector || this.props.handleSelector === this.props.nodeSelector ? handle : this.getDragNode(handle);
        if (target) {
          handle.setAttribute('draggable', false);
          target.setAttribute('draggable', true);
          target.ondragstart = this.onDragStart;
          target.ondragend = this.onDragEnd;
        }
      }
    }
  }, {
    key: 'onDragStart',
    value: function onDragStart(e) {
      var target = this.getDragNode(e.target);
      var eventData = e;
      if (target) {
        var parentNode = target.parentNode;

        eventData.dataTransfer.setData('Text', '');
        eventData.dataTransfer.effectAllowed = 'move';
        parentNode.ondragenter = this.onDragEnter;
        parentNode.ondragover = function (ev) {
          ev.preventDefault();
          return true;
        };
        var fromIndex = (0, _util.getDomIndex)(target, this.props.ignoreSelector);
        this.setState({ fromIndex: fromIndex, toIndex: fromIndex });
        this.scrollElement = (0, _util.getScrollElement)(parentNode);
      }
    }
  }, {
    key: 'onDragEnter',
    value: function onDragEnter(e) {
      var target = this.getDragNode(e.target);
      var eventData = e;
      var toIndex = void 0;
      if (target) {
        toIndex = (0, _util.getDomIndex)(target, this.props.ignoreSelector);
        if (this.props.enableScroll) {
          this.resolveAutoScroll(eventData, target);
        }
      } else {
        toIndex = -1;
        this.stopAutoScroll();
      }
      this.cacheDragTarget = target;
      this.setState({ toIndex: toIndex });
      this.fixDragLine(target);
    }
  }, {
    key: 'onDragEnd',
    value: function onDragEnd(e) {
      var target = this.getDragNode(e.target);
      this.stopAutoScroll();
      if (target) {
        target.removeAttribute('draggable');
        target.ondragstart = null;
        target.ondragend = null;
        target.parentNode.ondragenter = null;
        target.parentNode.ondragover = null;
        if (this.state.fromIndex >= 0 && this.state.fromIndex !== this.state.toIndex) {
          this.props.onDragEnd(this.state.fromIndex, this.state.toIndex);
        }
      }
      this.hideDragLine();
      this.setState({ fromIndex: -1, toIndex: -1 });
    }
  }, {
    key: 'getDragNode',
    value: function getDragNode(target) {
      return (0, _util.closest)(target, this.props.nodeSelector, this.dragList);
    }
  }, {
    key: 'getHandleNode',
    value: function getHandleNode(target) {
      return (0, _util.closest)(target, this.props.handleSelector || this.props.nodeSelector, this.dragList);
    }
  }, {
    key: 'getDragLine',
    value: function getDragLine() {
      if (!this.dragLine) {
        this.dragLine = window.document.createElement('div');
        this.dragLine.setAttribute('style', DRAG_LIND_STYLE);
        window.document.body.appendChild(this.dragLine);
      }
      this.dragLine.className = this.props.lineClassName || '';
      return this.dragLine;
    }
  }, {
    key: 'resolveAutoScroll',
    value: function resolveAutoScroll(e, target) {
      if (!this.scrollElement) {
        return;
      }

      var _scrollElement$getBou = this.scrollElement.getBoundingClientRect(),
          top = _scrollElement$getBou.top,
          height = _scrollElement$getBou.height;

      var targetHeight = target.offsetHeight;
      var pageY = e.pageY;

      var compatibleHeight = targetHeight * (2 / 3);
      this.direction = 0;
      if (pageY > top + height - compatibleHeight) {
        this.direction = DIRECTIONS.BOTTOM;
      } else if (pageY < top + compatibleHeight) {
        this.direction = DIRECTIONS.TOP;
      }
      if (this.direction) {
        if (this.scrollTimerId < 0) {
          this.scrollTimerId = setInterval(this.autoScroll, 20);
        }
      } else {
        this.stopAutoScroll();
      }
    }
  }, {
    key: 'stopAutoScroll',
    value: function stopAutoScroll() {
      clearInterval(this.scrollTimerId);
      this.scrollTimerId = -1;
      this.fixDragLine(this.cacheDragTarget);
    }
  }, {
    key: 'autoScroll',
    value: function autoScroll() {
      var scrollTop = this.scrollElement.scrollTop;

      if (this.direction === DIRECTIONS.BOTTOM) {
        this.scrollElement.scrollTop = scrollTop + this.props.scrollSpeed;
        if (scrollTop === this.scrollElement.scrollTop) {
          this.stopAutoScroll();
        }
      } else if (this.direction === DIRECTIONS.TOP) {
        this.scrollElement.scrollTop = scrollTop - this.props.scrollSpeed;
        if (this.scrollElement.scrollTop <= 0) {
          this.stopAutoScroll();
        }
      } else {
        this.stopAutoScroll();
      }
    }
  }, {
    key: 'hideDragLine',
    value: function hideDragLine() {
      if (this.dragLine) {
        this.dragLine.style.display = 'none';
      }
    }
  }, {
    key: 'fixDragLine',
    value: function fixDragLine(target) {
      var dragLine = this.getDragLine();
      if (!target || this.state.fromIndex < 0 || this.state.fromIndex === this.state.toIndex) {
        this.hideDragLine();
        return;
      }

      var _target$getBoundingCl = target.getBoundingClientRect(),
          left = _target$getBoundingCl.left,
          top = _target$getBoundingCl.top,
          width = _target$getBoundingCl.width,
          height = _target$getBoundingCl.height;

      var lineTop = this.state.toIndex < this.state.fromIndex ? top : top + height;
      if (this.props.enableScroll && this.scrollElement) {
        var _scrollElement$getBou2 = this.scrollElement.getBoundingClientRect(),
            scrollHeight = _scrollElement$getBou2.height,
            scrollTop = _scrollElement$getBou2.top;

        if (lineTop < scrollTop - 2 || lineTop > scrollTop + scrollHeight + 2) {
          this.hideDragLine();
          return;
        }
      }
      dragLine.style.left = left + UNIT_PX;
      dragLine.style.width = width + UNIT_PX;
      dragLine.style.top = lineTop + UNIT_PX;
      dragLine.style.display = 'block';
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2['default'].createElement(
        'div',
        { role: 'presentation', onMouseDown: this.onMouseDown, onTouchStart: this.onMouseDown, ref: function ref(c) {
            _this2.dragList = c;
          } },
        this.props.children
      );
    }
  }]);
  return ReactDragListView;
}(_react.Component);

ReactDragListView.propTypes = {
  onDragEnd: _propTypes2['default'].func.isRequired,
  handleSelector: _propTypes2['default'].string,
  nodeSelector: _propTypes2['default'].string,
  ignoreSelector: _propTypes2['default'].string,
  enableScroll: _propTypes2['default'].bool,
  scrollSpeed: _propTypes2['default'].number,
  lineClassName: _propTypes2['default'].string,
  children: _propTypes2['default'].node
};
ReactDragListView.defaultProps = {
  nodeSelector: DEFAULT_NODE_SELECTOR,
  ignoreSelector: '',
  enableScroll: true,
  scrollSpeed: 10,
  handleSelector: '',
  lineClassName: '',
  children: null
};
exports['default'] = ReactDragListView;
module.exports = exports['default'];