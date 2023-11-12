import config from "../../config/config";
import {CustomHttp} from "./custom-http";
import {DefaultResponseType} from "../types/default-response.type";
import {BalanceResponseType} from "../types/balance-response.type";

export class Balance {

    public static async getActualBalance(): Promise<void> {
        let balanceElement: HTMLElement | null = document.getElementById('balance');
        try {
            const response: DefaultResponseType | BalanceResponseType = await CustomHttp.request(config.host + '/balance');
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            }
            if (balanceElement) {
                balanceElement.textContent = String((response as BalanceResponseType).balance) + ' $';
            }
        } catch (error) {
            console.log(error);
        }
    }
}