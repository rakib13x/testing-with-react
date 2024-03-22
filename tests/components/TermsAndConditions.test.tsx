import { render, screen } from "@testing-library/react";
import TermsAndConditions from "../../src/components/TermsAndConditions";
import userEvent from "@testing-library/user-event";

describe("TermsAndConditions", () => {
  const renderComponent = () => {
    render(<TermsAndConditions />);

    return {
      heading: screen.getByRole("heading"),
      checkBox: screen.getByRole("checkbox"),
      button: screen.getByRole("button"),
    };
  };

  it("should render with correct text and initial state", () => {
    const { heading, checkBox, button } = renderComponent();

    // expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Terms & Conditions");

    // expect(checkBox).toBeInTheDocument();
    expect(checkBox).not.toBeChecked();

    // expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("should enable the button when the checkBox is checked", async () => {
    const { checkBox, button } = renderComponent();
    //Arrange
    // render(<TermsAndConditions />);

    //Act
    const user = userEvent.setup();
    await user.click(checkBox);

    //Assert
    expect(button).toBeEnabled();
  });
});
