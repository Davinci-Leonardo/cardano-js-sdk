import { WalletApi } from './WalletApi';
import { ApiError, APIErrorCode } from '../errors';
import {  Logger } from 'ts-log';
import { WalletPublic } from './WalletPublic';
import { WindowMaybeWithCardano } from '../injectWindow';

/**
 * CIP30 Specification version
 */
export type SpecificationVersion = string;

/**
 * Unique identifier, used to inject into the cardano namespace
 */
export type WalletName = string;

export type WalletProperties = { name: WalletName; version: SpecificationVersion };

/**
 * Resolve true to authorise access to the WalletAPI, or resolve false to deny.
 *
 * Errors: `ApiError`
 */
export type RequestAccess = () => Promise<boolean>;

export type WalletOptions = {
  logger?: Logger;
  persistAllowList?: boolean;
  storage?: Storage;
};

export class Wallet {
  readonly version: SpecificationVersion;
  readonly name: WalletName;

  private allowList: string[];
  // private logger: Logger;

  constructor(
    properties: WalletProperties,
    private api: WalletApi,
    private requestAccess: RequestAccess,
    private options?: WalletOptions
  ) {
    // this.logger = options.logger ?? dummyLogger;
    this.name = properties.name;
    this.version = properties.version;

    if (typeof options.persistAllowList === 'undefined') {
      options.persistAllowList = false;
    }

    this.allowList = this.options.persistAllowList ? this.getAllowList() : [];
  }

  public getPublicApi(window: WindowMaybeWithCardano): WalletPublic {
    return {
      name: this.name,
      version: this.version,
      enable: this.enable.bind(this, window),
      isEnabled: this.isEnabled.bind(this, window)
    };
  }

  private getAllowList(): string[] {
    return JSON.parse(this.options.storage?.getItem(this.name)) || [];
  }

  private allowApplication(appName: string) {
    this.allowList.push(appName);

    if (this.options.persistAllowList) {
      const currentList = this.getAllowList();
      // Todo: Encrypt
      this.options.storage?.setItem(this.name, JSON.stringify([...currentList, appName]));
      console.log(
        {
          module: 'Wallet',
          walletName: this.name,
          allowList: this.getAllowList()
        },
        'Allow list persisted'
      );
    }
  }

  /**
   * Returns true if the dApp is already connected to the user's wallet, or if requesting access
   * would return true without user confirmation (e.g. the dApp is whitelisted), and false otherwise.
   *
   * If this function returns true, then any subsequent calls to wallet.enable()
   * during the current session should succeed and return the API object.
   *
   * Errors: `ApiError`
   */
  public async isEnabled(window: WindowMaybeWithCardano): Promise<Boolean> {
    const appName = window.location.hostname;
    return this.allowList.includes(appName);
  }

  /**
   * This is the entrypoint to start communication with the user's wallet.
   *
   * The wallet should request the user's permission to connect the web page to the user's wallet,
   * and if permission has been granted, the full API will be returned to the dApp to use.
   *
   * The wallet can choose to maintain a whitelist to not necessarily ask the user's permission
   * every time access is requested, but this behavior is up to the wallet and should be transparent
   * to web pages using this API.
   *
   * If a wallet is already connected this function should not request access a second time,
   * and instead just return the API object.
   *
   * Errors: `ApiError`
   */
  public async enable(window: WindowMaybeWithCardano): Promise<WalletApi> {
    const appName = window.location.hostname;

    if (this.options.persistAllowList && this.allowList.includes(appName)) {
      console.log(
        {
          module: 'Wallet',
          walletName: this.name
        },
        `${appName} has previously been allowed`
      );
      return this.api;
    }

    // gain authorization from wallet owner
    const isAuthed = await this.requestAccess();

    if (!isAuthed) {
      throw new ApiError(APIErrorCode.Refused, 'wallet not authorized.');
    }

    this.allowApplication(appName);

    return this.api;
  }
}
