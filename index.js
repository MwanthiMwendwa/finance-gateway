import "dotenv/config";
import express from "express";
import axios from "axios";

const port = process.env.PORT || 7000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const {
  OSKI_APP_CONSUMER_KEY,
  OSKI_APP_CONSUMER_SECRET,
  MPESA_URL_AUTH,
  MPESA_STK_URL,
  MPESA_PASS_KEY,
  MPESA_QR_URL,
  MPESA_C2B_URL,
  MPESA_BILL_MANAGER_OPTIN_URL,
  /***/

  MPESA_PROD_CONSUMER_KEY, MPESA_PROD_CONSUMER_SECRET, SHORTCODE_PROD
} = process.env;

const getMpesaAccessToken = async () => {
  // const auth = Buffer.from(
  //   `${OSKI_APP_CONSUMER_KEY}:${OSKI_APP_CONSUMER_SECRET}`
  // ).toString("base64");

  /***--------------------------------------------- */
  const auth = Buffer.from(
    "KorjRJ6fdtCngHTNSMPnn4XoDIKPSqHIbGcaNcKMOtc29OlF:LlGjCzyrzw7MfMURJdA2uFOVOPgApMs9Kj73L2r4a2bGCIJLzcCGFt1XrV1JLUas"
  ).toString("base64");

  //--------------------------------------------------
  const res = await axios.get(MPESA_URL_AUTH, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  console.log(res.data)
  return res.data.access_token;
};

/**
 * @url ${MPESA_URL_AUTH}
 * @param null
 * @returns token = data.access_token.
 */

const generateMpesaQr = async () => {
  const res = await axios.post(
    MPESA_QR_URL,
    {
      MerchantName: "Grog",
      RefNo: "ORDER1234",
      Amount: "1500",
      TrxCode: "SM", // PB for PayBill, till number uses ST
      CPI: "254706577789", // your PayBill or Till number
      Size: "300",
    },
    {
      headers: { Authorization: `Bearer ` + (await getMpesaAccessToken()) },
    }
  );

  console.log(res.data);
  return res.data;
};
const stkPush = async () => {
  const res = await axios.post(
    MPESA_STK_URL,
    {
      BusinessShortCode: "174379",
      Password: Buffer.from(
        "174379" +
          MPESA_PASS_KEY +
          new Date()
            .toISOString()
            .replace(/[-:T.Z]/g, "")
            .slice(0, 14)
      ).toString("base64"),
      Timestamp: new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, "")
        .slice(0, 14),
      TransactionType: "CustomerPayBillOnline",
      Amount: "1",
      PartyA: "254706577789",
      PartyB: "174379",
      PhoneNumber: "254706577789",
      CallBackURL: "https://finance-gateway.onrender.com/api/mpesa/callback",
      AccountReference: "Grog",
      TransactionDesc: "Being purchase of Glenfiddich 18yrs",
    },
    {
      headers: { Authorization: `Bearer ` + (await getMpesaAccessToken()) },
    }
  );
  return res.data;
};

const B2C = async () => {};
const billManager = async () => {
  const response = await axios.post(
    MPESA_BILL_MANAGER_OPTIN_URL,
    {
      shortcode:SHORTCODE_PROD ,
      email: "werkbund.e@gmail.com",
      officialContact: "0720211391",
      sendReminders: "1",
      logo: "image",
      callbackurl: "https://finance-gateway.onrender.com/api/mpesa/callback",
    },
    {
      headers: { Authorization: `Bearer ` + (await getMpesaAccessToken()) },
    }
  );
  console.log(response)
  return response
};
const singleInvoicing = async () => {
  const response = await axios.post(
    "https://api.safaricom.co.ke/v1/billmanager-invoice/single-invoicing",
    {
      externalReference: "#9932340",
      billedFullName: "John Doe",
      billedPhoneNumber: "0706577789",
      billedPeriod: "August 2021",
      invoiceName: "Jentrys",
      dueDate: "2021-10-12",
      accountReference: "1ASD678H",
      amount: "800",
      invoiceItems: [
        {
          itemName: "food",
          amount: "700",
        },
        {
          itemName: "water",
          amount: "100",
        },
      ],
    },
    {
      headers: { 
        Authorization: `Bearer ` + (await getMpesaAccessToken()) 

      },
    }
  );
  res.status(200).json({
    status: "success",
    data: response.data
  });
}

getMpesaAccessToken()
stkPush()
// generateMpesaQr()
// billManager()
// singleInvoicing()

app.post("/api/mpesa/qr", async (req, res) => {
  const response = await axios.post(
    MPESA_QR_URL,
    {
      MerchantName: "Grog",
      RefNo: "ORDER1234",
      Amount: "1500",
      TrxCode: "SM", // PB for PayBill, till number uses ST
      CPI: 254706577789, // your PayBill or Till number
      Size: "300",
    },
    {
      headers: { Authorization: `Bearer ` + (await getMpesaAccessToken()) },
    }
  );
  res.status(200).json({
    status: "success",
    data: response.data,
  });
});

app.post("/api/mpesa/stk", async (req, res) => {
  const response = await axios.post(
    MPESA_STK_URL,
    {
      BusinessShortCode: "4186263",
      Password: Buffer.from(
        "4186263" +
          MPESA_PASS_KEY +
          new Date()
            .toISOString()
            .replace(/[-:T.Z]/g, "")
            .slice(0, 14)
      ).toString("base64"),
      Timestamp: new Date()
        .toISOString()
        .replace(/[-:T.Z]/g, "")
        .slice(0, 14),
      TransactionType: "CustomerPayBillOnline",
      Amount: "1",
      PartyA: "254706577789",
      PartyB: "4186263",
      PhoneNumber: "254706577789",
      CallBackURL: "https://finance-gateway.onrender.com/api/mpesa/callback",
      AccountReference: "Grog",
      TransactionDesc: "Being purchase of Glenfiddich 18yrs",
    },
    {
      headers: { Authorization: `Bearer ` + (await getMpesaAccessToken()) },
    }
  );

  res.status(200).json({
    status: "success",
    data: response.data,
  });
});

app.get("/", (req, res) => {
  res.send("Application active!");
});

app.post("/api/mpesa/callback", (req, res) => {
  const { Body } = req.body;
  console.log(Body);
});

app.listen(port, () => {
  console.log(`App runing on ${port}`);
});
