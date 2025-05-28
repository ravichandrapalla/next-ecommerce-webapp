import ProductList from "@/components/shared/product/product-list";
import sampleData from "@/db/sample-data";

const Homepage = () => {
  return (
    <>
      <ProductList data={sampleData} title="Newest Arrivals" />
    </>
  );
};

export default Homepage;
