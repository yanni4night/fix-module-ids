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
  }), function(k, v) {
    // System.register
    if (v && 'CallExpression' === v.type && v.callee && 'MemberExpression' === v.callee.type && v.callee
        .object && v.callee.object.name ===
      'System' && v.callee.property.name === 'register' && Array.isArray(v.arguments) && v.arguments.length
    ) {
      let fixDeps = (idx) => {
        if (v.arguments[idx] && Array.isArray(v.arguments[idx].elements)) {
          collectedDatas.push({
            range: v.arguments[idx].range,
            value: '[' + v.arguments[idx].elements.filter((dep) => 'Literal' === dep.type)
                .map((dep) => '\'' + options.fixModuleDepsId(
                    dep.value) +
                  '\'').join(',') + ']'
          });
        }
      };
      // System.register(A,[B,C])
      if ('Literal' === v.arguments[0].type) {
        collectedDatas.push({
          range: v.arguments[0].range,
          value: '\'' + options.fixModuleId(v.arguments[0].value) + '\'',
        });
        fixDeps(1);
      } else {
        fixDeps(0);
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