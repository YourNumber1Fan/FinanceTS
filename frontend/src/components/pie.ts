import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Balance} from "../services/balance";
import {Filter} from "../services/filter";
import AirDatepicker from "air-datepicker";
import {OperationsType} from "../types/operations.type";
import {DefaultResponseType} from "../types/default-response.type";
import {Chart} from "chart.js/auto";

export class Pie {
    private categoryNameIncomeArray: string[];
    private categoryValueIncomeArray: number[];
    private categoryColorIncomeArray: string[];
    private categoryNameExpensesArray: string[];
    private categoryValueExpensesArray: number[];
    private categoryColorExpensesArray: string[];
    private result: OperationsType[] | DefaultResponseType;
    private refreshToken: string | null;
    private pieIncome: Chart | null;
    private pieExpenses: Chart | null;
    private canvasIncome: HTMLCanvasElement;
    private canvasExpenses: HTMLCanvasElement;
    readonly buttons: HTMLCollectionOf<HTMLButtonElement>;

    constructor() {
        Balance.getActualBalance();
        this.categoryNameIncomeArray = [];
        this.categoryValueIncomeArray = [];
        this.categoryColorIncomeArray = [];
        this.categoryNameExpensesArray = [];
        this.categoryValueExpensesArray = [];
        this.categoryColorExpensesArray = [];
        this.result = [];
        this.refreshToken = null;
        this.pieIncome = null;
        this.pieExpenses = null;
        this.canvasIncome = document.getElementById('pie-income') as HTMLCanvasElement;
        this.canvasExpenses = document.getElementById('pie-expenses') as HTMLCanvasElement;
        this.buttons = document.getElementsByClassName('btn-filter') as HTMLCollectionOf<HTMLButtonElement>;

        new AirDatepicker('#with');
        new AirDatepicker('#before');

        Filter.activeButtonInterval();

        //Загрузка операций дохода/расхода "Сегодня" по умолчанию
        window.addEventListener('DOMContentLoaded', () => this.initShowFilterElement());

        //Загрузка фильтра
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].onclick = () => {
                this.initShowFilterElement(this.buttons[i]);

                //Вешаем на кнопки класс active
                for (let j = 0; j < (this.buttons as HTMLCollection).length; j++) {
                    (this.buttons as HTMLCollection)[j].classList.remove('active');
                }
                return (this.buttons as HTMLCollection)[i].classList.add('active');
            }
        }

        this.initShowFilterElement();
    }

    async initShowFilterElement(buttons: HTMLElement | null = null): Promise<void> {
        let actualDate: Date | string = new Date();
        let actualDateFormat: string | HTMLInputElement;
        let responseDateFormat: string | HTMLInputElement;

        this.categoryNameIncomeArray = [];
        this.categoryValueIncomeArray = [];
        this.categoryColorIncomeArray = [];
        this.categoryNameExpensesArray = [];
        this.categoryValueExpensesArray = [];
        this.categoryColorExpensesArray = [];

        if (this.pieIncome) {
            this.pieIncome.destroy();
        }
        if (this.pieExpenses) {
            this.pieExpenses.destroy();
        }

        try {
            if (buttons) {
                switch (buttons.innerText) {
                    case 'Неделя':
                        this.result = await CustomHttp.request(config.host + '/operations?period=week');
                        break;
                    case 'Месяц':
                        this.result = await CustomHttp.request(config.host + '/operations?period=month');
                        break;
                    case 'Год':
                        this.result = await CustomHttp.request(config.host + '/operations?period=year');
                        break;
                    case 'Все':
                        this.result = await CustomHttp.request(config.host + '/operations?period=all');
                        break;
                    case 'Интервал':
                        responseDateFormat = document.getElementById('with') as HTMLInputElement;
                        actualDateFormat = document.getElementById('before') as HTMLInputElement;
                        if (responseDateFormat.value && actualDateFormat.value) {
                            this.result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + Filter.ChangeDateFormat(responseDateFormat) + '&dateTo=' + Filter.ChangeDateFormat(actualDateFormat));
                            responseDateFormat.value = '';
                            actualDateFormat.value = '';
                        }
                        break;
                    default:
                        actualDate = Filter.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                        this.result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + actualDate + '&dateTo=' + actualDate);
                        break;
                }
            } else {
                actualDate = Filter.ChangeDateFormatFilter(actualDate.toLocaleDateString());
                this.result = await CustomHttp.request(config.host + '/operations?period=interval&dateFrom=' + actualDate + '&dateTo=' + actualDate);
            }


            if (!this.result && (this.result as DefaultResponseType).error) {
                throw new Error((this.result as DefaultResponseType).message);
            } else {
                let incomeArray: OperationsType[] = (this.result as OperationsType[]).filter((item: OperationsType) => {
                    return item.type === 'income';
                });
                let expensesArray: OperationsType[] = (this.result as OperationsType[]).filter((item: OperationsType) => {
                    return item.type === 'expense';
                });

                // console.log(incomeArray);
                // console.log(expensesArray);

                //Формирование данных для диаграммы Доходы
                try {
                    const incomeCategory = await CustomHttp.request(config.host + '/categories/income');
                    if (incomeCategory.error) {
                        throw new Error(incomeCategory.message);
                    } else {

                        for (let i = 0; i < incomeCategory.length; i++) {
                            this.categoryNameIncomeArray[i] = incomeCategory[i].title;
                        }

                        for (let i = 0; i < this.categoryNameIncomeArray.length; i++) {
                            this.categoryValueIncomeArray[i] = 0;
                            for (let j = 0; j < incomeArray.length; j++) {
                                if (this.categoryNameIncomeArray[i] === incomeArray[j].category) {
                                    this.categoryValueIncomeArray[i] += incomeArray[j].amount;
                                }
                            }
                        }

                        for (let i = 0; i < this.categoryValueIncomeArray.length; i++) {
                            this.categoryColorIncomeArray[i] = `hsla(${Math.random() * 360}, 100%, 50%, 1)`
                        }
                    }
                } catch (error) {
                    console.log(error);
                }

                //Загрузка диаграммы доходов
                let ctxIncome = this.canvasIncome.getContext('2d') as CanvasRenderingContext2D;
                this.pieIncome = new Chart(ctxIncome, {
                    type: 'pie',
                    data: {
                        datasets: [{
                            data: this.categoryValueIncomeArray,
                            backgroundColor: this.categoryColorIncomeArray
                        }],
                        labels: this.categoryNameIncomeArray
                    },
                    options: {
                        responsive: true
                    }
                }) as Chart;

                //Формирование данных для диаграммы Расходы
                try {
                    const expensesCategory = await CustomHttp.request(config.host + '/categories/expense');
                    if (expensesCategory.error) {
                        throw new Error(expensesCategory.message);
                    } else {

                        for (let i = 0; i < expensesCategory.length; i++) {
                            this.categoryNameExpensesArray[i] = expensesCategory[i].title;
                        }

                        for (let i = 0; i < this.categoryNameExpensesArray.length; i++) {
                            this.categoryValueExpensesArray[i] = 0;
                            for (let j = 0; j < expensesArray.length; j++) {
                                if (this.categoryNameExpensesArray[i] === expensesArray[j].category) {
                                    this.categoryValueExpensesArray[i] += expensesArray[j].amount;
                                }
                            }
                        }

                        for (let i = 0; i < this.categoryValueExpensesArray.length; i++) {
                            this.categoryColorExpensesArray[i] = `hsla(${Math.random() * 360}, 100%, 50%, 1)`
                        }
                    }
                } catch (error) {
                    console.log(error);
                }

                //Загрузка диаграммы расходов
                let ctxExpenses = this.canvasExpenses.getContext('2d') as CanvasRenderingContext2D;
                this.pieExpenses = new Chart(ctxExpenses, {
                    type: 'pie',
                    data: {
                        datasets: [{
                            data: this.categoryValueExpensesArray,
                            backgroundColor: this.categoryColorExpensesArray
                        }],
                        labels: this.categoryNameExpensesArray
                    },
                    options: {
                        responsive: true
                    }
                }) as Chart;
            }

        } catch (error) {
            console.log(error);
        }

    }

}