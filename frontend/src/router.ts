import {Form} from "./components/form";
import {Auth} from "./services/auth";
import {Income} from "./components/income";
import {CreateCategoryIncome} from "./components/income-create";
import {EditCategoryIncome} from "./components/income-edit";
import {Expense} from "./components/expense";
import {CreateCategoryExpense} from "./components/expense-create";
import {EditCategoryExpense} from "./components/expense-edit";
import {IncomeExpenses} from "./components/income-expenses";
import {IncomeExpensesCreate} from "./components/income-expenses-create";
import {IncomeExpensesEdit} from "./components/income-expenses-edit";
import {Pie} from "./components/pie";
import {Menu} from "./services/menu";
import {RouteType} from "./types/route.type";
import {UserInfo} from "./services/user-info";


export class Router {
    readonly contentElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;
    private modal: HTMLCollectionOf<Element>;
    readonly secondaryContent: HTMLElement | null;
    private routes: RouteType[];
    private test: HTMLElement | null;

    constructor() {
        this.contentElement = document.getElementById('content');
        this.titleElement = document.getElementById('page-title');
        this.modal = document.getElementsByClassName('modal-backdrop fade show');
        this.secondaryContent = document.getElementById("main-content");
        this.test = document.getElementById("menu-income-expenses");

        this.routes = [
            {
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'styles/common.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'styles/common.css',
                load: () => {
                    new Form('login');
                }
            },
            {
                route: '#/main',
                title: 'Главная',
                template: 'templates/pie.html',
                styles: 'styles/common.css',
                load: () => {
                    new Pie();
                }
            },
            {
                route: "#/income",
                title: "Доходы",
                template: "templates/income.html",
                // secondPartTemplate: "templates/extraTemplates/income.html",
                load: () => {
                    new Income();
                }
            },
            {
                route: '#/create-category-income',
                title: 'Создание категории дохода',
                template: "templates/income-create.html",
                // secondPartTemplate: "templates/extraTemplates/income-create.html",
                load: () => {
                    new CreateCategoryIncome();
                }
            },
            {
                route: '#/edit-category-income',
                title: 'Редактирование категории дохода',
                template: "templates/income-edit.html",
                // secondPartTemplate: "templates/extraTemplates/income-edit.html",
                load: () => {
                    new EditCategoryIncome();
                }
            },
            {
                route: "#/expenses",
                title: "Расходы",
                template: "templates/expense.html",
                // secondPartTemplate: "templates/extraTemplates/expense.html",
                load: () => {
                    new Expense();
                }
            },
            {
                route: '#/create-category-expense',
                title: 'Создание категории расхода',
                template: "templates/expense-create.html",
                // secondPartTemplate: "templates/extraTemplates/expense-create.html",
                load: () => {
                    new CreateCategoryExpense();
                }
            },
            {
                route: '#/edit-category-expense',
                title: 'Редактирование категории расхода',
                template: "templates/expense-edit.html",
                // secondPartTemplate: "templates/extraTemplates/expense-edit.html",
                load: () => {
                    new EditCategoryExpense();
                }
            },
            {
                route: '#/income-expenses',
                title: 'Доходы и расходы',
                template: "templates/income-expenses.html",
                // secondPartTemplate: "templates/extraTemplates/income-expenses.html",
                load: () => {
                    new IncomeExpenses();
                    new Menu();
                }
            },
            {
                route: '#/create-income-expenses',
                title: 'Создание дохода/расхода',
                template: "templates/income-expenses-create.html",
                // secondPartTemplate: "templates/extraTemplates/income-expenses-create.html",
                load: () => {
                    new IncomeExpensesCreate();
                }
            },
            {
                route: '#/edit-income-expenses',
                title: 'Редактирование дохода/расхода',
                template: "templates/income-expenses-edit.html",
                // secondPartTemplate: "templates/extraTemplates/income-expenses-edit.html",
                load: () => {
                    new IncomeExpensesEdit();
                }
            },
        ]

        // this.shadeLink();
    }

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash.split('?')[0];
        if (urlRoute === '#/logout') {
            const result: boolean = await Auth.logout();
            if (result) {
                window.location.href = '#/login';
                this.modal = document.getElementsByClassName('modal-backdrop fade show');
                this.modal[0].classList.remove('modal-backdrop');
                return;
            }
        }

        const newRoute: RouteType | undefined = this.routes.find(item => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/login';
            return;
        }

        if (!this.contentElement || !this.titleElement) {
            if (urlRoute === '#/') {
                return;
            } else {
                window.location.href = '#/login';
            }
        }

        if (this.contentElement) {
            this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
        }

        if (this.titleElement) {
            this.titleElement.innerText = newRoute.title;
        }

        new UserInfo();

        newRoute.load();
    }

    // public async shadeLink(): Promise<void> {
    //     const urlRoute: string = window.location.hash.split('?')[0];
    //     if (urlRoute === '#/income-expenses') {
    //         (this.test as HTMLElement).classList.add("activeLink");
    //         // return;
    //
    //     }
    // }
}