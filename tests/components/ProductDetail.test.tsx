import { render, screen } from "@testing-library/react";
import ProductDetail from "../../src/components/ProductDetail";

describe("ProductDetail", () => {
  it("should render the Product Detail", async () => {
    render(<ProductDetail productId={1} />);

    expect(await screen.findByText(/product 1/i)).toBeInTheDocument();
  });
});
