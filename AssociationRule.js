
class AssociationRule {
    constructor() {
        this.x = new ItemSet();
        this.y = new ItemSet();
        this.support = 0.0;
        this.confidence = 0.0;
    }

    // to print out association rules with accompanying support and confidence
    toString() {
        return this.X.toStringNoSupport() + ' => ' + this.Y.toStringNoSupport() +
            ' (Support: ' + this.support.toFixed(2) + '%, ' +
            ' Confidence: ' + this.confidence.toFixed(2) + '%)';
    }
}
