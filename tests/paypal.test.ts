//Test for generating access token from paypal

import { generateAccessToken } from "../lib/paypal";

test("Generate token from payapl", async () => {
  const tokenResponse = await generateAccessToken();
  console.log(tokenResponse);
  expect(typeof tokenResponse).toBe("string");
  expect(tokenResponse.length).toBeGreaterThan(0);
});
