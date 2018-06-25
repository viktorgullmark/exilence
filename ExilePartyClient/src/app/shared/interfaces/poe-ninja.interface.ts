export enum NinjaTypes {
    CURRENCY = 'Currency',
    FRAGMENT = 'Fragment',
    ESSENCE = 'Essence',
    DIVINATION_CARD = 'DivinationCard',
    PROPHECY = 'Prophecy',
    SKILL_GEM = 'SkillGem',
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
    currencyTypeName: string;
    pay: NinjaPay;
    receive: NinjaReceive;
    paySparkLine: NinjaPaySparkLine;
    receiveSparkLine: NinjaReceiveSparkLine;
    chaosEquivalent: number;
    lowConfidencePaySparkLine: NinjaLowConfidencePaySparkLine;
    lowConfidenceReceiveSparkLine: NinjaLowConfidenceReceiveSparkLine;
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
