export interface TErrorSources {
    name: string,
    message: string
}


export interface TGenericErrorResponse {
    statusCode: number,
    message: string,
    errorSources?: TErrorSources[]
}