// Readline and fs are functionalities that are included in NodeJS that allow the program to read and write from files
const readline = require('readline');
const fs = require('fs');
const Combinatorics = require('js-combinatorics');

// Lodash is a library that provides functions such as contains() in an array
const _ = require('lodash');

// Variables that will be defined by the user
let supportRate;
let confidenceRate;
let fileName;

// Variable that will hold the attributes that are specified in the first row of the data
let attributes;

// Variable that will be an array of objects that represent the transactions in the data
let transactions = [];

// First and second pattern sets
let oneItemSetPattern = [];
let twoItemSetPattern = [];

// Array of frequent item sets, these will be used to generate the association rules
let frequentItemSets = [];

// Initializes command prompt for user input
let rl = readline.createInterface(process.stdin, process.stdout);

// Getting user input
rl.question('Please enter the minimum support rate: ', function(suppRate) {
    supportRate = suppRate;
    rl.question('Please enter the minimum confidence rate: ', function(confRate) {
        confidenceRate = confRate;
        rl.question('Please enter the name of the data file: ', function(fName) {
            fileName = fName;

            // Reading data from file
            let rf = readline.createInterface({
                input: fs.createReadStream(fileName),
                crlfDelay: Infinity
            });

            let lineNumber = 0;
            rf.on('line', function (line) {
                // If it is the first line, then it the line with the attributes
                if(lineNumber === 0) {
                    // Removing all empty elements in the array that are caused by unnecessary spaces (if any)
                    attributes = line.split(",");
                    let i = attributes.length;
                    while(i--) {

                        if (attributes[i] === "") {
                            attributes.splice(i, 1);
                        }
                    }
                }

                // This if statement signifies that it is the end of the file and data parsing will begin based on transactions gathered
                if(line.replace(/ /g,'') === '') {

                    // This collection of loops goes over all transactions and adds individual elements and their frequencies to the oneItemSetPattern array
                    for(let b = 0; b < transactions.length; b++) {
                        for(let c = 0; c < attributes.length; c++) {

                            let found = false;
                            // Checking the itemset to see if it exists, if not adding and increasing the frequency
                            for(let d = 0; d < oneItemSetPattern.length; d++) {

                                // Testing extra check to ensure that attribute name is also accounted for
                                if(transactions[b][attributes[c]] === oneItemSetPattern[d]['attribute'] &&
                                    oneItemSetPattern[d]['attributeName'] === attributes[c]) {
                                    oneItemSetPattern[d]['frequency'] = oneItemSetPattern[d]['frequency'] + 1;
                                    // Add transaction id here
                                    oneItemSetPattern[d]['transactionIds'].push(b);
                                    found = true;
                                }

                            }

                            let tempArray = transactions[b][attributes[c]];
                            if(found === false) {
                                let transactionIds = [b];
                                oneItemSetPattern.push({attribute: tempArray ,attributeName: attributes[c] , transactionIds: transactionIds,
                                    frequency: 1});
                                // Add transaction id here
                                console.log("Pushing new item to oneItemPatternArray");
                                console.log(oneItemSetPattern);
                            }
                        }
                    }


                    // Comparing occurences against minimum support and removing infrequent sets
                    let minimumFrequency = calculateMinimumFrequency(supportRate, transactions.length);

                    console.log("MINIMUM FREQUENCY TESTING");
                    console.log(minimumFrequency);


                    // Removing itemsets that do not meet the minimum frequency
                    let e = oneItemSetPattern.length;
                    while (e--) {

                        if (oneItemSetPattern[e]['frequency'] < minimumFrequency) {
                            oneItemSetPattern.splice(e, 1);
                        }
                    }

                    console.log("Testing after pruning");
                    console.log(oneItemSetPattern);

                    // Forms pairs (That do not repeat) twoItemSetPattern from the oneItemSetPattern
                    let k = 2;
                    let cmb = Combinatorics.combination(oneItemSetPattern, k);
                    while(a = cmb.next()) {
                        if(a.length === k) {
                            twoItemSetPattern.push(a);
                        }
                    }


                    console.log("Two item set pattern testing");
                    console.log(twoItemSetPattern);

                    twoItemSetPattern = frequencyPruning(twoItemSetPattern, minimumFrequency);

                    console.log("Two item set pattern testing after pruning");
                    console.log(twoItemSetPattern);

                    // Adding the frequent item sets to the frequent item sets array
                    for(let f = 0; f < oneItemSetPattern.length; f++) {
                        frequentItemSets.push(oneItemSetPattern[f]);
                    }

                    for(let f = 0; f < twoItemSetPattern.length; f++) {
                        frequentItemSets.push(twoItemSetPattern[f]);
                    }

                    // testing the join operation
                    joinOperation(twoItemSetPattern, 3, minimumFrequency);

                }

                // If not the first or last line then it keeps parsing the transactions and adding them to the transactions array
                if(line.replace(/ /g,'') !== '' && lineNumber !== 0) {

                    console.log("");
                    console.log("Current line testing");
                    console.log(line);


                    let currentTransaction = {};
                    let lineValues = line.split(",");
                    let x = lineValues.length;
                    while (x--) {
                        if (lineValues[x] === "") {
                            lineValues.splice(x, 1);
                        }
                    }
                    for (let a = 0; a < lineValues.length; a++) {
                        currentTransaction[attributes[a]] = lineValues[a];
                    }
                    transactions.push(currentTransaction);

                    console.log("Current transaction testing");
                    console.log(currentTransaction);

                    console.log("");
                }
                lineNumber++;
            });
        });
    });
});

// Function that calculates minimum frequency
function calculateMinimumFrequency(supportRate, totalTransactions) {
    return supportRate * totalTransactions;
}

// Given an item set, this function calculates the minimum frequency of common attributes by comparing common transaction ids to the minimum frequency
function frequencyPruning(itemSet, minimumFrequency) {
    let newItemSet = [];
    for(let i = 0; i < itemSet.length; i++) {

        // This process identifies the transaction ids that show up in all items
        let totalArray = [];
        for(let y = 0; y < itemSet[i].length; y++) {
           totalArray.push(itemSet[i][y]['transactionIds']);
        }
        let unique = _.intersection.apply(_,totalArray);
        if(unique.length >= minimumFrequency) {
            newItemSet.push(itemSet[i]);
        }
    }
    return newItemSet;
}

// Function that will join itemsets with itself until it no longer meets the minimum support
function joinOperation(itemSet, k, minimumFrequency) {

    let newItemSet = [];

    for(let i = 0; i < itemSet.length; i++) {

        for(let y = 1; y < itemSet.length; y++) {
            let numMatches = 0;
            // currentIteration or "k" - 1 in this case represents the number of attributes that should be present in a set
            for(let z = 0; z < k - 1; z++) {
                if (itemSet[i][z]['attribute'] === itemSet[y][z]['attribute'] && itemSet[i][z]['attributeName'] === itemSet[y][z]['attributeName']) {
                    numMatches++;
                }
            }

            if(numMatches >= k-2) {
                // Combine the item set and add it to the array
                let currentItemToAdd = [];
                let differentOccurence = 0;
                for(let z = 0; z < k - 1; z++) {
                    if (itemSet[i][z]['attribute'] === itemSet[y][z]['attribute'] && itemSet[i][z]['attributeName'] === itemSet[y][z]['attributeName']) {
                        // Adds the same attributes once
                        currentItemToAdd.push(itemSet[i][z]);
                    } else {
                        // Adds both different attribute which creates the +1 dataset
                        currentItemToAdd.push(itemSet[i][z]);
                        currentItemToAdd.push(itemSet[y][z]);
                        differentOccurence++;
                    }
                }


                console.log("ITEM SET TESTING");
                console.log(newItemSet);

                console.log("Current Item to add");
                console.log(currentItemToAdd);


                let tempSet = new Set (newItemSet);
                let currentHas = tempSet.has(currentItemToAdd);

                console.log("Current has value");
                console.log(currentHas);


                if(currentHas) {
                    console.log("NEW ITEM SET ALREADY INCLUDES ITEM");
                    console.log(newItemSet);
                }

                // Problem might be with the way we are pushing things in the array, if the problem persists, rewrite this statement to make it more readable
                if( currentHas === false && differentOccurence === 1 && currentItemToAdd.length === k) {
                    newItemSet.push(currentItemToAdd);
                }

                // We want to push if array includes is false, if different occurence is 1 and if currentItemToAdd is k


            }
        }
    }

    //
    console.log("NEW ITEM SET TESTING AFTER PRUNING");
    console.log(frequencyPruning(newItemSet, minimumFrequency));

    // console.log("Lodash includes testing");
    // console.log(_.includes([1, 2, 3], 1));
    //
    // console.log("Lodash includes testing 2");
    // console.log(_.includes.apply([[1, 2, 3]], 1));


}

// This function writes the rules that are found in the frequentItemSet array
function writeRule() {

}


// USE  rl.close();  to finish running the program

//
// }).on('close',function(){
//     process.exit(0);
// });