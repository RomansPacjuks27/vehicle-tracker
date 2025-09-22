import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { retry, timeout } from "rxjs";
import { REQUEST_TIMEOUT, RETRY_COUNT } from "../services/map.service";

export const resilienceInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {

    const retryCount = req.context.get(RETRY_COUNT);
    const timeoutTime = req.context.get(REQUEST_TIMEOUT);

    return next(req)
        .pipe(timeout(timeoutTime),
            retry({
                count: retryCount,
                delay: 1000
            })
        );
}