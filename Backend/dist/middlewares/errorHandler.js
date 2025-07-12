"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
}
