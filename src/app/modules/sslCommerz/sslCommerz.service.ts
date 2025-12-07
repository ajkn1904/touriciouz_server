/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import { ISSLCommerz } from "./sslCommerz.interface";
import axios from "axios"
import config from "../../../config";
import AppError from "../../errors/AppError";
import { prisma } from "../../utils/prisma";

const sslPaymentInit = async(payload: ISSLCommerz) => {
    try {
        const data = {
            store_id: config.SSL.STORE_ID || "touri6934bf630b575",
            store_passwd: config.SSL.STORE_PASS || "touri6934bf630b575@ssl",
            total_amount: payload.amount,
            currency: "BDT",
            tran_id: payload.transactionId,
            success_url: `${config.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
            fail_url: `${config.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
            cancel_url: `${config.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
            ipn_url: config.SSL.SSL_IPN_URL,
            shipping_method: "N/A",
            product_name: "Tour",
            product_category: "Service",
            product_profile: "general",
            cus_name: payload.name,
            cus_email: payload.email,
            cus_add1: "N/A",
            cus_add2: "N/A",
            cus_city: "Chittagong",
            cus_state: "Chittagong",
            cus_postcode: "4000",
            cus_country: "Bangladesh",
            cus_phone: payload.phone,
            cus_fax: "01711111111",
            ship_name: "N/A",
            ship_add1: "N/A",
            ship_add2: "N/A",
            ship_city: "N/A",
            ship_state: "N/A",
            ship_postcode: 1000,
            ship_country: "N/A",
        }

        //console.log("SSLCommerz Request Data:", data);
        
        const response = await axios({
            method: "POST",
            url: config.SSL.SSL_PAYMENT_API,
            data: data,
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        })
      //console.log("sslcomeerz validate api response", response.data);

        return response.data;
        
  
    } catch (error: any) {
        console.log("Payment Error Occurred!", error);
        throw new AppError(StatusCodes.BAD_REQUEST, error.message) 
    }
}

const validatePayment = async (payload: any) => {
    try {
        const response = await axios({
            method: "GET",
            url: `${config.SSL.SSL_VALIDATION_API}?val_id=${payload.val_id}&store_id=${config.SSL.STORE_ID}&store_passwd=${config.SSL.STORE_PASS}`
        })

        console.log("sslcomeerz validate api response", response.data);

        await prisma.payment.update({
            where: { transactionId: payload.tran_id },
            data: { paymentGatewayData: response.data }
        })
        return response.data;
    } catch (error: any) {
        console.log(error);
        throw new AppError(401, `Payment Validation Error, ${error.message}`)
    }
}


export const SSLService = {
    sslPaymentInit,
    validatePayment
}