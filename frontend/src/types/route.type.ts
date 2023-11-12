export type RouteType = {
    route: string,
    title: string,
    template: string,
    secondPartTemplate?: string,
    styles?: string,
    load(): void
}
