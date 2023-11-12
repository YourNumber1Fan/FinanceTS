import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {DefaultResponseType} from "../types/default-response.type";
import {CommonCategoryResponseType} from "../types/common-category-response.type";

export class CreateCategoryExpense {
    readonly createButton:HTMLElement | null;
    readonly cancelButton:HTMLElement | null;

    constructor() {
        Balance.getActualBalance();
        this.createButton = document.getElementById('createCategoryExpense');
        this.cancelButton = document.getElementById('cancelCreateCategoryExpense');
        let that:CreateCategoryExpense = this;

        if(this.createButton){
            this.createButton.onclick = function () {
                that.createCategoryExpense();
            }
        }

        if(this.cancelButton){
            this.cancelButton.onclick = () => {
                location.href = '#/expenses';
            }
        }
    }

    private async createCategoryExpense(): Promise<void> {
        const nameCategoryExpense: HTMLElement | null = document.getElementById('nameCategoryExpense');
        try {
            if ((nameCategoryExpense as HTMLInputElement).value) {
                let result: DefaultResponseType | CommonCategoryResponseType = await CustomHttp.request(config.host + '/categories/expense', 'POST', {
                    title: (nameCategoryExpense as HTMLInputElement).value
                });
                if (!result && (result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                } else {
                    location.href = '#/expenses';
                }
            } else {
                alert('Укажите наименование категории');
            }

        } catch (error) {
            console.log (error);
        }
    }
}