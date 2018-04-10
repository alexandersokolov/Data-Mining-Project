class Subset {
  static findSubsets(itemset, n) {
        let subSets = new ItemSetCollection();

        let subSetCount = Math.pow(2, itemset.length);
        for (var i = 0; i < subSetCount; i++) {
            if (n == 0 || Subset.getOnCount(i, itemset.length) == n) {
                let binary = Subset.decimalToBinary(i, itemset.length);

                let subset = new ItemSet();
                for (var charIndex = 0; charIndex < binary.length; charIndex++) {
                    if (binary[binary.length - charIndex - 1] == '1') {
                        subset.push(itemset[charIndex]);
                    }
                }
                subsets.push(subset);
            }
        }

        return subSets;
    }

    static getSubset(value, position) {
        let subSet = value & Math.pow(2, position);
        return (subSet > 0 ? 1 : 0);
    }

    static decimalToBinary(value, length) {
        let binary = '';
        for (var position = 0; position < length; position++) {
            binary = Subset.getSubset(value, position) + binary;
        }
        return binary;
    }

    static getOnCount(value, length) {
        let binary = Subset.decimalToBinary(value, length);

        let onCount = 0;
        for (var i = 0; i < binary.length; i += 1) {
            if (binary[i] == '1') {
                onCount += 1;
            }
        }

        return onCount;
    }
}
