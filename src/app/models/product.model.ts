export interface MongoDate {
    $date: string;
}

export interface MongoId {
    $oid: string | undefined
}

export class Product {
    constructor(
        public _id: MongoId,
        public name: string,
        public description: string,
        public sellingPrice: number,
        public stock: number,
        public imagePath: string,
        public bestByDate: MongoDate) {}
}
