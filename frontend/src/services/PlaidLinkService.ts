import {
  create as CreateTokenConfig,
  dismissLink,
  LinkExit,
  LinkIOSPresentationStyle,
  LinkLogLevel,
  LinkOpenProps,
  LinkSuccess,
  LinkTokenConfiguration,
  open,
} from "react-native-plaid-link-sdk";
import useAuthStore from "../stores/useAuthStore";
import { API } from "../api/api";

export interface PlaidAccount {
  _id: string;
  plaid_account_id: string;
  name: string;
  official_name?: string;
  type: string;
  subtype?: string;
  mask?: string;
  balance_available?: number;
  balance_current: number;
  balance_limit?: number;
  currency: string;
  institution_name: string;
  institution_id: string;
  isLinked: boolean;
  lastUpdated: string;
}

export interface PlaidLinkError {
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface PlaidLinkCallbacks {
  onSuccess?: (accounts: PlaidAccount[]) => void;
  onExit?: (error?: PlaidLinkError) => void;
}

class PlaidService {
  private callBacks: PlaidLinkCallbacks = {};

  async openPlaidLink(callBacks?: PlaidLinkCallbacks): Promise<void> {
    this.callBacks = callBacks || {};

    const userId = useAuthStore.getState().user?._id;

    console.log(userId);

    if (!userId) {
      const error: PlaidLinkError = {
        errorCode: "USER_NOT_AUTHENTICATED",
        errorMessage: "User must be logged in to link an account",
      };
      this.callBacks.onExit?.(error);
      throw new Error(error.errorMessage);
    }

    try {
      const tokenConfiguration = await this.createLinkToken(userId);
      console.log("Plaid tokenConfiguration:", tokenConfiguration);
      console.log("Plaid native funcs:", {
        CreateTokenConfig: typeof CreateTokenConfig,
        open: typeof open,
        dismissLink: typeof dismissLink,
      });

      if (typeof CreateTokenConfig !== "function" || typeof open !== "function") {
        console.error(
          "Plaid native SDK not available. Are you running in Expo Go? Use a custom dev client or EAS build."
        );
        throw new Error(
          "Plaid native module not available. Build a custom dev client or use EAS to run Plaid Link."
        );
      }

      CreateTokenConfig(tokenConfiguration);

      const linkOpenProps: LinkOpenProps = {
        onSuccess: (success: LinkSuccess) => {
          console.log("Plaid link Success:", success);
          this.handleSuccess(success, userId);
        },
        onExit: (linkExit: LinkExit) => {
          console.log("Plaid Exite: ", linkExit);
          this.handleExit(linkExit);
        },
        iOSPresentationStyle: LinkIOSPresentationStyle.FULL_SCREEN,
        logLevel: LinkLogLevel.WARN,
      };
      open(linkOpenProps);
    } catch (error) {
      console.error("Error opening Plaid Link:", error);
      const plaidError: PlaidLinkError = {
        errorCode: "LINK_OPEN_FAILED",
        errorMessage: error instanceof Error ? error.message : "Failed to open Pliad Link",
      };
      this.callBacks.onExit?.(plaidError);
      throw error;
    }
  }

  private async createLinkToken(userId: string): Promise<LinkTokenConfiguration> {
    try {
      const response = await API.post("/plaid/link-token", { userId });
      const { linkToken } = response.data;

      if (!linkToken) {
        throw new Error("No link token recived from server");
      }
      return {
        token: linkToken,
        noLoadingState: false,
      };
    } catch (error) {
      console.error("Error creating link token: ", error);
      throw error;
    }
  }

  private async handleSuccess(success: LinkSuccess, userId: string): Promise<void> {
    try {
      const { publicToken, metadata } = success;

      const response = await API.post("/plaid/token-exchange", {
        publicToken,
        userId,
        institution: metadata.institution,
      });

      const { accounts } = response.data;
      console.log("Accounts linked successfully:", accounts?.length);

      this.callBacks.onSuccess?.(accounts || []);
    } catch (error) {
      console.error("Error exchanging token: ", error);
      const plaidError: PlaidLinkError = {
        errorCode: "TOKEN_EXCHANGE_FAILED",
        errorMessage: error instanceof Error ? error.message : "Failed to linke accounts",
      };
      this.callBacks.onExit?.(plaidError);
    }
  }

  private handleExit(linkExit: LinkExit): void {
    dismissLink();

    if (linkExit.error) {
      const plaidError: PlaidLinkError = {
        errorCode: linkExit.error.errorCode,
        errorMessage: linkExit.error.errorMessage,
        metadata: linkExit.metadata as unknown as Record<string, unknown>,
      };
      this.callBacks.onExit?.(plaidError);
    } else {
      this.callBacks.onExit?.();
    }
  }
}

export const plaidService: PlaidService = new PlaidService();

export async function openPlaidLink(userId: string) {
  try {
    const resp = await API.post(`/plaid/link_token`, { userId });
    console.log("link token response data:", resp.data);
    const token = resp.data?.linkToken || resp.data?.link_token;
    console.log("resolved token:", token);

    if (!token) {
      console.error("No link token in response");
      return;
    }

    // Check native function presence (adjust to how you import it)
    if (typeof (global as any).PlaidLinkOpen !== "function" && typeof (global as any).open !== "function") {
      console.warn("Plaid native open not available — are you running Expo Go? Use a custom dev client or EAS build.");
      return;
    }

    // call the native/open implementation your app uses:
    // Example: open({ token }) or PlaidLink.open({ token }) depending on your import
    (global as any).open ? (global as any).open({ token }) : (global as any).PlaidLinkOpen({ token });
  } catch (err) {
    console.error("Error opening Plaid Link:", err);
  }
}
