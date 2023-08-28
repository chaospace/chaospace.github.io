

class Store<T> {
    itemCreator<U>(generate: (item: Omit<T, keyof U>) => U): (item: Omit<T, keyof U>) => Omit<T, keyof U> & U {
        return item => ({ ...item, ...generate(item) });
    }
    itemCreator2<U>(
        generate: <P = Omit<T, keyof U>>(item: P) => U
    ): (item: Omit<T, keyof U>) => Omit<T, keyof U> & U {
        return item => ({ ...item, ...generate(item) });
    }
}

type Person = {
    id: string;
    name: string;
    email: string;
    age?: number;
}

const create = new Store<Person>().itemCreator(() => ({ id: 'ID', extra: 42 }));
const person = create({ name: 'chaospace', email: "test@.com" });

const createA = new Store<Person>().itemCreator((a) => ({ id: 'ID', extra: 42 }));
const personA = createA({ name: 'chaospace', email: 'test@.com' });


const createB = new Store<Person>().itemCreator2((a) => ({ id: 'ID', extra: 42 }));
const personB = createB({ name: 'chaospace', email: 'test@.com' });