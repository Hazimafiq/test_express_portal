'use strict';
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

/**
 * @class SpreadSheetService
 * @description A service to interact with Google Sheets using the Google Sheets API.
 * @param {GOOGLE_SERVICE_ACCOUNT_EMAIL} - The email of the Google service account.
 * @param {GOOGLE_PRIVATE_KEY} - The private key of the Google service account.
 * @requires google-spreadsheet and google-auth-library packages.
 */
class SpreadSheetService {
    /**
     * @constructor
     * @param {string} spreadSheetUrl - The URL of the Google Spreadsheet.
     */
    constructor(spreadSheetUrl) {
        if (!spreadSheetUrl) {
            throw new Error('Missing spreadSheetUrl.');
        }
        this.serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.doc = new GoogleSpreadsheet(spreadSheetUrl, this.serviceAccountAuth);
    }

    /**
     * Appends data to a Google Spreadsheet.
     * @param {string} sheetTab - Spread Sheet Tab name.
     * @param {Object} data - The data to append as a new row. It is an array.
     */
    async appendData(sheetTab, data) {
        if (!sheetTab) {
            throw new Error('Missing sheetTab.');
        }
        if (!data) {
            throw new Error('Missing data.');
        }
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }

        await this.doc.loadInfo();

        const sheet = this.doc.sheetsByTitle[sheetTab];

        await sheet.addRows(data);
    }

    /**
     * Get latest column data from spread sheet.
     * @param {string} sheetTab - Spread Sheet Tab name.
     * @param {string} columnName - Column Header name.
     */
    async getColumnValues(sheetTab, columnName) {
        if (!sheetTab) {
            throw 'Missing sheetTab.';
        }
        if (!columnName) {
            throw 'Missing columnName.';
        }

        await this.doc.loadInfo();

        const sheet = this.doc.sheetsByTitle[sheetTab];

        if (!sheet) {
            throw `Sheet tab "${sheetTab}" not found in the sheet`;
        }

        const rows = await sheet.getRows();

        const columnIndex = sheet.headerValues.indexOf(columnName);
        if (columnIndex === -1) {
            throw `Column "${columnName}" not found in the sheet`;
        }

        const columnValue = rows.length ? rows[rows.length - 1].get(columnName) : '';

        return columnValue;
    }
}

module.exports = SpreadSheetService;
