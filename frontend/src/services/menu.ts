export class Menu {
    readonly menuIncomeExpenses: HTMLElement | null;

    constructor() {
        this.menuIncomeExpenses = document.getElementById('menu-income-expenses');

        if(this.menuIncomeExpenses){
            this.menuIncomeExpenses.onclick = () => {
                if (this.menuIncomeExpenses) {
                    this.menuIncomeExpenses.classList.add('active');
                }
                // console.log('111')
            }
        }
    }
}