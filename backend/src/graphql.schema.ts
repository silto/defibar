
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export class Protocol {
    id: string;
    slug: string;
    name: string;
    url: string;
    symbol?: Nullable<string>;
    description?: Nullable<string>;
    chains?: Nullable<Nullable<string>[]>;
    logoUrl?: Nullable<string>;
    tvl?: Nullable<number>;
    parentProtocol?: Nullable<string>;
}

export abstract class IQuery {
    abstract searchProtocol(query?: Nullable<string>): Protocol[] | Promise<Protocol[]>;
}

type Nullable<T> = T | null;
