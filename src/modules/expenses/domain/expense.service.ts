import { ExpensePGRepository } from "../repos/expense.repo";

interface equalSplitObject{
    userId:string,
}

interface splitObject{
    userId:string,
    split:number
}

interface billObject{
    totalAmount:number,
    description:string,
    splitType:"equal"|"percentage"|"exact",
    userData:splitObject[] | equalSplitObject[]
}

export class ExpenseService {
  constructor(private expenseRepo: ExpensePGRepository) {}

  async createBill(id:string,billingObject:billObject):Promise<string|null> {
    let mappedData;
    if(billingObject.splitType == "equal"){
        mappedData = billingObject.userData.map((val)=>{
            return {
                userId:val.userId,
                splitAmount:billingObject.totalAmount/billingObject.userData.length
            }
        })
    }
    else if(billingObject.splitType == "exact"){
        mappedData = billingObject.userData.map((val)=>{
            return {
                userId:val.userId,
                splitAmount:val.split
            }
        })
    }
    else if(billingObject.splitType == "percentage"){
        mappedData = billingObject.userData.map((val)=>{
            return {
                userId:val.userId,
                splitAmount:(val.split*billingObject.totalAmount)/100
            }
        })
    }
    const myBillingObject = {
        totalAmount:billingObject.totalAmount,
        description:billingObject.description,
        splitType:billingObject.splitType,
        splitData:mappedData
    }
    const res = await this.expenseRepo.splitOnThatThang(id,myBillingObject);
    return (res?.transactionId?res.transactionId:null);
  }
}