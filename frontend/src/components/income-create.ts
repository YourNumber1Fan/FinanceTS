import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {DefaultResponseType} from "../types/default-response.type";
import {CommonCategoryResponseType} from "../types/common-category-response.type";

export class CreateCategoryIncome {
    readonly createButton: HTMLElement | null;
    readonly cancelButton: HTMLElement | null;

    constructor() {
        Balance.getActualBalance();
        this.createButton = document.getElementById('createCategoryIncome');
        this.cancelButton = document.getElementById('cancelCreateCategoryIncome');
        let that = this;

        if (this.createButton) {
            this.createButton.onclick = () => {
                that.createCategoryIncome();
            }
        }

        if (this.cancelButton) {
            this.cancelButton.onclick = () => {
                location.href = '#/income';
            }
        }
    }

    private async createCategoryIncome(): Promise<void> {
        const nameCategoryIncome: HTMLElement | null = document.getElementById('nameCategoryIncome');
        try {
            if ((nameCategoryIncome as HTMLInputElement).value) {
                let result: DefaultResponseType | CommonCategoryResponseType = await CustomHttp.request(config.host + '/categories/income', 'POST', {
                    title: (nameCategoryIncome as HTMLInputElement).value
                });
                if (!result && (result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                } else {
                    location.href = '#/income';
                }
            } else {
                alert('Укажите наименование категории');
            }

        } catch (error) {
            console.log(error);
        }
    }
}