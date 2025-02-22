"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TxSignError = void 0;
const ts_custom_error_1 = require("ts-custom-error");
var TxSignErrorCode;
(function (TxSignErrorCode) {
    TxSignErrorCode[TxSignErrorCode["ProofGeneration"] = 1] = "ProofGeneration";
    TxSignErrorCode[TxSignErrorCode["UserDeclined"] = 2] = "UserDeclined";
})(TxSignErrorCode || (TxSignErrorCode = {}));
class TxSignError extends ts_custom_error_1.CustomError {
    constructor(code, info) {
        super();
        this.code = code;
        this.info = info;
    }
}
exports.TxSignError = TxSignError;
//# sourceMappingURL=TxSignError.js.map