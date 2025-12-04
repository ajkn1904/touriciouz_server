/* eslint-disable @typescript-eslint/no-explicit-any */

import { TErrorSources, TGenericErrorResponse } from "../interfaces/error.interface"


export const handleZodError = (err: any): TGenericErrorResponse => {
    const errorSources: TErrorSources[] = []

    err.issues.forEach((issue: any) => {
        errorSources.push({
            // path: issue.path.length > 1 && issue.path.reverse().join(" inside "),
            name: issue.path[issue.path.length - 1],
            message: issue.message
        })
    })

    return {
        statusCode: 400,
        message: "Zod Error",
        errorSources

    }
}