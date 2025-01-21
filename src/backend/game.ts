import { Preshop } from "./preshop";
let preshop = new Preshop();
let globalTick = setInterval(tick, 250);
console.log("starting");
function tick() {
  // update preshop
  preshop.tick();
  console.log("tick");
}

function test() {
  console.log("test");
}
