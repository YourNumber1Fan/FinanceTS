import {CustomHttp} from "../services/custom-http";
import {CommonConstruction} from "../services/common-construction";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {Filter} from "../services/filter";
import {DefaultResponseType} from "../types/default-response.type";
import AirDatepicker from "air-datepicker";

export class IncomeExpenses {
    readonly buttons: HTMLCollectionOf<HTMLInputElement>;
    readonly createIncomeButton: HTMLElement | null;
    readonly createExpenseButton: HTMLElement | null;
    readonly tableElement: HTMLElement | null;
    readonly deleteOperations: HTMLElement | null;
    readonly cancelDeleteOperation: HTMLElement | null;

    constructor() {
        new AirDatepicker('#with');
        new AirDatepicker('#before');

        Balance.getActualBalance();
        this.buttons = document.getElementsByClassName('btn-filter') as HTMLCollectionOf<HTMLInputElement>;

        this.createIncomeButton = document.getElementById('createIncome');
        if (this.createIncomeButton) {
            this.createIncomeButton.onclick = () => {
                // console.log('1')
                location.href = '#/create-income-expenses';
            }
        }

        this.createExpenseButton = document.getElementById('createExpense');
        if (this.createExpenseButton) {
            this.createExpenseButton.onclick = () => {
                // console.log('1')
                location.href = '#/create-income-expenses';
            }
        }

        this.tableElement = document.getElementById('table');

        //Загрузка операций дохода/расхода "Сегодня" по умолчанию
        window.addEventListener('DOMContentLoaded', () => {
            this.initShowFilterElementDefault();
        });

        //Загрузка фильтра
        for (let i = 0; i < this.buttons.length; i++) {
            (this.buttons[i] as HTMLInputElement).onclick = () => {
                if (this.buttons) {
                    this.initShowFilterElement(this.buttons[i], this.tableElement);
                    //Вешаем на кнопки класс active
                    for (let j = 0; j < this.buttons.length; j++) {
                        this.buttons[j].classList.remove('active');
                    }
                    return this.buttons[i].classList.add('active');
                }
            }
        }

        // обработка удаления в модальном окне
        this.deleteOperations = document.getElementById('deleteOperation');
        if (this.deleteOperations) {
            this.deleteOperations.onclick = () => {
                this.deleteOperationsIncomeExpense();
            }
        }

        this.cancelDeleteOperation = document.getElementById('cancelDeleteOperation');
        if (this.cancelDeleteOperation) {
            this.cancelDeleteOperation.onclick = () => {
                location.href = '#/income-expenses';
            }
        }

        //Обрабатываем разблокировку кнопки "Интервал" при наличии дат в полях ввода
        Filter.activeButtonInterval();
        this.initShowFilterElementDefault();
    }

    private initShowFilterElementDefault(): void {
        if (this.tableElement) {
            Filter.showFilterElementDefault(this.tableElement);
        }
    }

    private initShowFilterElement(buttons: HTMLInputElement, tableElement: HTMLElement | null): void {
        if (tableElement) {
            Filter.showFilterElement(buttons, tableElement);
        }
    }

    private async deleteOperationsIncomeExpense(): Promise<void> {
        let operationId: number = CommonConstruction.getIdElement();
        try {
            const response: DefaultResponseType = await CustomHttp.request(config.host + '/operations/' + operationId, 'DELETE');
            if ((response as DefaultResponseType).error) {
                throw new Error((response as DefaultResponseType).message);
            } else {
                localStorage.removeItem('IdElement');
                location.href = '#/income-expenses';
            }
        } catch (error) {
            console.log(error);
        }
    }
}