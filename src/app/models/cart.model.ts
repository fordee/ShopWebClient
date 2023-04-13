import { MongoDate, MongoId, Product } from "./product.model";

export interface MongoItem {
    product: Product;
    quantity: number;
    price: number;
}

export class Order {
    constructor(
    public _id: MongoId | undefined,
    public reservationId: string,
    public status: string,
    public items: Array<MongoItem>,
    public submittedTime: MongoDate | undefined,
    public deliveredTime: MongoDate | undefined,
    public paid: boolean,
    public paymentMethod: string | undefined,
    public notes: string | undefined, ) {}
    
}

export interface Cart { 
    status: string,
    items: MongoItem[],
    paymentMethod: string | undefined,
}

export class StatusUpdate {
    constructor(
        public status: string
    ) {}
}

export class StatusItemsUpdate {
    constructor(
        public status: string,
        public items: MongoItem[],
        public paymentMethod: string
    ) {}
}

export class StatusFilter {
    constructor(
        public statuses: string[]
    ) {}
}

export class Token {
    constructor(
        public token: string
    ) {}
}