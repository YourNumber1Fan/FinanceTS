import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {CommonConstruction} from "../services/common-construction";
import {Balance} from "../services/balance";

export class EditCategoryExpense {
    readonly idElement: number | null;
    private newNameCategoryExpense: HTMLElement | null;
    readonly editCategoryIncomeExpense: HTMLElement | null;
    readonly cancelEditCategoryIncomeButton: HTMLElement | null;

    constructor() {
        Balance.getActualBalance();
        this.idElement = CommonConstruction.getIdElement();
        this.newNameCategoryExpense = document.getElementById('newNameCategoryExpense');

        this.editCategoryIncomeExpense = document.getElementById('editCategoryExpenseButton');
        if(this.editCategoryIncomeExpense){
            this.editCategoryIncomeExpense.onclick = () => {
                this.editCategoryExpense();
            }
        }

        this.cancelEditCategoryIncomeButton = document.getElementById('cancelEditCategoryExpenseButton');
        if(this.cancelEditCategoryIncomeButton){
            this.cancelEditCategoryIncomeButton.onclick = () => {
                location.href = '#/expenses';
            }
        }
    }

    private async editCategoryExpense():Promise<void> {
        try {
            if((this.newNameCategoryExpense as HTMLInputElement).value){
                const response:Response = await CustomHttp.request(config.host + '/categories/expense/' + this.idElement, 'PUT', {
                    'title': (this.newNameCategoryExpense as HTMLInputElement).value
                });
                if (!response) {
                    throw new Error("Неправильно отправлен запрос на изменение категории");
                } else {
                    localStorage.removeItem('idElement');
                    location.href = '#/expenses';
                }
            } else {
                alert('Укажите наименование категории');
            }
        } catch (error) {
            console.log(error);
        }
    }
}