"use strict";

function abc() {
  console.log('abc');
}

abc();
"use strict";

for (var i = 0; i < 10; i++) {
  var aaa = function aaa() {
    i++;
    console.log(i);
  };

  console.log(i + 10);
  aaa(); // retrun i
}
//# sourceMappingURL=all.js.map
