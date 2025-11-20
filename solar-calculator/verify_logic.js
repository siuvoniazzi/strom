import { calculateSolarStats } from './src/lib/calculator.js';

// Mock data for one day (4 intervals for simplicity)
const mockDay = [
    { date: '01.01.2025', values: [10, 20, 5, 0] } // Production
];
const mockOwner = [
    { date: '01.01.2025', values: [5, 5, 10, 5] } // Usage
];
const mockNeighbor = [
    { date: '01.01.2025', values: [2, 10, 2, 2] } // Usage
];

// We need 96 values for the real calculator, so let's pad it or modify the calculator to be flexible?
// The calculator assumes 96 values. Let's pad the mock data to 96.
const pad = (arr) => {
    const newArr = [...arr];
    while (newArr.length < 96) newArr.push(0);
    return newArr;
};

const data = {
    production: [{ date: '01.01.2025', values: pad([10, 20, 5, 0]) }],
    ownerUsage: [{ date: '01.01.2025', values: pad([5, 5, 10, 5]) }],
    neighborUsage: [{ date: '01.01.2025', values: pad([2, 10, 2, 2]) }]
};

const config = {
    priceA: 0.10, // Neighbor
    priceB: 0.08, // Grid Sell
    priceC: 0.30  // Grid Buy
};

const result = calculateSolarStats(data, config);
const day = result.daily[0];

console.log("Production:", day.production); // 35
console.log("Owner Usage:", day.ownerUsage); // 25
console.log("Neighbor Usage:", day.neighborUsage); // 16

// Interval 1: Prod 10, Owner 5, Neighbor 2
// Self: 5 (Rem Prod: 5)
// Neighbor: 2 (Rem Prod: 3)
// Grid Sell: 3
// Grid Buy Owner: 0
// Grid Buy Neighbor: 0

// Interval 2: Prod 20, Owner 5, Neighbor 10
// Self: 5 (Rem Prod: 15)
// Neighbor: 10 (Rem Prod: 5)
// Grid Sell: 5
// Grid Buy Owner: 0
// Grid Buy Neighbor: 0

// Interval 3: Prod 5, Owner 10, Neighbor 2
// Self: 5 (Rem Prod: 0)
// Neighbor: 0 (Rem Prod: 0)
// Grid Sell: 0
// Grid Buy Owner: 5
// Grid Buy Neighbor: 2

// Interval 4: Prod 0, Owner 5, Neighbor 2
// Self: 0
// Neighbor: 0
// Grid Sell: 0
// Grid Buy Owner: 5
// Grid Buy Neighbor: 2

// Totals:
// Self: 5+5+5+0 = 15
// Neighbor: 2+10+0+0 = 12
// Grid Sell: 3+5+0+0 = 8
// Grid Buy Owner: 0+0+5+5 = 10
// Grid Buy Neighbor: 0+0+2+2 = 4

console.log("Self Consumed (Exp: 15):", day.selfConsumed);
console.log("Sold to Neighbor (Exp: 12):", day.soldToNeighbor);
console.log("Sold to Grid (Exp: 8):", day.soldToGrid);
console.log("Bought Grid Owner (Exp: 10):", day.boughtFromGridOwner);
console.log("Bought Grid Neighbor (Exp: 4):", day.boughtFromGridNeighbor);

if (
    day.selfConsumed === 15 &&
    day.soldToNeighbor === 12 &&
    day.soldToGrid === 8 &&
    day.boughtFromGridOwner === 10 &&
    day.boughtFromGridNeighbor === 4
) {
    console.log("VERIFICATION PASSED");
} else {
    console.log("VERIFICATION FAILED");
}
