const snarkjs = require('snarkjs')
const fs = require("fs");

async function verify(){
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { risk: [1,2,3,4,5,6,7,8,9,10], weight: [2,2,2,2,2,1,1,1,1,1], minRisk: 50, maxRisk: 100 }, 
    "circuit_js/circuit.wasm", 
    "circuit_0000.zkey");


    const vKey = JSON.parse(fs.readFileSync("verification_key.json"));
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      if (res === true) {
        console.log("Verification OK");
      } else {
        console.log("Invalid proof");
      }
}
verify()

verify().then(() => {
    process.exit(0);
});