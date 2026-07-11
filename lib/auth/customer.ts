import "server-only";
import { customerAccountConfig } from "@/lib/auth/config";
import { readSession } from "@/lib/auth/session";

/**
 * The auth boundary for account routes (TDD §20).
 *
 * Every account page reads through `getCustomer()`, so this one file decides
 * whether a visitor is signed in. It returns `null` — signed out — when the
 * Customer Account API is unconfigured, when there is no session, or when the
 * session cannot be resolved to a customer. It never invents a customer: a fake
 * signed-in state would hide exactly the bugs the shell exists to surface.
 *
 * The access token is kept fresh by the Edge middleware (a Server Component
 * render cannot refresh it), so here an expired token simply reads as signed
 * out rather than being renewed inline.
 */
export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface CustomerOrder {
  id: string;
  /** Human-facing order name, e.g. "#1001". */
  name: string;
  processedAt: string;
  totalAmount: string;
  currencyCode: string;
}

export const isCustomerAccountConfigured = customerAccountConfig !== null;

/**
 * One authenticated GraphQL round-trip to the Customer Account API. Returns the
 * typed `data`, or `null` on any failure (no session, network, GraphQL errors,
 * expired token) so callers degrade to signed-out rather than throwing a 500 at
 * a shopper. The access token is sent raw — the Customer Account API does not
 * use a "Bearer" prefix.
 */
async function customerAccountFetch<T>(query: string): Promise<T | null> {
  const config = customerAccountConfig;
  if (!config) return null;

  const session = await readSession();
  if (!session || session.expiresAt <= Date.now()) return null;

  try {
    const response = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: session.accessToken,
      },
      body: JSON.stringify({ query }),
      cache: "no-store",
    });

    if (!response.ok) return null;

    const body = (await response.json()) as { data?: T; errors?: unknown };
    if (body.errors || !body.data) {
      if (body.errors) console.error("Customer Account API errors", body.errors);
      return null;
    }
    return body.data;
  } catch (error) {
    console.error("Customer Account API request failed", error);
    return null;
  }
}

const CUSTOMER_QUERY = /* GraphQL */ `
  query NoirCustomer {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
    }
  }
`;

interface CustomerQueryData {
  customer: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    emailAddress?: { emailAddress?: string | null } | null;
  } | null;
}

export async function getCustomer(): Promise<Customer | null> {
  const data = await customerAccountFetch<CustomerQueryData>(CUSTOMER_QUERY);
  const customer = data?.customer;
  if (!customer) return null;

  return {
    id: customer.id,
    email: customer.emailAddress?.emailAddress ?? "",
    firstName: customer.firstName ?? undefined,
    lastName: customer.lastName ?? undefined,
  };
}

const ORDERS_QUERY = /* GraphQL */ `
  query NoirCustomerOrders {
    customer {
      orders(first: 25, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            processedAt
            totalPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;

interface OrdersQueryData {
  customer: {
    orders: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          processedAt: string;
          totalPrice: { amount: string; currencyCode: string };
        };
      }>;
    };
  } | null;
}

/**
 * The signed-in customer's orders, newest first. Returns `[]` both for a
 * customer who has never ordered and for any resolution failure — the orders
 * page treats "no orders" identically either way.
 */
export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  const data = await customerAccountFetch<OrdersQueryData>(ORDERS_QUERY);
  const edges = data?.customer?.orders.edges;
  if (!edges) return [];

  return edges.map(({ node }) => ({
    id: node.id,
    name: node.name,
    processedAt: node.processedAt,
    totalAmount: node.totalPrice.amount,
    currencyCode: node.totalPrice.currencyCode,
  }));
}
