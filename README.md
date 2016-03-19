# fix-module-ids
Fixed module ids for systemjs modules

# usage

```javascript
const fixModuleIds = require('fix-module-ids').fixModuleIds;

const ret = fixModuleIds('System.register("A", ["B","C"])', {
    fixModuleId: moduleId => 'M:' + moduleId,
    fixModuleDepsId: (moduleId) => 'N:' + moduleId
});
console.log(ret);//System.register("M:A",["N:B","N:C"])
```


# author
 - <yanni4night@gmail.com>