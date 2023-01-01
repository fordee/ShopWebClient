export interface MongoDate {
    $date: string;
}

export interface MongoId {
    $oid: string | undefined
}

export interface Product {
    _id: MongoId;
    name: string;    
    description: string;
    sellingPrice: number;
    stock: number;
    imagePath: string;
    bestByDate: MongoDate;
}
