'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.fixModuleIds = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; /**
                                                                                                                                                                                                                                                                   * Copyright (C) 2016 yanni4night.com
                                                                                                                                                                                                                                                                   * index.js
                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                   * changelog
                                                                                                                                                                                                                                                                   * 2016-03-18[16:21:43]:revised
                                                                                                                                                                                                                                                                   *
                                                                                                                                                                                                                                                                   * @author yanni4night@gmail.com
                                                                                                                                                                                                                                                                   * @version 1.0.0
                                                                                                                                                                                                                                                                   * @since 1.0.0
                                                                                                                                                                                                                                                                   */


var _esprima = require('esprima');

var _esprima2 = _interopRequireDefault(_esprima);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fixModuleIds = exports.fixModuleIds = function fixModuleIds(source, opts) {
    var options = _extends({
        fixModuleId: function fixModuleId(moduleId) {
            return moduleId;
        },
        fixModuleDepsId: function fixModuleDepsId(moduleId) {
            return moduleId;
        }
    }, opts);

    var collectedDatas = [];

    JSON.stringify(_esprima2.default.parse(source, {
        range: true
    }), function (k, v) {
        if (v && v.callee && v.callee.object && v.callee.object.name === 'System') {
            if (v.arguments[0]) {
                collectedDatas.push({
                    range: v.arguments[0].range,
                    value: '\'' + options.fixModuleId(v.arguments[0].value) + '\''
                });
            }
            if (v.arguments[1] && Array.isArray(v.arguments[1].elements)) {
                collectedDatas.push({
                    range: v.arguments[1].range,
                    value: '[' + v.arguments[1].elements.map(function (dep) {
                        return '\'' + options.fixModuleDepsId(dep.value) + '\'';
                    }).join(',') + ']'
                });
            }
        }
        return v;
    });

    for (var i = collectedDatas.length - 1; i >= 0; --i) {
        var range = collectedDatas[i].range;
        var replaceString = collectedDatas[i].value;
        source = source.slice(0, range[0]) + replaceString + source.slice(range[1]);
    }

    return source;
};

