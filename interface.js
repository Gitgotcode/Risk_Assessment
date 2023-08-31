import React, { useState } from 'react';
import wc from './circuit_js/witness_calculator';

const Interface = () => {
  const [weight, setWeight] = useState(Array(10).fill(0));
  const [risk, setRisk] = useState(Array(10).fill(0));
  const [minRisk, setMinRisk] = useState(0);
  const [maxRisk, setMaxRisk] = useState(0);
  const [proofAndPublicSignalsBase64, setProofAndPublicSignalsBase64] = useState('');
  const [verificationResult, setVerificationResult] = useState('');
  const [valid, setValid] = useState('');
  const [proof,setproof] = useState('');

  const handleInputChange = (event, setter) => {
    setter(event.target.value);
  };
  
  const handleCopyProof = (proofAndPublicSignalsBase64) => {
    navigator.clipboard.writeText(proofAndPublicSignalsBase64)
      .then(() => {
        console.log('Copied to clipboard:');
        alert('Copied');
      })
      .catch((err) => {
        console.error(`Failed to copy to clipboard: ${err}`);
      });
  };

  function isBase64(value) {
    const base64Pattern = /^[A-Za-z0-9+/]{4}([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/;
  
    return base64Pattern.test(value);
  }
  
  const proofGeneration = async () => {
    const wasmPath = '/circuit.wasm';
    const res = await fetch(wasmPath);
    const buffer = await res.arrayBuffer();
    const WC = await wc(buffer);
    const SnarkJS = window['snarkjs'];
    const input = {
      weight: weights,
      risk: risks,
      minRisk: minRisk,
      maxRisk: maxRisk,
    };
    const r = await WC.calculateWitness(input, 0);
    if (r[1] == 0) {
      alert('invalid values')
    } 
    else {
      const { proof, publicSignals } = await SnarkJS.groth16.fullProve(
        {
          weight: weight,
          risk: risk,
          minRisk: minRisk,
          maxRisk: maxRisk,
        },
        '/circuit.wasm',
        '/final.zkey'
      );
  
      const proofAndPublicSignals = {
        proof: proof,
        publicSignals: publicSignals,
      };
      const proofAndPublicSignalsJSON = JSON.stringify(proofAndPublicSignals);
      const proofAndPublicSignalsBase64 = Buffer.from(proofAndPublicSignalsJSON).toString('base64');
      setProofAndPublicSignalsBase64(proofAndPublicSignalsBase64);
    }
  };
  
    
  const proofVerification = async () => {
    function decodeBase64(proof) {
      if (!isBase64(proof)) {
        alert('Please enter a valid Base64 proof');
        return null; // Return null instead of undefined
      } else {
        try {
          const decodedString = atob(proof);
          const decodedObject = JSON.parse(decodedString);
          return decodedObject;
        } catch (error) {
          alert('An error occurred while decoding the Base64 proof');
          console.error(error);
          return null; // Return null instead of undefined
        }
      }
    }
      
    const SnarkJS = window['snarkjs'];
    let proofObject;
    if(!isBase64(proof)){
      alert('please enter valid base64 proof');
    }
    else{
      proofObject = decodeBase64(proof);
    }
    try{
      const vKeyResponse = await fetch('/verification_key.json');
      const vKey = await vKeyResponse.json();
      const res = await SnarkJS.groth16.verify(vKey, proofObject.publicSignals, proofObject.proof);
      if (res === true) {
        setValid('Verification OK, risk is as per the contract');
      } else {
        setValid('Invalid');
      }
    }catch(e){
      alert('please enter valid base64 proof');
    }
  
  };

    
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Risk Assessment</h1>

      
        <div key={index} style={{ marginBottom: '1rem' }}>
          <label>Weight {index + 1}:</label>
          <input
            type="number"
            value={weight[index]}
            onChange={(e) => handleInputChange(e, setWeight)}
          />
          <label>Risk {index + 1}:</label>
          <input
            type="number"
            value={risk[index]}
            onChange={(e) => handleInputChange(e, setRisk)}
          />
        </div>
      

      <div>
        <label>Minimum Risk:</label>
        <input
          type="number"
          value={minRisk}
          onChange={(e) => handleInputChange(e, setMinRisk)}
        />
        <label>Maximum Risk:</label>
        <input
          type="number"
          value={maxRisk}
          onChange={(e) => handleInputChange(e, setMaxRisk)}
        />
      </div>

      <button onClick={proofGeneration} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
        Generate Proof
      </button>

      {proofAndPublicSignalsBase64 ? (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Proof and Public Signals:</h2>
          <textarea
            value={proofAndPublicSignalsBase64}
            readOnly
            style={{ width: '100%', minHeight: '10rem', padding: '0.5rem', marginBottom: '0.5rem' }}
          />
          <button
            onClick={() => handleCopyProof(proofAndPublicSignalsBase64)}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#f0f0f0', border: 'none', cursor: 'pointer' }}
          >
            Copy
          </button>
        </div>
      ) : (
        <h3></h3>
      )}

      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Proof Verification</h2>
        <input
          type="text"
          onChange={(e) => handleInputChange(e, setproof)}
          style={{ padding: '0.5rem', marginRight: '1rem' }}
        />
        <button onClick={proofVerification} style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>
          Verify Proof
        </button>
      
        {valid === 'Verification OK, the risk is as per contract terms' && (
          <p style={{ marginTop: '1rem', color: 'green' }}>{valid}</p>
        )}
        {valid === 'Invalid' && (
          <p style={{ marginTop: '1rem', color: 'red' }}>{valid}</p>
        )}
      </div>
    </div>
  );
};
  
export default Interface;
