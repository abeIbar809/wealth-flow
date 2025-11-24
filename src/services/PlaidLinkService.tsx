import axios from 'axios';
import { create as CreateTokenConfig, dismissLink, LinkExit, LinkIOSPresentationStyle, LinkLogLevel, LinkOpenProps, LinkSuccess, LinkTokenConfiguration, open } from "react-native-plaid-link-sdk";

interface IPlaidLinkService {
    onPlaidLinkPressed: () => void
}

export const plaidService: IPlaidLinkService = {
    onPlaidLinkPressed: async () => {
        try {
            const tokenConfiguration = await serviceHelpers.createTokenConfig()
            CreateTokenConfig(tokenConfiguration);

            const linkOpenProps: LinkOpenProps = {
                onSuccess: (success: LinkSuccess) => {
                    // Link success
                    console.log("Success: ", success);
                    serviceHelpers.handleSuccessfulAccountLink(success.publicToken)
                },
                onExit: (linkExit: LinkExit) => {
                    // Exited Link session.
                    console.log("Exit: ", linkExit);
                    dismissLink();
                },
                // MODAL or FULL_SCREEEN presentation on iOS. Defaults to MODAL.
                iOSPresentationStyle: LinkIOSPresentationStyle.FULL_SCREEN,
                logLevel: LinkLogLevel.WARN,
            }
            // Open the actual UI LINK FLOW.
            open(linkOpenProps);
        } catch (error) {
            throw error
        }
    },
}

const serviceHelpers = {
    createTokenConfig: async (): Promise<LinkTokenConfiguration> => {
        try {
            const request = (await axios.post('http://localhost:3000/api/plaid/link-token', { _id: "id" }));
            const { linkToken } = request.data
            return { token: linkToken, noLoadingState: false }
        } catch (error) {
            throw error
        }

    },

    handleSuccessfulAccountLink: async (publicToken: string) => {
        try {
            const body = { _id: "id", publicToken: publicToken }
            const req = await axios.post('http://localhost:3000/plaid/api/token-exchange', body);
            console.log(req.statusText)
        } catch (error) {
            throw error
        }
    },
}




