import * as React from "react";
import styled from "styled-components";
// import WalletConnect from "@walletconnect/client";
// import QRCodeModal from "@walletconnect/qrcode-modal";
import WalletConnectProvider from '@walletconnect/web3-provider';
import { convertUtf8ToHex } from "@walletconnect/utils";
import { IInternalEvent } from "@walletconnect/types";
import Button from "./components/Button";
import Column from "./components/Column";
import Wrapper from "./components/Wrapper";
import Modal from "./components/Modal";
import Header from "./components/Header";
import Loader from "./components/Loader";
import { fonts } from "./styles";
import { apiGetAccountAssets } from "./helpers/api";
import {
  verifySignature,
  hashMessage,
} from "./helpers/utilities";
import { IAssetData } from "./helpers/types";
import Banner from "./components/Banner";
import AccountAssets from "./components/AccountAssets";

const SLayout = styled.div`
  position: relative;
  width: 100%;
  /* height: 100%; */
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper as any)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SLanding = styled(Column as any)`
  height: 600px;
`;

const SButtonContainer = styled(Column as any)`
  width: 400px;
  margin: 100px 0;
`;

const SConnectButton = styled(Button as any)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 44px;
  width: 100%;
  margin: 12px 0;
`;

const SContainer = styled.div`
  height: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  word-break: break-word;
`;

const SModalContainer = styled.div`
  width: 100%;
  position: relative;
  word-wrap: break-word;
`;

const SModalTitle = styled.div`
  margin: 1em 0;
  font-size: 20px;
  font-weight: 700;
`;

const SModalParagraph = styled.p`
  margin-top: 30px;
`;

// @ts-ignore
const SBalances = styled(SLanding as any)`
  height: 100%;
  & h3 {
    padding-top: 30px;
  }
`;

const STable = styled(SContainer as any)`
  flex-direction: column;
  text-align: left;
`;

const SRow = styled.div`
  width: 100%;
  display: flex;
  margin: 6px 0;
`;

const SKey = styled.div`
  width: 30%;
  font-weight: 700;
`;

const SValue = styled.div`
  width: 70%;
  font-family: monospace;
`;

const STestButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
`;

const STestButton = styled(Button as any)`
  border-radius: 8px;
  font-size: ${fonts.size.medium};
  height: 44px;
  width: 100%;
  max-width: 175px;
  margin: 12px;
`;

interface IAppState {
  connector: WalletConnectProvider | null;
  fetching: boolean;
  connected: boolean;
  chainId: number;
  showModal: boolean;
  pendingRequest: boolean;
  uri: string;
  accounts: string[];
  address: string;
  result: any | null;
  assets: IAssetData[];
}

// interface IPatchBody {
//   id: string;
//   address: string;
//   isValid: boolean;
//   hashId: string;
// }

const INITIAL_STATE: IAppState = {
  connector: null,
  fetching: false,
  connected: false,
  chainId: 1,
  showModal: false,
  pendingRequest: false,
  uri: "",
  accounts: [],
  address: "",
  result: null,
  assets: [],
};

class App extends React.Component<any, any> {
  public state: IAppState = {
    ...INITIAL_STATE,
  };

  
  public connect = async () => {
    console.log("START");
  
    const provider = new WalletConnectProvider({
      rpc: {
        5555558: "ws://34.136.129.114:8545/"
      },
      chainId: 5555558,
      qrcodeModalOptions: {
        desktopLinks: [
          'ledger',
          'tokenary',
          'wallet',
          'wallet 3',
          'secuX',
          'ambire',
          'wallet3',
          'apolloX',
          'zerion',
          'sequence',
          'punkWallet',
          'kryptoGO',
          'nft',
          'riceWallet',
          'vision',
          'keyring',
          'metamask'
        ],
        mobileLinks: [
          "rainbow",
          "metamask",
          "argent",
          "trust",
          "imtoken",
          "pillar",
        ],
      },
    });
    // provider.updateRpcUrl(5555558); // Don't think this one did anything
    await provider.enable();
    provider.updateRpcUrl(5555558); // This one forces the switch 

    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId: number) => {
      console.log(chainId);
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code: number, reason: string) => {
      console.log(code, reason);

      this.onDisconnect();
    });
  };

  /*
  public connect = async () => {
    
    // bridge url
    const bridge = "https://bridge.walletconnect.org";

    // create new connector
    const connector = new WalletConnect({ bridge, qrcodeModal: QRCodeModal });

    await this.setState({ connector });

    // check if already connected
    if (!connector.connected) {
      // create new session
      await connector.createSession();
    }

    // subscribe to events
    await this.subscribeToEvents();
    
  };
  
  public subscribeToEvents = () => {
    const { connector } = this.state;

    if (!connector) {
      return;
    }

    connector.on("session_update", async (error, payload) => {
      console.log(`connector.on("session_update")`);

      if (error) {
        throw error;
      }

      const { chainId, accounts } = payload.params[0];
      this.onSessionUpdate(accounts, chainId);
    });

    connector.on("connect", (error, payload) => {
      console.log(`connector.on("connect")`);

      if (error) {
        throw error;
      }

      this.onConnect(payload);
    });

    connector.on("disconnect", (error, payload) => {
      console.log(`connector.on("disconnect")`);

      if (error) {
        throw error;
      }

      this.onDisconnect();
    });

    if (connector.connected) {
      const { chainId, accounts } = connector;
      const address = accounts[0];
      this.setState({
        connected: true,
        chainId,
        accounts,
        address,
      });
      this.onSessionUpdate(accounts, chainId);
    }

    this.setState({ connector });
  };
  */

  public killSession = async () => {
    const { connector } = this.state;
    if (connector) {
      connector.killSession();
    }
    this.resetApp();
  };

  public resetApp = async () => {
    await this.setState({ ...INITIAL_STATE });
  };

  public onConnect = async (payload: IInternalEvent) => {
    const { chainId, accounts } = payload.params[0];
    const address = accounts[0];
    await this.setState({
      connected: true,
      chainId,
      accounts,
      address,
    });
    this.getAccountAssets();
  };

  public onDisconnect = async () => {
    this.resetApp();
  };

  public onSessionUpdate = async (accounts: string[], chainId: number) => {
    const address = accounts[0];
    await this.setState({ chainId, accounts, address });
    await this.getAccountAssets();
  };

  public getAccountAssets = async () => {
    const { address, chainId } = this.state;
    this.setState({ fetching: true });
    try {
      // get account balances
      const assets = await apiGetAccountAssets(address, chainId);
      // console.log(`getAccountAssets = ${address}, ${chainId}`)

      await this.setState({ fetching: false, address, assets });
    } catch (error) {
      console.error(error);
      await this.setState({ fetching: false });
    }
  };

  public toggleModal = () => this.setState({ showModal: !this.state.showModal });

  public testPersonalSignMessage = async () => {
    const { connector, address, chainId } = this.state;

    if (!connector) {
      return;
    }

    // test message
    const message = `To validate you as a wallet (${address}) owner, sign the transaction ${new Date().toUTCString()}`;

    // encode message (hex)
    const hexMsg = convertUtf8ToHex(message);

    // eth_sign params
    const msgParams = [hexMsg, address];

    try {
      // open modal
      this.toggleModal();

      // toggle pending request indicator
      this.setState({ pendingRequest: true });

      // send message
      const result = await connector.signPersonalMessage(msgParams);

      // verify signature
      const hash = hashMessage(message);
      const valid = await verifySignature(address, result, hash, chainId);

      // format displayed result
      const formattedResult = {
        method: "Validate the address",
        address,
        valid,
        result,
      };
      console.log(`address = ${address}, valid = ${valid}, result = ${result}`);

      // display result
      this.setState({
        connector,
        pendingRequest: false,
        result: formattedResult || null,
      });

    } catch (error) {
      console.error(error);
      this.setState({ connector, pendingRequest: false, result: null });
    }
  };

  public render = () => {
    const {
      assets,
      address,
      connected,
      chainId,
      fetching,
      showModal,
      pendingRequest,
      result,
    } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header
            connected={connected}
            address={address}
            chainId={chainId}
            killSession={this.killSession}
          />
          <SContent>
            {!address && !assets.length ? (
              <SLanding center>
                <SButtonContainer>
                  <SConnectButton left onClick={this.connect} fetching={fetching}>
                    {"Please press button below to connect your wallet"}
                  </SConnectButton>
                </SButtonContainer>
              </SLanding>
            ) : (
              <SBalances>
                <Banner />
                <h3>Actions</h3>
                <Column center>
                  <STestButtonContainer>
                    <STestButton left onClick={this.testPersonalSignMessage}>
                      {"Validate the address"}
                    </STestButton>
                  </STestButtonContainer>
                </Column>
                <h3>Balances</h3>
                {!fetching ? (
                  <AccountAssets chainId={chainId} assets={assets} />
                ) : (
                  <Column center>
                    <SContainer>
                      <Loader />
                    </SContainer>
                  </Column>
                )}
              </SBalances>
            )}
          </SContent>
        </Column>
        <Modal show={showModal} toggleModal={this.toggleModal}>
          {pendingRequest ? (
            <SModalContainer>
              <SModalTitle>{"Pending Call Request"}</SModalTitle>
              <SContainer>
                <Loader />
                <SModalParagraph>{"Approve or reject request using your wallet"}</SModalParagraph>
              </SContainer>
            </SModalContainer>
          ) : result ? (
            <SModalContainer>
              <SModalTitle>{"Call Request Approved"}</SModalTitle>
              <STable>
                {Object.keys(result).map(key => (
                  <SRow key={key}>
                    <SKey>{key}</SKey>
                    <SValue>{result[key].toString()}</SValue>
                  </SRow>
                ))}
              </STable>
            </SModalContainer>
          ) : (
            <SModalContainer>
              <SModalTitle>{"Call Request Rejected"}</SModalTitle>
            </SModalContainer>
          )}
        </Modal>
      </SLayout>
    );
  };
}

export default App;