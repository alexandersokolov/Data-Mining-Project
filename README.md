# DATA MINING CSCI 4144 FINAL PROJECT

## Kelvin Njoroge and Alexander Sokolov

This program is developed in the context of the CSCI 4144 Data Mining Course

Start the program by running the following command: `node association.js`

Enter the minimum confidence and support rates using two decimal value (eg: 1.00, 0.76)
(The program will not function properly if incorrect values or file name is entered)

Enter the name of the data file
*It is important to note that this program is built with the sample data in mind*
    This means that there must not be any empty line(s) in the middle of the data as it signifies the end of the file.
    This also means that the data file must have two empty lines at the end
    
    functions 
    - calculateMinimumFrequecy(): Calculates minimum frequency based on transactions
    - frequencyPruning(): The most important function that takes advantage of the improved apriori algorithm by pruning itemsets based on the transaction ids that they have in common to avoid repeadetly scanning the database
    - joinOperation(): Function that joins together item sets to create new one
    - writeRulesToFile(): Writes the discovered rules to a text file called results.txt



