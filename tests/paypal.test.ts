//Test for generating access token from paypal

import { generateAccessToken, paypal } from "../lib/paypal";

test("Generate token from payapl", async () => {
  const tokenResponse = await generateAccessToken();
  console.log(tokenResponse);
  expect(typeof tokenResponse).toBe("string");
  expect(tokenResponse.length).toBeGreaterThan(0);
});

//Test to create a paypal order
test("Creates a paypal order", async () => {
  const token = await generateAccessToken();
  const price = 10.0;
  const orderResponse = await paypal.createOrder(price);
  console.log(orderResponse);
  expect(orderResponse).toHaveProperty("id");
  expect(orderResponse.status).toBe("CREATED");
});

//test to capture payment with mockj order
//  a spy is a function the watches over another function so we can here modify the returning data
test("simulate capturing a payment from an order", async () => {
  const orderId = "100";
  const mockCapturePayment = jest
    .spyOn(paypal, "capturePayment")
    .mockResolvedValue({
      status: "COMPLETED",
    });
  const captureResponse = await paypal.capturePayment(orderId);
  expect(captureResponse).toHaveProperty("status", "COMPLETED");
  mockCapturePayment.mockRestore();
});
