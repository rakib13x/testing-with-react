import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster } from "react-hot-toast";
import ProductForm from "../../src/components/ProductForm";
import { Category, Product } from "../../src/entities";
import AllProviders from "../AllProviders";
import { db } from "../mocks/db";

describe("ProductForm", () => {
  let category: Category;

  beforeAll(() => {
    category = db.category.create();
  });

  afterAll(() => {
    db.category.delete({ where: { id: { equals: category.id } } });
  });

  const renderComponent = (product?: Product) => {
    const onSubmit = vi.fn();
    render(
      <>
        <ProductForm product={product} onSubmit={onSubmit} />
        <Toaster />
      </>,
      {
        wrapper: AllProviders,
      }
    );

    return {
      onSubmit,
      expectErrorToBeInTheDocument: (errorMessage: RegExp) => {
        const error = screen.getByRole("alert");
        expect(error).toBeInTheDocument();
        expect(error).toHaveTextContent(errorMessage);
      },
      waitForFormToLoad: async () => {
        await screen.findByRole("form");

        const nameInput = screen.getByPlaceholderText(/name/i);
        const priceInput = screen.getByPlaceholderText(/price/i);
        const categoryInput = screen.getByRole("combobox", {
          name: /category/i,
        });
        const SubmitButton = screen.getByRole("button");

        type FormData = {
          [K in keyof Product]: any;
        };

        const validData: FormData = {
          id: 1,
          name: "a",
          price: 1,
          categoryId: category.id,
        };

        const fill = async (product: FormData) => {
          const user = userEvent.setup();

          if (product.name !== undefined)
            await user.type(nameInput, product.name);
          if (product.price !== undefined)
            await user.type(priceInput, product.price.toString());
          await user.tab(); //to remove warning in console
          await user.click(categoryInput);
          const options = screen.getAllByRole("option");
          await user.click(options[0]);
          await user.click(SubmitButton);
        };

        return {
          nameInput,
          priceInput,
          categoryInput,
          SubmitButton,
          fill,
          validData,
        };
      },
    };
  };

  it("should render form fields", async () => {
    const { waitForFormToLoad } = renderComponent();
    const { nameInput, priceInput, categoryInput } = await waitForFormToLoad();

    expect(nameInput).toBeInTheDocument();
    expect(priceInput).toBeInTheDocument();
    expect(categoryInput).toBeInTheDocument();
  });

  it("should populate form fields when editing a product", async () => {
    const product: Product = {
      id: 1,
      name: "Rakib",
      price: 10,
      categoryId: category.id,
    };
    const { waitForFormToLoad } = renderComponent(product);

    const { nameInput, priceInput, categoryInput } = await waitForFormToLoad();

    expect(nameInput).toHaveValue(product.name);
    expect(priceInput).toHaveValue(product.price.toString());
    expect(categoryInput).toHaveTextContent(category.name);
  });

  it("should put focus on the name field", async () => {
    const { waitForFormToLoad } = renderComponent();

    const { nameInput } = await waitForFormToLoad();
    expect(nameInput).toHaveFocus();
  });

  it.each([
    {
      scenerio: "missing",
      errorMessage: /required/i,
    },
    {
      scenerio: "longer than 255 characters",
      name: "a".repeat(256),
      errorMessage: /255/,
    },
  ])(
    "should display an error if name is $scenerio",
    async ({ name, errorMessage }) => {
      const { waitForFormToLoad, expectErrorToBeInTheDocument } =
        renderComponent();

      const form = await waitForFormToLoad();
      await form.fill({ ...form.validData, name });

      expectErrorToBeInTheDocument(errorMessage);
    }
  );
  it.each([
    {
      scenerio: "missing",
      errorMessage: /required/i,
    },
    {
      scenerio: "0",
      price: 0,
      errorMessage: /1/,
    },
    {
      scenerio: "negative",
      price: -1,
      errorMessage: /1/,
    },
    {
      scenerio: "greater than 1000",
      price: 1001,
      errorMessage: /1000/,
    },
    {
      scenerio: "not a number",
      price: "a",
      errorMessage: /required/,
    },
  ])(
    "should display an error if price is $scenerio",
    async ({ price, errorMessage }) => {
      const { waitForFormToLoad, expectErrorToBeInTheDocument } =
        renderComponent();

      const form = await waitForFormToLoad();
      await form.fill({ ...form.validData, price });
      expectErrorToBeInTheDocument(errorMessage);
    }
  );

  it("should call onSubmit with the correct data", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    const { id, ...formData } = form.validData; //exclude the id property

    expect(onSubmit).toHaveBeenCalledWith(formData);
  });

  it("should display a toast if Submission fails", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    onSubmit.mockRejectedValue({});

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    const toast = await screen.findByRole("status");
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent(/error/i);
  });

  it("should disable the submit button upon submission", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    onSubmit.mockReturnValue(new Promise(() => {}));

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    expect(form.SubmitButton).toBeDisabled();
  });
  it("should re-enable the submit button after submission", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    onSubmit.mockResolvedValue({});

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    expect(form.SubmitButton).not.toBeDisabled();
  });
  it("should re-enable the submit button if submission fails", async () => {
    const { waitForFormToLoad, onSubmit } = renderComponent();
    onSubmit.mockRejectedValue("error");

    const form = await waitForFormToLoad();
    await form.fill(form.validData);

    expect(form.SubmitButton).not.toBeDisabled();
  });
});
