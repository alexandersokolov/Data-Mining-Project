// Readline and fs are functionalities that are included in NodeJS that allow the program to read and write from files
const readline = require('readline');
const fs = require('fs');

// Combinatorics is a library that calculates permutations in an array
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


// Array of frequent item sets
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
                    // Removing all empty elements in the array that are caused by spaces
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

                    console.log("THIS IS THE LAST LINE");
                    console.log("Attributes testing");
                    console.log(attributes);

                    // This collection of loops goes over all transactions and adds individual elements and their frequencies to the oneItemSetPattern array
                    for(let b = 0; b < transactions.length; b++) {
                        for(let c = 0; c < attributes.length; c++) {

                            let found = false;
                            // Checking the itemset to see if it exists, if not adding and increasing the frequency
                            for(let d = 0; d < oneItemSetPattern.length; d++) {

                                if(transactions[b][attributes[c]] === oneItemSetPattern[d]['attributes'][0]) {
                                    oneItemSetPattern[d]['frequency'] = oneItemSetPattern[d]['frequency'] + 1;
                                    found = true;
                                }

                            }

                            let tempArray = [transactions[b][attributes[c]]];
                            if(found === false) {
                                oneItemSetPattern.push({attributes: tempArray ,frequency: 1});
                                console.log("Pushing new item to oneItemPatternArray");
                                console.log(oneItemSetPattern);
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

                    console.log("Testing after pruning");
                    console.log(oneItemSetPattern);

                    // Adding the frequent item sets to the frequent item sets array


                    for(let f = 0; f < oneItemSetPattern.length; f++) {
                        frequentItemSets.push(oneItemSetPattern[f]);
                    }




                    console.log("SINGLE ITEM PATTERN");
                    console.log(oneItemSetPattern);

                }

                // If not the first or last line then it keeps parsing the transactions and adding them to the transactions array
                if(line.replace(/ /g,'') !== '' && lineNumber !== 0) {

                    console.log("");
                    console.log("Current line testing");
                    console.log(line);


                    let currentTransaction = {};
                    let lineValues = line.split(" ");
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



function calculateMinimumFrequency(supportRate, totalTransactions) {
    return supportRate * totalTransactions;
}

// Calculates the frequency of a given item set
function calculateFrequency(itemSet, transactions) {

    for(let i = 0; i < itemSet.length; i++) {

        for(let x = 1; x < itemSet[i].length; x++){

            itemSet[i] = JSON.parse(JSON.stringify(itemSet[i]));
            // Concatenates the attributes in a single entry
            itemSet[i][0]["attributes"] = itemSet[i][0]["attributes"].concat(itemSet[i][x]["attributes"]);
            // Sets the other entries as empty array after they have been added
            itemSet[i][x] = [];
        }

        // Looping over the array again and removing the empty arrays
        x = itemSet[i].length;
        while (x--) {
            if (itemSet[i][x].length === 0) {
                itemSet[i].splice(x, 1);
            }
        }
    }


    for(x = 0; x < itemSet.length; x++) {
        itemSet[x] = itemSet[x][0];
    }

    // For every entry, going over every transaction and calculating frequency
    for(let z = 0; z < itemSet.length; z++) {

        let newFrequency = 0;

        for (let y = 0; y < transactions.length; y++) {

            let allAttributesFound = true;
            for(let q = 0; q < itemSet[z]["attributes"].length; q++) {

                if(! _.includes(transactions[y],itemSet[z]["attributes"][q])) {
                    allAttributesFound = false;
                }

            }

            if(allAttributesFound === true) {
                newFrequency++;
            }
        }

        itemSet[z]["frequency"] = newFrequency;
    }

    return itemSet;
}


// USE  rl.close();  to finish running the program

//
// }).on('close',function(){
//     process.exit(0);
// });