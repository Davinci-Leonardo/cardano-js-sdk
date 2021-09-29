import { WalletApi } from './WalletApi';
import { Logger } from 'ts-log';
import { WalletPublic } from './WalletPublic';
import { WindowMaybeWithCardano } from '../injectWindow';
export declare type SpecificationVersion = string;
export declare type WalletName = string;
export declare type WalletProperties = {
    name: WalletName;
    version: SpecificationVersion;
};
export declare type RequestAccess = () => Promise<boolean>;
export declare type WalletOptions = {
    logger?: Logger;
    persistAllowList?: boolean;
    storage?: Storage;
};
export declare class Wallet {
    private api;
    private requestAccess;
    private options?;
    readonly version: SpecificationVersion;
    readonly name: WalletName;
    private allowList;
    private logger;
    constructor(properties: WalletProperties, api: WalletApi, requestAccess: RequestAccess, options?: WalletOptions);
    getPublicApi(window: WindowMaybeWithCardano): WalletPublic;
    private getAllowList;
    private allowApplication;
    isEnabled(window: WindowMaybeWithCardano): Promise<Boolean>;
    enable(window: WindowMaybeWithCardano): Promise<WalletApi>;
}
//# sourceMappingURL=Wallet.d.ts.map