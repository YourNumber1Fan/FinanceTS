export class ProcessIncomeExpenses {

    public static setCategoriesInfo(categoriesName:string, categoriesInfo:string): void {
        localStorage.setItem(categoriesName, JSON.stringify(categoriesInfo));
    }

    public static removeCategoriesInfo(categoriesName:string): void {
        localStorage.removeItem(categoriesName);
    }

    public static getCategoriesInfo(keyName:string):string | null {
        const categoriesInfo: string | null = localStorage.getItem(keyName);
        if (categoriesInfo) {
            return JSON.parse(categoriesInfo);
        }
        return null;
    }

    public static getCategoryName(keyName:string):string | null {
        const categoriesInfo: string | null = localStorage.getItem(keyName);
        if (categoriesInfo) {
            return categoriesInfo;
        }
        return null;
    }
}