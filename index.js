
const snarkjs = require('snarkjs')

async function generateProof(){
const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { risk: [1,2,3,4,5,6,7,8,9,10], weight: [2,2,2,2,2,1,1,1,1,1], minRisk: 50, maxRisk: 100 }, 
    "circuit_js/circuit.wasm", 
    "circuit_0000.zkey");
  console.log(publicSignals);
  console.log(proof);
}

generateProof()

generateProof().then(() => {
    process.exit(0);
});