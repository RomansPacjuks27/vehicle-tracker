import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable } from "@angular/core";
import { NotificationService } from "../services/notification.service";

@Injectable()
export class AppErrorHandler implements ErrorHandler {

    constructor(private notificationService: NotificationService){
    }

    handleError(error: Error | HttpErrorResponse) {
        let message: string =  '';
        if (error instanceof HttpErrorResponse) {
            switch (error.status) {
                case 0:
                    message = "Couldn't send a request";
                    break;
                case 404:
                    message = "Couldn't retrieve data";
                    break;
                case 500:
                default:
                    message = "Server internal error occured";
                    break;
            }
            this.notificationService.openServerErrorDialog(message);
        }
        else if (error instanceof Error)
        {
            message = "Something went wrong";
            this.notificationService.openServerErrorDialog(message);
        }
    }
}