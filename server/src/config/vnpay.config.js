const vnpayConfig = {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE,
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
    vnp_Url: process.env.VNPAY_URL,
    vnp_ApiUrl: process.env.VNPAY_API_URL,
    vnp_ReturnUrl: process.env.VNPAY_RETURN_URL,
};

export default vnpayConfig;