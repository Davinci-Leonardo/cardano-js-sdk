"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const errors_1 = require("../errors");
const ts_log_1 = require("ts-log");
class Wallet {
    constructor(properties, api, requestAccess, options) {
        this.api = api;
        this.requestAccess = requestAccess;
        this.options = options;
        this.logger = options.logger ?? ts_log_1.dummyLogger;
        this.name = properties.name;
        this.version = properties.version;
        if (typeof options.persistAllowList === 'undefined') {
            options.persistAllowList = false;
        }
        this.allowList = this.options.persistAllowList ? this.getAllowList() : [];
    }
    getPublicApi(window) {
        return {
            name: this.name,
            version: this.version,
            enable: this.enable.bind(this, window),
            isEnabled: this.isEnabled.bind(this, window)
        };
    }
    getAllowList() {
        return JSON.parse(this.options.storage?.getItem(this.name)) || [];
    }
    allowApplication(appName) {
        this.allowList.push(appName);
        if (this.options.persistAllowList) {
            const currentList = this.getAllowList();
            this.options.storage?.setItem(this.name, JSON.stringify([...currentList, appName]));
            this.logger.debug({
                module: 'Wallet',
                walletName: this.name,
                allowList: this.getAllowList()
            }, 'Allow list persisted');
        }
    }
    async isEnabled(window) {
        const appName = window.location.hostname;
        return this.allowList.includes(appName);
    }
    async enable(window) {
        const appName = window.location.hostname;
        if (this.options.persistAllowList && this.allowList.includes(appName)) {
            this.logger.debug({
                module: 'Wallet',
                walletName: this.name
            }, `${appName} has previously been allowed`);
            return this.api;
        }
        const isAuthed = await this.requestAccess();
        if (!isAuthed) {
            throw new errors_1.ApiError(errors_1.APIErrorCode.Refused, 'wallet not authorized.');
        }
        this.allowApplication(appName);
        return this.api;
    }
}
exports.Wallet = Wallet;
//# sourceMappingURL=Wallet.js.map