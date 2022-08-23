import * as React from "react";
import Column from "./Column";
import AssetRow from "./AssetRow";
import { IAssetData } from "../helpers/types";

const AccountAssets = (props: any) => {
  const { assets } = props;

  if (assets && assets.length) {
    const tokens: IAssetData[] = assets.filter((asset: IAssetData) =>
      assets && assets.length
    );
    
    return (
      <Column center>
        {tokens.map(token => (
          <AssetRow key={token.symbol} asset={token} />
        ))}
      </Column>
    );
  }
  return (
    <Column center>
      {}
    </Column>
  );
};

export default AccountAssets;
