import {CustomHttp} from "../services/custom-http";
import {CommonConstruction} from "../services/common-construction";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {DefaultResponseType} from "../types/default-response.type";
import {CommonCategoryResponseType} from "../types/common-category-response.type";

export class Income {
    private idElement: number | null;
    private incomeCategory: CommonCategoryResponseType[];
    readonly wrapperIncomeCategories: HTMLElement | null;
    readonly removeCategoryIncome: HTMLElement | null;
    readonly createCategoryIncome: HTMLElement | null;

    constructor() {
        Balance.getActualBalance();
        this.idElement = null;
        this.incomeCategory = [];
        this.wrapperIncomeCategories = document.getElementById('income-item-elements');
        this.getIncomeCategories();

        this.removeCategoryIncome = document.getElementById('remove-category');
        if (this.removeCategoryIncome) {
            this.removeCategoryIncome.onclick = () => {
                this.removeIncomeCategory();
            }
        }

        this.createCategoryIncome = document.getElementById('add-category');
        if (this.createCategoryIncome) {
            this.createCategoryIncome.onclick = () => {
                location.href = '#/create-category-income';
            }
        }
    }

    private async getIncomeCategories(): Promise<void> {
        try {
            const response: CommonCategoryResponseType[] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/income');
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                this.incomeCategory = response as CommonCategoryResponseType[];
                CommonConstruction.showCategory(this.incomeCategory, this.wrapperIncomeCategories, 'edit-category-income');
            }
        } catch (error) {
            console.log(error);
        }
    }

    private async removeIncomeCategory(): Promise<void> {
        this.idElement = CommonConstruction.getIdElement();
        try {
            await CommonConstruction.removeOperations(this.idElement, 'income');
            const response: DefaultResponseType | null = await CustomHttp.request(config.host + '/categories/income/' + this.idElement,
                "DELETE");
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                localStorage.removeItem('idElement');
                location.href = '#/income';
            }
        } catch (error) {
            console.log(error);
        }
    }

}