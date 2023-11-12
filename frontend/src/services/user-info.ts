import {UserInfoType} from "../types/user-info.type";
import {Auth} from "./auth";

export class UserInfo {
    readonly userName: HTMLElement | null;
    readonly userInfo:UserInfoType | null;
    readonly accessToken: string | null;

    constructor() {
        this.userName = document.getElementById('profile-full-name');
        this.userInfo = Auth.getUserInfo();
        this.accessToken = localStorage.getItem(Auth.accessTokenKey);
        this.getUserInfo();
    }

    private getUserInfo():void {
        if (this.userInfo && this.accessToken){
            if (this.userName) {
                this.userName.innerText = `${this.userInfo.name} ${this.userInfo.lastName.split(' ')[0]}`;
            }
        } else {
            if (this.userName){
                this.userName.innerText = 'Нет данных';
            }
        }
    }
}
