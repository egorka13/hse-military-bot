import { join } from "path";
import { writeFileSync } from "fs";
import { Parser } from "htmlparser2";
import fetch from "node-fetch";
import BaseError from "@/modules//BaseError";

const ScheduleDownloaderError = BaseError.createErrorGenerator(
    "ScheduleDownloaderError",
);

class ScheduleDownloader {
    private _baseUrl = "https://www.hse.ru";
    private _scheduleUrl = `${this._baseUrl}/org/hse/ouk/mil/schedule`;
    private _schedulePath = join(__dirname, "../../static/schedule.xlsx");

    public async downloadSchedule(): Promise<void> {
        const html = await this._getPlainHtml();
        const scheduleHref = await this._parseHtml(html);

        if (scheduleHref === undefined) {
            throw ScheduleDownloaderError("Cannot find href for schedule");
        }

        await this._downloadAndSaveXlsx(`${this._baseUrl}${scheduleHref}`);
    }

    private async _getPlainHtml(): Promise<string> {
        const response = await fetch(this._scheduleUrl);

        if (!response.ok) {
            throw ScheduleDownloaderError(
                "Cannot find download html for schedule",
            );
        }

        return response.text();
    }

    private _parseHtml(html: string): Promise<string | void> {
        return new Promise((resolve) => {
            const parser = new Parser(
                {
                    onopentag: (name, attribs): void => {
                        if (
                            name === "a" &&
                            attribs.href &&
                            attribs.href.indexOf(".xlsx") !== -1
                        ) {
                            resolve(attribs.href);
                        }
                    },
                },
                { decodeEntities: true },
            );

            parser.write(html);
            parser.end();
        });
    }

    private async _downloadAndSaveXlsx(scheduleHref: string): Promise<void> {
        try {
            const response = await fetch(scheduleHref);
            const xlsxContent = await response.buffer();

            writeFileSync(this._schedulePath, xlsxContent, "utf8");
        } catch (exception) {
            throw ScheduleDownloaderError("Cannot download schedule xlsx");
        }
    }
}

export default new ScheduleDownloader();
