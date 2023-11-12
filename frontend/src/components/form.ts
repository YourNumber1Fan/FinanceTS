import {CustomHttp} from "../services/custom-http";
import {Auth} from "../services/auth";
import config from "../../config/config";
import {FormFieldType} from "../types/form-field.type";
import {SignupResponseType} from "../types/signup-response.type";

export class Form {
    readonly rememberMe: HTMLElement | null;
    readonly button: HTMLElement | null;
    readonly page: 'signup' | 'login';
    private fields: FormFieldType[] = [];
    private email: HTMLInputElement | null;
    private password: HTMLInputElement | null;

    constructor(page: 'signup' | 'login') {
        this.rememberMe = document.getElementById("remember-me");
        this.button = document.getElementById("process");
        this.page = page;
        this.email = null;
        this.password = null;
        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                valid: false
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                valid: false
            }
        ];

        if (this.page === 'signup') {
            this.fields.unshift({
                    name: 'fullName',
                    id: 'fullName',
                    element: null,
                    regex: /^[А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+ [А-ЯЁ][а-яё]+$/,
                    valid: false
                },
                {
                    name: 'passwordRepeat',
                    id: 'passwordRepeat',
                    element: null,
                    regex: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/,
                    valid: false,
                    matchPassword: 'password',
                });
        }

        const that: Form = this;
        this.fields.forEach((item: FormFieldType) => {
            item.element = document.getElementById(item.id) as HTMLInputElement;
            if (item.element) {
                item.element.onchange = function () {
                    that.validateField.call(that, item, <HTMLInputElement>this);
                }
            }

        });

        if (this.button) {
            this.button.onclick = function () {
                that.processForm();
            }
        }
    }

    private validateField(field: FormFieldType, element: HTMLInputElement): void {
        if (!element.value || !element.value.match(field.regex)) {
            element.classList.add("is-invalid");
            // element.parentNode.style.borderColor = 'red';
            field.valid = false;
        } else {
            // element.parentNode.removeAttribute('style');
            element.classList.remove("is-invalid");
            field.valid = true;
        }
        if (field.matchPassword) {

            const password = this.fields.find(item => item.name === field.matchPassword)?.element;

            if (password) {
                if (password.value !== element.value) {
                    element.classList.add("is-invalid");
                    field.valid = false;
                } else {
                    element.classList.remove("is-invalid");
                    field.valid = true;
                }
            }
        }
        this.validateForm();
    }

    private validateForm(): boolean {
        const validForm: boolean = this.fields.every(item => item.valid);
        const isValid: boolean = validForm;
        if (this.button) {
            if (isValid) {
                this.button.removeAttribute("disabled");
            } else {
                this.button.setAttribute("disabled", "disabled");
            }
        }
        return isValid;
    }

    private async processForm(): Promise<void> {
        if (this.validateForm()) {
            const email: string | undefined = this.fields.find(item => item.name === "email")?.element?.value;
            const password: string | undefined = this.fields.find(item => item.name === "password")?.element?.value;

            let rememberMe: boolean = true;
            if (this.rememberMe && !(this.rememberMe as HTMLInputElement).checked) {
                rememberMe = false;
            }

            if (this.page === "signup") {
                const nameInput: HTMLElement | null = document.getElementById("fullName");
                const nameInputParts: Array<string> = (nameInput as HTMLInputElement).value.split(" ");
                const name: string = nameInputParts[0];
                const lastName: string = nameInputParts.length > 1 ? nameInputParts.slice(1).join(" ") : "";

                try {
                    const result: SignupResponseType = await CustomHttp.request(config.host + "/signup", "POST", {
                        name: name,
                        lastName: lastName,
                        email: email,
                        password: password,
                        passwordRepeat: this.fields.find(item => item.name === "passwordRepeat")?.element?.value,
                    });

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }
                    }
                } catch (error) {
                    console.log(error);
                    return;
                }
            }

            try {
                const result: SignupResponseType = await CustomHttp.request(config.host + "/login", "POST", {
                    email: email,
                    password: password,
                    rememberMe: rememberMe,
                });

                if (result) {
                    // if (result.error || !result.tokens.accessToken || !result.tokens.refreshToken || !result.user.name || !result.user.lastName || !result.user.id) {
                    if (result.error || !result.tokens || !result.user) {
                        throw new Error(result.message);
                    }

                    Auth.setTokens(result.tokens.accessToken, result.tokens.refreshToken);
                    Auth.setUserInfo({
                        name: result.user.name,
                        lastName: result.user.lastName,
                        id: result.user.id,
                    });
                    location.href = "#/main";
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
}