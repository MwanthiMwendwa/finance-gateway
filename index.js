import "dotenv/config";
import express from "express";
import axios from "axios";

const app = express();
const port = 3000;

const {
  OSKI_APP_CONSUMER_KEY,
  OSKI_APP_CONSUMER_SECRET,
  MPESA_URL_AUTH,
  MPESA_STK_URL,
  MPESA_PASS_KEY,
  MPESA_QR_URL,
  MPESA_C2B_URL
} = process.env;

const getMpesaAccessToken = async () => {
  const auth = Buffer.from(
    `${OSKI_APP_CONSUMER_KEY}:${OSKI_APP_CONSUMER_SECRET}`
  ).toString("base64");
  const res = await axios.get(MPESA_URL_AUTH, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  return res.data.access_token;
};

const generateMpesaQr = async () => {
  const res = await axios.post(MPESA_QR_URL, {
    MerchantName: "Grog",
    RefNo: "ORDER1234",
    Amount: "1500",
    TrxCode: "SM",        // PB for PayBill, till number uses ST
    CPI: "254706577789",        // your PayBill or Till number
    Size: "300"  
  }, {
    headers: { Authorization: `Bearer ` + await getMpesaAccessToken()}
  })

  console.log(res.data)

}

const stkPush = async () => {
  const res = await axios.post(MPESA_STK_URL, {
    BusinessShortCode: "174379",
    Password: Buffer.from("174379" + MPESA_PASS_KEY + new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14)).toString("base64"),
     Timestamp: new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14),
    TransactionType: "CustomerPayBillOnline",
    Amount: "1",
    PartyA: "254706577789",
    PartyB: "174379",
    PhoneNumber: "254706577789",
    CallBackURL: "https://mydomain.com/pat",
    AccountReference: "Grog",
    TransactionDesc: "Being purchase of Glenfiddich 18yrs",
  },
 {
   headers: { Authorization: `Bearer ` + await getMpesaAccessToken()}
 });

  console.log(res.data)
};




app.get("/", (req, res) => {
  res.send("Application active!");
});

app.listen(port, () => {
  console.log(`App runing on ${port}`);
});
