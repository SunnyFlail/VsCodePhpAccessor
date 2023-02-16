import { execSync } from "child_process"
import { BaseDto, ClassDto } from "./dtos";

export type ClientResponse = {
    success: boolean;
    body: string
}

export interface Success extends ClientResponse {
    success: true;
    class: ClassDto;
};

export interface Failure extends ClientResponse {
    success: false;
    message: string;
}

export class PhpClient
{
    public fetch(
        extensionPath: string,
        composerPath: string,
        className: string,
        phpPath: string
    ): Failure|Success {
        try {
            const data = {
                'composerPath': composerPath,
                'className': className
            };

            const dataString = JSON.stringify(data);

            const response = execSync(`cd ${extensionPath}/php_plugin && ${phpPath} entrypoint.php '${dataString}'`);
            const responseBody: Success|Failure = JSON.parse(response.toString('utf-8'));

            if (responseBody.success && 'class' in responseBody) {
                return <Success> {
                    success: true,
                    class: responseBody.class
                };
            }

            return <Failure> {
                success: false,
                //@ts-ignore
                message: responseBody.message ?? 'An error occurred'
            };
        } catch (err) {
            return <Failure> {
                success: false,
                message: err
            };
        }
    }
}