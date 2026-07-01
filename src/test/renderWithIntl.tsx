import { render, type RenderOptions } from "@testing-library/react"
import { IntlProvider } from "react-intl"
import en from "@/translations/en.json"

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <IntlProvider locale="en" messages={en} defaultLocale="en">
    {children}
  </IntlProvider>
)

export function renderWithIntl(ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, { wrapper: Wrapper, ...options })
}
