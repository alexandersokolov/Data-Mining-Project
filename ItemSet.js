class ItemSet extends Array {
    constructor() {
        super();
        this.support = 0.0;
    }

    addItemset(itemSet) {
        for (var i = 0; i < itemSet.length; i++) {
            var item = itemSet[i];
            if (!this.includes(item)) {
                return false;
            }
        }
        return true;
    }

    removeItemset(itemset) {
        var removed = new Itemset();
        for (var i = 0; i < this.length; i += 1) {
            var item = this[i];
            if (!itemset.includes(item)) {
                removed.push(item);
            }
        }
        return removed;
    }

    toStringNoSupport() {
        return '{' + this.join(', ') + '}';
    }

    toString() {
        return '{' + this.join(', ') + '} (Support: ' + this.support + '%)';
    }
}