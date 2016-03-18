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
const source = fs.readFileSync(__dirname + '/fixtures/case.js', 'utf8');

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
                fixModuleDepsId: (moduleId) => 'N:' + moduleId
            });
            const ast = esprima.parse(dist);
            assert.deepEqual('System', ast.body[0].expression.callee.object.name);
            assert.deepEqual('register', ast.body[0].expression.callee.property.name);
            assert.deepEqual('M:A', ast.body[0].expression.arguments[0].value);
            assert.deepEqual('ArrayExpression', ast.body[0].expression.arguments[1].type);
            assert.deepEqual('N:B', ast.body[0].expression.arguments[1].elements[0].value);
            assert.deepEqual('N:C', ast.body[0].expression.arguments[1].elements[1].value);
        });
    });
});