export interface KeyValuePair<K, V> {
    key: K;
    value: V;
}

export interface IDictionary<K, V> {
    add(key: K, value: V): void;
    set(key: K, value: V): KeyValuePair<K, V>;
    get(key: K): KeyValuePair<K, V> | null;
    getValue(key: K): V;
    remove(key: K): KeyValuePair<K, V> | null;
    containsKey(key: K): boolean;
    keys(): K[];
    values(): V[];
}

export class Dictionary<K, V> implements IDictionary<K, V> {

    private dictionary: KeyValuePair<K, V>[];
    private compareFn: (a: K, b: K) => number;

    constructor(
        compareFn: (a: K, b: K) => number
    ) {
        this.dictionary = [];
        this.compareFn = compareFn;
    }

    set(key: K, value: V): KeyValuePair<K, V> {
        const index = this.indexOf(key);

        if (index === -1) {
            throw new Error('Key does not exist.');
        }

        const tmpKvp = this.dictionary[index];
        this.dictionary[index] = { key, value};

        return tmpKvp;
    }

    get(key: K): KeyValuePair<K, V> | null {
        const index = this.indexOf(key);

        if (index !== -1) {
            return this.dictionary[index];
        }
        return null;
    }

    getValue(key: K): V {
        const index = this.indexOf(key);

        if (index === -1) {
            throw new Error('Value could not be found.');
        }
        return this.dictionary[index].value;
    }

    add(key: K, value: V): void {
        const index = this.indexOf(key);

        if (index !== -1) {
            throw new Error('Key already exists.');
        }

        this.dictionary.push({ key, value });
    }

    remove(key: K): KeyValuePair<K, V> | null {
        const index = this.indexOf(key);

        if (index === -1) {
            return null;
        }

        const kvp = this.dictionary[index];
        this.dictionary.splice(index, 1);
        return kvp;
    }

    public containsKey(key: K): boolean {
        const index = this.indexOf(key);
        return index !== -1;
    }

    public keys(): K[] {
        return this.dictionary.map(kvp => kvp.key);
    }

    public values(): V[] {
        return this.dictionary.map(kvp => kvp.value);
    }

    private indexOf(key: K): number {
        return this.dictionary.findIndex(kvp => this.compareFn(kvp.key, key) === 0);
    }

}