import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {ProcessIncomeExpenses} from "../services/process-income-expenses";
import AirDatepicker from "air-datepicker";
import {CommonCategoryResponseType} from "../types/common-category-response.type";
import {DefaultResponseType} from "../types/default-response.type";
import {CreateOperationType} from "../types/create-operation.type";

export class IncomeExpensesCreate {
    readonly selectIncomeExpenses: HTMLInputElement | null;
    readonly categoriesSelect: HTMLInputElement | null;
    readonly createItemIncomeExpenses: HTMLElement | null;
    readonly cancelCreateItemIncomeExpenses: HTMLElement | null;
    private categories: CommonCategoryResponseType[] | DefaultResponseType;

    constructor() {
        Balance.getActualBalance();
        this.selectIncomeExpenses = document.getElementById('selectIncomeExpenses') as HTMLInputElement;
        this.categoriesSelect = document.getElementById('categoriesSelect') as HTMLInputElement;
        this.createItemIncomeExpenses = document.getElementById('createIncomeExpenses');
        this.cancelCreateItemIncomeExpenses = document.getElementById('cancelCreateIncomeExpenses');
        this.categories = [];

        new AirDatepicker('#date');

        //получение категорий с сервера дохода/расхода при изменении select
        if (this.selectIncomeExpenses) {
            this.selectIncomeExpenses.onchange = () => {
                this.getCategories();
            }
        }

        //отправка запроса на создание дохода/расхода
        if (this.createItemIncomeExpenses) {
            this.createItemIncomeExpenses.onclick = () => {
                this.createItem();
            }
        }

        //отмена отправки запроса на создание дохода/расхода
        if (this.cancelCreateItemIncomeExpenses) {
            this.cancelCreateItemIncomeExpenses.onclick = () => {
                location.href = '#/income-expenses';
            }
        }
    }

    private async getCategories(): Promise<void> {
        try {
            let selectIncomeExpensesCurrent: HTMLElement | null = document.getElementById('selectIncomeExpenses');
            let name: string | null = null;
            if ((selectIncomeExpensesCurrent as HTMLInputElement).value === 'доход') {
                name = 'income';
                ProcessIncomeExpenses.removeCategoriesInfo('categoriesName');
                ProcessIncomeExpenses.setCategoriesInfo('categoriesName', 'income');
            } else if ((selectIncomeExpensesCurrent as HTMLInputElement).value === 'расход') {
                name = 'expense';
                ProcessIncomeExpenses.removeCategoriesInfo('categoriesName');
                ProcessIncomeExpenses.setCategoriesInfo('categoriesName', 'expense');
            }

            if (name) {
                this.categories = await this.responseCategories('/categories/' + name);
                this.setCategoriesToSelect();
            } else {
                this.removeCategoriesToSelect();
                throw new Error('Отсутствует значение дохода/расхода');
            }

        } catch (error) {
            console.log(error);
        }
    }

    private async responseCategories(hashResponse: string): Promise<CommonCategoryResponseType[] | DefaultResponseType> {
        try {
            const response: CommonCategoryResponseType[] | DefaultResponseType = await CustomHttp.request(config.host + hashResponse);
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                return (response as CommonCategoryResponseType[]);
            }
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    private setCategoriesToSelect(): void {
        if (this.categories) {
            this.removeCategoriesToSelect();
            for (let i = 0; i < (this.categories as CommonCategoryResponseType[]).length; i++) {
                const category: CommonCategoryResponseType = (this.categories as CommonCategoryResponseType[])[i];
                const optionElement: HTMLElement = document.createElement('option');
                optionElement.setAttribute('id', category.id.toString());
                optionElement.setAttribute('value', category.title);
                optionElement.innerText = category.title;
                if (this.categoriesSelect) {
                    this.categoriesSelect.append(optionElement);
                }
            }
        }
    }

    private removeCategoriesToSelect(): void {
        if (this.categoriesSelect) {
            this.categoriesSelect.innerHTML = '';
        }
    }

    private async createItem(): Promise<void> {
        const categoriesName: string | null = ProcessIncomeExpenses.getCategoriesInfo('categoriesName');
        const selectIncomeExpenses: HTMLSelectElement | null = document.getElementById('selectIncomeExpenses') as HTMLSelectElement;
        const categoriesSelect: HTMLSelectElement | null = document.getElementById('categoriesSelect') as HTMLSelectElement;
        const amount: HTMLInputElement | null = document.getElementById('amount') as HTMLInputElement;
        const date: HTMLInputElement | null = document.getElementById('date') as HTMLInputElement;
        const dateArray: Array<string> = (date as HTMLInputElement).value.split('.').reverse();
        const dateResponse: string = dateArray.join('-');
        const comment: HTMLInputElement | null = document.getElementById('comment') as HTMLInputElement;
        const category_id: string = this.getCategoryId();

        if (!selectIncomeExpenses.value || !categoriesSelect.value ||
            !(amount as HTMLInputElement).value || !(date as HTMLInputElement).value || !(comment as HTMLInputElement).value) {
            alert('Заполните все поля для создания категории');
        } else {
            try {
                if (categoriesName) {
                    const result: CreateOperationType | DefaultResponseType = await CustomHttp.request(config.host + '/operations', 'POST', {
                        type: categoriesName,
                        amount: +(amount as HTMLInputElement).value,
                        date: dateResponse,
                        comment: (comment as HTMLInputElement).value,
                        category_id: +category_id
                    });

                    if ((result as DefaultResponseType).error) {
                        throw new Error((result as DefaultResponseType).message);
                    } else {
                        ProcessIncomeExpenses.removeCategoriesInfo('categoriesName');
                        location.href = '#/income-expenses';
                    }
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    private getCategoryId(): string {
        let selectCategoryActual: HTMLSelectElement | null = document.getElementById('categoriesSelect') as HTMLSelectElement;
        let categories: HTMLElement[] = Array.from((this.categoriesSelect as HTMLElement).childNodes) as HTMLElement[];
        let activeCategory: HTMLElement | undefined = categories.find((item: HTMLElement) => {
            return item.textContent === (selectCategoryActual as HTMLSelectElement).value;
        })
        return (activeCategory as HTMLElement).getAttribute('id') as string;
    }
}