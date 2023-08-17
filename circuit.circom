pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom"; 

template Summation(n){
    signal input weight[n]; //Each weight
    signal input risk[n]; 
    signal input minRisk; 
    signal input maxRisk;

    //Individual risks //int
    //int

    // Output
    signal output out; //1 or 0

    //intermediary variables 
    signal sum;
    var intermediary = 0;

    //Constraint : The aggregated risk must be the weighted sum of the risks
    for (var i=0; i < n; i++) {
        intermediary = intermediary + weight[i] * risk[i]; 
    }             
    sum <-- intermediary;

    //Constraint: the aggregated risk within the range minRisk <= AggregatedRisk <= maxRisk.
    //Max num bits is 20. 2^20 > 1000000. The magnitude is this big because numbers have to be integers.

    component lt1 = LessEqThan(20); 
    lt1.in[0] <== sum;
    lt1.in[1] <== maxRisk;
    lt1.out === 1;

    component gt1 = GreaterEqThan(20); 
    gt1.in[0] <== sum;
    gt1.in[1] <== minRisk;
    gt1.out === 1;

    out <-- (lt1.out * gt1.out); 
    out === 1;

}
component main = Summation(10);