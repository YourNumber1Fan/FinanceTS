import {CustomHttp} from "./custom-http";
import config from "../../config/config";
import {CommonConstruction} from "./common-construction";
import {CreateOperationType} from "../types/create-operation.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Filter {
    private static buttonInterval: HTMLButtonElement | null;

    public static activeButtonInterval(): void {
        this.buttonInterval = document.getElementById('button-interval') as HTMLButtonElement;

        const withElement: HTMLElement | null = document.getElementById('with');
        const beforeElement: HTMLElement | null = document.getElementById('before');

        if (withElement) {
            withElement.addEventListener('focusout', () => {
                let withValue: HTMLElement | null = document.getElementById('with');
                let beforeValue: HTMLElement | null = document.getElementById('before');
                if ((withValue as HTMLInputElement).value && (beforeValue as HTMLInputElement).value) {
                    (this.buttonInterval as HTMLInputElement).disabled = false;
                }
            })
        }

        if (beforeElement) {
            beforeElement.addEventListener('focusout', () => {
                let withValue: HTMLElement | null = document.getElementById('with');
                let beforeValue: HTMLElement | null = document.getElementById('before');
                if ((withValue as HTMLInputElement).value && (beforeValue as HTMLInputElement).value) {
                    (this.buttonInterval as HTMLInputElement).disabled = false;
                }
            })
        }
    }

    public static async showFilterElementDefault(tableElement: HTMLElement | null = null): Promise<void> {
        let actualDate: any = new Date();
        actualDate = this.ChangeDateFormatFilter(actualDate.toLocaleDateString());
        let result: CreateOperationType[] = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + actualDate + '&dateTo=' + actualDate);
        if (tableElement) {
            CommonConstruction.getTable(result, tableElement);
        }
    }

    public static async showFilterElement(button: HTMLElement, tableElement: HTMLElement | null = null): Promise<CreateOperationType[] | undefined> {
        let actualDate: Date | string = new Date();
        let responseDate: Date | null = null;
        let responseDateArray: string[] = [];
        let decreaseDate: number | null = null;
        let actualDateFormat: string | HTMLInputElement;
        let responseDateFormat: string | HTMLInputElement;
        let result: CreateOperationType[] | DefaultResponseType = [];

        try {
            switch (button.innerText) {
                case 'Неделя':
                    result = await CustomHttp.request(config.host + '/operations?period=week');
                    break;
                case 'Месяц':
                    result = await CustomHttp.request(config.host + '/operations?period=month');
                    break;
                case 'Год':
                    result = await CustomHttp.request(config.host + '/operations?period=year');
                    break;
                case 'Все':
                    result = await CustomHttp.request(config.host + '/operations?period=all');
                    break;
                case 'Интервал':
                    responseDateFormat = document.getElementById('with') as HTMLInputElement;
                    actualDateFormat = document.getElementById('before') as HTMLInputElement;
                    if (responseDateFormat.value && actualDateFormat.value) {
                        result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + this.ChangeDateFormat(responseDateFormat) + '&dateTo=' + this.ChangeDateFormat(actualDateFormat));
                        responseDateFormat.value = '';
                        actualDateFormat.value = '';
                    }
                    break;
                default:
                    actualDate = this.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                    result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + actualDate + '&dateTo=' + actualDate);
                    break;
            }

            if (!result && (result as DefaultResponseType).error) {
                throw new Error((result as DefaultResponseType).message);
            } else {
                if (tableElement) {
                    CommonConstruction.getTable((result as CreateOperationType[]), tableElement);
                }
                if (result) {
                    return (result as CreateOperationType[]);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    public static ChangeDateFormat(date: HTMLInputElement):string {
        const dateArray: Array<string> = date.value.split('.').reverse();
        return dateArray.join('-');
    }

    public static ChangeDateFormatFilter(date: string): string {
        const dateArray: Array<string> = date.split('.').reverse();
        return dateArray.join('-');
    }
}