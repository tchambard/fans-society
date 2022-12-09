# Fans Society - Smart Contracts

## Typescript

Utilisation de [typechain](https://github.com/dethcrypto/TypeChain)

## Compilation

```sh
# Compiler les contrats et générer les fichiers de types
yarn compile
```

## Lint

```sh
# Exécuter le lint
yarn lint
```

## Tests

```sh
# Exécuter les tests
yarn test

# Exécuter les tests avec les informations de consommation de gas
REPORT_GAS=true yarn test

# Exécuter le coverage
yarn coverage

# Déploiement sur Ganache
yarn deploy:localhost

```

## Déploiement

```sh
# Déploiement sur Ganache
yarn deploy:localhost
```

## Lint

Utilisation de [solhint](https://github.com/protofire/solhint)
nnel après passage sur hardhat.

## Output du coverage

```sh
------------------------------|----------|----------|----------|----------|----------------|
File                          |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------------------------|----------|----------|----------|----------|----------------|
 contracts/                   |       81 |    55.36 |    89.47 |    83.08 |                |
  AMM.sol                     |    78.57 |    54.88 |    90.91 |    80.39 |... 390,391,392 |
  Projects.sol                |    93.75 |    56.67 |     87.5 |    92.86 |        126,127 |
 contracts/common/            |    71.43 |       40 |       75 |    69.57 |                |
  AMMFactorySecurity.sol      |      100 |       50 |      100 |      100 |                |
  WETHToken.sol               |    69.23 |     37.5 |    66.67 |       65 |... 38,39,53,54 |
 contracts/interfaces/        |      100 |      100 |      100 |      100 |                |
  IWETH.sol                   |      100 |      100 |      100 |      100 |                |
 contracts/pools/             |    89.39 |    62.12 |    94.44 |    92.22 |                |
  LPTokenERC20.sol            |      100 |       50 |      100 |      100 |                |
  Pool.sol                    |    90.57 |       64 |      100 |    92.75 |... 262,264,265 |
  PoolFactory.sol             |    77.78 |       60 |       80 |    86.67 |          70,71 |
 contracts/pools/interfaces/  |      100 |      100 |      100 |      100 |                |
  IPool.sol                   |      100 |      100 |      100 |      100 |                |
  IPoolFactory.sol            |      100 |      100 |      100 |      100 |                |
 contracts/tokens/            |      100 |       75 |      100 |      100 |                |
  ProjectTokenERC20.sol       |      100 |    77.78 |      100 |      100 |                |
  ProjectTokenFactory.sol     |      100 |       50 |      100 |      100 |                |
 contracts/tokens/interfaces/ |      100 |      100 |      100 |      100 |                |
  IProjectTokenERC20.sol      |      100 |      100 |      100 |      100 |                |
  IProjectTokenFactory.sol    |      100 |      100 |      100 |      100 |                |
------------------------------|----------|----------|----------|----------|----------------|
All files                     |    84.77 |    58.65 |    90.57 |    86.42 |                |
------------------------------|----------|----------|----------|----------|----------------|
```

## Output des tests

```sh

  Contract: AMM
    # no project exist
      ✔ > createProject should succeed when called with contract owner address (71ms)
    # one project is created
      > commitments
        ✔ > commit on project with unsufficient amount should fail
        ✔ > commit on project with too large amount should fail
        ✔ > many commits on project should succeed until commitments is larger than maxInvest
        ✔ > commit on project with correct correct amount should succeed
        ✔ > withdraw should succeed if commitments is done before
      > claimProjectTokens
        ✔ > should fail until project is completed
      # project funds are completed
        ✔ > launchProject should fail if not partner
        > launchProject as partner
          ✔ > should change project status
          ✔ > should create token with expected supply and max supply
          ✔ > should dispatch tokens
          ✔ > should dispatch funds
        # project is launched
          > claimProjectTokens
            ✔ > should allow a project participant to claim his token share
            ✔ > should fail if not a participant
          # first fans investor has reclaimed his shares
            > addPoolLiquidity
              ✔ > should fail when using weth on tokenX and no msg.value
              ✔ > should fail when using weth on tokenY and no msg.value
              ✔ > should fail when using weth on tokenX and no amountY value
              ✔ > should fail when using weth on tokenY and no amountX value
              ✔ > should fail when using weth on tokenX and amountX value not equal to zero
              ✔ > should fail when using weth on tokenY and amountY value not equal to zero
              ✔ > should succeed when using weth on tokenX with correct amounts (46ms)
              ✔ > should succeed when using weth on tokenY with correct amounts (41ms)
              ✔ > should succeed when using two ERC20 tokens with correct amounts
            > removePoolLiquidity
              ✔ > should fail when caller does not own LP tokens
            # first fan investor has added liquidity
              > removePoolLiquidity
                ✔ > should succeed when caller ask for owned LP tokens amount (42ms)
              > swap
                ✔ > should fail if tokenIn is weth and output amount is equal to zero
                ✔ > should fail if tokenIn is ERC20 and output amount is equal to zero
                ✔ > should fail if tokenIn is weth and msg.value is not sufficient (47ms)
                ✔ > should fail if tokenIn is ERC20 and msg value is provided
                ✔ > should fail if tokenIn is ERC20 and balance is not sufficient (39ms)
                ✔ > should succeed if tokenIn is weth with msg value provided and address owns sufficient amount (40ms)
                ✔ > should succeed if tokenIn is ERC20 with amount provided and address owns sufficient amount (60ms)

  Contract: Pools
    > pool is created
      > liquidity is empty
        ✔ > mintLP (44ms)
      > pool has some liquidity
        ✔ > burnLP (53ms)
        ✔ > swap with input on tokenX (45ms)
        > computing functions
          ✔ > computeMaxOutputAmount should return price regarding fees
          ✔ > computeRequiredInputAmount should return price regarding fees
          ✔ > computePriceOut should return price regarding fees

  Contract: Tokens
    > Project token factory
      > createToken
        ✔ > should fail with total supply lower than distributed shared
        ✔ > should create token with expected supply and max supply
    > Project token ERC20
      > claim
        ✔ > should fail when called out of amm contract
        ✔ > should fail if total supply is lower than distributed shared
        ✔ > should mint new tokens
        ✔ > should fail when claim is already done for same account


  44 passing (13s)
```

## ETH gas reporter

L'utilisation de eth-gas-reporter est conditionné lors de l'exécution de la commande de lancement des tests par l'usage de la variable d'environnment `REPORT_GAS`.

```sh
·-----------------------------------------------|---------------------------|-------------|-----------------------------·
|             Solc version: 0.8.17              ·  Optimizer enabled: true  ·  Runs: 200  ·  Block limit: 30000000 gas  │
················································|···························|·············|······························
|  Methods                                                                                                              │
························|·······················|·············|·············|·············|···············|··············
|  Contract             ·  Method               ·  Min        ·  Max        ·  Avg        ·  # calls      ·  eur (avg)  │
························|·······················|·············|·············|·············|···············|··············
|  AMM                  ·  addPoolLiquidity     ·     164383  ·     164541  ·     164430  ·           10  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  AMM                  ·  claimProjectTokens   ·          -  ·          -  ·     121934  ·           20  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  AMM                  ·  commitOnProject      ·      60158  ·      77258  ·      62443  ·          252  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  AMM                  ·  createProject        ·          -  ·          -  ·     270890  ·           32  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  AMM                  ·  launchProject        ·     770318  ·     770328  ·     770325  ·           24  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  AMM                  ·  removePoolLiquidity  ·          -  ·          -  ·     181249  ·            1  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  AMM                  ·  setFactories         ·      69018  ·      69030  ·      69028  ·           32  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  AMM                  ·  swap                 ·     127038  ·     137458  ·     132248  ·            2  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  AMM                  ·  withdrawOnProject    ·          -  ·          -  ·      38683  ·            1  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  ERC20Upgradeable     ·  transfer             ·      36953  ·      54065  ·      53488  ·           38  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  Pool                 ·  burnLP               ·          -  ·          -  ·      84876  ·            1  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  Pool                 ·  mintLP               ·     162994  ·     163011  ·     163008  ·            6  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  Pool                 ·  swap                 ·          -  ·          -  ·      71524  ·            1  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  PoolFactory          ·  createPool           ·     233223  ·     233235  ·     233233  ·            6  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  ProjectTokenERC20    ·  claim                ·          -  ·          -  ·      82060  ·            2  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  ProjectTokenFactory  ·  createToken          ·     233787  ·     233811  ·     233800  ·           17  ·          -  │
························|·······················|·············|·············|·············|···············|··············
|  Deployments                                  ·                                         ·  % of limit   ·             │
················································|·············|·············|·············|···············|··············
|  AMM                                          ·    3621399  ·    3621423  ·    3621422  ·       12.1 %  ·          -  │
················································|·············|·············|·············|···············|··············
|  Pool                                         ·          -  ·          -  ·    1929907  ·        6.4 %  ·          -  │
················································|·············|·············|·············|···············|··············
|  PoolFactory                                  ·     490328  ·     490340  ·     490337  ·        1.6 %  ·          -  │
················································|·············|·············|·············|···············|··············
|  ProjectTokenERC20                            ·          -  ·          -  ·     969947  ·        3.2 %  ·          -  │
················································|·············|·············|·············|···············|··············
|  ProjectTokenFactory                          ·     328571  ·     328583  ·     328581  ·        1.1 %  ·          -  │
················································|·············|·············|·············|···············|··············
|  WETHToken                                    ·          -  ·          -  ·     554617  ·        1.8 %  ·          -  │
·-----------------------------------------------|-------------|-------------|-------------|---------------|-------------·
```
