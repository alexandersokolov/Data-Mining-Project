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
                            }
                        }
                    }


                    // Comparing occurences against minimum support and removing infrequent sets
                    let minimumFrequency = calculateMinimumFrequency(supportRate, transactions.length);

                    // Removing itemsets that do not meet the minimum frequency
                    let e = oneItemSetPattern.length;
                    while (e--) {

                        if (oneItemSetPattern[e]['frequency'] < minimumFrequency) {
                            oneItemSetPattern.splice(e, 1);
                        }
                    }

                    // Forms pairs (That do not repeat) twoItemSetPattern from the oneItemSetPattern
                    let k = 2;
                    let cmb = Combinatorics.combination(oneItemSetPattern, k);
                    while(a = cmb.next()) {
                        if(a.length === k) {
                            twoItemSetPattern.push(a);
                        }
                    }

                    twoItemSetPattern = frequencyPruning(twoItemSetPattern, minimumFrequency);
                    // Adding the frequent item sets to the frequent item sets array
                    for(let f = 0; f < oneItemSetPattern.length; f++) {
                        frequentItemSets.push(oneItemSetPattern[f]);
                    }

                    for(let f = 0; f < twoItemSetPattern.length; f++) {
                        frequentItemSets.push(twoItemSetPattern[f]);
                    }

                    let currentIteration = 3;
                    let stopIterating = false;
                    let currentIterationItems = twoItemSetPattern;

                    while(stopIterating === false) {

                        let currentNewItems = joinOperation(currentIterationItems, currentIteration, minimumFrequency);
                        if(currentNewItems.length === 0) {
                            stopIterating = true;
                        } else {
                            frequentItemSets.push(currentNewItems);
                            currentIterationItems = currentNewItems;
                        }
                        currentIteration++;
                    }

                    for(let s = 0; s < frequentItemSets.length; s++) {
                        delete frequentItemSets[s]['transactionIds'];
                    }
                    writeRulesToFile();

                }

                // If not the first or last line then it keeps parsing the transactions and adding them to the transactions array
                if(line.replace(/ /g,'') !== '' && lineNumber !== 0) {
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

                // The check includes does not work here for some strange reason and causes the
                if( newItemSet.includes(currentItemToAdd) === false && differentOccurence === 1 && currentItemToAdd.length === k) {
                    newItemSet.push(currentItemToAdd);
                }
            }
        }
    }
    return frequencyPruning(newItemSet, minimumFrequency);
}

// This function writes the rules that are found in the frequentItemSet array
function writeRulesToFile() {

        let introduction = "Summary: \nTotal rows in the original set: " + transactions.length + "\nTotal Rules Discovered: " + frequentItemSets.length + "\n\n";
        fs.writeFile('results.txt', introduction, function (err) {
            if (err)
                return console.log(err);
        });

        for(let i = 0; i < frequentItemSets.length; i++) {
                // writing the attributes to a the results file
                fs.appendFile('results.txt', JSON.stringify(frequentItemSets[i]) + "\n", function (err) {
                    if (err)
                        return console.log(err);
                });

        }

    console.log("You can find the mined rules in the rules.txt file");
}