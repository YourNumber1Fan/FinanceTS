import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {CommonConstruction} from "../services/common-construction";
import {Balance} from "../services/balance";

export class EditCategoryIncome {
    readonly idElement: number | null;
    private newNameCategoryIncome: HTMLElement | null;
    readonly editCategoryIncomeButton: HTMLElement | null;
    readonly cancelEditCategoryIncomeButton: HTMLElement | null;

    constructor() {
        Balance.getActualBalance();
        this.idElement = CommonConstruction.getIdElement();
        this.newNameCategoryIncome = document.getElementById('newNameCategoryIncome');

        this.editCategoryIncomeButton = document.getElementById('editCategoryIncomeButton');
        if (this.editCategoryIncomeButton) {
            this.editCategoryIncomeButton.onclick = () => {
                this.editCategoryIncome();
            }
        }

        this.cancelEditCategoryIncomeButton = document.getElementById('cancelEditCategoryIncomeButton');
        if (this.cancelEditCategoryIncomeButton) {
            this.cancelEditCategoryIncomeButton.onclick = () => {
                location.href = '#/income';
            }
        }
    }

    private async editCategoryIncome(): Promise<void> {
        try {
            if ((this.newNameCategoryIncome as HTMLInputElement).value) {
                const response: Response = await CustomHttp.request(config.host + '/categories/income/' + this.idElement, 'PUT', {
                    'title': (this.newNameCategoryIncome as HTMLInputElement).value
                });
                if (!response) {
                    throw new Error("Неправильно отправлен запрос на изменение категории");
                } else {
                    localStorage.removeItem('idElement');
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