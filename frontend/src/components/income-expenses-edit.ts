import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {ProcessIncomeExpenses} from "../services/process-income-expenses";
import {DefaultResponseType} from "../types/default-response.type";
import AirDatepicker from "air-datepicker";
import {CategoriesCommonResponseType} from "../types/categories-common-response.type";
import {CommonCategoryResponseType} from "../types/common-category-response.type";
import {EditOperationType} from "../types/edit-operation.type";

export class IncomeExpensesEdit {
    readonly categoriesName: string | null;
    readonly nameCategory: string | null;
    readonly selectIncomeExpenses: HTMLSelectElement | null;
    readonly categoriesSelect: HTMLSelectElement | null;
    readonly editIncomeExpenses: HTMLElement | null;
    readonly cancelEditIncomeExpenses: HTMLElement | null;
    private categories: CategoriesCommonResponseType[] | DefaultResponseType;

    constructor() {
        Balance.getActualBalance();
        new AirDatepicker('#date');

        this.categoriesName = ProcessIncomeExpenses.getCategoryName('categoriesName');
        this.nameCategory = ProcessIncomeExpenses.getCategoryName('nameCategory');

        this.selectIncomeExpenses = document.getElementById('selectIncomeExpenses') as HTMLSelectElement;
        this.categoriesSelect = document.getElementById('categoriesSelect') as HTMLSelectElement;
        this.editIncomeExpenses = document.getElementById('editIncomeExpenses');
        this.cancelEditIncomeExpenses = document.getElementById('cancelEditIncomeExpenses');
        this.categories = [];

        //Присваивание в поля тип и категория значения редактируемой операции, чтобы пользователь их не исправил
        //для типа операции (доход/расход)
        this.setValueCategory(this.categoriesName, this.selectIncomeExpenses);

        //для категории операции
        if (this.categoriesSelect) {
            this.categoriesSelect.innerHTML = "<option>" + this.nameCategory + "</option>";
            (this.categoriesSelect as HTMLSelectElement).disabled = true;
        }

        //получение категорий дохода/расхода
        if (this.selectIncomeExpenses) {
            this.selectIncomeExpenses.onchange = () => {
                this.getCategories();
            }
        }

        //отправка запроса на редактирование дохода/расхода
        if (this.editIncomeExpenses) {
            this.editIncomeExpenses.onclick = () => {
                this.editItem();
            }
        }

        //отмена отправки запроса на редактирование дохода/расхода
        if (this.cancelEditIncomeExpenses) {
            this.cancelEditIncomeExpenses.onclick = () => {
                ProcessIncomeExpenses.removeCategoriesInfo('categoriesName');
                ProcessIncomeExpenses.removeCategoriesInfo('idElement');
                ProcessIncomeExpenses.removeCategoriesInfo('nameCategory');
                location.href = '#/income-expenses';
            }
        }
    }

    private setValueCategory(nameLocalStorage: string | null, selectElement: HTMLSelectElement | null): HTMLSelectElement | null {
        if (nameLocalStorage === 'income') {
            (selectElement as HTMLSelectElement).value = 'доход';
            (selectElement as HTMLSelectElement).disabled = true;
        } else if (nameLocalStorage === 'expense') {
            (selectElement as HTMLSelectElement).value = 'расход';
            (selectElement as HTMLSelectElement).disabled = true;
        }
        return selectElement as HTMLSelectElement;
    }

    private async getCategories(): Promise<void> {
        try {
            let selectIncomeExpensesActual: HTMLSelectElement | null = document.getElementById('selectIncomeExpenses') as HTMLSelectElement;
            let name: string | null = null;
            if ((selectIncomeExpensesActual as HTMLSelectElement).value === 'доход') {
                name = 'income';
                ProcessIncomeExpenses.removeCategoriesInfo('categoriesName');
                ProcessIncomeExpenses.setCategoriesInfo('categoriesName', 'income');
            } else if ((selectIncomeExpensesActual as HTMLSelectElement).value === 'расход') {
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

    private async responseCategories(hashResponse: string): Promise<CategoriesCommonResponseType[] | DefaultResponseType> {
        try {
            const response: CategoriesCommonResponseType[] | DefaultResponseType = await CustomHttp.request(config.host + hashResponse);
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                return response;
            }
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    private setCategoriesToSelect(): void {
        if (this.categories) {
            this.removeCategoriesToSelect();
            for (let i = 0; i < (this.categories as CategoriesCommonResponseType[]).length; i++) {
                const category = (this.categories as unknown as CommonCategoryResponseType[])[i];
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

    private async editItem(): Promise<void> {
        const amount: HTMLInputElement | null = document.getElementById('amount') as HTMLInputElement;
        const date: HTMLInputElement | null = document.getElementById('date') as HTMLInputElement;
        const dateArray: Array<string> = (date as HTMLInputElement).value.split('.').reverse();
        const dateResponse: string = dateArray.join('-');
        const comment: HTMLInputElement | null = document.getElementById('comment') as HTMLInputElement;
        const element_id: number = Number(ProcessIncomeExpenses.getCategoryName('idElement'));

        //изменение операции
        const categoryArray: CommonCategoryResponseType[] | DefaultResponseType = await CustomHttp.request(config.host + '/categories/' + this.categoriesName);
        const category_id: CommonCategoryResponseType | undefined = (categoryArray as CommonCategoryResponseType[]).find((item: CommonCategoryResponseType) => {
            if (item.title === this.nameCategory) {
                return item.id;
            }
        })

        try {
            if (this.categoriesName && category_id) {
                const result: EditOperationType | DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + element_id, 'PUT', {
                    type: this.categoriesName,
                    amount: Number((amount as HTMLInputElement).value),
                    date: dateResponse,
                    comment: (comment as HTMLInputElement).value,
                    category_id: category_id.id
                });

                if ((result as DefaultResponseType).error) {
                    throw new Error((result as DefaultResponseType).message);
                } else {
                    ProcessIncomeExpenses.removeCategoriesInfo('categoriesName');
                    ProcessIncomeExpenses.removeCategoriesInfo('idElement');
                    ProcessIncomeExpenses.removeCategoriesInfo('nameCategory');
                    location.href = '#/income-expenses';
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

}