export enum NinjaTypes {
    CURRENCY = 'Currency',
    FRAGMENT = 'Fragment',
    FOSSILS = 'Fossil',
    SCARAB = 'Scarab',
    RESONATORS = 'Resonator',
    ESSENCE = 'Essence',
    DIVINATION_CARD = 'DivinationCard',
    PROPHECY = 'Prophecy',
    SKILL_GEM = 'SkillGem',
    BASE_TYPE = 'BaseType',
    HELMET_ENCHANT = 'HelmetEnchant',
    UNIQUE_MAP = 'UniqueMap',
    MAP = 'Map',
    UNIQUE_JEWEL = 'UniqueJewel',
    UNIQUE_FLASK = 'UniqueFlask',
    UNIQUE_WEAPON = 'UniqueWeapon',
    UNIQUE_ARMOUR = 'UniqueArmour',
    UNIQUE_ACCESSORY = 'UniqueAccessory',
}

export interface NinjaPay {
    id: number;
    league_id: number;
    pay_currency_id: number;
    get_currency_id: number;
    sample_time_utc: Date;
    count: number;
    value: number;
    data_point_count: number;
    includes_secondary: boolean;
}

export interface NinjaReceive {
    id: number;
    league_id: number;
    pay_currency_id: number;
    get_currency_id: number;
    sample_time_utc: Date;
    count: number;
    value: number;
    data_point_count: number;
    includes_secondary: boolean;
}

export interface NinjaPaySparkLine {
    data: any[];
    totalChange: number;
}

export interface NinjaReceiveSparkLine {
    data: number[];
    totalChange: number;
}

export interface NinjaLowConfidencePaySparkLine {
    data: any[];
    totalChange: number;
}

export interface NinjaLowConfidenceReceiveSparkLine {
    data: any[];
    totalChange: number;
}

export interface NinjaLine {
    currencyTypeName?: string;
    name?: string;
    baseType?: string;
    chaosEquivalent?: number;
    chaosValue?: number;
    exaltedValue?: number;
    links?: number;
    receive?: any;
    gemLevel?: number;
    gemQuality?: number;
    pay?: any;
    variation?: string;
}

export interface NinjaPriceInfo {
    name: string;
    value: number;
    gemLevel: number;
    gemQuality: number;
    variation: string;
    itemlevel: number;
    baseType: string;
    links: number;
}

export interface NinjaCurrencyDetail {
    id: number;
    icon: string;
    name: string;
    poeTradeId: number;
}

export interface NinjaResponse {
    lines: NinjaLine[];
    currencyDetails: NinjaCurrencyDetail[];
}
