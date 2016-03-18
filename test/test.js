/**
 * Copyright (C) 2016 tieba.baidu.com
 * test.js
 *
 * changelog
 * 2016-03-18[16:37:28]:revised
 *
 * @author yanni4night@gmail.com
 * @version 1.0.0
 * @since 1.0.0
 */

const fixModuleIds = require('../dist/').fixModuleIds;
const esprima = require('esprima');
const fs = require('fs');
const assert = require('assert');
const source = 'System.register ( "A" , [ "B", "C" ] ) ';

describe('#fixModuleIds()', () => {
  describe('systemjs', () => {
    it('should return primary if no option', () => {
      const dist = fixModuleIds(source);
      const ast = esprima.parse(dist);
      assert.deepEqual('System', ast.body[0].expression.callee.object.name);
      assert.deepEqual('register', ast.body[0].expression.callee.property.name);
      assert.deepEqual('A', ast.body[0].expression.arguments[0].value);
      assert.deepEqual('ArrayExpression', ast.body[0].expression.arguments[1].type);
      assert.deepEqual('B', ast.body[0].expression.arguments[1].elements[0].value);
      assert.deepEqual('C', ast.body[0].expression.arguments[1].elements[1].value);
    });

    it('should modify module id', () => {
      const dist = fixModuleIds(source, {
        fixModuleId: moduleId => 'M:' + moduleId,
        fixModuleDepsId: moduleId => 'N:' + moduleId
      });
      const ast = esprima.parse(dist);
      assert.deepEqual('System', ast.body[0].expression.callee.object.name);
      assert.deepEqual('register', ast.body[0].expression.callee.property.name);
      assert.deepEqual('M:A', ast.body[0].expression.arguments[0].value);
      assert.deepEqual('ArrayExpression', ast.body[0].expression.arguments[1].type);
      assert.deepEqual('N:B', ast.body[0].expression.arguments[1].elements[0].value);
      assert.deepEqual('N:C', ast.body[0].expression.arguments[1].elements[1].value);
    });

    it('should work if deps do not exist', () => {
      const dist = fixModuleIds('System.register ( "A" ) ', {
        fixModuleId: moduleId => 'M:' + moduleId,
        fixModuleDepsId: moduleId => 'N:' + moduleId
      });
      const ast = esprima.parse(dist);
      assert.deepEqual('System', ast.body[0].expression.callee.object.name);
      assert.deepEqual('register', ast.body[0].expression.callee.property.name);
      assert.deepEqual('M:A', ast.body[0].expression.arguments[0].value);
    });

    it('should work if module id does not exists', function() {
      const dist = fixModuleIds('System.register ( [ "B" , "C" ] )', {
        fixModuleId: moduleId => 'M:' + moduleId,
        fixModuleDepsId: moduleId => 'N:' + moduleId
      });
      const ast = esprima.parse(dist);
      assert.deepEqual('System', ast.body[0].expression.callee.object.name);
      assert.deepEqual('register', ast.body[0].expression.callee.property.name);
      assert.deepEqual('ArrayExpression', ast.body[0].expression.arguments[0].type);
      assert.deepEqual('N:B', ast.body[0].expression.arguments[0].elements[0].value);
      assert.deepEqual('N:C', ast.body[0].expression.arguments[0].elements[1].value);
    });

    it('should add module id if not exists', () => {
      var dist = fixModuleIds('System.register ( ) ', {
        fixModuleId: moduleId => 'M:' + moduleId,
        fixModuleDepsId: moduleId => 'N:' + moduleId,
        appendModuleId: 'M:A'
      });
      var ast = esprima.parse(dist);
      assert.deepEqual('System', ast.body[0].expression.callee.object.name);
      assert.deepEqual('register', ast.body[0].expression.callee.property.name);
      assert.deepEqual('M:A', ast.body[0].expression.arguments[0] && ast.body[0].expression.arguments[0].value);

      dist = fixModuleIds('System.register ( [ "B", "C" ] ) ', {
        fixModuleId: moduleId => 'M:' + moduleId,
        fixModuleDepsId: moduleId => 'N:' + moduleId,
        appendModuleId: 'M:A'
      });
      ast = esprima.parse(dist);
      assert.deepEqual('System', ast.body[0].expression.callee.object.name);
      assert.deepEqual('register', ast.body[0].expression.callee.property.name);
      assert.deepEqual('M:A', ast.body[0].expression.arguments[0] && ast.body[0].expression.arguments[0].value);
      assert.deepEqual('ArrayExpression', ast.body[0].expression.arguments[1].type);
      assert.deepEqual('N:B', ast.body[0].expression.arguments[1].elements[0].value);
      assert.deepEqual('N:C', ast.body[0].expression.arguments[1].elements[1].value);
    });
  });
});