export interface ItemPricing {
    name: string;
    quality: number;
    gemlevel: number;
    sockets: number;
    links: number;
    variation: string;
    chaosequiv: number;
    chaosequiv_min: number;
    chaosequiv_max: number;
    chaosequiv_mode: number;
    chaosequiv_median: number;
    chaosequiv_average: number;
    frameType: number;
    quantity: number;
}

export interface SimpleItemPricing {
    chaosequiv: number;
    chaosequiv_min: number;
    chaosequiv_max: number;
    chaosequiv_mode: number;
    chaosequiv_median: number;
    chaosequiv_average: number;
    quantity: number;
}



