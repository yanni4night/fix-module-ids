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
    fixModuleDepsId: (moduleId) => moduleId,
    appendModuleId: false
  }, opts);

  const {fixModuleId, fixModuleDepsId, appendModuleId} = options;

  const collectedDatas = [];

  const ast = esprima.parse(source, {
    tokens: true,
    range: true
  });

  JSON.stringify(ast, function(k, v) {
    // System.register
    if (v && 'CallExpression' === v.type && v.callee && 'MemberExpression' === v.callee.type && v.callee
        .object && v.callee.object.name ===
      'System' && /(register|import)/.test(v.callee.property.name) && Array.isArray(v.arguments)) {

      let appendId = () => {
        if ('register' === v.callee.property.name && appendModuleId) {
          let registerTokenIdx = -1;
          let token;

          for (let i = 0; i < ast.tokens.length; ++i) {
            token = ast.tokens[i];
            if (token.range[0] === v.callee.property.range[0] && token.range[1] === v.callee.property.range[1]) {
              registerTokenIdx = i;
              break;
            }
          }

          let nextToken = ast.tokens[1 + registerTokenIdx];

          if (registerTokenIdx > -1 && nextToken && 'Punctuator' === nextToken.type) {
            collectedDatas.push({
              range: [nextToken.range[1], nextToken.range[1]],
              value: '\'' + ('function' === typeof appendModuleId ? appendModuleId() : appendModuleId) + '\'' + (v.arguments.length ? ',' : ''),
            });
          }
        }
      };

      let fixDeps = (idx) => {
        if (v.arguments[idx] && Array.isArray(v.arguments[idx].elements)) {
          collectedDatas.push({
            range: v.arguments[idx].range,
            value: '[' + v.arguments[idx].elements.filter((dep) => 'Literal' === dep.type)
                .map((dep) => '\'' + fixModuleDepsId(
                    dep.value) +
                  '\'').join(',') + ']'
          });
        }
      };
      // System.register()
      if (!v.arguments.length) {
        appendId();
      }
      // System.register(A,[B,C])
      else if ('Literal' === v.arguments[0].type) {
        collectedDatas.push({
          range: v.arguments[0].range,
          value: '\'' + fixModuleId(v.arguments[0].value) + '\'',
        });
        fixDeps(1);
      }
      // System.register([B,C]) 
      else {
        appendId();
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