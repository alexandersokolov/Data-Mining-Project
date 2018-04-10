class ItemSetCollection extends Array {
  constructor() {
    super();
  }

  getFrequentItems(){
    let frequentItems = new ItemSet();

    for (var i in this) {
            let itemSet = this[i];
            for (var i = 0; i < itemSet.length; i += 1) {
                if (!frequentItems.includes(itemSet[i])) {
                    frequentItems.push(itemSet[i]);
                }
            }
        }

        return frequentItems;
  }
  getSupport(itemset) {
        let matchCount = 0;
        for (var i in this) {
            let is = this[i];
            if (is.includesItemset(itemset)) {
                matchCount += 1;
            }
        }

        let support = (matchCount / this.length) * 100.0;
        return support;
    }

    clear() {
        this.length = 0;
    }

    toString() {
        return this.join('\n');
    }
}
