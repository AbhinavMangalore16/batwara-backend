import { ExpensePGRepository } from "../repos/expense.repo";
import { dtoTypes } from "../dtos";

export class ExpenseService {
  constructor(private expenseRepo: ExpensePGRepository) {}

  async createBill(id:string,billingObject:dtoTypes["BillDTO"]):Promise<string|null> {
    let mappedData;
    if(billingObject.splitData.splitType == "equal"){
        mappedData = billingObject.splitData.data.map((val)=>{
            return {
                userId:val.userId,
                splitAmount:Math.floor(billingObject.totalAmount/billingObject.splitData.data.length)
            }
        })
        const myBillingObject = {
            totalAmount:billingObject.totalAmount,
            description:billingObject.description,
            splitType:billingObject.splitData.splitType,
            splitData:mappedData
        }
        const res = await this.expenseRepo.splitThat(id,myBillingObject);
        return (res?.transactionId?res.transactionId:null);
    }
    else if(billingObject.splitData.splitType == "exact"){
        mappedData = billingObject.splitData.data.map((val)=>{
            return {
                userId:val.userId,
                splitAmount:val.amount
            }
        })
        const myBillingObject = {
            totalAmount:billingObject.totalAmount,
            description:billingObject.description,
            splitType:billingObject.splitData.splitType,
            splitData:mappedData
        }
        const res = await this.expenseRepo.splitThat(id,myBillingObject);
        return (res?.transactionId?res.transactionId:null);
    }
    else if(billingObject.splitData.splitType == "percentage"){
        mappedData = billingObject.splitData.data.map((val)=>{
            return {
                userId:val.userId,
                splitAmount:Math.floor((val.percentage*billingObject.totalAmount)/100)
            }
        })
        const myBillingObject = {
            totalAmount:billingObject.totalAmount,
            description:billingObject.description,
            splitType:billingObject.splitData.splitType,
            splitData:mappedData
        }
        const res = await this.expenseRepo.splitThat(id,myBillingObject);
        return (res?.transactionId?res.transactionId:null);
    }
    return null;
  }
}