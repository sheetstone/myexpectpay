import { render, type RenderOptions } from "@testing-library/react"
import { IntlProvider } from "react-intl"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import en from "@/translations/en.json"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function AllProviders({ children }: { children: React.ReactNode }) {
  const queryClient = makeQueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en" messages={en} defaultLocale="en">
        {children}
      </IntlProvider>
    </QueryClientProvider>
  )
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options })
}
