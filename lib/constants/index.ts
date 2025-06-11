export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || "Next-ecommerce-webapp";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "generalized e-commerce application built using nextjs";
export const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_UTL || "https://localhost:3000";
export const LATEST_PRODUCTS_LIMIT =
  Number(process.env.LATEST_PRODUCTS_LIMIT) || 4;

export const signInDefaultValues = {
  email: "",
  password: "",
};

export const signUpDefaultValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};
export const shippingAddressDefaultValues = {
  fullName: "John doe",
  streetAddress: "123 Main street",
  city: "mumbai",
  postalCode: "125635",
  country: "IND",
};
