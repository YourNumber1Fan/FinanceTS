import {CustomHttp} from "../services/custom-http";
import {CommonConstruction} from "../services/common-construction";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {DefaultResponseType} from "../types/default-response.type";
import {CommonCategoryResponseType} from "../types/common-category-response.type";

export class Expense {
    idElement: number | null;
    expenseCategory: CommonCategoryResponseType[] | DefaultResponseType;
    wrapperExpenseCategories: HTMLElement | null;
    removeCategoryExpense: HTMLElement | null;
    createCategoryExpense: HTMLElement | null;

    constructor() {
        Balance.getActualBalance();
        this.idElement = null;
        this.expenseCategory = [];
        this.wrapperExpenseCategories = document.getElementById('expense-item-elements');
        this.getExpenseCategories();

        this.removeCategoryExpense = document.getElementById('remove-category');
        if (this.removeCategoryExpense) {
            this.removeCategoryExpense.onclick = () => {
                this.removeExpenseCategory();
            }
        }

        this.createCategoryExpense = document.getElementById('add-category');
        if (this.createCategoryExpense) {
            this.createCategoryExpense.onclick = () => {
                location.href = '#/create-category-expense';
            }
        }
    }

    private async getExpenseCategories(): Promise<void> {
        try {
            const response: DefaultResponseType | CommonCategoryResponseType[] = await CustomHttp.request(config.host + '/categories/expense');
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                this.expenseCategory = response as CommonCategoryResponseType[];
                CommonConstruction.showCategory(this.expenseCategory, this.wrapperExpenseCategories, 'edit-category-expense');
            }
        } catch (error) {
            console.log(error);
        }
    }

    private async removeExpenseCategory(): Promise<void> {
        this.idElement = CommonConstruction.getIdElement();
        try {
            await CommonConstruction.removeOperations(this.idElement, 'expense');
            const response: DefaultResponseType | CommonCategoryResponseType = await CustomHttp.request(config.host + '/categories/expense/' + this.idElement,
                "DELETE");
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                localStorage.removeItem('idElement');
                location.href = '#/expenses';
            }
        } catch (error) {
            console.log(error);
        }
    }

}