/**
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
import esprima from 'esprima';

export const fixModuleIds = (source, opts) => {
    const options = Object.assign({
        fixModuleId: moduleId => moduleId,
        fixModuleDepsId: (moduleId) => moduleId
    }, opts);

    const collectedDatas = [];

    JSON.stringify(esprima.parse(source, {
        range: true
    }), function (k, v) {
        if (v && v.callee && v.callee.object && v.callee.object.name === 'System') {
            if (v.arguments[0]) {
                collectedDatas.push({
                    range: v.arguments[0].range,
                    value: '\'' + options.fixModuleId(v.arguments[0].value) + '\'',
                });
            }
            if (v.arguments[1] && Array.isArray(v.arguments[1].elements)) {
                collectedDatas.push({
                    range: v.arguments[1].range,
                    value: '[' + v.arguments[1].elements.map((dep) => '\'' + options.fixModuleDepsId(dep.value) +
                        '\'').join(',') + ']'
                });
            }
        }
        return v;
    });

    for (let i = collectedDatas.length - 1; i >= 0; --i) {
        let range = collectedDatas[i].range;
        let replaceString = collectedDatas[i].value;
        source = source.slice(0, range[0]) + replaceString + source.slice(range[1]);
    }

    return source;
};